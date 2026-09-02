export type CareerId = "build" | "analyze" | "protect" | "lead";

export type CareerScore = Record<CareerId, number>;

export type QuizOption = {
  id: string;
  label: string;
  detail: string;
  scores: CareerScore;
};

export type QuizQuestion = {
  eyebrow: string;
  prompt: string;
  helper: string;
  options: QuizOption[];
};

export type InterviewQuestion = {
  id: string;
  type: "Behavioral" | "Technical";
  prompt: string;
  why: string;
  rubric: string[];
  keyTerms: string[];
  coachNote: string;
  strongAnswer: string;
  hasCode?: boolean;
};

export type CareerPath = {
  id: CareerId;
  signal: string;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  color: string;
  softColor: string;
  roles: string[];
  workModes: { label: string; value: number }[];
  dayInLife: { time: string; activity: string; detail: string }[];
  realityCheck: string;
  thrivesWhen: string[];
  friction: string;
  byuMoves: { title: string; detail: string; tag: string }[];
  readiness: { id: string; label: string; detail: string }[];
  outlook: string;
  sourceLabel: string;
  sourceUrl: string;
  questions: InterviewQuestion[];
};

const even = (build = 0, analyze = 0, protect = 0, lead = 0): CareerScore => ({
  build,
  analyze,
  protect,
  lead,
});

