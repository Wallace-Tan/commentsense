import pandas as pd
import numpy as np
import json
import os
from datetime import datetime, timedelta

def create_dashboard_json(product_type_file, video_type_file):
    try:
        product_type_df = pd.read_csv(product_type_file)
        video_type_df = pd.read_csv(video_type_file)
    except FileNotFoundError as e:
        print(f"Error: {e}. Please ensure both CSV files are in the data/ directory.")
        return

    final_df = pd.merge(
        product_type_df[['videoId', 'cluster_label']],
        video_type_df[['videoId', 'video_type', 'publishedAt']],
        on='videoId',
        how='left'
    )

    # --- 2. Simulate Missing Data (Title and CQS) ---
    print("Simulating missing data (titles and CQS)...")
    final_df['title'] = [f"Video Title {i+1}" for i in range(len(final_df))]
    np.random.seed(42) # for reproducible random numbers
    final_df['cqs'] = np.random.uniform(75, 99, size=len(final_df)).round(1)

    # --- 3. Prepare Data for JSON Structure ---

    # a) Video CQS Ranking Data
    video_cqs_data = [{
        "id": row['videoId'],
        "title": row['title'],
        "cqs": row['cqs'],
        "timestamp": row['publishedAt']
    } for _, row in final_df.iterrows()]

    # b) Mock Video CQS History
    video_cqs_history = {}
    for video in video_cqs_data:
        history = []
        for i in range(3, 0, -1):
            mock_date = (pd.to_datetime(video['timestamp']) - pd.Timedelta(days=i*7)).strftime('%Y-%m-%d')
            mock_cqs = round(video['cqs'] - np.random.uniform(1, 5), 1)
            history.append({"t": mock_date, "cqs": mock_cqs})
        video_cqs_history[str(video['id'])] = history

    # c) Product Discussion Data
    product_discussion_data = final_df['cluster_label'].value_counts().reset_index()
    product_discussion_data.columns = ['name', 'value']
    product_discussion_data = product_discussion_data.to_dict(orient='records')

    # d) Video Type Data
    video_type_data = final_df['video_type'].value_counts().reset_index()
    video_type_data.columns = ['name', 'value']
    video_type_data = video_type_data.to_dict(orient='records')

    # e) Next Month's Focus Data
    top_video_type = final_df.groupby('video_type')['cqs'].mean().idxmax()
    avg_cqs_top_type = final_df.groupby('video_type')['cqs'].mean().max()
    most_discussed_product = product_discussion_data[0]['name']
    most_discussed_mentions = product_discussion_data[0]['value']

    next_month_focus_data = {
        "topQualityCommentVideo": {"title": top_video_type, "metric": f"Avg. CQS {avg_cqs_top_type:.1f}"},
        "mostDiscussedProduct": {"title": most_discussed_product, "metric": f"{most_discussed_mentions} Mentions"}
    }

    # --- 4. Assemble and Save Final JSON ---
    final_json = {
        "videoCqsData": video_cqs_data,
        "videoCqsHistory": video_cqs_history,
        "productDiscussionData": product_discussion_data,
        "videoTypeData": video_type_data,
        "nextMonthFocusData": next_month_focus_data
    }

    output_dir = 'public'
    output_path = os.path.join(output_dir, 'output.json')
    os.makedirs(output_dir, exist_ok=True)

    with open(output_path, 'w') as f:
        json.dump(final_json, f, indent=2)

    print(f"Successfully generated JSON file at: {output_path}")

# --- MAIN EXECUTION ---
if __name__ == "__main__":
    product_file = 'data/product_type_classified.csv'
    video_file = 'data/video_type_classified.csv'

    create_dashboard_json(product_file, video_file)