import apiService from "../services/apiService";

class UserTracker {
	constructor() {
		this.userId = null;
		this.sessionId = null;
		this.eventQueue = [];
		this.isTracking = false;
		this.mousePath = [];
		this.lastMouseMove = Date.now();
		this.sessionStartTime = Date.now();
		this.idleTime = 0;
		this.lastActivityTime = Date.now();

		this.batchInterval = 5000;
		this.batchTimer = null;
		this.mouseMoveThrottle = 100;
		this.lastMouseMoveLog = 0;
	}

	async init() {
		this.userId = this._getOrCreateUserId();
		this.sessionId = this._generateSessionId();

		const fingerprint = this._collectFingerprint();

		await apiService.startSession(this.userId, this.sessionId, fingerprint);

		this._startTracking();

		this._startBatchSending();

		this._trackPageVisibility();

		this._trackIdleTime();

		console.log(`Tracking initialized for user: ${this.userId}`);
	}

	_getOrCreateUserId() {
		let userId = localStorage.getItem("wfa_user_id");

		if (!userId) {
			const random = Math.random().toString(36).substring(2, 14);
			userId = `user_${random}`;
			localStorage.setItem("wfa_user_id", userId);
			localStorage.setItem("wfa_first_visit", new Date().toISOString());
		}

		localStorage.setItem("wfa_last_visit", new Date().toISOString());

		return userId;
	}

	_generateSessionId() {
		const timestamp = Date.now();
		const random = Math.random().toString(36).substring(2, 14);
		return `session_${random}_${timestamp}`;
	}

	_collectFingerprint() {
		const pluginsList = navigator.plugins ? Array.from(navigator.plugins).map((p) => p.name) : [];

		return {
			user_agent: navigator.userAgent,
			screen_resolution: `${window.screen.width}x${window.screen.height}`,
			screen_color_depth: window.screen.colorDepth,
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			timezone_offset: new Date().getTimezoneOffset(),
			language: navigator.language,
			languages: navigator.languages,
			platform: navigator.userAgentData?.platform || navigator.platform || "unknown",
			cookie_enabled: navigator.cookieEnabled,
			do_not_track: navigator.doNotTrack,
			plugins: pluginsList,
			canvas_fingerprint: this._getCanvasFingerprint(),
			webgl_vendor: this._getWebGLInfo().vendor,
			webgl_renderer: this._getWebGLInfo().renderer,
			hardware_concurrency: navigator.hardwareConcurrency,
			device_memory: navigator.deviceMemory,
			connection_type: navigator.connection?.effectiveType,
			touch_support: "ontouchstart" in window,
		};
	}

	_getCanvasFingerprint() {
		try {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			const text = "WFA Fingerprint 123";
			ctx.textBaseline = "top";
			ctx.font = "14px Arial";
			ctx.fillText(text, 2, 2);
			return canvas.toDataURL().slice(0, 50);
		} catch (e) {
			return "unavailable";
		}
	}

	_getWebGLInfo() {
		try {
			const canvas = document.createElement("canvas");
			const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
			if (gl) {
				const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
				return {
					vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
					renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
				};
			}
		} catch (e) {}
		return { vendor: "unknown", renderer: "unknown" };
	}

	_startTracking() {
		if (this.isTracking) return;
		this.isTracking = true;

		document.addEventListener("click", this._handleClick.bind(this), true);

		document.addEventListener("mousemove", this._handleMouseMove.bind(this), true);

		document.addEventListener("mouseenter", this._handleMouseEnter.bind(this), true);
		document.addEventListener("mouseleave", this._handleMouseLeave.bind(this), true);

		window.addEventListener("scroll", this._handleScroll.bind(this), true);

		document.addEventListener("keydown", this._handleKeyDown.bind(this), true);

		document.addEventListener("copy", this._handleCopy.bind(this), true);
		document.addEventListener("paste", this._handlePaste.bind(this), true);

		document.addEventListener("focusin", this._handleFocusIn.bind(this), true);
		document.addEventListener("focusout", this._handleFocusOut.bind(this), true);

		document.addEventListener("submit", this._handleSubmit.bind(this), true);

		window.addEventListener("beforeunload", this._handleBeforeUnload.bind(this));
	}

