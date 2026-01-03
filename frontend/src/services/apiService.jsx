import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

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

	async getUserAnalytics(userId) {
		try {
			const response = await apiClient.get(`/api/analytics/user/${userId}`);
			return response.data;
		} catch (error) {
			console.error("Error getting user analytics:", error);
			return null;
		}
	},

	async getTrending() {
		try {
			const response = await apiClient.get("/api/analytics/trending");
			return response.data;
		} catch (error) {
			console.error("Error getting trending data:", error);
			return { trending: [] };
		}
	},

	async healthCheck() {
		try {
			const response = await apiClient.get("/health");
			return response.data;
		} catch (error) {
			console.error("Health check failed:", error);
			return null;
		}
	},
};

export default apiService;
