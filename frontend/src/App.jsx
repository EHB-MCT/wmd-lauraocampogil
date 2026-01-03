import React, { useEffect, useState } from "react";
import tracker from "./utils/tracker";
import apiService from "./services/apiService";
import { mockSocialMediaData, generateAnalyticsSummary } from "./utils/mockSocialMediaData";
import { Dashboard } from "./components/Dashboard";
import { SocialMediaAnalytics } from "./components/SocialMediaAnalytics";
import "./App.css";

function App() {
	const [userAnalytics, setUserAnalytics] = useState(null);
	const [trending, setTrending] = useState([]);
	const [socialData, setSocialData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [userId, setUserId] = useState(null);
	const [activeTab, setActiveTab] = useState("user-behavior");

	const loadPersonalizedData = async (uid) => {
		try {
			const analytics = await apiService.getUserAnalytics(uid);
			if (analytics && analytics.success) {
				setUserAnalytics(analytics.analytics);
			}

			const trendingData = await apiService.getTrending();
			if (trendingData && trendingData.success) {
				setTrending(trendingData.trending);
			}
		} catch (error) {
			console.error("Failed to load personalized data:", error);
		}
	};

	const initializeApp = async () => {
		try {
			await tracker.init();
			const uid = tracker.getUserId();
			setUserId(uid);

			await loadPersonalizedData(uid);

			const summary = generateAnalyticsSummary(mockSocialMediaData.posts);
			setSocialData(summary);

			setLoading(false);
		} catch (error) {
			console.error("Failed to initialize app:", error);
			setLoading(false);
		}
	};

	useEffect(() => {
		initializeApp();

		return () => {
			tracker.stop();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Run once on mount

	if (loading) {
		return (
			<div className="loading-container">
				<div className="loading-spinner"></div>
				<p>Loading Women's Football Analytics...</p>
			</div>
		);
	}

	return (
		<div className="App">
			<header className="App-header">
				<h1>⚽ Women's Football Social Media Analytics</h1>
				<p className="subtitle">Real-time insights for promoting women's football</p>

				<nav className="main-nav">
					<button className={`nav-btn ${activeTab === "user-behavior" ? "active" : ""}`} onClick={() => setActiveTab("user-behavior")}>
						📊 Your Dashboard
					</button>
					<button className={`nav-btn ${activeTab === "social-media" ? "active" : ""}`} onClick={() => setActiveTab("social-media")}>
						📱 Social Media Analysis
					</button>
				</nav>
			</header>

			{activeTab === "user-behavior" ? <Dashboard userAnalytics={userAnalytics} trending={trending} userId={userId} onRefresh={() => loadPersonalizedData(userId)} /> : <SocialMediaAnalytics socialData={socialData} />}

			<footer className="App-footer">
				<p>Women's Football Analytics</p>
				<p className="disclaimer">Combining user behavior analytics with social media insights</p>
			</footer>
		</div>
	);
}

export default App;
