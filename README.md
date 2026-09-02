# BYU IS Career Launchpad

A polished, browser-based career discovery and interview practice MVP for BYU Information Systems juniors preparing for recruiting.

## What is included

- An eight-question, one-question-at-a-time career signal
- Four IS paths: Software Development, Data & Analytics, Cybersecurity, and Product & Project
- A ranked fit result with an animated reveal
- Honest role previews: representative day, work rhythm, likely friction, and related titles
- BYU junior-core preparation moves and persistent internship-readiness checklists
- Sixteen role-specific interview questions: two behavioral and two technical per path
- Typed answers plus progressive-enhancement voice dictation through the browser Speech Recognition API
- Deterministic answer coaching, role criteria, strong-answer comparisons, and a practice-set summary
- Responsive desktop/mobile layouts and reduced-motion support

No database, account, environment variable, or paid AI API is required for the MVP.

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Verify

```bash
npm run lint
npm run build
```

The project intentionally uses webpack for local development and production builds. This keeps builds reliable in restricted environments where Turbopack cannot open its internal helper port.

## Edit the career content

All assessment, career, checklist, and interview content lives in:

```text
src/data/careers.ts
```

The scoring and local interview feedback logic lives in:

```text
src/lib/scoring.ts
```

The data is typed, so malformed additions are caught during `npm run build`. See `docs/PRODUCT_CONCEPT.md` for the content model and research rationale.

## Voice support

Voice dictation is an enhancement, not a dependency. The practice lab detects browser support and enables **Answer with voice** where `SpeechRecognition` is available. Chrome-family browsers currently provide the most reliable demo experience. Other browsers retain the complete typed-answer flow.

## Deploy on Vercel

1. Push this directory to a GitHub repository.
2. Import the repository in Vercel.
3. Keep the detected framework as **Next.js**.
4. No environment variables or build overrides are required.
5. Deploy.

## Important positioning

This is a student-built exploration tool, not an official BYU advising product or a validated psychometric assessment. Fit percentages are intentionally framed as hypotheses to investigate through projects and conversations—not as hiring predictions or permanent labels.
