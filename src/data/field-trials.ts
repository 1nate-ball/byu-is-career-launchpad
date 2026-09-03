import type { CareerId } from "@/data/careers";

export type TrialChoice = {
  id: string;
  title: string;
  detail: string;
  score: 1 | 2 | 3;
  response: string;
  principle: string;
};

export type TrialStep = {
  id: string;
  eyebrow: string;
  situation: string;
  prompt: string;
  choices: TrialChoice[];
};

export type FieldTrial = {
  careerId: CareerId;
  title: string;
  mission: string;
  setting: string;
  sourceLabel: string;
  sourceUrl: string;
  steps: TrialStep[];
  launchWeek: { day: string; title: string; detail: string }[];
};

export type TrialResult = {
  score: number;
  maxScore: number;
  energy: number;
};

export const fieldTrials: Record<CareerId, FieldTrial> = {
  build: {
    careerId: "build",
    title: "The Checkout Incident",
    mission: "Trace a production failure without turning one bug into three.",
    setting: "A student-built event platform begins returning errors just after a Friday release. Registrations are open now, and the team needs a calm first move.",
    sourceLabel: "O*NET Software Developers",
    sourceUrl: "https://www.onetonline.org/link/summary/15-1252.00",
    steps: [
      {
        id: "build-scope",
        eyebrow: "01 / Stabilise the problem",
        situation: "Support reports that some students cannot check out. The release changed both the cart interface and a database query.",
        prompt: "What do you do first?",
        choices: [
          { id: "guess", title: "Patch the most suspicious line", detail: "The database change looks risky, so edit it immediately.", score: 1, response: "Fast, but it changes evidence before you know which path is failing.", principle: "Preserve the signal before changing the system." },
          { id: "observe", title: "Reproduce and inspect", detail: "Confirm the failure, check logs, and compare it with the release boundary.", score: 3, response: "Strong. You turn a broad alarm into a testable failure before choosing a fix.", principle: "Reproduce, observe, then narrow." },
          { id: "rollback", title: "Rollback the full release", detail: "Restore the last known version before investigating further.", score: 2, response: "Reasonable when impact is high, though you still need enough evidence to know the rollback is safe and useful.", principle: "Containment and diagnosis should inform one another." },
        ],
      },
      {
        id: "build-diagnose",
        eyebrow: "02 / Narrow the cause",
        situation: "Logs show database timeouts only when a cart contains several discounted items. Small carts still work.",
        prompt: "Which next step creates the best evidence?",
        choices: [
          { id: "retry", title: "Add automatic retries", detail: "Give the slow query more chances to finish.", score: 1, response: "Retries may multiply load and disguise the actual defect.", principle: "A workaround is not a diagnosis." },
          { id: "query", title: "Inspect the query path", detail: "Compare query plans and inputs for small and discounted carts.", score: 3, response: "Strong. The boundary between working and failing carts gives you a focused experiment.", principle: "Use differences between cases to isolate causes." },
          { id: "timeout", title: "Increase the timeout", detail: "Allow the existing query to run longer during registration.", score: 2, response: "This may reduce visible errors, but it trades reliability for slower failure unless you also find the cause.", principle: "Name the tradeoff in every temporary fix." },
        ],
      },
      {
        id: "build-verify",
        eyebrow: "03 / Prove the repair",
        situation: "You find a missing index, add it, and the failing cart now completes locally.",
        prompt: "What makes this a professional fix?",
        choices: [
          { id: "ship", title: "Deploy immediately", detail: "The cart worked once, and students are waiting.", score: 1, response: "One success is encouraging, but it does not protect the team from the same failure returning.", principle: "A fix needs evidence and a guardrail." },
          { id: "test", title: "Add a regression test and monitor", detail: "Cover the discounted-cart case, deploy gradually, and watch latency and error rate.", score: 3, response: "Strong. You verify the behavior, protect it, and watch the real system after release.", principle: "Test the failure boundary and monitor the outcome." },
          { id: "announce", title: "Tell the team it is fixed", detail: "Document the index change and close the incident.", score: 2, response: "Communication matters, but closure should follow production evidence rather than precede it.", principle: "Close an incident with proof, not optimism." },
        ],
      },
    ],
    launchWeek: [
      { day: "Today", title: "Polish one working feature", detail: "Choose a junior-core build and add one test, a useful README, and a two-sentence explanation of your decision." },
      { day: "Within 3 days", title: "Run a code conversation", detail: "Ask a classmate or alumnus to question one implementation choice and record what you would change." },
      { day: "Before the fair", title: "Rehearse the incident story", detail: "Practise explaining the bug, your diagnostic sequence, the tradeoff, and how you verified the repair." },
    ],
  },
  analyze: {
    careerId: "analyze",
    title: "The Vanishing Conversion",
    mission: "Turn an alarming metric into a decision the team can trust.",
    setting: "A campus marketplace reports an 18% week-over-week conversion drop. Leaders want an explanation before the afternoon meeting.",
    sourceLabel: "O*NET Data Scientists",
    sourceUrl: "https://www.onetonline.org/link/summary/15-2051.00",
    steps: [
      {
        id: "analyze-validate",
        eyebrow: "01 / Question the number",
        situation: "The dashboard is refreshed daily, but nobody in the room can state exactly how conversion is defined.",
        prompt: "What deserves attention first?",
        choices: [
          { id: "trend", title: "Graph the last twelve months", detail: "More history may reveal whether the drop is seasonal.", score: 2, response: "Useful soon, but historical context cannot rescue an undefined or broken metric.", principle: "Validate the measure before interpreting its movement." },
          { id: "definition", title: "Audit definition and freshness", detail: "Confirm numerator, denominator, time zone, data delay, and recent tracking changes.", score: 3, response: "Strong. You establish that the number means what the team thinks it means.", principle: "A confident chart begins with a trustworthy measure." },
          { id: "average", title: "Compare with the monthly average", detail: "A longer window should smooth the alarming change.", score: 1, response: "Smoothing can hide a real break and does not test whether the pipeline is healthy.", principle: "Do not average away uncertainty." },
        ],
      },
      {
        id: "analyze-localize",
        eyebrow: "02 / Find the boundary",
        situation: "The definition is sound. The drop began after a mobile release, while desktop conversion appears steady.",
        prompt: "Which analysis is most useful next?",
        choices: [
          { id: "survey", title: "Survey every user", detail: "Ask customers why they did not complete a purchase.", score: 1, response: "Research may help later, but the device boundary already offers a faster way to localise the failure.", principle: "Follow the strongest available signal first." },
          { id: "segment", title: "Segment the mobile funnel", detail: "Compare steps, versions, traffic sources, and completed orders against an independent source.", score: 3, response: "Strong. You narrow where the loss occurs and cross-check whether it is real.", principle: "Segment to localise; triangulate to trust." },
          { id: "total", title: "Report total revenue impact", detail: "Translate the percentage into dollars for leadership.", score: 2, response: "Impact matters, but the team still needs to know where the drop begins before acting.", principle: "Size the problem and locate it." },
        ],
      },
      {
        id: "analyze-recommend",
        eyebrow: "03 / Make the recommendation",
        situation: "The largest loss is on the payment step for version 4.2, but the sample is only six hours old.",
        prompt: "How do you present the finding?",
        choices: [
          { id: "certain", title: "Declare the release responsible", detail: "The timing and segment line up, so recommend an immediate rollback.", score: 2, response: "The recommendation may be right, but the certainty outruns the evidence.", principle: "Separate what you know from what you infer." },
          { id: "wait", title: "Wait for a full week", detail: "Avoid saying anything until the sample is unquestionably large.", score: 1, response: "Perfect certainty arrives too late for many useful decisions.", principle: "Decision quality includes timeliness." },
          { id: "calibrated", title: "State evidence, risk, and next test", detail: "Describe the pattern, quantify current impact, label uncertainty, and propose a monitored rollback or experiment.", score: 3, response: "Strong. You give leaders a decision now without pretending the evidence is complete.", principle: "Make uncertainty usable." },
        ],
      },
    ],
    launchWeek: [
      { day: "Today", title: "Turn one assignment into a case", detail: "Write the question, source, cleaning decision, finding, limitation, and recommendation on a single page." },
      { day: "Within 3 days", title: "Ask for a sceptical read", detail: "Have someone challenge your metric definition and one conclusion before you polish the visual." },
      { day: "Before the fair", title: "Practise the executive version", detail: "Explain the decision in sixty seconds: evidence, implication, uncertainty, and next test." },
    ],
  },
  protect: {
    careerId: "protect",
    title: "The Impossible Sign-in",
    mission: "Triage a suspicious event while preserving evidence and business context.",
    setting: "An alert shows a finance analyst signing in from Utah and Eastern Europe within eleven minutes. Payroll closes today.",
    sourceLabel: "O*NET Information Security Analysts",
    sourceUrl: "https://www.onetonline.org/link/summary/15-1212.00",
    steps: [
      {
        id: "protect-triage",
        eyebrow: "01 / Judge the signal",
        situation: "The foreign session used a new device. Multi-factor authentication was approved, but the IP belongs to a commercial VPN.",
        prompt: "What is your first move?",
        choices: [
          { id: "ignore", title: "Dismiss the VPN alert", detail: "VPN locations are unreliable, and MFA succeeded.", score: 1, response: "Both facts reduce certainty, but neither proves the session is legitimate.", principle: "Uncertainty should shape investigation, not erase risk." },
          { id: "disable", title: "Disable the account permanently", detail: "Remove access before any financial data can be changed.", score: 2, response: "Containment is defensible, but permanent action is larger than the evidence and may disrupt payroll unnecessarily.", principle: "Match containment to likely impact and reversibility." },
          { id: "contain", title: "Revoke sessions and verify", detail: "Apply reversible containment, contact the user through a trusted channel, and preserve the alert evidence.", score: 3, response: "Strong. You reduce exposure while continuing to test whether the activity is legitimate.", principle: "Contain, preserve, and verify in parallel." },
        ],
      },
      {
        id: "protect-scope",
        eyebrow: "02 / Establish scope",
        situation: "The analyst denies the sign-in. You find three mailbox rules created moments after the foreign session began.",
        prompt: "What should you investigate next?",
        choices: [
          { id: "device", title: "Reimage the analyst’s laptop", detail: "Assume the endpoint is compromised and start over.", score: 1, response: "The device may matter, but current evidence points first to account and mailbox activity.", principle: "Let observed behavior guide the scope." },
          { id: "identity", title: "Trace identity and mailbox activity", detail: "Review sign-in logs, token use, rule actions, privilege, and similar events across accounts.", score: 3, response: "Strong. You follow the attacker’s likely path and test whether the incident extends beyond one account.", principle: "Scope the identities, actions, and blast radius." },
          { id: "password", title: "Reset the password and stop", detail: "A new password should block future access.", score: 2, response: "Necessary, but active tokens, malicious rules, or wider access may survive a password change.", principle: "Eradication requires more than one control." },
        ],
      },
      {
        id: "protect-communicate",
        eyebrow: "03 / Communicate under pressure",
        situation: "Access is contained. Leaders ask whether payroll data was stolen; logs show mailbox access but no confirmed download.",
        prompt: "What is the clearest update?",
        choices: [
          { id: "safe", title: "Say no data was stolen", detail: "There is no download event, so reassure leadership.", score: 1, response: "Absence of one event is not proof that no exposure occurred.", principle: "Never convert missing evidence into certainty." },
          { id: "breach", title: "Declare a confirmed breach", detail: "Treat the suspicious access as proof of theft.", score: 2, response: "Urgency is appropriate, but the claim should remain aligned with what the logs establish.", principle: "Escalate risk without overstating fact." },
          { id: "known", title: "Separate known, unknown, and next", detail: "Report confirmed access and containment, identify the unresolved exposure question, and name the next evidence check.", score: 3, response: "Strong. Leaders receive a useful risk picture and a clear next update point.", principle: "Calibrated language is a security control." },
        ],
      },
    ],
    launchWeek: [
      { day: "Today", title: "Write one incident note", detail: "Use a lab or class scenario to record signal, scope, containment, evidence, and the next unanswered question." },
      { day: "Within 3 days", title: "Practise a threat briefing", detail: "Explain one risk to a nontechnical classmate without drama, jargon, or false certainty." },
      { day: "Before the fair", title: "Prepare your lab evidence", detail: "Bring one sanitised screenshot, query, control decision, or short incident write-up you can discuss." },
    ],
  },
  lead: {
    careerId: "lead",
    title: "The Priority Collision",
    mission: "Create a defensible decision when people, time, and evidence disagree.",
    setting: "Two days before a student-services release, advising requests a new enrollment feature while engineering reports growing reliability risk.",
    sourceLabel: "O*NET Project Management Specialists",
    sourceUrl: "https://www.onetonline.org/link/summary/13-1082.00",
    steps: [
      {
        id: "lead-frame",
        eyebrow: "01 / Frame the decision",
        situation: "Advising says the feature is urgent. Engineering says any scope increase may threaten registration-week stability.",
        prompt: "How do you begin?",
        choices: [
          { id: "vote", title: "Ask the team to vote", detail: "A quick majority decision will keep the meeting moving.", score: 1, response: "Voting is fast, but it can hide the user outcome, technical risk, and who owns the decision.", principle: "Alignment begins with a shared decision frame." },
          { id: "frame", title: "Clarify outcome and constraints", detail: "Name the affected student, desired outcome, deadline, reliability threshold, and decision owner.", score: 3, response: "Strong. The conflict becomes a decision with criteria rather than a contest of opinions.", principle: "Define the outcome before comparing solutions." },
          { id: "defer", title: "Follow the senior stakeholder", detail: "Advising requested the feature, so engineering should find a way.", score: 2, response: "Authority matters, but good product leadership makes the cost and risk visible before commitment.", principle: "Escalation should carry clear tradeoffs." },
        ],
      },
      {
        id: "lead-options",
        eyebrow: "02 / Shape the options",
        situation: "The full feature takes six days. A manual advising workflow could help the highest-need students tomorrow.",
        prompt: "What do you bring to the decision?",
        choices: [
          { id: "full", title: "Promise the full feature", detail: "Commit publicly so the team has urgency and accountability.", score: 1, response: "A promise does not remove the capacity or reliability constraint.", principle: "Commitments should follow evidence, not manufacture it." },
          { id: "small", title: "Compare a smaller test", detail: "Lay out the manual option, limited product slice, full build, and the impact, effort, and risk of each.", score: 3, response: "Strong. You make tradeoffs explicit and preserve a path to learn before the larger commitment.", principle: "Create options that reveal the real tradeoff." },
          { id: "stability", title: "Cancel all feature work", detail: "Reliability risk always outranks new capability.", score: 2, response: "Protecting stability may be right, but an absolute rule can overlook a safe and valuable smaller option.", principle: "Priorities depend on context and thresholds." },
        ],
      },
      {
        id: "lead-close",
        eyebrow: "03 / Make alignment durable",
        situation: "The group chooses the manual workflow now and a limited product experiment after registration week.",
        prompt: "How do you close the loop?",
        choices: [
          { id: "meeting", title: "End with verbal agreement", detail: "Everyone heard the decision and can begin working.", score: 1, response: "Shared memory decays quickly, especially when the original priorities were contested.", principle: "Important alignment deserves an artifact." },
          { id: "roadmap", title: "Add the feature to the roadmap", detail: "A future date proves the request was not ignored.", score: 2, response: "A date helps, but it can become a promise without a learning condition or owner.", principle: "A roadmap should communicate intent and uncertainty." },
          { id: "decision", title: "Publish a one-page decision", detail: "Record owner, rationale, tradeoffs, success signal, follow-up date, and what would change the plan.", score: 3, response: "Strong. The artifact keeps teams aligned and makes the decision revisable when evidence changes.", principle: "Document not only what, but why and until when." },
        ],
      },
    ],
    launchWeek: [
      { day: "Today", title: "Create one decision artifact", detail: "Turn a team choice into a one-page brief with user, outcome, evidence, tradeoff, owner, and next check." },
      { day: "Within 3 days", title: "Interview a technical teammate", detail: "Ask what makes project or product partners especially helpful—and what creates avoidable friction." },
      { day: "Before the fair", title: "Rehearse the conflict story", detail: "Explain how you clarified a disagreement, what you personally did, and what changed for the team." },
    ],
  },
};
