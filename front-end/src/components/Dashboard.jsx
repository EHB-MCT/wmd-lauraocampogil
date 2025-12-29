import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function Dashboard({ userAnalytics }) {
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
}
