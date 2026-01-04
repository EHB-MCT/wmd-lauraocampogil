import React, { useState, useEffect, useCallback } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import { Dashboard } from "./components/Dashboard";
import { SocialMediaAnalytics } from "./components/SocialMediaAnalytics";
import { getRedditSocialData, refreshRedditData, startSession } from "./services/apiService";
// Import mock data as fallback
import { generateMockPosts, generateAnalyticsSummary } from "./utils/mockSocialMediaData";
import "./App.css";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function App() {
	const [activeTab, setActiveTab] = useState("dashboard");
	const [socialData, setSocialData] = useState(null);
	const [userAnalytics, setUserAnalytics] = useState(null);
	const [trending, setTrending] = useState([]);
	const [userId] = useState(() => {
		// Get or create user ID
		let id = localStorage.getItem("wfa_user_id");
		if (!id) {
			id = "user_" + Math.random().toString(36).substr(2, 9);
			localStorage.setItem("wfa_user_id", id);
		}
		return id;
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [dataSource, setDataSource] = useState("");
	const [usingMockData, setUsingMockData] = useState(false);

	/**
	 * Load mock data as fallback
	 */
	const loadMockData = useCallback(() => {
		console.log("📦 Loading mock data as fallback...");
		const mockPosts = generateMockPosts(100);
		const mockAnalytics = generateAnalyticsSummary(mockPosts);

		setSocialData(mockAnalytics);
		setDataSource("Mock Data (Demo)");
		setUsingMockData(true);

		// Extract trending for dashboard
		if (mockAnalytics.trendingHashtags) {
			setTrending(
				mockAnalytics.trendingHashtags.map((h) => ({
					hashtag: h.hashtag,
					trending_score: h.engagement,
					clicks: Math.floor(h.engagement / 10),
				}))
			);
		}

		// Set mock user analytics
		setUserAnalytics({
			total_interactions: Math.floor(Math.random() * 100) + 50,
			engagement_score: Math.floor(Math.random() * 500) + 100,
			top_interests: [
				{ element: "Match highlights", clicks: 45 },
				{ element: "Player stats", clicks: 32 },
				{ element: "Transfer news", clicks: 28 },
			],
			recommendations: {
				optimal_post_time: mockAnalytics.optimalTimes?.[0]?.hour + ":00" || "18:00",
				suggested_hashtags: mockAnalytics.trendingHashtags?.slice(0, 5).map((h) => h.hashtag) || [],
			},
		});

		console.log("✓ Mock data loaded successfully");
	}, []);

	/**
	 * Load real data from Reddit API
	 */
	const loadRedditData = useCallback(async () => {
		try {
			const redditData = await getRedditSocialData();
			setSocialData(redditData);
			setDataSource(redditData.fromCache ? "Reddit (cached)" : "Reddit (live)");
			setUsingMockData(false);

			// Extract trending for dashboard
			if (redditData.trendingHashtags) {
				setTrending(
					redditData.trendingHashtags.map((h) => ({
						hashtag: h.hashtag,
						trending_score: h.engagement,
						clicks: h.posts * 10,
					}))
				);
			}

			// Set user analytics based on Reddit data
			setUserAnalytics({
				total_interactions: Math.floor(Math.random() * 100) + 50,
				engagement_score: Math.floor(Math.random() * 500) + 100,
				top_interests: [
					{ element: "Match highlights", clicks: 45 },
					{ element: "Player stats", clicks: 32 },
					{ element: "Transfer news", clicks: 28 },
				],
				recommendations: {
					optimal_post_time: redditData.optimalTimes?.[0]?.hour + ":00" || "18:00",
					suggested_hashtags: redditData.trendingHashtags?.slice(0, 5).map((h) => h.hashtag) || [],
				},
			});

			return true;
		} catch (err) {
			console.error("Reddit API failed:", err);
			return false;
		}
	}, []);

	const initializeApp = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			// Start session (tracking)
			try {
				await startSession({
					user_id: userId,
					session_id: "session_" + Date.now(),
					fingerprint: navigator.userAgent,
				});
			} catch {
				console.log("Session start failed, continuing anyway");
			}

			// Try Reddit API first, fallback to mock data
			const redditSuccess = await loadRedditData();

			if (!redditSuccess) {
				console.log("⚠️ Reddit API unavailable, using mock data");
				loadMockData();
			}
		} catch {
			console.error("Failed to initialize app");
			// Final fallback - always load mock data
			loadMockData();
		} finally {
			setLoading(false);
		}
	}, [userId, loadRedditData, loadMockData]);

	// Fetch data on mount
	useEffect(() => {
		initializeApp();
	}, [initializeApp]);

	const handleRefresh = async () => {
		setLoading(true);
		setError(null);

		try {
			// Try to get fresh Reddit data
			const freshData = await refreshRedditData();
			setSocialData(freshData);
			setDataSource("Reddit (refreshed)");
			setUsingMockData(false);

			if (freshData.trendingHashtags) {
				setTrending(
					freshData.trendingHashtags.map((h) => ({
						hashtag: h.hashtag,
						trending_score: h.engagement,
						clicks: h.posts * 10,
					}))
				);
			}
		} catch {
			console.error("Failed to refresh from Reddit");
			// Fallback to new mock data
			loadMockData();
			setError("Reddit unavailable - showing demo data");
		} finally {
			setLoading(false);
		}
	};

	const handleSwitchToMock = () => {
		loadMockData();
	};

	const handleSwitchToReddit = async () => {
		setLoading(true);
		const success = await loadRedditData();
		if (!success) {
			setError("Reddit API unavailable");
		}
		setLoading(false);
	};

	return (
		<div className="app">
			{/* Header */}
			<header className="app-header">
				<div className="header-content">
					<h1>
						<i className="fa-solid fa-futbol"></i> Women's Football Social Media Analytics
					</h1>
					<p>Real-time insights for promoting women's football</p>

					{/* Data Source Toggle */}
					<div className="data-source-toggle">
						<span className={`data-source-badge ${!usingMockData ? "active" : ""}`}>
							{usingMockData ? (
								<>
									<i className="fa-solid fa-database"></i> {dataSource}
								</>
							) : (
								<>
									<i className="fa-brands fa-reddit"></i> {dataSource}
								</>
							)}
						</span>

						<div className="source-buttons">
							<button className={`source-btn ${!usingMockData ? "active" : ""}`} onClick={handleSwitchToReddit} disabled={loading}>
								<i className="fa-brands fa-reddit"></i> Reddit
							</button>
							<button className={`source-btn ${usingMockData ? "active" : ""}`} onClick={handleSwitchToMock} disabled={loading}>
								<i className="fa-solid fa-database"></i> Mock Data
							</button>
						</div>
					</div>
				</div>

				{/* Navigation Tabs */}
				<nav className="tab-navigation">
					<button className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
						<i className="fa-solid fa-chart-pie"></i> Your Dashboard
					</button>
					<button className={`tab-btn ${activeTab === "social" ? "active" : ""}`} onClick={() => setActiveTab("social")}>
						<i className="fa-solid fa-share-nodes"></i> Social Media Analysis
					</button>
				</nav>
			</header>

			{/* Main Content */}
			<main className="app-main">
				{loading && (
					<div className="loading-overlay">
						<div className="loading-spinner">
							<i className="fa-solid fa-futbol fa-spin"></i>
							<p>{usingMockData ? "Loading demo data..." : "Loading real data from Reddit..."}</p>
						</div>
					</div>
				)}

				{error && (
					<div className="error-banner">
						<i className="fa-solid fa-exclamation-triangle"></i>
						<span>{error}</span>
						<button onClick={initializeApp}>
							<i className="fa-solid fa-rotate"></i> Retry
						</button>
					</div>
				)}

				{!loading && (
					<>
						{activeTab === "dashboard" && <Dashboard userAnalytics={userAnalytics} trending={trending} userId={userId} onRefresh={handleRefresh} />}

						{activeTab === "social" && <SocialMediaAnalytics socialData={socialData} />}
					</>
				)}
			</main>

			{/* Footer */}
			<footer className="app-footer">
				<div className="footer-content">
					<p>
						<i className="fa-solid fa-futbol"></i> Women's Football Analytics
					</p>
					<p className="footer-note">Combining user behavior analytics with social media insights</p>
					{!usingMockData ? (
						<p className="footer-source">
							<i className="fa-brands fa-reddit"></i> Data sourced from Reddit communities: r/WomensSoccer, r/NWSL, r/BarclaysWSL, r/Lionesses
						</p>
					) : (
						<p className="footer-source">
							<i className="fa-solid fa-database"></i> Demo mode: Using simulated data for demonstration
						</p>
					)}
				</div>
			</footer>
		</div>
	);
}

export default App;
