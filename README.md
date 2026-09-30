# Pikvita Quiz

A single-file interactive quiz for Pikvita. One React component, no build step, no dependencies to install. Spectrum-style questions rather than multiple choice, and a scored result at the end.

---

## What it is

`pikvita-quiz-v2.jsx` is the whole product. It is a self-contained React component that renders a question flow, records answers, and computes a result.

Two things distinguish it from a typical quiz:

- **Spectrum questions.** Answers are points on a scale, not discrete options, so the result reflects a position rather than a bucket.
- **Per-question interaction state.** The component tracks which questions the user has already answered, so revisiting a question shows their previous choice instead of resetting it.

---

## Usage

The file exports a single component:

```jsx
import PikvitaQuiz from './pikvita-quiz-v2.jsx';
```

To edit the quiz, change the `questions` array near the top of the file. Each entry defines the prompt and its spectrum options. The result logic follows below it.

---

## Running it

There is nothing to build. Drop the component into any React app:

```bash
npm create vite@latest pikvita-quiz-demo -- --template react
cd pikvita-quiz-demo
cp ../path/to/pikvita-quiz-v2.jsx src/
# then render <PikvitaQuiz /> in src/App.jsx
npm run dev
```

React 18+ and JSX support are the only requirements.

---

## Status

Dormant single-file prototype. Dormant for over two years, and kept as a standalone snippet rather than folded into the Pikvita app.
