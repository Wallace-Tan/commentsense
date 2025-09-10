import pandas as pd
import numpy as np

def calculate_cqs_from_csv(file_path):
    """
    Calculates Engagement Score and Comment Quality Score (CQS) for each video
    from a CSV file of comment data.

    The CQS is adjusted to a [-1, 1] range, where 0 indicates no comments.
    This function assumes the CSV contains data for videos that have comments.

    Args:
        file_path (str): The path to the input CSV file.

    Returns:
        pandas.DataFrame: A DataFrame with the calculated scores for each video_id.
    """
    # --- Step 1: Define Weights ---
    # These can be tuned based on your business logic.

    # Engagement Score Weights
    engagement_weights = {
        'like': 1,
        'favorite': 2,
        'comment': 3
    }

    # CQS Formula Weights (should sum to 1)
    cqs_weights = {
        'sentiment': 0.5,
        'relevance': 0.3,
        'engagement': 0.2
    }

    file_path = "../data/merged.csv"

    # --- Step 2: Load and Process the Data ---
    try:
        df = pd.read_csv(file_path)
    except FileNotFoundError:
        print(f"Error: The file '{file_path}' was not found.")
        return None

    # Group by video to aggregate comment data
    # We assume 'view_count', 'like_count', and 'favorite_count' are the same
    # for all rows of a single video.
    video_agg = df.groupby('video_id').agg(
        avg_sentiment=('sentiment_score', 'mean'),
        avg_relevance=('relevance_score', 'mean'),
        comment_count=('comment_id', 'size'),
        view_count=('view_count', 'first'),
        like_count=('like_count', 'first'),
        favorite_count=('favorite_count', 'first')
    ).reset_index()


    # --- Step 3: Calculate Engagement Score for each video ---
    # This uses the weighted formula.
    def get_engagement_score(row):
        if row['view_count'] == 0:
            return 0.0

        weighted_sum = (
            engagement_weights['like'] * row['like_count'] +
            engagement_weights['favorite'] * row['favorite_count'] +
            engagement_weights['comment'] * row['comment_count']
        )
        # Normalize by view count to get a consistent score
        return weighted_sum / row['view_count']

    video_agg['engagement_score'] = video_agg.apply(get_engagement_score, axis=1)


    # --- Step 4: Calculate the Final CQS for each video ---
    def get_cqs(row):
        # The logic assumes any video in this dataset has comments.
        # If a video had zero comments, it wouldn't be in the source CSV.
        
        # Calculate Quality Magnitude Score (QMS)
        # We use the absolute value for sentiment and relevance for the magnitude calculation.
        qms = (
            cqs_weights['sentiment'] * abs(row['avg_sentiment']) +
            cqs_weights['relevance'] * abs(row['avg_relevance']) +
            cqs_weights['engagement'] * row['engagement_score']
        )

        # Determine the sign based on average sentiment
        if row['avg_sentiment'] < 0:
            return -qms
        else:
            return qms

    video_agg['cqs'] = video_agg.apply(get_cqs, axis=1)

    return video_agg

if __name__ == '__main__':
    # Name of the CSV file containing the comment data
    input_csv_file = 'data.csv'

    # Calculate the scores
    video_scores = calculate_cqs_from_csv(input_csv_file)

    # Display the final results
    if video_scores is not None:
        print("--- Calculated Video Quality Scores ---")
        # Reordering columns for clarity
        final_columns = [
            'video_id', 'cqs', 'engagement_score', 'avg_sentiment',
            'avg_relevance', 'comment_count', 'view_count'
        ]
        print(video_scores[final_columns].round(4))
    video_scores[final_columns].round(4).to_csv("cqs.csv", index=False)