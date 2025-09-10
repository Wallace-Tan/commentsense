import pandas as pd
import numpy as np
import json
import os
from datetime import datetime, timedelta

def calculate_cqs_from_csv(file_path):
    """
    Calculates Engagement Score and Comment Quality Score (CQS) for each video
    from a CSV file of comment data.
    """
    engagement_weights = {'like': 2, 'favorite': 4, 'comment': 6}
    cqs_weights = {'sentiment': 5, 'relevance': 3, 'engagement': 2}

    try:
        df = pd.read_csv(file_path)
    except FileNotFoundError:
        print(f"Error: The file '{file_path}' was not found.")
        return None

    # Ensure necessary columns are numeric, coercing errors
    numeric_cols = ['viewCount', 'likeCount_y', 'favouriteCount']
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    df.dropna(subset=numeric_cols, inplace=True) 

    video_agg = df.groupby('videoId').agg(
        avg_sentiment=('sentiment_score', 'mean'),
        avg_relevance=('relevancyScore', 'mean'),
        comment_count=('commentId', 'size'),
        view_count=('viewCount', 'first'),
        like_count=('likeCount_y', 'first'),
        # FIX 1: Changed 'text' to 'title' to match the actual column name in your CSV.
        title=('title', 'first'),
        favorite_count=('favouriteCount', 'first')
    ).reset_index()

    def get_engagement_score(row):
        if row['view_count'] == 0:
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
        return -qms if row['avg_sentiment'] < 0 else qms

    video_agg['cqs'] = video_agg.apply(get_cqs, axis=1)
    
    return video_agg[['videoId', 'cqs', 'title']]

def create_dashboard_json(cqs_data_file, product_type_file, video_type_file):
    """
    Loads all data, calculates CQS, and generates the final JSON.
    """
    try:
        product_type_df = pd.read_csv(product_type_file)
        video_type_df = pd.read_csv(video_type_file)
        print("Classification files loaded successfully.")
    except FileNotFoundError as e:
        print(f"Error: {e}. Please ensure all CSV files are in the 'data/' directory.")
        return

    print("Calculating CQS from comment data...")
    cqs_df = calculate_cqs_from_csv(cqs_data_file)
    if cqs_df is None:
        return

    product_type_df['videoId'] = product_type_df['videoId'].astype(str)
    video_type_df['videoId'] = video_type_df['videoId'].astype(str)
    cqs_df['videoId'] = cqs_df['videoId'].astype(str)

    merged_df = pd.merge(product_type_df, video_type_df, on='videoId', how='left', suffixes=('_prod', '_vid'))
    final_df = pd.merge(merged_df, cqs_df, on='videoId', how='left')

    final_df['cqs'] = final_df['cqs'].fillna(0)
    final_df['title'] = final_df['title'].fillna('Title Not Available')
    
    final_df.dropna(subset=['publishedAt'], inplace=True)
    
    video_cqs_data = [{
        "id": row['videoId'],
        "title": row['title'],
        "cqs": row['cqs'],
        "timestamp": row['publishedAt']
    } for _, row in final_df.iterrows()]

    video_cqs_history = {}
    for video in video_cqs_data:
        history = []
        for i in range(3, 0, -1):
            mock_date = (pd.to_datetime(video['timestamp']) - pd.Timedelta(days=i*7)).strftime('%Y-%m-%d')
            mock_cqs_change = np.random.uniform(0.1, 0.5)
            mock_cqs = round(video['cqs'] - mock_cqs_change if video['cqs'] > 0 else video['cqs'] + mock_cqs_change, 2)
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
        "topQualityCommentVideo": {"title": top_video_type, "metric": f"Avg. CQS {avg_cqs_top_type:.2f}"},
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
    cqs_input_file = 'data/final_comments1.csv' 
    product_file = 'data/product_type_classified.csv'
    video_file = 'data/video_type_classified.csv'
    
    create_dashboard_json(cqs_input_file, product_file, video_file)