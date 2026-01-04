import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api";

const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
});

export const startSession = async (sessionData) => {
	try {
		const response = await api.post("/tracking/session/start", sessionData);
		return response.data;
	} catch (error) {
		console.error("Error starting session:", error);
		throw error;
	}
};

export const endSession = async (sessionId) => {
	try {
		const response = await api.post("/tracking/session/end", { session_id: sessionId });
		return response.data;
	} catch (error) {
		console.error("Error ending session:", error);
		throw error;
	}
};

export const trackEvent = async (eventData) => {
	try {
		const response = await api.post("/tracking/event", eventData);
		return response.data;
	} catch (error) {
		console.error("Error tracking event:", error);
		throw error;
	}
};

export const trackBatchEvents = async (events) => {
	try {
		const response = await api.post("/tracking/batch", { events });
		return response.data;
	} catch (error) {
		console.error("Error tracking batch events:", error);
		throw error;
	}
};

export const getUserAnalytics = async (userId) => {
	try {
		const response = await api.get(`/analytics/user/${userId}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching user analytics:", error);
		throw error;
	}
};

export const getTrending = async () => {
	try {
		const response = await api.get("/analytics/trending");
		return response.data;
	} catch (error) {
		console.error("Error fetching trending:", error);
		throw error;
	}
};

export const getRedditSocialData = async () => {
	try {
		console.log("📡 Fetching Reddit social media data...");
		const response = await api.get("/social/reddit");

		if (response.data.success) {
			const data = response.data.data;
			console.log(`✓ Loaded ${data.totalPosts} posts from Reddit`, data.fromCache ? "(cached)" : "(fresh)");
			return data;
		}

		throw new Error(response.data.error || "Failed to fetch Reddit data");
	} catch (error) {
		console.error("❌ Error fetching Reddit data:", error);
		throw error;
	}
};

export const refreshRedditData = async () => {
	try {
		console.log("🔄 Refreshing Reddit data...");
		const response = await api.post("/social/reddit/refresh");

		if (response.data.success) {
			console.log("✓ Reddit data refreshed successfully");
			return response.data.data;
		}

		throw new Error(response.data.error || "Failed to refresh Reddit data");
	} catch (error) {
		console.error("❌ Error refreshing Reddit data:", error);
		throw error;
	}
};

export const searchReddit = async (query) => {
	try {
		const response = await api.get(`/social/reddit/search?q=${encodeURIComponent(query)}`);
		return response.data;
	} catch (error) {
		console.error("Error searching Reddit:", error);
		throw error;
	}
};

export const checkHealth = async () => {
	try {
		const response = await api.get("/health");
		return response.data;
	} catch (error) {
		console.error("Health check failed:", error);
		return { status: "unhealthy", error: error.message };
	}
};

export default api;
