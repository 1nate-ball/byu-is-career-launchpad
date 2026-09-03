# BYU IS Career Launchpad

A polished, browser-based career discovery and interview practice MVP for BYU Information Systems juniors preparing for recruiting.

## Live site

[Open the BYU IS Career Launchpad](https://1nate-ball.github.io/byu-is-career-launchpad/)

The public site is rebuilt automatically by GitHub Actions whenever `main` is updated.

## What is included

- An eight-question, one-question-at-a-time career signal
- Four IS paths: Software Development, Data & Analytics, Cybersecurity, and Product & Project
- A ranked fit result with an animated reveal and answer-level explanation of why the match surfaced
- Four interactive, O*NET-grounded field trials that let students test the work before committing to a path
- Three focused role views: real work, recruiter expectations, and the path ahead
- Contextual salary benchmarks that keep BYU first-job data separate from national all-experience medians
- BYU junior-core preparation moves and persistent internship-readiness checklists
- Twenty-four researched interview questions: three behavioral and three technical per path
- A recruiter-proof builder that turns honest classwork details into a resume bullet and interview story spine
- Printable personal launch cards with match evidence, field-trial results, and a seven-day action plan
- Typed answers plus local audio recording/replay and progressive-enhancement voice dictation
- Deterministic answer coaching, attempt-over-attempt comparison, role criteria, strong-answer comparisons, and a practice-set summary
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

The assessment, broad career framing, and BYU readiness content lives in:

```text
src/data/careers.ts
```

The teammate-informed role research, salary context, progression, credentials, and interview bank lives in:

```text
src/data/career-research.ts
```

The decision scenarios and seven-day field plans live in:

```text
src/data/field-trials.ts
```

The scoring and local interview feedback logic lives in:

```text
src/lib/scoring.ts
```

The data is typed, so malformed additions are caught during `npm run build`. See `docs/PRODUCT_CONCEPT.md` for the content model and research rationale.

## Voice support

Voice is an enhancement, not a dependency. Where supported, the practice lab can record an attempt for local replay and use `SpeechRecognition` to place spoken words in the answer field. Audio remains in the current tab and is not uploaded. Other browsers retain the complete typed-answer flow.

## GitHub Pages deployment

The app uses Next.js static export and deploys through `.github/workflows/deploy-pages.yml`. GitHub supplies the repository base path during the build, so local development remains available at `/` while the published site works at `/byu-is-career-launchpad/`.

## Important positioning

This is a student-built exploration tool, not an official BYU advising product or a validated psychometric assessment. Fit percentages are intentionally framed as hypotheses to investigate through projects and conversations—not as hiring predictions or permanent labels.
