"use strict";

const LEXICON = Object.freeze({
  abandon: -2.0, abandoned: -2.2, abysmal: -3.4, adore: 3.2, adored: 3.2,
  amazing: 4.0, amaze: 3.0, annoyed: -2.0, annoying: -2.2, awful: -3.1,
  awesome: 3.1, bad: -2.5, badly: -2.0, beautiful: 2.9, best: 3.2,
  better: 2.1, bored: -1.3, boring: -1.7, brilliant: 3.2, broken: -2.1,
  calm: 1.3, charming: 2.2, disappointing: -2.3, disappointed: -2.1,
  dislike: -2.3, disliked: -2.3, dreadful: -3.0, dull: -1.7, enjoy: 2.4,
  enjoyed: 2.5, excellent: 3.2, exceptional: 3.1, excited: 2.6, fantastic: 3.3,
  favorite: 2.5, fine: 1.0, flawless: 2.8, fun: 2.3, glad: 2.0,
  gorgeous: 2.9, good: 1.9, great: 3.1, happy: 2.7, happier: 2.8,
  happiest: 3.2, hate: -3.2, hated: -3.2, hateful: -2.9, heartwarming: 2.7,
  horrible: -3.1, horrendous: -3.2, hope: 1.8, hopeful: 2.1, hopeless: -2.8,
  impressed: 2.4, incredible: 3.2, like: 1.8, liked: 1.9, lively: 2.0,
  love: 3.2, loved: 3.2, lovely: 2.6, magnificent: 3.2, masterpiece: 3.3,
  marvelous: 3.0, miss: -1.2, missed: -1.3, negative: -2.0, nice: 1.8,
  outstanding: 3.1, perfect: 3.2, pleasant: 1.8, pleasure: 2.3, positive: 2.0,
  poor: -2.0, pretty: 1.3, recommend: 1.8, recommended: 1.8, remarkable: 2.6,
  rude: -2.0, sad: -2.1, sadly: -1.8, satisfy: 1.8, satisfied: 2.0,
  satisfying: 2.2, sucks: -2.5, superb: 3.1, sweet: 2.1, terrible: -3.5,
  terrific: 3.1, thank: 1.8, thanks: 2.0, thrilling: 2.6, tired: -1.2,
  tough: -1.3, unforgettable: 2.7, unhappy: -2.4, unfortunately: -1.8,
  unpleasant: -2.2, upset: -2.1, useful: 1.8, useless: -2.3, warm: 1.5,
  waste: -2.1, wasted: -2.2, welcome: 1.5, well: 1.7, wonderful: 3.1,
  wow: 2.0, wrong: -2.1, yikes: -1.8, yummy: 2.0,
  ":)": 2.0, ":-)": 2.0, ":D": 2.3, ":-D": 2.3, "<3": 3.0,
  ":(": -2.0, ":-(": -2.0, ":'(": -2.2, "💔": -2.5, "👎": -1.8,
  "😢": -2.0, "😭": -2.4, "😡": -2.5, "😠": -2.3, "😊": 2.0,
  "😍": 3.0, "🥰": 3.0, "🙂": 1.5, "👍": 2.0, "🎉": 2.5,
  "✨": 1.5
});

const BOOSTERS = Object.freeze({
  absolutely: 0.293, almost: -0.293, amazingly: 0.293, barely: -0.293,
  completely: 0.293, deeply: 0.293, enormously: 0.293, especially: 0.293,
  exceptionally: 0.293, extremely: 0.293, fairly: -0.293, highly: 0.293,
  incredibly: 0.293, kind: -0.293, particularly: 0.293, pretty: 0.293,
  quite: 0.293, really: 0.293, remarkably: 0.293, slightly: -0.293,
  so: 0.293, somewhat: -0.293, thoroughly: 0.293, totally: 0.293,
  tremendously: 0.293, truly: 0.293, utterly: 0.293, very: 0.293
});

const NEGATIONS = new Set([
  "aint", "aren't", "cannot", "can't", "couldn't", "darent", "didn't",
  "doesn't", "dont", "don't", "hadn't", "hasn't", "haven't", "isn't",
  "mightn't", "mustn't", "neither", "never", "no", "nobody", "none",
  "nor", "not", "nothing", "nowhere", "shan't", "shouldn't", "wasn't",
  "weren't", "won't", "wouldn't"
]);

