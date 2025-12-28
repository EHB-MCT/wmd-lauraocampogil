import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const apiClient = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 10000,
});

const apiService = {
	async startSession(userId, sessionId, fingerprint) {
		try {
			const response = await apiClient.post("/api/tracking/session/start", {
				user_id: userId,
				session_id: sessionId,
				fingerprint,
			});
			return response.data;
		} catch (error) {
			console.error("Error starting session:", error);
			throw error;
		}
	},
	async endSession(userId, sessionId) {
		try {
			const response = await apiClient.post("/api/tracking/session/end", {
				user_id: userId,
				session_id: sessionId,
			});
			return response.data;
		} catch (error) {
			console.error("Error ending session:", error);
			throw error;
		}
	},

	async sendEvent(eventData) {
		try {
			const response = await apiClient.post("/api/tracking/event", eventData);
			return response.data;
		} catch (error) {
			console.error("Error sending event:", error);
			throw error;
		}
	},
	async sendBatchEvents(events) {
		try {
			const response = await apiClient.post("/api/tracking/batch", {
				events,
			});
			return response.data;
		} catch (error) {
			console.error("Error sending batch events:", error);
			throw error;
		}
	},
};

export default apiService;
