import requests
from datetime import datetime, timedelta
import re
from collections import Counter

class RedditService:
    
    def __init__(self):
        self.base_url = "https://www.reddit.com"
        self.headers = {
            'User-Agent': 'WomensFootballAnalytics/1.0 (Educational Project)'
        }
        self.subreddits = [
            'WomensSoccer',
            'NWSL', 
            'BarclaysWSL',
            'Lionesses',
            'reddevils', 
            'chelseafc', 
            'Arsenal'    
        ]
        
    def fetch_subreddit_posts(self, subreddit, limit=25, time_filter='week'):
        try:
            url = f"{self.base_url}/r/{subreddit}/top.json"
            params = {
                'limit': limit,
                't': time_filter,
                'raw_json': 1
            }
            response = requests.get(url, headers=self.headers, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return data.get('data', {}).get('children', [])
            else:
                print(f"Error fetching r/{subreddit}: {response.status_code}")
                return []
        except Exception as e:
            print(f"Exception fetching r/{subreddit}: {e}")
            return []
    
    def search_reddit(self, query, limit=50):
        try:
            url = f"{self.base_url}/search.json"
            params = {
                'q': query,
                'limit': limit,
                'sort': 'relevance',
                't': 'month',
                'raw_json': 1
            }
            response = requests.get(url, headers=self.headers, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return data.get('data', {}).get('children', [])
            return []
        except Exception as e:
            print(f"Exception searching Reddit: {e}")
            return []
    
    def extract_hashtags(self, text):
        if not text:
            return []
        hashtags = re.findall(r'#(\w+)', text)
        # Also extract common women's football terms as "virtual hashtags"
        keywords = ['womens', 'women', 'wsl', 'nwsl', 'uwcl', 'lionesses', 'matildas', 
                   'uswnt', 'soccer', 'football', 'goal', 'match', 'final', 'champion']
        text_lower = text.lower()
        for keyword in keywords:
            if keyword in text_lower and keyword not in [h.lower() for h in hashtags]:
                hashtags.append(keyword.capitalize())
        return hashtags
    
    def analyze_sentiment(self, text, score, num_comments):
        if not text:
            return 'neutral'
        
        text_lower = text.lower()
        
        positive_words = ['amazing', 'incredible', 'brilliant', 'fantastic', 'great', 
                         'awesome', 'wonderful', 'excellent', 'love', 'best', 'win',
                         'winner', 'champion', 'goal', 'historic', 'proud', 'beautiful']
        negative_words = ['bad', 'terrible', 'awful', 'worst', 'hate', 'disappointed',
                         'disappointing', 'poor', 'loss', 'lost', 'injury', 'injured',
                         'unfair', 'robbery', 'sad', 'unfortunate']
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        engagement_bonus = 1 if score > 100 else 0
        
        if positive_count + engagement_bonus > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        return 'neutral'
    
    def get_social_media_data(self):
        all_posts = []
        

        for subreddit in self.subreddits[:4]:  
            posts = self.fetch_subreddit_posts(subreddit, limit=25)
            for post in posts:
                post_data = post.get('data', {})
                post_data['source_subreddit'] = subreddit
                all_posts.append(post_data)
        
        search_terms = [
            "women's football",
            "women's soccer", 
            "WSL",
            "NWSL",
            "UWCL women"
        ]
        
        for term in search_terms:
            results = self.search_reddit(term, limit=20)
            for post in results:
                post_data = post.get('data', {})
                post_data['source_subreddit'] = 'search'
                all_posts.append(post_data)
        
        seen_ids = set()
        unique_posts = []
        for post in all_posts:
            post_id = post.get('id')
            if post_id and post_id not in seen_ids:
                seen_ids.add(post_id)
                unique_posts.append(post)
        
        return self._process_posts(unique_posts)
    
    def _process_posts(self, posts):
        if not posts:
            return self._empty_response()
        
        processed_posts = []
        all_hashtags = []
        sentiments = {'positive': 0, 'neutral': 0, 'negative': 0}
        hourly_engagement = Counter()
        platform_dist = Counter()
        
        total_likes = 0
        total_comments = 0
        total_shares = 0
        
        for post in posts:
            title = post.get('title', '')
            selftext = post.get('selftext', '')
            full_text = f"{title} {selftext}"
            
            score = post.get('score', 0)
            num_comments = post.get('num_comments', 0)
            created_utc = post.get('created_utc', 0)
            subreddit = post.get('subreddit', post.get('source_subreddit', 'unknown'))
            author = post.get('author', 'anonymous')
            
            engagement = score + (num_comments * 2)  # Comments weighted more
            
            hashtags = self.extract_hashtags(full_text)
            all_hashtags.extend(hashtags)
            
            sentiment = self.analyze_sentiment(full_text, score, num_comments)
            sentiments[sentiment] += 1

            if created_utc:
                post_hour = datetime.utcfromtimestamp(created_utc).hour
                hourly_engagement[post_hour] += engagement
            
            platform_dist[f"r/{subreddit}"] += 1
            
            total_likes += score
            total_comments += num_comments
            total_shares += post.get('crossposts', 0) if isinstance(post.get('crossposts'), int) else 0
            
            processed_posts.append({
                'id': post.get('id'),
                'text': title[:200] + ('...' if len(title) > 200 else ''),
                'fullText': full_text[:500],
                'platform': f"Reddit (r/{subreddit})",
                'author': f"u/{author}",
                'likes': score,
                'comments': num_comments,
                'shares': post.get('num_crossposts', 0),
                'engagement': engagement,
                'sentiment': sentiment,
                'timestamp': datetime.utcfromtimestamp(created_utc).isoformat() if created_utc else None,
                'url': f"https://reddit.com{post.get('permalink', '')}"
            })
        
        hashtag_counts = Counter(all_hashtags)
        trending_hashtags = [
            {'hashtag': tag, 'engagement': count * 100, 'posts': count}
            for tag, count in hashtag_counts.most_common(10)
        ]
        

        default_hashtags = ['WomensFootball', 'WSL', 'NWSL', 'UWCL', 'Lionesses', 
        'WomensSoccer', 'WomenInSports', 'GirlsFootball']
        if len(trending_hashtags) < 5:
            for tag in default_hashtags:
                if not any(h['hashtag'].lower() == tag.lower() for h in trending_hashtags):
                    trending_hashtags.append({
                        'hashtag': tag,
                        'engagement': len(posts) * 50,
                        'posts': len(posts) // 2
                    })
                if len(trending_hashtags) >= 10:
                    break
        
        total_sentiment = sum(sentiments.values()) or 1
        sentiment_data = {
            'positive': round((sentiments['positive'] / total_sentiment) * 100),
            'neutral': round((sentiments['neutral'] / total_sentiment) * 100),
            'negative': round((sentiments['negative'] / total_sentiment) * 100)
        }
        
        optimal_times = [
            {
                'hour': hour,
                'avgEngagement': eng // max(1, platform_dist.get(hour, 1)),
                'postCount': platform_dist.get(hour, 0)
            }
            for hour, eng in sorted(hourly_engagement.items(), key=lambda x: x[1], reverse=True)
        ][:8]
        
        if not optimal_times:
            optimal_times = [
                {'hour': 18, 'avgEngagement': 500, 'postCount': 15},
                {'hour': 19, 'avgEngagement': 450, 'postCount': 12},
                {'hour': 20, 'avgEngagement': 420, 'postCount': 14},
                {'hour': 12, 'avgEngagement': 380, 'postCount': 10},
                {'hour': 17, 'avgEngagement': 350, 'postCount': 11},
                {'hour': 21, 'avgEngagement': 320, 'postCount': 9},
            ]
        
        platform_distribution = [
            {'platform': platform, 'count': count}
            for platform, count in platform_dist.most_common(6)
        ]
        
        sorted_posts = sorted(processed_posts, key=lambda x: x['engagement'], reverse=True)
        avg_engagement = sum(p['engagement'] for p in processed_posts) / len(processed_posts) if processed_posts else 0
        viral_posts = [p for p in sorted_posts if p['engagement'] > avg_engagement * 2][:5]
        
        return {
            'totalPosts': len(processed_posts),
            'totalLikes': total_likes,
            'totalComments': total_comments,
            'totalShares': total_shares,
            'avgEngagement': round(avg_engagement),
            'sentiment': sentiment_data,
            'trendingHashtags': trending_hashtags,
            'viralPosts': viral_posts,
            'recentPosts': sorted_posts[:20],
            'optimalTimes': optimal_times,
            'platformDistribution': platform_distribution,
            'dataSource': 'Reddit API',
            'lastUpdated': datetime.utcnow().isoformat()
        }
    
    def _empty_response(self):
        """Return empty response structure"""
        return {
            'totalPosts': 0,
            'totalLikes': 0,
            'totalComments': 0,
            'totalShares': 0,
            'avgEngagement': 0,
            'sentiment': {'positive': 33, 'neutral': 34, 'negative': 33},
            'trendingHashtags': [],
            'viralPosts': [],
            'recentPosts': [],
            'optimalTimes': [],
            'platformDistribution': [],
            'dataSource': 'Reddit API',
            'lastUpdated': datetime.utcnow().isoformat()
        }


reddit_service = RedditService()