	_handleClick(event) {
		const element = this._getElementInfo(event.target);

		this._queueEvent({
			event_type: "click",
			element: element.id || element.class || element.tag,
			page_url: window.location.pathname,
			x: event.clientX,
			y: event.clientY,
			timestamp: Date.now() / 1000,
			metadata: {
				element_text: event.target.innerText?.substring(0, 100),
				element_tag: element.tag,
				element_id: element.id,
				element_class: element.class,
				button: event.button,
				ctrl_key: event.ctrlKey,
				shift_key: event.shiftKey,
				alt_key: event.altKey,
			},
		});

		this._resetIdleTimer();
	}

	_handleMouseMove(event) {
		const now = Date.now();

		this.mousePath.push({
			x: event.clientX,
			y: event.clientY,
			time: now,
		});

		if (this.mousePath.length > 50) {
			this.mousePath.shift();
		}

		if (now - this.lastMouseMoveLog > this.mouseMoveThrottle) {
			this._queueEvent({
				event_type: "mouse_move",
				x: event.clientX,
				y: event.clientY,
				timestamp: now / 1000,
				metadata: {
					speed: this._calculateMouseSpeed(),
					page_url: window.location.pathname,
				},
			});

			this.lastMouseMoveLog = now;
		}

		this.lastMouseMove = now;
		this._resetIdleTimer();
	}

	_calculateMouseSpeed() {
		if (this.mousePath.length < 2) return 0;

		const last = this.mousePath[this.mousePath.length - 1];
		const prev = this.mousePath[this.mousePath.length - 2];

		const distance = Math.sqrt(Math.pow(last.x - prev.x, 2) + Math.pow(last.y - prev.y, 2));
		const timeDiff = (last.time - prev.time) / 1000;

		return timeDiff > 0 ? Math.round(distance / timeDiff) : 0;
	}

	_handleMouseEnter(event) {
		const element = this._getElementInfo(event.target);

		event.target._hoverStartTime = Date.now();

		this._queueEvent({
			event_type: "hover",
			element: element.id || element.class || element.tag,
			page_url: window.location.pathname,
			timestamp: Date.now() / 1000,
			metadata: {
				element_tag: element.tag,
				hover_action: "start",
			},
		});
	}

	_handleMouseLeave(event) {
		const element = this._getElementInfo(event.target);
		const hoverDuration = event.target._hoverStartTime ? Date.now() - event.target._hoverStartTime : 0;

		this._queueEvent({
			event_type: "hover",
			element: element.id || element.class || element.tag,
			page_url: window.location.pathname,
			duration: hoverDuration,
			timestamp: Date.now() / 1000,
			metadata: {
				element_tag: element.tag,
				hover_action: "end",
			},
		});
	}

	_handleScroll() {
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const scrollHeight = document.documentElement.scrollHeight;
		const clientHeight = document.documentElement.clientHeight;
		const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;

		this._queueEvent({
			event_type: "scroll",
			scroll_depth: Math.round(scrollPercent),
			timestamp: Date.now() / 1000,
			metadata: {
				scroll_position: scrollTop,
				page_height: scrollHeight,
				viewport_height: clientHeight,
				page_url: window.location.pathname,
			},
		});

		this._resetIdleTimer();
	}

	_handleKeyDown(event) {
		this._queueEvent({
			event_type: "key_press",
			timestamp: Date.now() / 1000,
			metadata: {
				key_code: event.keyCode,
				key_type: this._getKeyType(event.keyCode),
				ctrl_key: event.ctrlKey,
				shift_key: event.shiftKey,
				alt_key: event.altKey,
				page_url: window.location.pathname,
			},
		});

		this._resetIdleTimer();
	}

