import pandas as pd
import numpy as np
import json
import os
from datetime import datetime, timedelta

def create_dashboard_json(comments_file):
    """
    Loads a comprehensive merged comments file, calculates CQS and other metrics,
    and generates the final JSON for the dashboard.
    """
    # --- 1. Load the Merged Comments Data ---
    try:
        df = pd.read_csv(comments_file)
        print("Merged comments file loaded successfully.")
    except FileNotFoundError as e:
        print(f"Error: {e}. Please ensure the merged CSV is in the 'data/' directory.")
        return

    # --- 2. Calculate Comment Quality Score (CQS) and Aggregate Data ---
    print("Calculating CQS and aggregating data...")

    engagement_weights = {'like': 1, 'favorite': 2, 'comment': 3}
    cqs_weights = {'sentiment': 0.5, 'relevance': 0.3, 'engagement': 0.2}

    # Aggregate by video, using the correct column names from your CSV
    video_agg = df.groupby('videoId').agg(
        avg_sentiment=('sentiment_score', 'mean'),
        avg_relevance=('relevancyScore', 'mean'),
        comment_count=('commentId', 'size'),
        view_count=('viewCount', 'first'),
        like_count=('likeCount_y', 'first'),
        favorite_count=('favouriteCount', 'first'),
        title=('title', 'first'),
        publishedAt=('publishedAt', 'first'),
        cluster_label=('cluster_label', 'first'),
        video_type=('video_type', 'first')
    ).reset_index()

    def get_engagement_score(row):
        if row['view_count'] == 0 or pd.isna(row['view_count']):
            return 0.0
        weighted_sum = (
            engagement_weights['like'] * row['like_count'] +
            engagement_weights['favorite'] * row['favorite_count'] +
            engagement_weights['comment'] * row['comment_count']
        )
        return weighted_sum / row['view_count']

    video_agg['engagement_score'] = video_agg.apply(get_engagement_score, axis=1)

    def get_cqs(row):
        qms = (
            cqs_weights['sentiment'] * abs(row['avg_sentiment']) +
            cqs_weights['relevance'] * abs(row['avg_relevance']) +
            cqs_weights['engagement'] * row['engagement_score']
        )
        
        # Scale the score to be more intuitive (e.g., out of 100)
        scaled_cqs = qms * 10
        
        return -scaled_cqs if row['avg_sentiment'] < 0 else scaled_cqs

    video_agg['cqs'] = video_agg.apply(get_cqs, axis=1)
    final_df = video_agg.fillna(0) # Ensure no NaN values remain

    # --- 3. Prepare Data for JSON Structure ---
    print("Structuring final JSON...")

    video_cqs_data = [{
        "id": row['videoId'],
        "title": row['title'],
        "cqs": round(row['cqs'], 1), 
        "timestamp": row['publishedAt']
    } for _, row in final_df.iterrows()]

    video_cqs_history = {}
    for video in video_cqs_data:
        history = []
        for i in range(3, 0, -1):
            mock_date = (pd.to_datetime(video['timestamp']) - pd.Timedelta(days=i*7)).strftime('%Y-%m-%d')
            change_factor = np.random.uniform(-0.5, 0.15)
            mock_cqs = round(video['cqs'] * (1 + change_factor), 1)
            if video['cqs'] > 0 and mock_cqs < 0:
                mock_cqs = 0
            history.append({"t": mock_date, "cqs": mock_cqs})
        video_cqs_history[str(video['id'])] = history

    product_discussion_data = final_df['cluster_label'].value_counts().reset_index()
    product_discussion_data.columns = ['name', 'value']
    product_discussion_data = product_discussion_data.to_dict(orient='records')

    video_type_data = final_df['video_type'].value_counts().reset_index()
    video_type_data.columns = ['name', 'value']
    video_type_data = video_type_data.to_dict(orient='records')

    top_video_type = final_df.groupby('video_type')['cqs'].mean().idxmax()
    avg_cqs_top_type = final_df.groupby('video_type')['cqs'].mean().max()
    most_discussed_product = product_discussion_data[0]['name']
    most_discussed_mentions = product_discussion_data[0]['value']

    next_month_focus_data = {
        "topQualityCommentVideo": {"title": top_video_type, "metric": f"Avg. CQS {avg_cqs_top_type:.1f}"},
        "mostDiscussedProduct": {"title": most_discussed_product, "metric": f"{most_discussed_mentions} Mentions"}
    }

    final_json = {
        "videoCqsData": video_cqs_data,
        "videoCqsHistory": video_cqs_history,
        "productDiscussionData": product_discussion_data,
        "videoTypeData": video_type_data,
        "nextMonthFocusData": next_month_focus_data
    }

    # --- 4. Save Final JSON to /public Folder ---
    output_dir = 'public'
    output_path = os.path.join(output_dir, 'output.json')
    os.makedirs(output_dir, exist_ok=True)

    with open(output_path, 'w') as f:
        json.dump(final_json, f, indent=2)

    print(f"Successfully generated JSON file at: {output_path}")

# --- MAIN EXECUTION ---
if __name__ == "__main__":
    comments_input_file = 'data/merged.csv'
    
    create_dashboard_json(comments_input_file)

