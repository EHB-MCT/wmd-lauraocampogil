const TEAMS = ["Barcelona Femení", "Chelsea Women", "Lyon Féminin", "Bayern Munich Women", "Arsenal Women", "Manchester City Women", "Real Madrid Femenino", "PSG Féminin", "Wolfsburg Women", "Red Flames"];

const PLAYERS = ["Alexia Putellas", "Sam Kerr", "Aitana Bonmatí", "Tessa Wullaert", "Vivianne Miedema", "Ada Hegerberg", "Megan Rapinoe", "Lucy Bronze", "Caroline Graham Hansen", "Lauren Hemp"];

const HASHTAGS = ["#WomensFootball", "#UWCL", "#RedFlames", "#WomenInSports", "#FemaleSoccer", "#WomensSoccer", "#Lionesses", "#USWNT", "#Barça", "#WomenWorldCup"];

const POST_TEMPLATES = [
	"Just watched {player} score an incredible goal!  {hashtags}",
	"{team} absolutely dominated today! What a performance! {hashtags}",
	"Can't believe the skill level in women's football right now  {hashtags}",
	"{player} is unstoppable this season! {hashtags}",
	"The UWCL final was absolutely incredible! {hashtags}",
	"Women's football deserves so much more recognition  {hashtags}",
	"{team} vs {team} - what a match! {hashtags}",
	"These athletes are amazing! More coverage needed! {hashtags}",
	"The future of football is bright! {hashtags}",
	"{player} just broke another record! Legend!  {hashtags}",
];

const PLATFORMS = ["Twitter", "Instagram", "Threads"];

export function generateMockPost() {
	const template = POST_TEMPLATES[Math.floor(Math.random() * POST_TEMPLATES.length)];
	const team1 = TEAMS[Math.floor(Math.random() * TEAMS.length)];
	const team2 = TEAMS[Math.floor(Math.random() * TEAMS.length)];
	const player = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];

	const numHashtags = 2 + Math.floor(Math.random() * 3);
	const selectedHashtags = [];
	const hashtagsCopy = [...HASHTAGS];
	for (let i = 0; i < numHashtags; i++) {
		const idx = Math.floor(Math.random() * hashtagsCopy.length);
		selectedHashtags.push(hashtagsCopy.splice(idx, 1)[0]);
	}

	const text = template
		.replace("{player}", player)
		.replace("{team}", team1)
		.replaceAll(/\{team\}/g, team2)
		.replace("{hashtags}", selectedHashtags.join(" "));

	const baseLikes = 50 + Math.floor(Math.random() * 1000);
	const isViral = Math.random() > 0.9;

	const likes = isViral ? baseLikes * (3 + Math.floor(Math.random() * 7)) : baseLikes;
	const comments = Math.floor(likes * (0.05 + Math.random() * 0.15));
	const shares = Math.floor(likes * (0.03 + Math.random() * 0.1));

	const sentimentRoll = Math.random();
	const sentiment = sentimentRoll < 0.7 ? "positive" : sentimentRoll < 0.9 ? "neutral" : "negative";

	const platform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];

	const timestamp = Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);

	return {
		id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
		platform,
		text,
		author: `@${player.replace(/\s/g, "").toLowerCase()}${Math.floor(Math.random() * 999)}`,
		timestamp,
		likes,
		comments,
		shares,
		engagement: likes + comments + shares,
		hashtags: selectedHashtags,
		sentiment,
		isViral,
		url: `https://${platform.toLowerCase()}.com/post/${Math.random().toString(36).substr(2, 9)}`,
	};
}

export function generateMockPosts(count = 50) {
	const posts = [];
	for (let i = 0; i < count; i++) {
		posts.push(generateMockPost());
	}
	return posts.sort((a, b) => b.timestamp - a.timestamp);
}

export function analyzeTrendingHashtags(posts) {
	const hashtagCounts = {};

	posts.forEach((post) => {
		post.hashtags.forEach((hashtag) => {
			hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + post.engagement;
		});
	});

	return Object.entries(hashtagCounts)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10)
		.map(([hashtag, score]) => ({
			hashtag: hashtag.replace("#", ""),
			engagement: score,
			trending_score: score,
		}));
}

export function analyzeOptimalPostTimes(posts) {
	const hourEngagement = {};

	posts.forEach((post) => {
		const hour = new Date(post.timestamp).getHours();
		if (!hourEngagement[hour]) {
			hourEngagement[hour] = { count: 0, totalEngagement: 0 };
		}
		hourEngagement[hour].count++;
		hourEngagement[hour].totalEngagement += post.engagement;
	});

	const hourStats = Object.entries(hourEngagement).map(([hour, stats]) => ({
		hour: parseInt(hour),
		avgEngagement: Math.round(stats.totalEngagement / stats.count),
		postCount: stats.count,
	}));

	return hourStats.sort((a, b) => b.avgEngagement - a.avgEngagement);
}

export function detectViralPosts(posts) {
	const avgEngagement = posts.reduce((sum, p) => sum + p.engagement, 0) / posts.length;
	const viralThreshold = avgEngagement * 3;

	return posts.filter((p) => p.engagement >= viralThreshold).sort((a, b) => b.engagement - a.engagement);
}

export function analyzeSentiment(posts) {
	const sentimentCounts = {
		positive: 0,
		neutral: 0,
		negative: 0,
	};

	posts.forEach((post) => {
		sentimentCounts[post.sentiment]++;
	});

	const total = posts.length;
	return {
		positive: Math.round((sentimentCounts.positive / total) * 100),
		neutral: Math.round((sentimentCounts.neutral / total) * 100),
		negative: Math.round((sentimentCounts.negative / total) * 100),
	};
}

export function analyzePlatformDistribution(posts) {
	const platformCounts = {};

	posts.forEach((post) => {
		platformCounts[post.platform] = (platformCounts[post.platform] || 0) + 1;
	});

	return Object.entries(platformCounts).map(([platform, count]) => ({
		platform,
		count,
		percentage: Math.round((count / posts.length) * 100),
	}));
}

export function generateAnalyticsSummary(posts) {
	const totalEngagement = posts.reduce((sum, p) => sum + p.engagement, 0);
	const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
	const totalComments = posts.reduce((sum, p) => sum + p.comments, 0);
	const totalShares = posts.reduce((sum, p) => sum + p.shares, 0);

	return {
		totalPosts: posts.length,
		totalEngagement,
		totalLikes,
		totalComments,
		totalShares,
		avgEngagement: Math.round(totalEngagement / posts.length),
		trendingHashtags: analyzeTrendingHashtags(posts),
		optimalTimes: analyzeOptimalPostTimes(posts),
		viralPosts: detectViralPosts(posts),
		sentiment: analyzeSentiment(posts),
		platformDistribution: analyzePlatformDistribution(posts),
	};
}

export const mockSocialMediaData = {
	posts: generateMockPosts(100),
	lastUpdated: new Date().toISOString(),
};
