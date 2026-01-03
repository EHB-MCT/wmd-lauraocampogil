import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import "./Dashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export function Dashboard({ userAnalytics, trending, userId, onRefresh }) {
	const getEngagementChartData = () => {
		if (!userAnalytics) {
			return {
				labels: ["Clicks", "Hovers", "Scrolls"],
				datasets: [
					{
						label: "Your Activity",
						data: [0, 0, 0],
						backgroundColor: ["rgba(255, 99, 132, 0.6)", "rgba(54, 162, 235, 0.6)", "rgba(255, 206, 86, 0.6)"],
					},
				],
			};
		}

		return {
			labels: ["Clicks", "Hovers", "Scrolls"],
			datasets: [
				{
					label: "Your Activity",
					data: [userAnalytics.total_interactions || 0, Math.round((userAnalytics.total_interactions || 0) * 0.6), Math.round((userAnalytics.total_interactions || 0) * 0.4)],
					backgroundColor: ["rgba(255, 99, 132, 0.6)", "rgba(54, 162, 235, 0.6)", "rgba(255, 206, 86, 0.6)"],
				},
			],
		};
	};

	const getTrendingChartData = () => {
		const labels = trending.slice(0, 5).map((t) => `#${t.hashtag}`);
		const data = trending.slice(0, 5).map((t) => t.clicks);

		return {
			labels,
			datasets: [
				{
					label: "Engagement Score",
					data,
					backgroundColor: "rgba(75, 192, 192, 0.6)",
					borderColor: "rgba(75, 192, 192, 1)",
					borderWidth: 1,
				},
			],
		};
	};

	return (
		<div className="dashboard-container">
			{/* Personalized Welcome */}
			<div className="welcome-section">
				<h2>
					Welcome back! <i className="fa-solid fa-hand"></i>
				</h2>
				<p>Your personalized women's football analytics dashboard</p>
				{userAnalytics && (
					<div className="user-stats">
						<div className="stat-card">
							<span className="stat-value">{userAnalytics.total_interactions || 0}</span>
							<span className="stat-label">Your Interactions</span>
						</div>
						<div className="stat-card">
							<span className="stat-value">{userAnalytics.engagement_score || 0}</span>
							<span className="stat-label">Engagement Score</span>
						</div>
					</div>
				)}
			</div>

			{/* Main Content Grid */}
			<div className="content-grid">
				{/* Trending Hashtags - INFLUENCED BY USER BEHAVIOR */}
				<div className="card trending-card">
					<h3>
						<i className="fa-solid fa-fire"></i> Trending Hashtags
					</h3>
					<p className="card-subtitle">Based on community engagement</p>

					{trending.length > 0 ? (
						<>
							<div className="trending-list">
								{trending.slice(0, 5).map((item, index) => (
									<div key={index} className="trending-item" id={`hashtag-${item.hashtag}`}>
										<span className="rank">#{index + 1}</span>
										<span className="hashtag">#{item.hashtag}</span>
										<span className="score">{item.trending_score} pts</span>
									</div>
								))}
							</div>

							<div className="chart-container">
								<Bar
									data={getTrendingChartData()}
									options={{
										responsive: true,
										maintainAspectRatio: false,
										plugins: {
											legend: { display: false },
											title: { display: true, text: "Hashtag Performance" },
										},
									}}
								/>
							</div>
						</>
					) : (
						<p className="no-data">Loading trending data...</p>
					)}
				</div>

				{/* Personalized Recommendations - INFLUENCED BY TRACKING */}
				<div className="card recommendations-card">
					<h3>
						<i className="fa-solid fa-lightbulb"></i> Personalized Recommendations
					</h3>
					<p className="card-subtitle">Based on your interests</p>

					{userAnalytics && userAnalytics.top_interests && userAnalytics.top_interests.length > 0 ? (
						<>
							<div className="interests-section">
								<h4>Your Top Interests:</h4>
								<div className="interests-list">
									{userAnalytics.top_interests.map((interest, index) => (
										<div key={index} className="interest-item">
											<span className="interest-name">{interest.element}</span>
											<span className="interest-count">{interest.clicks} clicks</span>
										</div>
									))}
								</div>
							</div>

							<div className="optimal-time-section">
								<h4>
									<i className="fa-solid fa-clock"></i> Optimal Posting Time:
								</h4>
								<div className="time-recommendation">
									<span className="time-value">{userAnalytics.recommendations?.optimal_post_time || "09:00"}</span>
									<span className="time-label">Based on your activity patterns</span>
								</div>
							</div>

							{userAnalytics.peak_activity_hours && (
								<div className="activity-hours">
									<h4>Your Peak Activity Hours:</h4>
									<div className="hours-list">
										{userAnalytics.peak_activity_hours.map((hour, index) => (
											<div key={index} className="hour-item">
												<span>{hour.hour}:00</span>
												<span className="hour-bar" style={{ width: `${hour.interactions}%` }}></span>
											</div>
										))}
									</div>
								</div>
							)}
						</>
					) : (
						<div className="no-data-info">
							<p>
								<i className="fa-solid fa-magnifying-glass"></i> Keep exploring to get personalized recommendations!
							</p>
							<p className="hint">Click on hashtags and explore the dashboard to unlock insights</p>
						</div>
					)}
				</div>

				{/* Your Activity Chart */}
				<div className="card activity-card">
					<h3>
						<i className="fa-solid fa-chart-pie"></i> Your Activity Overview
					</h3>
					<p className="card-subtitle">Your engagement patterns</p>

					<div className="chart-container">
						<Pie
							data={getEngagementChartData()}
							options={{
								responsive: true,
								maintainAspectRatio: false,
								plugins: {
									legend: { position: "bottom" },
								},
							}}
						/>
					</div>

					{userAnalytics && (
						<div className="activity-summary">
							<p>You've been highly engaged with women's football content! Your personalized dashboard shows content tailored to your interests.</p>
						</div>
					)}
				</div>

				{/* Suggested Hashtags - INFLUENCED BY USER CLICKS */}
				<div className="card suggestions-card">
					<h3>
						<i className="fa-solid fa-star"></i> Suggested Hashtags for You
					</h3>
					<p className="card-subtitle">Curated based on your activity</p>

					{userAnalytics?.recommendations?.suggested_hashtags ? (
						<div className="hashtag-suggestions">
							{userAnalytics.recommendations.suggested_hashtags.map((hashtag, index) => (
								<button key={index} className="hashtag-button" id={`suggested-hashtag-${hashtag}`}>
									#{hashtag}
								</button>
							))}
						</div>
					) : (
						<div className="hashtag-suggestions">
							<button className="hashtag-button" id="suggested-hashtag-WomensFootball">
								#WomensFootball
							</button>
							<button className="hashtag-button" id="suggested-hashtag-UWCL">
								#UWCL
							</button>
							<button className="hashtag-button" id="suggested-hashtag-RedFlames">
								#RedFlames
							</button>
							<button className="hashtag-button" id="suggested-hashtag-WomenInSports">
								#WomenInSports
							</button>
							<button className="hashtag-button" id="suggested-hashtag-FemaleSoccer">
								#FemaleSoccer
							</button>
						</div>
					)}

					<p className="suggestion-note">
						<i className="fa-solid fa-lightbulb"></i> These hashtags are performing well and match your interests
					</p>
				</div>

				{/* Quick Actions */}
				<div className="card actions-card">
					<h3>
						<i className="fa-solid fa-bolt"></i> Quick Actions
					</h3>

					<div className="action-buttons">
						<button className="action-btn primary" id="btn-analyze" onClick={onRefresh}>
							<i className="fa-solid fa-rotate"></i> Refresh Data
						</button>
						<button className="action-btn secondary" id="btn-export">
							<i className="fa-solid fa-download"></i> Export Report
						</button>
						<button className="action-btn secondary" id="btn-share">
							<i className="fa-solid fa-share-nodes"></i> Share Insights
						</button>
					</div>

					<div className="tips-section">
						<h4>
							<i className="fa-solid fa-lightbulb"></i> Pro Tips:
						</h4>
						<ul>
							<li>Post during your optimal times for maximum reach</li>
							<li>Use trending hashtags to boost visibility</li>
							<li>Engage with women's football communities</li>
							<li>Share authentic stories and highlights</li>
						</ul>
					</div>
				</div>

				{/* Additional Info */}
				<div className="card info-card">
					<h3>
						<i className="fa-solid fa-circle-info"></i> About This Dashboard
					</h3>
					<p>This analytics platform helps you understand and optimize your women's football social media presence. All recommendations are personalized based on engagement data and trending patterns.</p>
					<p className="user-id-display">
						<small>
							Your User ID: <code>{userId}</code>
						</small>
					</p>
				</div>
			</div>
		</div>
	);
}
