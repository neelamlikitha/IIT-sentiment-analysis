# Browser-based Sentiment Live Demo

This standalone demo uses HTML, CSS, and JavaScript. It runs locally in the browser and makes no API calls or external asset requests.

## Run

Open `index.html` in a modern browser. No server, package installation, or build step is required.

## About the analyzer

The interface is a browser-based VADER-style sentiment analyzer with an embedded, curated lexicon and rule-based scoring for emphasis, negation, capitalization, punctuation, and contrast with “but”. It returns Positive, Negative, or Neutral and a compound score from -1 to +1.

This is not the original trained Naive Bayes model, and the compact embedded lexicon means results can differ from full NLTK VADER. The original project files are not changed by this demo.