export const quizQuestions: QuizQuestion[] = [
  {
    eyebrow: "Follow the spark",
    prompt: "Pick something you could see yourself getting really into.",
    helper: "Choose the one that sounds most naturally absorbing—not most career-relevant.",
    options: [
      {
        id: "customize",
        label: "Building or customizing something",
        detail: "Until it is exactly how I want it.",
        scores: even(4, 1, 0, 1),
      },
      {
        id: "plan-experience",
        label: "Planning a group experience",
        detail: "Trips, events, or something everyone will remember.",
        scores: even(1, 0, 0, 4),
      },
      {
        id: "track-trends",
        label: "Rankings, stats, or tracking trends",
        detail: "Fantasy sports, comparisons, or watching a pattern develop.",
        scores: even(0, 4, 1, 1),
      },
      {
        id: "solve-mystery",
        label: "Strategy games or mysteries",
        detail: "Escape rooms, hidden clues, or figuring out what others missed.",
        scores: even(1, 2, 4, 0),
      },
    ],
  },
  {
    eyebrow: "Dinner decision",
    prompt: "You and your friends are trying a new restaurant. How do you pick?",
    helper: "Go with what you would really do when nobody has a strong preference.",
    options: [
      {
        id: "try-new",
        label: "Find somewhere new",
        detail: "Give it a shot and learn by trying it.",
        scores: even(3, 1, 0, 1),
      },
      {
        id: "group-agreement",
        label: "Get everyone to agree",
        detail: "Find a few good options and build consensus.",
        scores: even(0, 1, 0, 4),
      },
      {
        id: "compare-options",
        label: "Compare the options",
        detail: "Ratings, prices, distance, and reviews all go into the decision.",
        scores: even(0, 4, 1, 2),
      },
      {
        id: "check-red-flags",
        label: "Check the bad reviews first",
        detail: "I want to know whether there are any red flags.",
        scores: even(0, 2, 4, 0),
      },
    ],
  },
  {
    eyebrow: "A completely open Saturday",
    prompt: "You have an entire Saturday with nothing scheduled. Which sounds best?",
    helper: "Pick the version of unstructured time that gives you energy.",
    options: [
      {
        id: "random-project",
        label: "Start a random project",
        detail: "Something I have been wanting to try or make.",
        scores: even(4, 1, 0, 0),
      },
      {
        id: "group-outing",
        label: "Go somewhere with friends",
        detail: "The best version includes a group and a shared plan.",
        scores: even(0, 0, 0, 4),
      },
      {
        id: "rabbit-hole",
        label: "Go down a rabbit hole",
        detail: "Follow a question until I understand something new.",
        scores: even(1, 4, 1, 0),
      },
      {
        id: "nagging-problem",
        label: "Figure out what is bothering me",
        detail: "Finally trace the issue and get it resolved.",
        scores: even(2, 1, 4, 0),
      },
    ],
  },
  {
    eyebrow: "Game-night instinct",
    prompt: "You are playing a board game you have never played before. What is most likely to be you?",
    helper: "Choose the sentence you would actually say.",
    options: [
      {
        id: "learn-playing",
        label: "“Let’s just start playing.”",
        detail: "I will figure it out as we go.",
        scores: even(4, 1, 0, 1),
      },
      {
        id: "check-everyone",
        label: "“Does everyone understand?”",
        detail: "I want the whole group ready before we begin.",
        scores: even(0, 0, 1, 4),
      },
      {
        id: "find-strategy",
        label: "“I think there’s a strategy here.”",
        detail: "Give me a minute to find the pattern.",
        scores: even(1, 4, 1, 0),
      },
      {
        id: "challenge-rule",
        label: "“Can you actually do that?”",
        detail: "I want to check the rules before that move stands.",
        scores: even(1, 1, 4, 0),
      },
    ],
  },
  {
    eyebrow: "The chaotic group project",
    prompt: "Nobody knows what they are doing. What do you do first?",
    helper: "This one is intentionally ambiguous. Choose your first move, not your whole plan.",
    options: [
      {
        id: "clarify-goal",
        label: "Ask what we are solving",
        detail: "Keep asking questions until the actual goal is clear.",
        scores: even(0, 3, 3, 1),
      },
      {
        id: "start-experiment",
        label: "Start experimenting",
        detail: "Make something small so the team has somewhere to begin.",
        scores: even(3, 2, 0, 0),
      },
      {
        id: "map-strengths",
        label: "Figure out everyone’s strengths",
        detail: "Then shape responsibilities around what people can contribute.",
        scores: even(2, 0, 0, 4),
      },
      {
        id: "find-examples",
        label: "Find useful examples",
        detail: "See how other people solved something similar.",
        scores: even(3, 3, 1, 0),
      },
    ],
  },
  {
    eyebrow: "Your friction radar",
    prompt: "Which problem would bother you the most?",
    helper: "Choose the one you would feel compelled to fix.",
    options: [
      {
        id: "too-many-steps",
        label: "Ten steps instead of two",
        detail: "A process is far more complicated than it needs to be.",
        scores: even(3, 1, 0, 2),
      },
      {
        id: "no-owner",
        label: "Nobody knows who owns what",
        detail: "The work keeps drifting because responsibility is unclear.",
        scores: even(0, 0, 1, 4),
      },
      {
        id: "no-truth",
        label: "Opinions without evidence",
        detail: "Everyone has a take, but nobody knows what is true.",
        scores: even(0, 4, 1, 1),
      },
      {
        id: "mystery-failure",
        label: "Something broke for no clear reason",
        detail: "It is not working, and nobody knows why.",
        scores: even(3, 1, 3, 0),
      },
    ],
  },
  {
    eyebrow: "The LEGO test",
    prompt: "You get a huge box of random LEGO pieces with no instructions. What sounds most like you?",
    helper: "There is no right build. Follow your first instinct.",
    options: [
      {
        id: "free-build",
        label: "Start building",
        detail: "See what takes shape once I begin.",
        scores: even(4, 1, 0, 0),
      },
      {
        id: "build-together",
        label: "Build something bigger together",
        detail: "Get a few people involved and combine what we can do.",
        scores: even(1, 0, 0, 4),
      },
      {
        id: "sort-pieces",
        label: "Sort the pieces first",
        detail: "I want to understand what I am working with.",
        scores: even(0, 4, 1, 0),
      },
      {
        id: "reverse-engineer",
        label: "Reverse-engineer something",
        detail: "Recreate a build I have seen by figuring out how it works.",
        scores: even(2, 1, 4, 0),
      },
    ],
  },
  {
    eyebrow: "The payoff",
    prompt: "Which result would make you feel the most satisfied?",
    helper: "Pick the sentence you would be happiest to say at the end.",
    options: [
      {
        id: "made-that",
        label: "“I made that.”",
        detail: "Something useful exists because I built it.",
        scores: even(4, 1, 0, 0),
      },
      {
        id: "pulled-off",
        label: "“We pulled that off.”",
        detail: "A group succeeded because the pieces came together.",
        scores: even(1, 0, 0, 4),
      },
      {
        id: "figured-out",
        label: "“I figured that out.”",
        detail: "A confusing question finally makes sense.",
        scores: even(0, 4, 0, 1),
      },
      {
        id: "caught-that",
        label: "“I caught that.”",
        detail: "I noticed the thing that could have become a problem.",
        scores: even(0, 1, 4, 0),
      },
    ],
  },
];

