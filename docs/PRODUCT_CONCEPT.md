# Product concept: Career Signal

## The product promise

Help a BYU Information Systems junior move from “IS could mean almost anything” to one promising recruiting direction, a realistic picture of the work, and a useful action they can take this week.

The memorable layer is **Career Signal**. The practical layer is the **Career Path Workspace**. Students may receive one of four signals:

| Signal | Career path | Core motivation |
| --- | --- | --- |
| Builder | Software Development | Make, debug, and improve working systems |
| Analyst | Data & Analytics | Turn evidence into a decision |
| Defender | Cybersecurity | Find and reduce hidden risk |
| Orchestrator | Product & Project | Create clarity across people, systems, and priorities |

These are starting hypotheses, not personality labels. Every result keeps all four paths visible.

## Why the experience is structured this way

- **One question at a time.** The [GOV.UK Design System question-page pattern](https://design-system.service.gov.uk/patterns/question-pages/) recommends this structure to reduce cognitive load and maintain focus. We use a simple “Question 3 of 8” indicator, a visible back control, and an explicit Continue action.
- **A reveal with immediate utility.** The cinematic moment creates emotional salience, then quickly translates the archetype into real titles, work patterns, friction, and action.
- **Progressive disclosure.** The dashboard reveals detail by task: first the role summary, then the real work, then BYU preparation, then readiness, then interview practice.
- **Motion with a job.** GSAP handles scene entrances, the signal orbit, and the result reveal. Motion is brief and tied to state changes. `gsap.matchMedia()` and CSS honor `prefers-reduced-motion`, consistent with [GSAP guidance](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/) and [W3C technique C39](https://www.w3.org/WAI/WCAG21/Techniques/css/C39.html).
- **Voice without fragility.** The browser [SpeechRecognition API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) is not supported everywhere, so the same coaching workflow always works by typing. Voice is enabled only after capability detection.
- **Transparent coaching.** The MVP does not pretend to be AI. It checks answer depth, structure, specificity, focused length, and role language, then shows its evidence and a human-readable rubric.

## Visual direction

The supplied Sorting Hat screenshots inspired interaction principles rather than intellectual property:

- Deep, restrained navy canvas
- One focal decision at a time
- Strong serif display type paired with compact utility type
- Four distinct signal colors
- Generous negative space
- A ritual-like reveal followed by a conventional, highly usable workspace

The implementation is approximately 70% professional and 30% playful. BYU navy, white, and gold establish the brand; cyan, violet, coral, and amber distinguish career paths. Decorative geometry stays abstract and functional.

## Assessment model

Eight situational questions score preferences across four dimensions: build, analyze, protect, and lead. Each option contributes a small transparent weight to every path. Percentages are normalized for a readable comparative display and deliberately avoid claims of psychometric validity.

The current question set is a strong MVP content model. A later research pass could validate wording with:

1. Five to eight current IS juniors
2. Two students recruiting into each target path
3. Alumni or recruiters who can identify false signals and missing tradeoffs
4. A short completion/clarity study rather than a “did you like it?” survey

## Career content sources

The role descriptions and work framing are grounded in current public career data and BYU program context:

- [BYU Marriott: Information Systems at a Glance](https://marriott.byu.edu/infosys/about/what-is-information-systems/at-a-glance/)
- [BYU Marriott: BS Information Systems Program Overview](https://marriott.byu.edu/infosys/bsis/what-will-i-study/program-overview/)
- [BYU Marriott: Career Tools](https://marriott.byu.edu/infosys/careers/career-tools/)
- [BLS: Software Developers](https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm)
- [BLS: Data Scientists](https://www.bls.gov/ooh/math/data-scientists.htm)
- [BLS: Information Security Analysts](https://www.bls.gov/ooh/computer-and-information-technology/information-security-analysts.htm)
- [O*NET: Information Security Analysts](https://www.onetonline.org/link/details/15-1212.00)

Team research should replace or extend the starter content in `src/data/careers.ts`; the interface should not need to be rebuilt.

## Scope decisions for the MVP

Included now:

- Personalized role ranking
- Four complete path workspaces
- BYU preparation advice
- Persistent readiness checklists
- Role-specific behavioral and technical practice
- Typed and voice-dictated responses
- Local, explainable coaching

Deferred deliberately:

- Accounts and cross-device sync
- Runtime generative AI
- Job-description parsing
- Resume uploads
- Live job feeds
- Video recording
- Recruiter or advisor dashboards

The next high-value enhancement is not more surface area. It is replacing starter career content with the team’s validated research and testing whether students understand why they matched a path.