const WORD_PATTERN = /[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)*|[:;=8xX][-^']?[)(/DPp]|<3|[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;
const CAPS_PATTERN = /[A-Z]/;

function tokenize(text) {
  return text.match(WORD_PATTERN) || [];
}

function normalizeToken(token) {
  return token.toLowerCase().replace(/’/g, "'");
}

function isAllCaps(token) {
  return CAPS_PATTERN.test(token) && token === token.toUpperCase();
}

function hasNegation(tokens, index) {
  for (let distance = 1; distance <= 3; distance += 1) {
    const previous = tokens[index - distance];
    if (!previous) {
      break;
    }

    const normalized = normalizeToken(previous);
    if (NEGATIONS.has(normalized) || normalized.endsWith("n't")) {
      return true;
    }

    if (
      normalized === "least" &&
      index - distance > 0 &&
      normalizeToken(tokens[index - distance - 1]) !== "at" &&
      normalizeToken(tokens[index - distance - 1]) !== "very"
    ) {
      return true;
    }
  }
  return false;
}

function punctuationEmphasis(text) {
  const exclamations = (text.match(/!/g) || []).length;
  const questions = (text.match(/\?/g) || []).length;
  const exclamationBoost = Math.min(exclamations, 4) * 0.292;
  let questionBoost = 0;

  if (questions > 1) {
    questionBoost = questions <= 3 ? questions * 0.18 : 0.96;
  }

  return exclamationBoost + questionBoost;
}

function normalizeScore(score) {
  const normalized = score / Math.sqrt(score * score + 15);
  return Number(normalized.toFixed(4));
}

function analyzeSentiment(text) {
  if (typeof text !== "string") {
    return { valid: false, error: "Enter text to analyze." };
  }

  const cleanedText = text.trim();
  if (!cleanedText) {
    return { valid: false, error: "Enter some text before analyzing." };
  }

  if (cleanedText.length > 5000) {
    return { valid: false, error: "Keep your text under 5,000 characters." };
  }

  const tokens = tokenize(cleanedText);
  if (tokens.length === 0) {
    return { valid: false, error: "Enter words or a supported emoji to analyze." };
  }

  const hasMixedCase = tokens.some(isAllCaps) &&
    tokens.some((token) => CAPS_PATTERN.test(token) && !isAllCaps(token));
  const sentiments = tokens.map((token, index) => {
    const normalized = normalizeToken(token);
    let valence = LEXICON[token] || LEXICON[normalized] || 0;

    if (valence === 0) {
      return 0;
    }

    if (hasMixedCase && isAllCaps(token)) {
      valence += valence > 0 ? 0.733 : -0.733;
    }

    for (let distance = 1; distance <= 3; distance += 1) {
      const previous = tokens[index - distance];
      if (!previous) {
        break;
      }

      const scalar = BOOSTERS[normalizeToken(previous)];
      if (scalar !== undefined) {
        const adjustedScalar = isAllCaps(previous) && hasMixedCase
          ? scalar + (scalar > 0 ? 0.733 : -0.733)
          : scalar;
        const attenuatedScalar = adjustedScalar * (distance === 2 ? 0.95 : distance === 3 ? 0.9 : 1);
        valence += valence > 0 ? attenuatedScalar : -attenuatedScalar;
      }
    }

    if (hasNegation(tokens, index)) {
      valence *= -0.74;
    }

    return valence;
  });

  const butIndex = tokens.findIndex((token) => normalizeToken(token) === "but");
  if (butIndex !== -1) {
    for (let index = 0; index < sentiments.length; index += 1) {
      sentiments[index] *= index < butIndex ? 0.5 : index > butIndex ? 1.5 : 1;
    }
  }

  const sentimentSum = sentiments.reduce((total, valence) => total + valence, 0);
  const emphasis = punctuationEmphasis(cleanedText);
  const signedEmphasis = sentimentSum > 0 ? emphasis : sentimentSum < 0 ? -emphasis : 0;
  const compound = normalizeScore(sentimentSum + signedEmphasis);
  const label = compound >= 0.05 ? "Positive" : compound <= -0.05 ? "Negative" : "Neutral";

  return { valid: true, label, compound };
}

function initDemo() {
  const textInput = document.getElementById("review-text");
  const analyzeButton = document.getElementById("analyze-button");
  const message = document.getElementById("input-message");
  const characterCount = document.getElementById("character-count");
  const resultPanel = document.getElementById("result-panel");
  const resultBadge = document.getElementById("result-badge");
  const resultTitle = document.getElementById("result-title");
  const resultExplanation = document.getElementById("result-explanation");
  const compoundScore = document.getElementById("compound-score");
  const scoreMarker = document.getElementById("score-marker");

  function showResult() {
    const result = analyzeSentiment(textInput.value);
    message.hidden = true;

    if (!result.valid) {
      resultPanel.hidden = true;
      message.textContent = result.error;
      message.hidden = false;
      textInput.focus();
      return;
    }

    const explanations = {
      Positive: "The overall wording leans positive. The compound score summarizes the balance and intensity of sentiment in the text.",
      Negative: "The overall wording leans negative. The compound score summarizes the balance and intensity of sentiment in the text.",
      Neutral: "The text reads as neutral or has little sentiment-bearing language in the embedded lexicon."
    };

    resultPanel.dataset.sentiment = result.label.toLowerCase();
    resultBadge.textContent = result.label;
    resultTitle.textContent = `Your text feels ${result.label.toLowerCase()}.`;
    resultExplanation.textContent = explanations[result.label];
    compoundScore.textContent = result.compound.toFixed(3);
    scoreMarker.style.left = `${((result.compound + 1) / 2) * 100}%`;
    resultPanel.hidden = false;
  }

  textInput.addEventListener("input", () => {
    characterCount.textContent = `${textInput.value.length.toLocaleString()} / 5,000`;
    message.hidden = true;
  });

  analyzeButton.addEventListener("click", showResult);

  textInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      showResult();
    }
  });

  document.querySelectorAll("[data-sample]").forEach((button) => {
    button.addEventListener("click", () => {
      textInput.value = button.dataset.sample;
      textInput.dispatchEvent(new Event("input", { bubbles: true }));
      showResult();
    });
  });
}

globalThis.IITSentimentDemo = Object.freeze({ analyzeSentiment });

if (typeof module !== "undefined" && module.exports) {
  module.exports = { analyzeSentiment };
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initDemo);
}