	_getKeyType(keyCode) {
		if (keyCode >= 65 && keyCode <= 90) return "letter";
		if (keyCode >= 48 && keyCode <= 57) return "number";
		if (keyCode === 32) return "space";
		if (keyCode === 13) return "enter";
		if (keyCode === 8) return "backspace";
		return "other";
	}

	_handleCopy() {
		this._queueEvent({
			event_type: "copy",
			timestamp: Date.now() / 1000,
			metadata: {
				page_url: window.location.pathname,
			},
		});
	}

	_handlePaste() {
		this._queueEvent({
			event_type: "paste",
			timestamp: Date.now() / 1000,
			metadata: {
				page_url: window.location.pathname,
			},
		});
	}

	_handleFocusIn(event) {
		const element = this._getElementInfo(event.target);

		this._queueEvent({
			event_type: "element_focus",
			element: element.id || element.class || element.tag,
			timestamp: Date.now() / 1000,
			metadata: {
				element_tag: element.tag,
				focus_action: "in",
				page_url: window.location.pathname,
			},
		});
	}

	_handleFocusOut(event) {
		const element = this._getElementInfo(event.target);

		this._queueEvent({
			event_type: "element_focus",
			element: element.id || element.class || element.tag,
			timestamp: Date.now() / 1000,
			metadata: {
				element_tag: element.tag,
				focus_action: "out",
				page_url: window.location.pathname,
			},
		});
	}

	_handleSubmit(event) {
		const form = event.target;

		this._queueEvent({
			event_type: "form_submit",
			element: form.id || form.className,
			timestamp: Date.now() / 1000,
			metadata: {
				form_id: form.id,
				form_action: form.action,
				page_url: window.location.pathname,
			},
		});
	}

	_trackPageVisibility() {
		document.addEventListener("visibilitychange", () => {
			this._queueEvent({
				event_type: "page_view",
				timestamp: Date.now() / 1000,
				metadata: {
					visibility_state: document.visibilityState,
					hidden: document.hidden,
					page_url: window.location.pathname,
				},
			});
		});
	}

	_trackIdleTime() {
		setInterval(() => {
			const now = Date.now();
			const timeSinceActivity = now - this.lastActivityTime;

			if (timeSinceActivity > 30000) {
				this.idleTime += timeSinceActivity;
			}
		}, 1000);
	}

	_resetIdleTimer() {
		this.lastActivityTime = Date.now();
	}

	_handleBeforeUnload() {
		this._sendBatch();

		apiService.endSession(this.userId, this.sessionId);

		const sessionDuration = Date.now() - this.sessionStartTime;

		this._queueEvent({
			event_type: "session_end",
			duration: sessionDuration,
			timestamp: Date.now() / 1000,
			metadata: {
				idle_time: this.idleTime,
				active_time: sessionDuration - this.idleTime,
			},
		});
	}

	_getElementInfo(element) {
		return {
			tag: element.tagName?.toLowerCase() || "",
			id: element.id || "",
			class: element.className || "",
		};
	}

	_queueEvent(event) {
		event.user_id = this.userId;
		event.session_id = this.sessionId;
		this.eventQueue.push(event);
	}

	_startBatchSending() {
		this.batchTimer = setInterval(() => {
			this._sendBatch();
		}, this.batchInterval);
	}

	async _sendBatch() {
		if (this.eventQueue.length === 0) return;

		const eventsToSend = [...this.eventQueue];
		this.eventQueue = [];

		try {
			await apiService.sendBatchEvents(eventsToSend);
		} catch (error) {
			console.error("Failed to send tracking batch:", error);
			this.eventQueue.unshift(...eventsToSend);
		}
	}

	stop() {
		if (this.batchTimer) {
			clearInterval(this.batchTimer);
		}
		this.isTracking = false;
	}

	getUserId() {
		return this.userId;
	}

	getSessionId() {
		return this.sessionId;
	}
}

const tracker = new UserTracker();

export default tracker;
