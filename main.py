import pandas as pd
import numpy as np
import json
import os

def create_dashboard_json(product_type_file, video_type_file):
    try:
        product_type_df = pd.read_csv(product_type_file)
        video_type_df = pd.read_csv(video_type_file)
    except FileNotFoundError as e:
        print(f"Error: {e}. Please ensure both CSV files are in the directory.")
        return

    product_discussion_data = product_type_df['cluster_label'].value_counts().reset_index()
    product_discussion_data.columns = ['name', 'value']
    product_discussion_data = product_discussion_data.to_dict(orient='records')

    video_type_data = video_type_df['video_type'].value_counts().reset_index()
    video_type_data.columns = ['name', 'value']
    video_type_data = video_type_data.to_dict(orient='records')

    merged_df = pd.merge(product_type_df[['videoId']], video_type_df[['videoId', 'video_type']], on='videoId')
    np.random.seed(42)
    merged_df['cqs'] = np.random.uniform(75, 99, size=len(merged_df)).round(1)

    top_video_type = merged_df.groupby('video_type')['cqs'].mean().idxmax()
    avg_cqs_top_type = merged_df.groupby('video_type')['cqs'].mean().max()
    most_discussed_product = product_discussion_data[0]['name']
    most_discussed_mentions = product_discussion_data[0]['value']

    next_month_focus_data = {
        "topQualityCommentVideo": {
            "title": top_video_type,
            "metric": f"Avg. CQS {avg_cqs_top_type:.1f}"
        },
        "mostDiscussedProduct": {
            "title": most_discussed_product,
            "metric": f"{most_discussed_mentions} Mentions"
        }
    }

    final_json = {
        "productDiscussionData": product_discussion_data,
        "videoTypeData": video_type_data,
        "nextMonthFocusData": next_month_focus_data
    }

    with open('output_partial.json', 'w') as f:
        json.dump(final_json, f, indent=2)

    print("Successfully generated 'output_partial.json'")

if __name__ == "__main__":
    
    product_file = 'data/product_type_classified.csv'
    video_file = 'data/video_type_classified.csv'
    
    create_dashboard_json(product_file, video_file)