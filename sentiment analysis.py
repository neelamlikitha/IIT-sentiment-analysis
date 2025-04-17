# Import necessary libraries
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# Load the dataset
nltk.download('movie_reviews')
nltk.download('vader_lexicon')

class SentimentAnalyzer:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
        self.classifier = MultinomialNB()

    def load_dataset(self):
        # Prepare the dataset
        from nltk.corpus import movie_reviews
        pos_reviews = [(' '.join(movie_reviews.words(fileid)), 'pos') for fileid in movie_reviews.fileids('pos')]
        neg_reviews = [(' '.join(movie_reviews.words(fileid)), 'neg') for fileid in movie_reviews.fileids('neg')]
        reviews = pos_reviews + neg_reviews
        return reviews

    def split_dataset(self, reviews):
        # Split the dataset into training and testing sets
        train_reviews, test_reviews, train_labels, test_labels = train_test_split([review for review, label in reviews], [1 if label == 'pos' else 0 for review, label in reviews], test_size=0.2, random_state=42)
        return train_reviews, test_reviews, train_labels, test_labels

    def train_model(self, train_reviews, train_labels):
        # Fit the vectorizer to the training data and transform both the training data
        X_train = self.vectorizer.fit_transform(train_reviews)
        self.classifier.fit(X_train, train_labels)

    def evaluate_model(self, test_reviews, test_labels):
        # Transform the testing data
        X_test = self.vectorizer.transform(test_reviews)
        y_pred = self.classifier.predict(X_test)
        print("Accuracy:", accuracy_score(test_labels, y_pred))
        print("Classification Report:\n", classification_report(test_labels, y_pred))

        # Plot confusion matrix
        plt.figure(figsize=(8,6))
        sns.heatmap(confusion_matrix(test_labels, y_pred), annot=True, cmap='Blues')
        plt.xlabel("Predicted labels")
        plt.ylabel("True labels")
        plt.show()

    def analyze_sentiment(self, text):
        sia = SentimentIntensityAnalyzer()
        sentiment_scores = sia.polarity_scores(text)
        if sentiment_scores['compound'] >= 0.05:
            return "Positive"
        elif sentiment_scores['compound'] <= -0.05:
            return "Negative"
        else:
            return "Neutral"

def main():
    analyzer = SentimentAnalyzer()
    reviews = analyzer.load_dataset()
    train_reviews, test_reviews, train_labels, test_labels = analyzer.split_dataset(reviews)
    analyzer.train_model(train_reviews, train_labels)
    analyzer.evaluate_model(test_reviews, test_labels)

    # Test the sentiment analysis function
    text = "I loved the movie! It was amazing."
    print("Sentiment", analyzer.analyze_sentiment(text))

if __name__ == "__main__":
    main()