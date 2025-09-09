# 📊 CQS Performance Dashboard
## 1. Project Overview 🎯
This project provides a web-based analytics dashboard designed to measure the true quality of audience engagement on social media content. Standard metrics like likes and views are insufficient as they don't capture the sentiment or relevance of audience conversations. This solution moves beyond vanity metrics by analyzing the comment sections of videos to provide deep, actionable insights for marketing strategy.

The core of this project is the Comment Quality Score (CQS), a proprietary metric that grades each video's comment section on a scale of -1 to 1, offering an instant health check of the online discussion.

## 2. Key Features ✨

- 📈 Video CQS Ranking: Instantly ranks all video content based on the quality of comment discussions, highlighting top performers and potential issues.

- 🎨 Thematic Analysis: Automatically identifies and visualizes the key product lines and video formats that drive high-quality engagement.

- 🎯 Actionable Recommendations: Synthesizes data to provide a clear "Next Month's Focus," removing guesswork from content strategy.

- 💡 Intuitive CQS Metric:

    - ✅ Positive Score (> 0): Healthy, positive, and relevant discussion.

    - ⚠️ Negative Score (< 0): Widespread negative sentiment, signaling a potential brand or product issue.

    - ❓ Zero Score (0): No comments, indicating a problem with content reach or initial impact.

## 3. How It Works: The Data Pipeline ⚙️
The dashboard is powered by a data processing pipeline that transforms raw comment data into strategic insights.

- 📥 Data Ingestion: Raw comment data is loaded from CSV files.

- 🧼 Preprocessing & Feature Engineering:

    - Comments are cleaned by removing irrelevant data, links, and user IDs.

    - Emojis are converted to text for accurate analysis.

    - Sentiment and Relevance scores are calculated for each individual comment using NLP models.

- 🧮 Metric Calculation:

    - An Engagement Score is calculated based on interactions.

    - The Comment Quality Score (CQS) is then computed for each video by combining the average sentiment, relevance, and engagement scores.

- 📦 Aggregation & Export: All metrics are aggregated by video and exported to a JSON file.

- 🖥️ Frontend Visualization: The dashboard application ingests the final JSON file and presents the data through an interactive and easy-to-understand interface.

## 4. Technology Stack 💻
- Backend & Data Processing: Python

- Frontend: Next.js, React

- Data Format: CSV (input), JSON (output for frontend)

## 5. Setup and Usage 🚀
To run this project, you will need a Python environment and a modern web browser.

1. Clone the repository:

    ``git clone <repository-url>``

2. Install backend dependencies:

    ``pip install -r requirements.txt``

3. Run the data processing script:

    ``python process_data.py``

    This will generate the final output.json file.

4. Launch the frontend:

    Navigate to the frontend directory and follow the instructions in its README file (e.g., npm install and npm start).

## 6. Future Enhancements 🔮
- 🧠 AI-Powered Insights: Integrate an LLM (e.g., GPT) to automatically generate executive summaries and strategic recommendations.

- ⚡ Real-Time Data Ingestion: Replace manual CSV uploads with direct API connections to social platforms (YouTube, Instagram, etc.).

- 💾 Integrated Data Warehouse: Implement a scalable database (e.g., PostgreSQL) for historical trend analysis.

- 🌍 Global Language Support: Expand the NLP models to accurately analyze comments in multiple languages.