export const careers: Record<CareerId, CareerPath> = {
  build: {
    id: "build",
    signal: "Builder",
    title: "Software Development",
    shortTitle: "Software",
    tagline: "Turn ambiguity into systems people can trust.",
    description:
      "You are energized by making, debugging, and improving. Software roles reward the patience to trace complex systems and the judgment to build the simplest useful thing.",
    color: "#59D5FF",
    softColor: "#C8F2FF",
    roles: ["Software engineer", "Application developer", "Solutions engineer", "QA automation engineer"],
    workModes: [
      { label: "Building & testing", value: 46 },
      { label: "Reading & debugging", value: 27 },
      { label: "Planning & review", value: 17 },
      { label: "Team communication", value: 10 },
    ],
    dayInLife: [
      { time: "9:10", activity: "Team sync", detail: "Surface blockers and confirm the day’s smallest shippable outcome." },
      { time: "10:00", activity: "Deep build", detail: "Implement a feature, write tests, and trace an unexpected edge case." },
      { time: "1:30", activity: "Code review", detail: "Read a teammate’s approach and make the design clearer together." },
      { time: "3:00", activity: "Customer context", detail: "Clarify a requirement with product or support before committing code." },
    ],
    realityCheck:
      "The job is rarely nonstop greenfield coding. A lot of value comes from reading existing code, narrowing vague requirements, testing edge cases, and leaving a system easier for the next person to understand.",
    thrivesWhen: ["A fuzzy idea needs a working form", "You can focus long enough to follow a bug", "Feedback is specific and iterative"],
    friction: "Frequent context switching and unclear ownership can be draining; strong engineers learn to ask for constraints early.",
    byuMoves: [
      { title: "Package one junior-core build", detail: "Turn an IS 403 or IS 413 project into a 90-second demo with a clear user, tradeoff, and result.", tag: "Portfolio" },
      { title: "Make the database visible", detail: "Use your IS 402 work to explain schema choices, not just the interface.", tag: "Story" },
      { title: "Practice technical narration", detail: "Solve one approachable problem weekly while saying your assumptions and test cases out loud.", tag: "Interview" },
    ],
    readiness: [
      { id: "build-demo", label: "One polished project demo", detail: "Live link or local demo, concise README, and your individual contribution." },
      { id: "build-git", label: "A clean GitHub signal", detail: "Pinned project, meaningful commits, setup instructions, and no exposed secrets." },
      { id: "build-story", label: "Two debugging stories", detail: "Explain symptoms, investigation, root cause, fix, and what you learned." },
      { id: "build-basics", label: "Core fundamentals refreshed", detail: "APIs, databases, testing, data structures, and one language you can use fluently." },
    ],
    outlook: "10% projected growth for software developers, 2025–35",
    sourceLabel: "U.S. Bureau of Labor Statistics",
    sourceUrl: "https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm",
    questions: [
      {
        id: "build-b1",
        type: "Behavioral",
        prompt: "Tell me about a time you had to debug a problem you did not initially understand.",
        why: "Interviewers want evidence that you can stay methodical when the answer is not obvious.",
        rubric: ["Clear symptom and stakes", "Specific investigation steps", "Root cause—not just the fix", "Learning or prevention"],
        keyTerms: ["debug", "test", "root cause", "logs", "learned"],
        coachNote: "Spend more time on your investigation than on the setup. The reasoning is the interesting part.",
        strongAnswer: "In our IS application project, checkout totals occasionally changed after refresh. I first reproduced the issue with a fixed test cart, then logged the values at the API and UI boundaries. That isolated a string-to-number conversion in the client. I fixed the parser, added a regression test for decimal quantities, and documented the data contract. The bug stopped recurring, and I learned to verify types at system boundaries before chasing rendering code.",
      },
      {
        id: "build-t1",
        type: "Technical",
        prompt: "A page becomes slow after a new feature launches. Walk me through how you would investigate it.",
        why: "The goal is not one magic tool; it is a disciplined sequence that narrows the system.",
        rubric: ["Defines the symptom", "Separates client, network, and server", "Uses measurement", "Verifies the fix"],
        keyTerms: ["measure", "network", "server", "database", "profile", "verify"],
        coachNote: "Begin by defining ‘slow’ and who is affected. Then move from observation to isolation to verification.",
        strongAnswer: "I would first quantify the regression—load time, affected routes, devices, and when it began. I’d inspect browser performance and network traces to separate rendering, asset, and API latency. If the API is slow, I’d trace server timing and database queries, looking for changed query volume or missing indexes. I’d form one hypothesis at a time, test against production-like data, and compare the same metric before and after the fix. Finally, I’d add monitoring or a performance budget so the issue is visible earlier next time.",
      },
      {
        id: "build-b2",
        type: "Behavioral",
        prompt: "Describe a technical tradeoff you explained to a nontechnical teammate.",
        why: "IS developers are valuable because they connect implementation choices to business outcomes.",
        rubric: ["Real audience", "Competing options", "Plain-language explanation", "Decision and outcome"],
        keyTerms: ["tradeoff", "option", "user", "impact", "decision"],
        coachNote: "Avoid teaching the technology. Explain what each option meant for time, risk, or the user.",
        strongAnswer: "Our team wanted real-time updates for a class scheduling tool, but the first release had a two-week deadline. I compared web sockets with a simpler refresh-based approach in terms of user value, testing risk, and build time. I recommended the simpler version for the pilot and showed how the architecture could support real-time updates later. We shipped on time, learned that users refreshed infrequently, and avoided complexity that the evidence did not justify.",
      },
      {
        id: "build-t2",
        type: "Technical",
        prompt: "How would you design an API endpoint that creates an account without creating duplicates?",
        why: "This reveals how you think about validation, data integrity, failure, and security together.",
        rubric: ["Input validation", "Database uniqueness", "Safe retry behavior", "Security and errors"],
        keyTerms: ["validate", "unique", "transaction", "idempotent", "hash", "error"],
        coachNote: "Layer the answer: request validation, database guarantee, secure handling, then response behavior.",
        strongAnswer: "I’d validate and normalize the request first, including canonicalizing the email. The database would enforce a unique constraint so two simultaneous requests cannot create duplicates. Passwords would be hashed and never logged. I’d use a transaction for related records and return a generic conflict response that does not expose sensitive account details. If retries are expected, I’d add an idempotency key. Tests would include concurrent requests, invalid input, and rollback after a partial failure.",
      },
    ],
  },
  analyze: {
    id: "analyze",
    signal: "Analyst",
    title: "Data & Analytics",
    shortTitle: "Data",
    tagline: "Find the signal, then make it useful.",
    description:
      "You are drawn to evidence, patterns, and precise questions. Analytics roles combine technical work with the judgment to explain uncertainty and recommend what should happen next.",
    color: "#B59CFF",
    softColor: "#E1D9FF",
    roles: ["Data analyst", "Business intelligence analyst", "Analytics engineer", "Data scientist"],
    workModes: [
      { label: "Cleaning & querying", value: 34 },
      { label: "Analysis & modeling", value: 29 },
      { label: "Explaining decisions", value: 23 },
      { label: "Scoping questions", value: 14 },
    ],
    dayInLife: [
      { time: "9:00", activity: "Question framing", detail: "Turn ‘retention is down’ into a testable set of definitions and segments." },
      { time: "10:30", activity: "Data work", detail: "Join, clean, and validate data before trusting the apparent pattern." },
      { time: "1:00", activity: "Analysis", detail: "Compare cohorts, test assumptions, and quantify uncertainty." },
      { time: "3:30", activity: "Decision readout", detail: "Show the one chart that changes what the team does next." },
    ],
    realityCheck:
      "The glamorous model is a small part of many analytics jobs. Much of the craft is defining metrics, fixing messy data, checking whether the comparison is fair, and persuading people not to overclaim.",
    thrivesWhen: ["The question matters more than the dashboard", "You can challenge a convenient assumption", "The audience wants a recommendation"],
    friction: "Requests often arrive underspecified. You may have to negotiate definitions before you can write the first query.",
    byuMoves: [
      { title: "Build one decision-grade analysis", detail: "Polish an IS 455 project around the decision it supports, your validation, and the limitation you would investigate next.", tag: "Portfolio" },
      { title: "Make SQL conversational", detail: "Practice explaining joins, grain, null handling, and validation without hiding behind syntax.", tag: "Technical" },
      { title: "Create a one-slide readout", detail: "Use one chart, one headline, and one recommendation. Ask a classmate what they would do next.", tag: "Communication" },
    ],
    readiness: [
      { id: "data-case", label: "One end-to-end case study", detail: "Question, source, cleaning, analysis, recommendation, and limitation." },
      { id: "data-sql", label: "SQL without a safety net", detail: "Joins, aggregates, CTEs, window functions, and validation checks." },
      { id: "data-viz", label: "A decision-ready visualization", detail: "Readable at a glance and honest about scale, uncertainty, and context." },
      { id: "data-story", label: "Two impact stories", detail: "Moments when your evidence changed a team’s understanding or next step." },
    ],
    outlook: "35% projected growth for data scientists, 2025–35",
    sourceLabel: "U.S. Bureau of Labor Statistics",
    sourceUrl: "https://www.bls.gov/ooh/math/data-scientists.htm",
    questions: [
      {
        id: "analyze-b1",
        type: "Behavioral",
        prompt: "Tell me about a time the data did not support the story people expected.",
        why: "Good analysts protect decision quality, even when the finding is inconvenient.",
        rubric: ["Expected belief", "Validation performed", "How you communicated it", "Decision or learning"],
        keyTerms: ["expected", "validated", "segment", "evidence", "decision"],
        coachNote: "Show tact and courage. The best answer preserves trust while correcting the conclusion.",
        strongAnswer: "Our team expected longer onboarding sessions to predict better course completion. Before presenting that claim, I segmented new and returning users and found the relationship disappeared for returning users. I checked event definitions and sample sizes, then reframed the finding: long sessions were a signal of first-time friction, not engagement. I showed both views and recommended simplifying the first-run flow. The team changed the experiment, and we avoided optimizing the wrong behavior.",
      },
      {
        id: "analyze-t1",
        type: "Technical",
        prompt: "A dashboard says conversion fell 12% overnight. What do you check before escalating?",
        why: "Interviewers want to see data skepticism, business context, and an efficient diagnostic order.",
        rubric: ["Confirms metric definition", "Checks pipeline and instrumentation", "Segments the change", "Quantifies business impact"],
        keyTerms: ["definition", "pipeline", "instrumentation", "segment", "baseline", "validate"],
        coachNote: "Lead with verification, then localization. Do not jump straight to a business explanation.",
        strongAnswer: "I’d confirm the metric definition, comparison window, timezone, and denominator. Then I’d check freshness, row counts, schema changes, and recent instrumentation releases. If the data is healthy, I’d segment by device, channel, geography, and funnel step to localize the drop. I’d compare with an independent source such as completed orders and estimate absolute impact. Only then would I escalate with what is known, what is ruled out, and the next test.",
      },
      {
        id: "analyze-b2",
        type: "Behavioral",
        prompt: "Describe an analysis you simplified for a busy decision-maker.",
        why: "Analysis creates value only when the audience can understand and use it.",
        rubric: ["Audience and decision", "What you removed", "Clear recommendation", "Observed outcome"],
        keyTerms: ["audience", "decision", "simplified", "recommendation", "outcome"],
        coachNote: "Explain your editorial judgment: what you left out and why.",
        strongAnswer: "For a student organization, I analyzed registration by channel across twelve charts. The president had five minutes and needed to allocate the next event’s budget, so I reduced the readout to one funnel and one cost-per-attendee comparison. I moved methodology to an appendix and led with a recommendation to keep email and test a smaller paid-social budget. The board made the decision in that meeting and used the same format for later events.",
      },
      {
        id: "analyze-t2",
        type: "Technical",
        prompt: "Explain how you would decide whether an A/B test result is trustworthy.",
        why: "This tests experiment reasoning beyond simply reading a p-value.",
        rubric: ["Randomization and sample", "Metric chosen in advance", "Statistical and practical impact", "Guardrails and limitations"],
        keyTerms: ["random", "sample", "metric", "significance", "effect", "guardrail"],
        coachNote: "Separate ‘likely real’ from ‘large enough to matter.’ Mention what could invalidate the test.",
        strongAnswer: "I’d verify random assignment, balanced groups, sample-ratio integrity, and that exposure was logged correctly. I’d confirm the primary metric and stopping rule were chosen before looking at results. Then I’d examine confidence intervals and effect size, not only significance, plus guardrail metrics for harmful tradeoffs. I’d check novelty, seasonality, repeated peeking, and segment consistency. A trustworthy result is both statistically credible and practically meaningful for the decision.",
      },
    ],
  },
  protect: {
    id: "protect",
    signal: "Defender",
    title: "Cybersecurity",
    shortTitle: "Security",
    tagline: "See the failure path before it becomes the headline.",
    description:
      "You naturally test trust and look for what others miss. Security work rewards curiosity, calm under pressure, and the ability to turn technical risk into proportionate action.",
    color: "#FF6F8E",
    softColor: "#FFD1DB",
    roles: ["Security analyst", "GRC analyst", "Cloud security analyst", "Security consultant"],
    workModes: [
      { label: "Monitoring & investigation", value: 35 },
      { label: "Hardening & testing", value: 28 },
      { label: "Risk communication", value: 22 },
      { label: "Documentation", value: 15 },
    ],
    dayInLife: [
      { time: "8:45", activity: "Signal review", detail: "Triage alerts, dismiss noise, and identify behavior that needs investigation." },
      { time: "10:15", activity: "Risk reduction", detail: "Review access, patch a weakness, or test a control with an engineering team." },
      { time: "1:00", activity: "Threat investigation", detail: "Build a timeline from logs and decide the appropriate containment step." },
      { time: "3:30", activity: "Translate the risk", detail: "Explain likelihood, impact, and options to a business owner." },
    ],
    realityCheck:
      "Security is not constant red-team excitement. Strong practitioners spend substantial time documenting controls, tuning noisy alerts, managing access, and persuading teams to fix risks without blocking useful work.",
    thrivesWhen: ["The system has hidden assumptions", "You can stay calm during ambiguity", "Prevention is valued even when nothing happens"],
    friction: "You may have to influence teams that see security as extra work, and some roles include on-call incident response.",
    byuMoves: [
      { title: "Turn IS 414 into evidence", detail: "Create a sanitized threat model or control review that shows how you prioritize—not just what tools you used.", tag: "Portfolio" },
      { title: "Connect network to risk", detail: "Use IS 404 concepts to narrate how a request travels, where trust changes, and what you would log.", tag: "Technical" },
      { title: "Run one ethical lab", detail: "Complete a legal sandbox exercise and write a short incident-style report with scope, evidence, severity, and remediation.", tag: "Practice" },
    ],
    readiness: [
      { id: "sec-lab", label: "One documented security lab", detail: "Authorized scope, method, evidence, risk rating, and remediation." },
      { id: "sec-foundations", label: "Systems foundations refreshed", detail: "Networking, identity, least privilege, common web risks, and logs." },
      { id: "sec-risk", label: "A plain-language risk story", detail: "Explain likelihood, impact, and a proportionate recommendation." },
      { id: "sec-incident", label: "One incident walkthrough", detail: "Detection, triage, containment, recovery, and lessons learned." },
    ],
    outlook: "21% projected growth for information security analysts, 2025–35",
    sourceLabel: "U.S. Bureau of Labor Statistics",
    sourceUrl: "https://www.bls.gov/ooh/computer-and-information-technology/information-security-analysts.htm",
    questions: [
      {
        id: "protect-b1",
        type: "Behavioral",
        prompt: "Tell me about a time you found a risk others had overlooked.",
        why: "Security teams need careful observation without alarmism or blame.",
        rubric: ["Specific risk", "Evidence and validation", "Proportionate response", "How you influenced others"],
        keyTerms: ["risk", "evidence", "impact", "mitigate", "stakeholder"],
        coachNote: "Do not make yourself the lone hero. Show how you verified the risk and brought people with you.",
        strongAnswer: "While reviewing a team project, I noticed our demo environment reused production-like credentials in a shared configuration file. I verified the repository history and confirmed the account permissions before raising it privately. I explained the realistic exposure, helped rotate the credential, moved secrets to environment variables, and added a pre-commit scan. We fixed the issue before the demo and adopted a checklist that prevented the same pattern in later projects.",
      },
      {
        id: "protect-t1",
        type: "Technical",
        prompt: "An employee reports clicking a suspicious link. What are your first steps?",
        why: "This tests calm prioritization, evidence preservation, containment, and communication.",
        rubric: ["Triage and scope", "Containment", "Evidence preservation", "Recovery and communication"],
        keyTerms: ["isolate", "credentials", "logs", "scope", "contain", "preserve"],
        coachNote: "State what you need to learn before choosing the least disruptive effective containment step.",
        strongAnswer: "I’d thank the employee and capture time, device, link, actions taken, and whether credentials or a file were involved. Based on risk, I’d isolate the endpoint, revoke sessions, and reset affected credentials while preserving browser, email, endpoint, identity, and network logs. I’d search for the same indicators across the environment to determine scope. Then I’d remove persistence, restore safely, notify the right owners, and document root cause and control improvements without blaming the reporter.",
      },
      {
        id: "protect-b2",
        type: "Behavioral",
        prompt: "Describe a time you had to explain a technical risk without overstating it.",
        why: "Credible security communication distinguishes possibility, likelihood, and impact.",
        rubric: ["Audience context", "Risk framed clearly", "Options and tradeoffs", "Decision reached"],
        keyTerms: ["likelihood", "impact", "option", "tradeoff", "recommend"],
        coachNote: "Avoid fear language. Show how you helped the audience choose.",
        strongAnswer: "A student team wanted to store survey exports in a shared personal drive. I explained that the main risk was accidental access persistence, not an imminent attacker. I compared three options by effort and exposure, then recommended a group-owned folder with limited membership and an end-of-project deletion date. The team adopted it immediately because the recommendation matched the actual risk and took only a few minutes.",
      },
      {
        id: "protect-t2",
        type: "Technical",
        prompt: "How would you review a web application’s authentication design?",
        why: "The answer reveals whether you can reason across identity, sessions, recovery, and monitoring.",
        rubric: ["Identity lifecycle", "Credential and session controls", "Authorization separation", "Abuse and recovery paths"],
        keyTerms: ["MFA", "session", "authorization", "rate limit", "recovery", "log"],
        coachNote: "Authentication proves identity; authorization governs access. Make that distinction explicit.",
        strongAnswer: "I’d map registration, login, logout, session renewal, password reset, and account recovery before testing controls. I’d check secure password storage, MFA options, rate limiting, generic error messages, cookie flags, CSRF protection, and session invalidation. Then I’d verify that authorization is enforced server-side for every object and action. I’d test recovery and support paths for bypasses and confirm sensitive identity events are logged, monitored, and reviewable.",
      },
    ],
  },
  lead: {
    id: "lead",
    signal: "Orchestrator",
    title: "Product & Project",
    shortTitle: "Product",
    tagline: "Create clarity where people, systems, and priorities meet.",
    description:
      "You are energized by alignment, momentum, and useful outcomes. Product and project roles reward the ability to discover the real problem, make tradeoffs visible, and help specialists do their best work.",
    color: "#FFB85C",
    softColor: "#FFE2B9",
    roles: ["Associate product manager", "IT project manager", "Business systems analyst", "Technology consultant"],
    workModes: [
      { label: "Discovery & decisions", value: 29 },
      { label: "Alignment & communication", value: 31 },
      { label: "Planning & follow-through", value: 25 },
      { label: "Analysis & documentation", value: 15 },
    ],
    dayInLife: [
      { time: "9:00", activity: "Priority check", detail: "Review customer signal, delivery risk, and the decision the team needs today." },
      { time: "10:30", activity: "Discovery", detail: "Interview a user or partner to understand the job behind a feature request." },
      { time: "1:00", activity: "Team working session", detail: "Clarify scope, surface tradeoffs, and give specialists room to shape the solution." },
      { time: "3:15", activity: "Decision hygiene", detail: "Update the plan, close loops, and explain what changed and why." },
    ],
    realityCheck:
      "The role is not simply having ideas or running meetings. Much of the craft is listening, writing, saying no with context, tracking unglamorous details, and owning outcomes you cannot produce alone.",
    thrivesWhen: ["Different groups need a shared definition", "The right next step is unclear", "You can learn enough technical detail to ask better questions"],
    friction: "You are accountable for momentum without controlling every dependency, and priorities may change after careful planning.",
    byuMoves: [
      { title: "Turn IS 401 or 405 into a case", detail: "Show the ambiguity, stakeholder needs, tradeoff, decision, and measurable outcome—not just the final deliverable.", tag: "Portfolio" },
      { title: "Keep your technical edge", detail: "Use IS 402, 403, 404, and 413 vocabulary to ask credible questions and understand engineering constraints.", tag: "Fluency" },
      { title: "Lead one real retrospective", detail: "Facilitate a short team retro, identify one system change, and follow up on whether it helped.", tag: "Leadership" },
    ],
    readiness: [
      { id: "lead-case", label: "One outcome-focused case study", detail: "Problem, users, constraints, tradeoff, your role, and what changed." },
      { id: "lead-stories", label: "Three influence stories", detail: "Conflict, ambiguity, and a decision you drove without formal authority." },
      { id: "lead-artifact", label: "A crisp working artifact", detail: "One-page brief, process map, roadmap slice, or decision memo." },
      { id: "lead-tech", label: "Technical fluency examples", detail: "Times your systems understanding improved scope, risk, or communication." },
    ],
    outlook: "7% projected growth for project management specialists, 2025–35",
    sourceLabel: "U.S. Bureau of Labor Statistics",
    sourceUrl: "https://www.bls.gov/ooh/business-and-financial/project-management-specialists.htm",
    questions: [
      {
        id: "lead-b1",
        type: "Behavioral",
        prompt: "Tell me about a time you aligned people who wanted different outcomes.",
        why: "Product and project work depends on surfacing the real disagreement and moving toward a shared decision.",
        rubric: ["Competing needs", "How you listened", "Decision mechanism", "Outcome and follow-through"],
        keyTerms: ["stakeholder", "priority", "tradeoff", "decision", "outcome"],
        coachNote: "Show the disagreement clearly. Alignment is not impressive if everyone already agreed.",
        strongAnswer: "On a class application, the sponsor wanted more features while the developers needed stability before the demo. I met with each side to identify the underlying goals: sponsor confidence and a reliable core flow. I proposed a must-have acceptance checklist, moved two features into a clearly labeled next release, and scheduled a midpoint demo. We delivered the core flow without defects, and the sponsor approved the deferred items because the tradeoff and follow-up were explicit.",
      },
      {
        id: "lead-t1",
        type: "Technical",
        prompt: "A stakeholder asks for a feature that will take six weeks. How do you decide what to do?",
        why: "This tests discovery, technical collaboration, prioritization, and outcome thinking.",
        rubric: ["Clarifies the user problem", "Tests value and urgency", "Explores smaller options", "Makes tradeoffs explicit"],
        keyTerms: ["user", "outcome", "evidence", "scope", "tradeoff", "measure"],
        coachNote: "Do not begin by accepting or rejecting the feature. Begin with the job it is meant to accomplish.",
        strongAnswer: "I’d ask who has the problem, how they solve it today, how often it occurs, and what outcome would improve. I’d look for evidence in interviews, support data, or behavior, then work with engineering to identify the cost, risks, and smallest testable version. I’d compare it with current priorities using expected impact and urgency. The decision would document what we believe, what we are giving up, and the metric or feedback that will tell us whether to continue.",
      },
      {
        id: "lead-b2",
        type: "Behavioral",
        prompt: "Describe a project that started to slip and how you responded.",
        why: "Interviewers want honest visibility, intelligent replanning, and ownership—not heroic last-minute effort.",
        rubric: ["Early signal", "Root cause", "Replan and communication", "Result and prevention"],
        keyTerms: ["risk", "dependency", "scope", "communicate", "replan"],
        coachNote: "Say when you noticed the problem. Strong project leaders make risk visible early.",
        strongAnswer: "Two weeks into our database project, integration work was slipping because the front-end and API teams used different field definitions. I compared the plan with completed work, identified the shared contract as the constraint, and called a 30-minute working session. We agreed on one schema, cut a low-value report, assigned an integration owner, and added a daily ten-minute check until the risk cleared. We recovered the core milestone and added contract review to future kickoff checklists.",
      },
      {
        id: "lead-t2",
        type: "Technical",
        prompt: "What would you include in a good product requirement for a new onboarding flow?",
        why: "This tests whether you can give a team clarity without prematurely dictating the solution.",
        rubric: ["Problem and audience", "Evidence and desired outcome", "Constraints and edge cases", "Success and non-goals"],
        keyTerms: ["problem", "user", "outcome", "constraint", "metric", "non-goal"],
        coachNote: "A requirement should clarify the decision space. It should not turn into a 40-page substitute for conversation.",
        strongAnswer: "I’d define the target user, the current onboarding failure, and the evidence that it matters. I’d state the desired behavior and success metrics, plus constraints such as accessibility, privacy, platform, and deadline. I’d include key scenarios and edge cases, dependencies, open questions, and explicit non-goals. I might add a rough flow to make the problem concrete, while leaving room for design and engineering to shape the best solution.",
      },
    ],
  },
};

export const careerOrder: CareerId[] = ["build", "analyze", "protect", "lead"];
