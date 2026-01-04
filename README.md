# Women's Football Social Media Analytics

A full-stack analytics platform that combines real-time social media data with user behavior tracking to provide insights for promoting women's football. Built as a demonstration of data collection systems and their potential impact.

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/EHB-MCT/wmd-lauraocampogil.git
   cd wmd-lauraocampogil
   ```

2. **Create environment file**

   ```bash
   cp .env.example .env
   ```

3. **Start all services**

   ```bash
   docker compose up --build
   ```

### Stop and start the Application

```bash
# Stop containers
docker compose down

# Start
docker compose up
```

## Usage

### User Dashboard

1. Open http://localhost:5173
2. Toggle between **Reddit** (live data) and **Mock Data** (demo)
3. Explore the **Your Dashboard** tab for personalized analytics
4. View **Social Media Analysis** for trending hashtags and viral posts

### Admin Dashboard

1. Open http://localhost:3001
2. View all tracked user sessions
3. Analyze user behavior patterns
4. Export data for analysis


### Reddit Communities

The application fetches real-time data from these subreddits:

| Subreddit                                           | Description                         |
| --------------------------------------------------- | ----------------------------------- |
| [r/WomensSoccer](https://reddit.com/r/WomensSoccer) | General women's football discussion |
| [r/NWSL](https://reddit.com/r/NWSL)                 | National Women's Soccer League      |
| [r/BarclaysWSL](https://reddit.com/r/BarclaysWSL)   | English Women's Super League        |
| [r/Lionesses](https://reddit.com/r/Lionesses)       | England Women's National Team       |

## Resources & Citations

### Technologies Documentation

- [React Documentation](https://react.dev/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [MongoDB Manual](https://www.mongodb.com/docs/manual/)
- [Docker Documentation](https://docs.docker.com/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [Reddit API Documentation](https://www.reddit.com/dev/api/)
- [Axios Documentation](https://axios-http.com/docs/intro)

### Libraries & Packages

- [react-chartjs-2](https://react-chartjs-2.js.org/) - React wrapper for Chart.js
- [Flask-CORS](https://flask-cors.readthedocs.io/) - CORS handling for Flask
- [PyMongo](https://pymongo.readthedocs.io/) - MongoDB driver for Python
- [Font Awesome](https://fontawesome.com/) - Icon library

### Educational Resources

- O'Neil, C. (2016). _Weapons of Math Destruction_. Crown Publishing.
- [Reddit JSON API Guide](https://github.com/reddit-archive/reddit/wiki/JSON)
