import React from "react";
import { Bar, Pie } from "react-chartjs-2";

function SocialMediaAnalytics({ socialData }) {
	if (!socialData) {
		return <div className="loading">Loading social media data...</div>;
	}

	// Sentiment pie chart data
	const sentimentData = {
		labels: ["Positive", "Neutral", "Negative"],
		datasets: [
			{
				data: [socialData.sentiment.positive, socialData.sentiment.neutral, socialData.sentiment.negative],
				backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 206, 86, 0.6)", "rgba(255, 99, 132, 0.6)"],
				borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 206, 86, 1)", "rgba(255, 99, 132, 1)"],
				borderWidth: 1,
			},
		],
	};
	const platformData = {
		labels: socialData.platformDistribution.map((p) => p.platform),
		datasets: [
			{
				label: "Posts by Platform",
				data: socialData.platformDistribution.map((p) => p.count),
				backgroundColor: "rgba(102, 126, 234, 0.6)",
				borderColor: "rgba(102, 126, 234, 1)",
				borderWidth: 1,
			},
		],
	};
	return (
		<div className="social-media-analytics">
			<div className="analytics-header">
				<h2>📱 Social Media Analytics</h2>
				<p className="subtitle">Real-time analysis of women's football social media engagement</p>
				<div className="data-source-note">ℹ️ Prototype using mock data - Ready for Twitter/Instagram API integration</div>
			</div>
			<div className="overview-stats">
				<div className="stat-box">
					<div className="stat-icon">📊</div>
					<div className="stat-content">
						<div className="stat-value">{socialData.totalPosts.toLocaleString()}</div>
						<div className="stat-label">Posts Analyzed</div>
					</div>
				</div>

				<div className="stat-box">
					<div className="stat-icon">❤️</div>
					<div className="stat-content">
						<div className="stat-value">{socialData.totalLikes.toLocaleString()}</div>
						<div className="stat-label">Total Likes</div>
					</div>
				</div>

				<div className="stat-box">
					<div className="stat-icon">💬</div>
					<div className="stat-content">
						<div className="stat-value">{socialData.totalComments.toLocaleString()}</div>
						<div className="stat-label">Total Comments</div>
					</div>
				</div>

				<div className="stat-box">
					<div className="stat-icon">🔄</div>
					<div className="stat-content">
						<div className="stat-value">{socialData.totalShares.toLocaleString()}</div>
						<div className="stat-label">Total Shares</div>
					</div>
				</div>

				<div className="stat-box highlight">
					<div className="stat-icon">📈</div>
					<div className="stat-content">
						<div className="stat-value">{socialData.avgEngagement.toLocaleString()}</div>
						<div className="stat-label">Avg Engagement</div>
					</div>
				</div>
			</div>
			<div className="analytics-section">
				<h3>🔥 Trending Hashtags</h3>
				<p className="section-note">Top performing hashtags in women's football</p>
				<div className="trending-hashtags-list">
					{socialData.trendingHashtags.slice(0, 5).map((item, index) => (
						<div key={index} className="hashtag-performance-item">
							<span className="hashtag-rank">#{index + 1}</span>
							<span className="hashtag-name">#{item.hashtag}</span>
							<div className="hashtag-bar">
								<div
									className="hashtag-bar-fill"
									style={{
										width: `${(item.engagement / socialData.trendingHashtags[0].engagement) * 100}%`,
									}}
								></div>
							</div>
							<span className="hashtag-score">{item.engagement.toLocaleString()} eng.</span>
						</div>
					))}
				</div>
			</div>
			<div className="analytics-section">
				<h3>🚀 Viral Posts (3x Avg Engagement)</h3>
				<p className="section-note">Posts with exceptional performance</p>
				{socialData.viralPosts.length > 0 ? (
					<div className="viral-posts-list">
						{socialData.viralPosts.slice(0, 3).map((post, index) => (
							<div key={post.id} className="viral-post-item">
								<div className="viral-badge">
									<span className="viral-icon">🔥</span>
									<span className="viral-rank">#{index + 1}</span>
								</div>
								<div className="viral-post-content">
									<div className="post-text">{post.text}</div>
									<div className="post-meta">
										<span className="post-platform">{post.platform}</span>
										<span className="post-author">{post.author}</span>
										<span className="post-time">{new Date(post.timestamp).toLocaleDateString()}</span>
									</div>
									<div className="post-stats">
										<span>❤️ {post.likes.toLocaleString()}</span>
										<span>💬 {post.comments.toLocaleString()}</span>
										<span>🔄 {post.shares.toLocaleString()}</span>
										<span className="total-engagement">📊 {post.engagement.toLocaleString()} total</span>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="no-viral-posts">No viral posts detected in current dataset</div>
				)}
			</div>
		</div>
	);
}
