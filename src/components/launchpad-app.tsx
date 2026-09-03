"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BadgeCheck,
  BookOpenCheck,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Circle,
  Code2,
  Compass,
  ExternalLink,
  Gauge,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Mic,
  MicOff,
  Play,
  Printer,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Users,
  Volume2,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { careers, careerOrder, quizQuestions, type CareerId } from "@/data/careers";
import { byuPlacementUrl, careerResearch } from "@/data/career-research";
import { fieldTrials, type TrialResult } from "@/data/field-trials";
import {
  analyzeInterviewAnswer,
  calculateMatches,
  getMatchEvidence,
  type AnswerAnalysis,
  type QuizAnswers,
} from "@/lib/scoring";

gsap.registerPlugin(useGSAP);

type View = "home" | "quiz" | "reveal" | "dashboard" | "trial" | "interview";
type InterviewMode = "answer" | "feedback" | "summary";
type CareerDetailTab = "work" | "recruiter" | "path";
type InterviewFilter = "All" | "Technical" | "Behavioral";

type SpeechResultEvent = {
  resultIndex: number;
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type InterviewAttempt = {
  score: number;
  words: number;
  seconds: number;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const iconMap: Record<CareerId, LucideIcon> = {
  build: Code2,
  analyze: BarChart3,
  protect: ShieldCheck,
  lead: Users,
};

const emptySubscribe = () => () => undefined;
const getVoiceSupport = () => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
const getServerVoiceSupport = () => false;
const getRecorderSupport = () => Boolean(window.MediaRecorder && navigator.mediaDevices?.getUserMedia);
const getServerRecorderSupport = () => false;

function readSavedState(): {
  answers?: QuizAnswers;
  selectedCareerId?: CareerId;
  readiness?: Record<string, boolean>;
  trialResults?: Partial<Record<CareerId, TrialResult>>;
} {
  if (typeof window === "undefined") return {};
  try {
    const saved = window.localStorage.getItem("byu-is-launchpad-v2");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function styleFor(accent: string): CSSProperties {
  return { "--accent": accent } as CSSProperties;
}

const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const questionScenes = [
  { src: `${publicBasePath}/art/quiz-curiosity.webp`, label: "Curiosity", note: "Notice what holds your attention." },
  { src: `${publicBasePath}/art/quiz-choice.webp`, label: "Choice", note: "Your process leaves a trail." },
  { src: `${publicBasePath}/art/quiz-curiosity.webp`, label: "Energy", note: "Free time tells the truth rather well." },
  { src: `${publicBasePath}/art/quiz-strategy.webp`, label: "Instinct", note: "Every new game reveals a first move." },
  { src: `${publicBasePath}/art/quiz-collaboration.webp`, label: "Clarity", note: "Order often begins with one useful question." },
  { src: `${publicBasePath}/art/quiz-clarity.webp`, label: "Friction", note: "What bothers you may point toward what you improve." },
  { src: `${publicBasePath}/art/quiz-making.webp`, label: "Making", note: "Start with the pieces. See what wants to become." },
  { src: `${publicBasePath}/art/quiz-making.webp`, label: "Satisfaction", note: "The best work leaves a particular sort of joy." },
];

function CareerSigil({ id }: { id: CareerId }) {
  if (id === "build") {
    return (
      <svg className="career-sigil" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M24 13 10 26v12l14 13M40 13l14 13v12L40 51M36 9 28 55" />
        <circle cx="32" cy="32" r="4" />
      </svg>
    );
  }
  if (id === "analyze") {
    return (
      <svg className="career-sigil" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M11 50h42M17 45V34M29 45V25M41 45V16M13 25l15-9 12 6 12-11" />
        <circle cx="13" cy="25" r="3" /><circle cx="28" cy="16" r="3" /><circle cx="40" cy="22" r="3" /><circle cx="52" cy="11" r="3" />
      </svg>
    );
  }
  if (id === "protect") {
    return (
      <svg className="career-sigil" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M32 7 51 15v15c0 13-8 22-19 27C21 52 13 43 13 30V15l19-8Z" />
        <path d="m21 32 7 7 15-17M32 7v9" />
      </svg>
    );
  }
  return (
    <svg className="career-sigil" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="7" /><circle cx="32" cy="10" r="5" /><circle cx="53" cy="32" r="5" /><circle cx="32" cy="54" r="5" /><circle cx="11" cy="32" r="5" />
      <path d="M32 15v10M48 32H39M32 39v10M25 32h-9M18 18l9 9M46 18l-9 9M46 46l-9-9M18 46l9-9" />
    </svg>
  );
}

const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
}).format(value);

function Brand({ compact = false, onClick }: { compact?: boolean; onClick?: () => void }) {
  return (
    <button
      className="brand"
      type="button"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        onClick?.();
      }}
    >
      <span className="brand-mark" aria-hidden="true"><span>IS</span></span>
      <span className="brand-copy">
        <strong>BYU&nbsp; IS</strong>
        {!compact && <span>Career Launchpad</span>}
      </span>
    </button>
  );
}

function AppHeader({
  view,
  onHome,
  onExplore,
  onPractice,
}: {
  view: View;
  onHome: () => void;
  onExplore: () => void;
  onPractice: () => void;
}) {
  return (
    <header className="site-header">
      <Brand onClick={onHome} />
      <nav aria-label="Primary navigation">
        <button className={view === "dashboard" ? "is-active" : ""} type="button" onClick={onExplore}>
          Explore paths
        </button>
        <button className={view === "interview" ? "is-active" : ""} type="button" onClick={onPractice}>
          Practice interview
        </button>
      </nav>
    </header>
  );
}

function SignalVisual({ active = "build", compact = false }: { active?: CareerId; compact?: boolean }) {
  return (
    <div className={`signal-visual ${compact ? "is-compact" : ""}`} aria-hidden="true">
      <div className="signal-halo signal-halo-one" />
      <div className="signal-halo signal-halo-two" />
      <div className="signal-axis signal-axis-one" />
      <div className="signal-axis signal-axis-two" />
      <div className="signal-core">
        <Compass />
        <span>IS</span>
      </div>
      {careerOrder.map((careerId, index) => {
        return (
          <div
            className={`signal-node signal-node-${index + 1} ${active === careerId ? "is-active" : ""}`}
            key={careerId}
            style={styleFor(careers[careerId].color)}
          >
            <CareerSigil id={careerId} />
          </div>
        );
      })}
      <div className="signal-scan" />
    </div>
  );
}

function HomeScreen({
  onStart,
  onExplore,
  onPractice,
  onSelectCareer,
}: {
  onStart: () => void;
  onExplore: () => void;
  onPractice: () => void;
  onSelectCareer: (id: CareerId) => void;
}) {
  return (
    <div className="home-screen">
      <AppHeader view="home" onHome={() => undefined} onExplore={onExplore} onPractice={onPractice} />
      <main>
        <section className="hero shell">
          <div className="hero-copy" data-enter>
            <p className="eyebrow"><span /> For BYU IS students stepping toward recruiting</p>
            <h1>Find the work you may be brilliant at.</h1>
            <p className="hero-lede">
              There is more than one worthy way to build a life in IS. Follow eight everyday instincts; we will help you name a promising direction, see the real work, and take one sensible next step.
            </p>
            <div className="hero-actions">
              <button className="button button-primary" type="button" onClick={onStart}>
                Begin the signal <ArrowRight />
              </button>
              <button className="button button-ghost" type="button" onClick={onExplore}>
                Browse the four paths
              </button>
            </div>
            <div className="hero-proof" aria-label="Product highlights">
              <span><Timer /> About 4 minutes</span>
              <span><Target /> Recruiting-ready next steps</span>
              <span><Mic /> Voice practice included</span>
            </div>
          </div>
          <div className="hero-art" data-enter>
            <div className="hero-field-note" aria-hidden="true"><span>DISCOVER</span><span>PREPARE</span><span>PRACTISE</span></div>
            <p className="visual-kicker">Your signal is waiting</p>
            <SignalVisual active="analyze" />
            <div className="visual-caption">
              <Sparkles /> Clarity often begins as curiosity.
            </div>
          </div>
        </section>

        <section className="path-preview shell" aria-labelledby="paths-heading">
          <div className="section-heading" data-enter>
            <div>
              <p className="eyebrow">The IS landscape</p>
              <h2 id="paths-heading">Four directions. Plenty of room to become.</h2>
            </div>
            <p>Explore the broad directions BYU IS students recruit into. None is a box; each is a useful place to begin testing your energy.</p>
          </div>
          <div className="path-grid">
            {careerOrder.map((careerId, index) => {
              const career = careers[careerId];
              return (
                <button
                  className="path-card"
                  data-enter
                  data-path={`0${index + 1}`}
                  key={careerId}
                  onClick={() => onSelectCareer(careerId)}
                  style={styleFor(career.color)}
                  type="button"
                >
                  <span className="path-number">0{index + 1}</span>
                  <span className="path-icon"><CareerSigil id={careerId} /></span>
                  <span className="path-signal">The {career.signal}</span>
                  <strong>{career.title}</strong>
                  <span className="path-tagline">{career.tagline}</span>
                  <span className="path-link">See the work <ArrowRight /></span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="how-it-works shell" aria-labelledby="how-heading">
          <div className="how-panel" data-enter>
            <div>
              <p className="eyebrow">Not a verdict</p>
              <h2 id="how-heading">A gracious place to begin.</h2>
            </div>
            <div className="how-steps">
              <div><span>01</span><strong>Notice your pattern</strong><p>Eight ordinary choices surface the ways you naturally solve problems.</p></div>
              <div><span>02</span><strong>Meet the real work</strong><p>See a representative day, the friction, and related entry-level roles.</p></div>
              <div><span>03</span><strong>Move this week</strong><p>Turn junior-core work into evidence, check readiness, and rehearse aloud.</p></div>
            </div>
          </div>
        </section>

        <section className="home-cta shell" data-enter>
          <div>
            <p className="eyebrow">You need not have the whole map</p>
            <h2>Begin with one good next step.</h2>
          </div>
          <button className="button button-light" type="button" onClick={onStart}>
            Find my signal <ArrowRight />
          </button>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function QuizScreen({
  answers,
  questionIndex,
  onAnswer,
  onBack,
  onContinue,
  onExit,
}: {
  answers: QuizAnswers;
  questionIndex: number;
  onAnswer: (optionId: string) => void;
  onBack: () => void;
  onContinue: () => void;
  onExit: () => void;
}) {
  const question = quizQuestions[questionIndex];
  const scene = questionScenes[questionIndex];
  const selected = answers[questionIndex];
  const progress = ((questionIndex + 1) / quizQuestions.length) * 100;

  return (
    <main className="quiz-screen">
      <header className="quiz-header">
        <button className="icon-button" type="button" onClick={onBack} aria-label={questionIndex === 0 ? "Exit assessment" : "Previous question"}>
          <ArrowLeft />
        </button>
        <Brand compact />
        <button className="text-button" type="button" onClick={onExit}>Save & exit</button>
      </header>
      <div className="quiz-progress" aria-label={`Question ${questionIndex + 1} of ${quizQuestions.length}`}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <section className="quiz-stage shell" aria-labelledby="question-heading">
        <div className="quiz-scene" data-scene>
          <Image src={scene.src} alt="" fill priority sizes="(max-width: 900px) 100vw, 42vw" />
          <div className="quiz-scene-shade" />
          <div className="quiz-scene-index" aria-hidden="true">0{questionIndex + 1}</div>
          <div className="quiz-scene-caption"><span>{scene.label}</span><p>{scene.note}</p></div>
        </div>
        <div className="quiz-question-panel">
          <div className="quiz-intro" data-enter>
            <p className="question-count">Question {questionIndex + 1} of {quizQuestions.length}</p>
            <p className="eyebrow">{question.eyebrow}</p>
            <h1 id="question-heading">{question.prompt}</h1>
            <p>{question.helper}</p>
          </div>
          <div className="option-grid" role="radiogroup" aria-labelledby="question-heading" data-enter>
            {question.options.map((option, index) => {
              const isSelected = selected === option.id;
              return (
                <button
                  aria-checked={isSelected}
                  className={`option-card ${isSelected ? "is-selected" : ""}`}
                  key={option.id}
                  onClick={() => onAnswer(option.id)}
                  role="radio"
                  style={styleFor("#f2c76e")}
                  type="button"
                >
                  <span className="option-icon" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
                  <span className="option-copy"><strong>{option.label}</strong><span>{option.detail}</span></span>
                  <span className="option-check">{isSelected ? <Check /> : <Circle />}</span>
                </button>
              );
            })}
          </div>
          <div className="quiz-actions" data-enter>
            <span>Trust the answer that feels most like Tuesday, not your best day.</span>
            <button className="button button-primary" disabled={!selected} type="button" onClick={onContinue}>
              {questionIndex === quizQuestions.length - 1 ? "Reveal my signal" : "Continue"} <ArrowRight />
            </button>
          </div>
        </div>
      </section>
      <div className="quiz-glow quiz-glow-left" />
      <div className="quiz-glow quiz-glow-right" />
    </main>
  );
}

function MatchBars({ matches, compact = false }: { matches: ReturnType<typeof calculateMatches>; compact?: boolean }) {
  return (
    <div className={`match-bars ${compact ? "is-compact" : ""}`}>
      {matches.map((match, index) => {
        const career = careers[match.id];
        const Icon = iconMap[match.id];
        return (
          <div className="match-row" key={match.id} style={styleFor(career.color)}>
            <div className="match-label"><span><Icon /></span><strong>{career.shortTitle}</strong></div>
            <div className="match-track"><span style={{ width: `${match.percent}%` }} /></div>
            <span className="match-value">{match.percent}%</span>
            {!compact && index === 0 && <span className="match-tag">Strongest</span>}
          </div>
        );
      })}
    </div>
  );
}

function RevealScreen({
  matches,
  answers,
  onContinue,
  onTrial,
  onPractice,
  onRetake,
}: {
  matches: ReturnType<typeof calculateMatches>;
  answers: QuizAnswers;
  onContinue: () => void;
  onTrial: () => void;
  onPractice: () => void;
  onRetake: () => void;
}) {
  const winner = careers[matches[0].id];
  const runnerUp = careers[matches[1].id];
  const evidence = getMatchEvidence(answers, winner.id);
  const matchGap = matches[0].percent - matches[1].percent;

  return (
    <main className="reveal-screen" style={styleFor(winner.color)}>
      <div className="reveal-topbar"><Brand compact /><span>Your career signal</span></div>
      <section className="reveal-stage shell">
        <div className="reveal-orbit" data-enter>
          <SignalVisual active={winner.id} compact />
        </div>
        <div className="reveal-copy" data-enter>
          <p className="eyebrow centered"><Sparkles /> A promising direction</p>
          <div className="reveal-icon reveal-sigil"><CareerSigil id={winner.id} /></div>
          <h1>The {winner.signal}</h1>
          <p className="reveal-role">{winner.title}</p>
          <p className="reveal-tagline">{winner.tagline}</p>
          <p className="reveal-description">{winner.description}</p>
        </div>
        <div className="reveal-evidence" data-enter>
          <div className="evidence-heading">
            <div><p>Why this rose to the top</p><h2>Your answers left a trail.</h2></div>
            <span>{matchGap <= 7 ? `Close call with ${runnerUp.shortTitle}` : `${matchGap}-point lead over ${runnerUp.shortTitle}`}</span>
          </div>
          <div className="evidence-grid">
            {evidence.map((item, index) => (
              <article key={`${item.question}-${item.choice}`}>
                <span>Signal 0{index + 1}</span>
                <small>{item.question}</small>
                <strong>{item.choice}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="reveal-matches" data-enter>
          <MatchBars matches={matches} />
          <p>This is an invitation to investigate, not a box to live in. Your adjacent paths remain part of the picture.</p>
        </div>
        <div className="reveal-actions" data-enter>
          <button className="button button-light" type="button" onClick={onTrial}><Radio /> Try the work</button>
          <button className="button button-ghost" type="button" onClick={onContinue}>Open my game plan <ArrowRight /></button>
          <button className="button button-ghost" type="button" onClick={onPractice}>Practice a {winner.shortTitle.toLowerCase()} interview</button>
          <button className="text-button" type="button" onClick={onRetake}><RefreshCw /> Retake signal</button>
        </div>
      </section>
      <div className="reveal-burst burst-one" />
      <div className="reveal-burst burst-two" />
    </main>
  );
}

function CareerTabs({ selected, onSelect }: { selected: CareerId; onSelect: (id: CareerId) => void }) {
  return (
    <div className="career-tabs" role="tablist" aria-label="Career paths">
      {careerOrder.map((careerId) => {
        const career = careers[careerId];
        const Icon = iconMap[careerId];
        return (
          <button
            aria-selected={selected === careerId}
            className={selected === careerId ? "is-active" : ""}
            key={careerId}
            onClick={() => onSelect(careerId)}
            role="tab"
            style={styleFor(career.color)}
            type="button"
          >
            <Icon /> <span>{career.shortTitle}</span>
          </button>
        );
      })}
    </div>
  );
}

function EvidenceBuilder({ careerId }: { careerId: CareerId }) {
  const career = careers[careerId];
  const research = careerResearch[careerId];
  const [project, setProject] = useState("");
  const [problem, setProblem] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const complete = [project, problem, action, result].every((value) => value.trim().length >= 4);
  const clean = (value: string) => value.trim().replace(/[.!?]+$/, "");
  const capitalise = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
  const actionPhrase = clean(action).replace(/^I\s+/i, "");
  const resumeBullet = complete ? `${capitalise(actionPhrase)} in ${clean(project)} to address ${clean(problem)}. Result: ${capitalise(clean(result))}.` : "";
  const story = complete ? `Situation: ${capitalise(clean(problem))}. Action: In ${clean(project)}, I ${actionPhrase.charAt(0).toLowerCase() + actionPhrase.slice(1)}. Result: ${capitalise(clean(result))}.` : "";

  async function copyProof() {
    if (!complete) return;
    try {
      await navigator.clipboard.writeText(`RESUME BULLET\n${resumeBullet}\n\nINTERVIEW STORY\n${story}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="evidence-builder" data-enter>
      <div className="evidence-builder-intro">
        <p className="eyebrow"><BadgeCheck /> Evidence builder</p>
        <h3>Turn classwork into recruiter proof.</h3>
        <p>Recruiters cannot see everything you learned. Give them one concrete decision, your contribution, and what changed.</p>
        <div>{research.skills.slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}</div>
      </div>
      <div className="evidence-form">
        <label><span>Project or course</span><input onChange={(event) => setProject(event.target.value)} placeholder="IS 403 event platform" value={project} /></label>
        <label><span>Problem or goal</span><input onChange={(event) => setProblem(event.target.value)} placeholder="students abandoned a long registration flow" value={problem} /></label>
        <label><span>What you personally did</span><input onChange={(event) => setAction(event.target.value)} placeholder="mapped the flow and built a shorter checkout" value={action} /></label>
        <label><span>Result or learning</span><input onChange={(event) => setResult(event.target.value)} placeholder="cut the process from eight steps to four" value={result} /></label>
      </div>
      <div className={`evidence-output ${complete ? "is-ready" : ""}`} aria-live="polite">
        <div><span>Resume bullet</span><p>{complete ? resumeBullet : `Add four honest details to shape a ${career.shortTitle.toLowerCase()} proof point.`}</p></div>
        <div><span>Interview story spine</span><p>{complete ? story : "Your situation, personal action, and result will appear here."}</p></div>
        <button disabled={!complete} onClick={copyProof} type="button">{copied ? <CheckCircle2 /> : <BadgeCheck />} {copied ? "Copied" : "Copy both"}</button>
      </div>
    </div>
  );
}

function DashboardScreen({
  selectedCareerId,
  matches,
  answers,
  readiness,
  trialResults,
  onSelectCareer,
  onToggleReadiness,
  onHome,
  onTrial,
  onPractice,
  onRetake,
}: {
  selectedCareerId: CareerId;
  matches: ReturnType<typeof calculateMatches>;
  answers: QuizAnswers;
  readiness: Record<string, boolean>;
  trialResults: Partial<Record<CareerId, TrialResult>>;
  onSelectCareer: (id: CareerId) => void;
  onToggleReadiness: (id: string) => void;
  onHome: () => void;
  onTrial: () => void;
  onPractice: () => void;
  onRetake: () => void;
}) {
  const career = careers[selectedCareerId];
  const research = careerResearch[selectedCareerId];
  const trial = fieldTrials[selectedCareerId];
  const trialResult = trialResults[selectedCareerId];
  const evidence = getMatchEvidence(answers, selectedCareerId);
  const completed = career.readiness.filter((item) => readiness[item.id]).length;
  const [detailTab, setDetailTab] = useState<CareerDetailTab>("work");
  const detailTabs: { id: CareerDetailTab; label: string; note: string; icon: LucideIcon }[] = [
    { id: "work", label: "Real work", note: "What the day feels like", icon: BriefcaseBusiness },
    { id: "recruiter", label: "Get hired", note: "What entry-level means", icon: ListChecks },
    { id: "path", label: "Path ahead", note: "Growth and next steps", icon: TrendingUp },
  ];

  return (
    <div className="dashboard-screen" style={styleFor(career.color)}>
      <AppHeader view="dashboard" onHome={onHome} onExplore={() => window.scrollTo({ top: 0, behavior: "smooth" })} onPractice={onPractice} />
      <main>
        <section className="result-hero shell">
          <div className="result-heading" data-enter>
            <p className="eyebrow"><span /> Career path workspace</p>
            <div className="result-title-row">
              <span className="result-icon"><CareerSigil id={career.id} /></span>
              <div><p>The {career.signal}</p><h1>{career.title}</h1></div>
            </div>
            <p className="result-lede">{career.description}</p>
            <div className="profile-focus">
              <strong>Profiled role: {research.focusRole}</strong>
              <span>{research.scopeNote}</span>
            </div>
            <div className="role-pills" aria-label="Related roles">
              {career.roles.map((role) => <span key={role}>{role}</span>)}
            </div>
            <div className="result-actions">
              <button className="button button-primary" type="button" onClick={onTrial}><Radio /> Try the work</button>
              <button className="button button-primary" type="button" onClick={onPractice}>Practice this interview <ArrowRight /></button>
              <button className="button button-ghost" type="button" onClick={onRetake}><RefreshCw /> Retake signal</button>
            </div>
          </div>
          <aside className="result-score-card" data-enter>
            <div className="score-card-top"><span>Your fit pattern</span><Sparkles /></div>
            <MatchBars matches={matches} compact />
            <p>Your top result is a starting hypothesis. Compare the work, then test it with a project and two conversations.</p>
          </aside>
        </section>

        <div className="tab-shell shell">
          <CareerTabs
            selected={selectedCareerId}
            onSelect={(id) => {
              setDetailTab("work");
              onSelectCareer(id);
            }}
          />
        </div>

        <div className="detail-tab-shell">
          <div className="detail-tabs shell" role="tablist" aria-label={`${research.focusRole} details`}>
            {detailTabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  aria-selected={detailTab === tab.id}
                  className={detailTab === tab.id ? "is-active" : ""}
                  key={tab.id}
                  onClick={() => setDetailTab(tab.id)}
                  role="tab"
                  type="button"
                >
                  <TabIcon />
                  <span><strong>{tab.label}</strong><small>{tab.note}</small></span>
                </button>
              );
            })}
          </div>
        </div>

        {detailTab === "work" && (
          <section className="workspace-section shell" aria-labelledby="work-heading">
            <div className="section-heading" data-enter>
              <div><p className="eyebrow">What the job is really like</p><h2 id="work-heading">A representative day—not a highlight reel.</h2></div>
              <p>{career.tagline}</p>
            </div>
            <div className="work-grid">
              <div className="day-card" data-enter>
                <div className="card-heading"><span><Timer /></span><div><p>Day in the life</p><h3>How the work moves</h3></div></div>
                <div className="day-timeline">
                  {career.dayInLife.map((item) => (
                    <div className="day-item" key={item.time}>
                      <time>{item.time}</time><span /><div><strong>{item.activity}</strong><p>{item.detail}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rhythm-card" data-enter>
                <div className="card-heading"><span><Gauge /></span><div><p>Work rhythm</p><h3>Where time and energy go</h3></div></div>
                <div className="rhythm-bars">
                  {career.workModes.map((mode) => (
                    <div key={mode.label}><div><span>{mode.label}</span><strong>{mode.value}%</strong></div><div className="rhythm-track"><span style={{ width: `${mode.value}%` }} /></div></div>
                  ))}
                </div>
                <p className="data-note">Illustrative mix; varies by company, team, and level.</p>
              </div>
              <div className="reality-card" data-enter>
                <div className="card-heading"><span><Lightbulb /></span><div><p>Reality check</p><h3>The part job posts skip</h3></div></div>
                <blockquote>{career.realityCheck}</blockquote>
                <div className="friction-note"><strong>Likely friction</strong><p>{career.friction}</p></div>
              </div>
              <div className="conditions-card" data-enter>
                <div className="card-heading"><span><Target /></span><div><p>Fit signals</p><h3>You may thrive when…</h3></div></div>
                <ul>{research.traits.map((item) => <li key={item}><CheckCircle2 />{item}</li>)}</ul>
                <div className="outlook-line"><span>Market signal</span><strong>{career.outlook}</strong></div>
                <a href={career.sourceUrl} target="_blank" rel="noreferrer">Source: {career.sourceLabel} <ExternalLink /></a>
              </div>
            </div>
            <details className="role-detail-list" data-enter>
              <summary><span><Wrench /> See six common tasks for {research.focusRole}</span><ChevronRight /></summary>
              <ul>{research.dailyReality.map((item) => <li key={item}>{item}</li>)}</ul>
            </details>
          </section>
        )}

        {detailTab === "recruiter" && (
          <>
            <section className="recruiter-section shell" aria-labelledby="recruiter-heading">
              <div className="section-heading" data-enter>
                <div><p className="eyebrow">The recruiter lens</p><h2 id="recruiter-heading">Know what “ready” actually means.</h2></div>
                <p>Focus on credible junior evidence. You do not need to impersonate a mid-career candidate.</p>
              </div>
              <div className="recruiter-grid">
                <article className="expectation-card" data-enter>
                  <div className="card-heading"><span><CheckCircle2 /></span><div><p>Expected now</p><h3>Signals worth building</h3></div></div>
                  <ul>{research.entryExpected.map((item) => <li key={item}><Check />{item}</li>)}</ul>
                </article>
                <article className="expectation-card is-muted" data-enter>
                  <div className="card-heading"><span><Circle /></span><div><p>Not expected yet</p><h3>Pressure you can drop</h3></div></div>
                  <ul>{research.notExpectedYet.map((item) => <li key={item}><Circle />{item}</li>)}</ul>
                </article>
                <article className="skills-card" data-enter>
                  <div className="card-heading"><span><Wrench /></span><div><p>Technical toolkit</p><h3>Build toward fluency</h3></div></div>
                  <div className="skill-chips">{research.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                </article>
                <article className="salary-card" data-enter>
                  <div className="card-heading"><span><CircleDollarSign /></span><div><p>Pay, with context</p><h3>Two numbers that are not interchangeable</h3></div></div>
                  <div className="salary-comparison">
                    <div><small>BYU BS IS, first jobs</small><strong>{formatCurrency(research.salary.byuMedian)}</strong><span>2025 median · all roles blended</span></div>
                    <div><small>National occupation median</small><strong>{formatCurrency(research.salary.nationalMedian)}</strong><span>{research.salary.nationalRole} · all experience levels</span></div>
                  </div>
                  <p>{research.salary.caveat}</p>
                  <div className="salary-links">
                    <a href={byuPlacementUrl} target="_blank" rel="noreferrer">BYU placement data <ExternalLink /></a>
                    <a href={research.salarySourceUrl} target="_blank" rel="noreferrer">BLS occupation data <ExternalLink /></a>
                  </div>
                </article>
              </div>
              <EvidenceBuilder key={selectedCareerId} careerId={selectedCareerId} />
            </section>

            <section className="byu-section" aria-labelledby="byu-heading">
              <div className="shell">
                <div className="section-heading light" data-enter>
                  <div><p className="eyebrow">Your BYU advantage</p><h2 id="byu-heading">Turn the junior core into recruiting evidence.</h2></div>
                  <p>You are already doing relevant work. The move is to package it around decisions, contribution, and impact.</p>
                </div>
                <div className="byu-moves">
                  {career.byuMoves.map((move, index) => (
                    <article data-enter key={move.title}>
                      <span className="move-number">0{index + 1}</span><span className="move-tag">{move.tag}</span><h3>{move.title}</h3><p>{move.detail}</p>
                    </article>
                  ))}
                </div>
                <div className="byu-resource" data-enter>
                  <div><GraduationCap /><span><strong>Recruit with the official ecosystem, too.</strong><small>BYU Marriott’s Career Tools page points students to CareerLaunch, Handshake, placement data, and internship resources.</small></span></div>
                  <a href="https://marriott.byu.edu/infosys/careers/career-tools/" target="_blank" rel="noreferrer">Open BYU career tools <ExternalLink /></a>
                </div>
              </div>
            </section>
          </>
        )}

        {detailTab === "path" && (
          <>
            <section className="path-ahead-section shell" aria-labelledby="path-ahead-heading">
              <div className="section-heading" data-enter>
                <div><p className="eyebrow">A possible path</p><h2 id="path-ahead-heading">See the next rung without locking in a ladder.</h2></div>
                <p>Titles and timing vary. Use this as a conversation map, not a promise.</p>
              </div>
              <div className="progression-track" data-enter>
                {research.progression.map((step, index) => (
                  <article key={`${step.stage}-${step.years}`}>
                    <span className="progression-number">{String(index + 1).padStart(2, "0")}</span>
                    <small>{step.years}</small>
                    <h3>{step.stage}</h3>
                    <p>{step.focus}</p>
                  </article>
                ))}
              </div>
              <div className="credential-panel" data-enter>
                <div className="credential-intro"><BadgeCheck /><div><p>Credentials, in context</p><h3>Useful when the timing is right</h3></div></div>
                <div className="credential-grid">
                  {research.credentials.map((credential) => (
                    <article key={credential.name}><span>{credential.timing}</span><strong>{credential.name}</strong><p>{credential.note}</p></article>
                  ))}
                </div>
              </div>
            </section>

            <section className="readiness-section shell" aria-labelledby="ready-heading">
              <div className="section-heading" data-enter>
                <div><p className="eyebrow">Internship readiness</p><h2 id="ready-heading">Your next four proof points.</h2></div>
                <div className="completion-pill"><strong>{completed}/{career.readiness.length}</strong><span>ready signals</span></div>
              </div>
              <div className="readiness-grid" data-enter>
                {career.readiness.map((item) => {
                  const isDone = Boolean(readiness[item.id]);
                  return (
                    <button className={isDone ? "is-done" : ""} key={item.id} onClick={() => onToggleReadiness(item.id)} type="button">
                      <span className="check-box">{isDone && <Check />}</span><span><strong>{item.label}</strong><small>{item.detail}</small></span>
                    </button>
                  );
                })}
              </div>
              <div className="practice-banner" data-enter>
                <div><span className="practice-icon"><Volume2 /></span><div><p>Ready to make the story sound like you?</p><h3>Practice a real {career.shortTitle.toLowerCase()} question—out loud.</h3></div></div>
                <button className="button button-light" type="button" onClick={onPractice}>Enter practice lab <ArrowRight /></button>
              </div>

              <article className="launch-card" data-enter>
                <div className="launch-card-top">
                  <div>
                    <p className="eyebrow"><Sparkles /> Personal launch card</p>
                    <h2>The {career.signal}: your next seven days</h2>
                    <p>{career.title} is a direction to test through evidence, conversation, and rehearsal.</p>
                  </div>
                  <div className="launch-card-mark"><CareerSigil id={career.id} /><span>BYU IS</span></div>
                </div>
                <div className="launch-card-grid">
                  <section>
                    <small>Your strongest signals</small>
                    {evidence.length ? evidence.map((item) => <p key={`${item.question}-${item.choice}`}><CheckCircle2 /> <span><strong>{item.choice}</strong>{item.question}</span></p>) : <p><Compass /> <span><strong>Explore with curiosity</strong>Complete the signal to personalise this section.</span></p>}
                  </section>
                  <section>
                    <small>Your field evidence</small>
                    {trialResult ? (
                      <div className="launch-trial-result"><strong>{trialResult.score}/{trialResult.maxScore}</strong><span>reasoning signal</span><em>{trialResult.energy}/5 desire to do another</em></div>
                    ) : (
                      <div className="launch-trial-empty"><Radio /><p><strong>No trial yet</strong><span>Test the work before you commit to the title.</span></p></div>
                    )}
                  </section>
                </div>
                <div className="launch-week">
                  {trial.launchWeek.map((step, index) => (
                    <div key={step.day}><span>0{index + 1}</span><small>{step.day}</small><strong>{step.title}</strong><p>{step.detail}</p></div>
                  ))}
                </div>
                <div className="launch-card-actions">
                  <button className="button button-light" type="button" onClick={() => window.print()}><Printer /> Print or save as PDF</button>
                  <button className="button button-ghost" type="button" onClick={onTrial}>{trialResult ? "Retake field trial" : "Take field trial"} <ArrowRight /></button>
                </div>
              </article>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function FieldTrialScreen({
  selectedCareerId,
  existingResult,
  onSelectCareer,
  onComplete,
  onHome,
  onExplore,
  onPractice,
}: {
  selectedCareerId: CareerId;
  existingResult?: TrialResult;
  onSelectCareer: (id: CareerId) => void;
  onComplete: (result: TrialResult) => void;
  onHome: () => void;
  onExplore: () => void;
  onPractice: () => void;
}) {
  const career = careers[selectedCareerId];
  const trial = fieldTrials[selectedCareerId];
  const [phase, setPhase] = useState<"briefing" | "mission" | "reflection" | "result">("briefing");
  const [stepIndex, setStepIndex] = useState(0);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [energy, setEnergy] = useState(existingResult?.energy ?? 0);
  const [finalResult, setFinalResult] = useState<TrialResult | null>(null);
  const step = trial.steps[stepIndex];
  const selectedId = choices[step?.id];
  const selectedChoice = step?.choices.find((choice) => choice.id === selectedId);
  const score = trial.steps.reduce((total, item) => {
    const choice = item.choices.find((candidate) => candidate.id === choices[item.id]);
    return total + (choice?.score ?? 0);
  }, 0);
  const maxScore = trial.steps.length * 3;

  function restartTrial() {
    setPhase("briefing");
    setStepIndex(0);
    setChoices({});
    setEnergy(0);
    setFinalResult(null);
  }

  function continueMission() {
    if (stepIndex < trial.steps.length - 1) {
      setStepIndex((current) => current + 1);
      return;
    }
    setPhase("reflection");
  }

  function finishTrial() {
    const result = { score, maxScore, energy };
    setFinalResult(result);
    onComplete(result);
    setPhase("result");
  }

  const result = finalResult ?? existingResult;
  const resultHeadline = score >= 8 ? "You reasoned with calm precision." : score >= 6 ? "Your instincts are promising." : "You found useful edges to practise.";

  return (
    <div className="trial-screen" style={styleFor(career.color)}>
      <AppHeader view="trial" onHome={onHome} onExplore={onExplore} onPractice={onPractice} />
      <main className="trial-shell shell">
        <div className="trial-kicker" data-enter><span>IS FIELD TRIAL · {career.shortTitle.toUpperCase()}</span><span>About 3 minutes</span></div>
        <CareerTabs selected={selectedCareerId} onSelect={onSelectCareer} />

        {phase === "briefing" && (
          <section className="trial-briefing" data-enter>
            <div className="trial-brief-copy">
              <p className="eyebrow"><Radio /> Try the work</p>
              <h1>{trial.title}</h1>
              <p className="trial-mission">{trial.mission}</p>
              <blockquote>{trial.setting}</blockquote>
              <div className="trial-guardrail"><Lightbulb /><p><strong>This is a reasoning rehearsal, not an aptitude test.</strong><span>Every option reveals a tradeoff. Notice both how you decide and whether you want another round.</span></p></div>
              <div className="trial-brief-actions">
                <button className="button button-primary" type="button" onClick={() => setPhase("mission")}>Accept the mission <ArrowRight /></button>
                {existingResult && <span>Previous field signal: {existingResult.score}/{existingResult.maxScore} · energy {existingResult.energy}/5</span>}
              </div>
            </div>
            <div className="trial-emblem" aria-hidden="true"><span>FIELD<br />TRIAL</span><CareerSigil id={career.id} /><small>0{careerOrder.indexOf(career.id) + 1}</small></div>
          </section>
        )}

        {phase === "mission" && step && (
          <section className="trial-mission-stage" data-enter>
            <div className="trial-progress" aria-label={`Step ${stepIndex + 1} of ${trial.steps.length}`}><span style={{ width: `${((stepIndex + 1) / trial.steps.length) * 100}%` }} /></div>
            <div className="trial-question">
              <div className="trial-context">
                <p>{step.eyebrow}</p>
                <span>Incoming evidence</span>
                <blockquote>{step.situation}</blockquote>
                <small>Choose the move you would defend to the team. You can change it before continuing.</small>
              </div>
              <div className="trial-decision">
                <p className="eyebrow">Your decision</p>
                <h2>{step.prompt}</h2>
                <div className="trial-choice-list" role="radiogroup" aria-label={step.prompt}>
                  {step.choices.map((choice, index) => {
                    const isSelected = choice.id === selectedId;
                    return (
                      <button aria-checked={isSelected} className={isSelected ? "is-selected" : ""} key={choice.id} onClick={() => setChoices((current) => ({ ...current, [step.id]: choice.id }))} role="radio" type="button">
                        <span>{String.fromCharCode(65 + index)}</span><span><strong>{choice.title}</strong><small>{choice.detail}</small></span><span>{isSelected ? <Check /> : <Circle />}</span>
                      </button>
                    );
                  })}
                </div>
                {selectedChoice && (
                  <div className={`trial-feedback is-score-${selectedChoice.score}`} aria-live="polite">
                    <span>{selectedChoice.score === 3 ? <CheckCircle2 /> : <Compass />}</span>
                    <div><strong>{selectedChoice.response}</strong><p>{selectedChoice.principle}</p></div>
                  </div>
                )}
                <div className="trial-step-actions">
                  <button className="text-button" type="button" onClick={() => stepIndex === 0 ? setPhase("briefing") : setStepIndex((current) => current - 1)}><ArrowLeft /> Back</button>
                  <button className="button button-primary" disabled={!selectedChoice} type="button" onClick={continueMission}>{stepIndex === trial.steps.length - 1 ? "Reflect on the work" : "Next decision"} <ArrowRight /></button>
                </div>
              </div>
            </div>
          </section>
        )}

        {phase === "reflection" && (
          <section className="trial-reflection" data-enter>
            <p className="eyebrow centered"><Sparkles /> One signal only you can supply</p>
            <div className="reflection-sigil"><CareerSigil id={career.id} /></div>
            <h1>Did the work give you energy?</h1>
            <p>A polished decision is useful. Wanting to make the next one is useful too.</p>
            <div className="energy-scale" role="radiogroup" aria-label="Desire to do another scenario">
              {["Not for me", "Mostly drained", "Still curious", "Quite engaged", "Give me another"].map((label, index) => (
                <button aria-checked={energy === index + 1} className={energy === index + 1 ? "is-selected" : ""} key={label} onClick={() => setEnergy(index + 1)} role="radio" type="button"><strong>{index + 1}</strong><span>{label}</span></button>
              ))}
            </div>
            <div className="reflection-actions"><button className="text-button" type="button" onClick={() => setPhase("mission")}><ArrowLeft /> Review decisions</button><button className="button button-light" disabled={!energy} type="button" onClick={finishTrial}>Reveal field report <ArrowRight /></button></div>
          </section>
        )}

        {phase === "result" && result && (
          <section className="trial-result" data-enter>
            <div className="trial-result-hero">
              <div className="trial-result-score"><strong>{result.score}</strong><span>/ {result.maxScore}</span></div>
              <div><p className="eyebrow"><BookOpenCheck /> Field report</p><h1>{resultHeadline}</h1><p>You rated your desire to do another {career.shortTitle.toLowerCase()} scenario <strong>{result.energy}/5</strong>. Keep the reasoning score and the energy signal separate; both tell you something useful.</p></div>
            </div>
            <div className="trial-result-grid">
              {trial.steps.map((item, index) => {
                const choice = item.choices.find((candidate) => candidate.id === choices[item.id]);
                return <article key={item.id}><span>Decision 0{index + 1}</span><strong>{choice?.title}</strong><p>{choice?.principle}</p><small>{choice?.score}/3 reasoning signal</small></article>;
              })}
            </div>
            <div className="trial-source"><p><strong>Grounded in real occupational work.</strong><span>The scenario is simplified for exploration; company processes and incident procedures vary.</span></p><a href={trial.sourceUrl} target="_blank" rel="noreferrer">Source: {trial.sourceLabel} <ExternalLink /></a></div>
            <div className="trial-result-actions"><button className="button button-light" type="button" onClick={onExplore}>Add this to my plan <ArrowRight /></button><button className="button button-ghost" type="button" onClick={onPractice}>Rehearse the interview</button><button className="text-button" type="button" onClick={restartTrial}><RefreshCw /> Replay trial</button></div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function InterviewScreen({
  selectedCareerId,
  onSelectCareer,
  onHome,
  onExplore,
}: {
  selectedCareerId: CareerId;
  onSelectCareer: (id: CareerId) => void;
  onHome: () => void;
  onExplore: () => void;
}) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [analysis, setAnalysis] = useState<AnswerAnalysis | null>(null);
  const [mode, setMode] = useState<InterviewMode>("answer");
  const [filter, setFilter] = useState<InterviewFilter>("All");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [attempts, setAttempts] = useState<Record<string, InterviewAttempt[]>>({});
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState("");
  const voiceSupported = useSyncExternalStore(emptySubscribe, getVoiceSupport, getServerVoiceSupport);
  const recorderSupported = useSyncExternalStore(emptySubscribe, getRecorderSupport, getServerRecorderSupport);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const transcriptBaseRef = useRef("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const audioUrlRef = useRef<string | null>(null);
  const career = careers[selectedCareerId];
  const research = careerResearch[selectedCareerId];
  const questions = filter === "All" ? research.questions : research.questions.filter((item) => item.type === filter);
  const question = questions[questionIndex];
  const questionAttempts = attempts[question.id] ?? [];
  const latestAttempt = questionAttempts.at(-1);
  const previousAttempt = questionAttempts.at(-2);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isRecording) return;
    const timer = window.setInterval(() => setRecordingSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isRecording]);

  function startRecognition() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    transcriptBaseRef.current = answer.trim();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }
      setAnswer(`${transcriptBaseRef.current}${transcriptBaseRef.current ? " " : ""}${transcript}`.trimStart());
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  }

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    startRecognition();
  }

  function clearRecording() {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
    setAudioUrl(null);
    setRecordingSeconds(0);
    setRecordingError("");
  }

  async function startRecording() {
    if (!recorderSupported) return;
    clearRecording();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = preferredType ? new MediaRecorder(stream, { mimeType: preferredType }) : new MediaRecorder(stream);
      recordingStreamRef.current = stream;
      recorderRef.current = recorder;
      recordingChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) recordingChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const nextUrl = URL.createObjectURL(blob);
        audioUrlRef.current = nextUrl;
        setAudioUrl(nextUrl);
        stream.getTracks().forEach((track) => track.stop());
        recordingStreamRef.current = null;
        recorderRef.current = null;
        setIsRecording(false);
      };
      setRecordingSeconds(0);
      recorder.start();
      setIsRecording(true);
      if (voiceSupported && !isListening) startRecognition();
    } catch {
      setRecordingError("Microphone access was unavailable. You can still type and receive the complete coaching review.");
      setIsRecording(false);
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  function submitAnswer() {
    recognitionRef.current?.stop();
    setIsListening(false);
    const result = analyzeInterviewAnswer(answer, question.type, question.keyTerms);
    const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;
    setAnalysis(result);
    setScores((current) => ({ ...current, [question.id]: result.score }));
    setAttempts((current) => ({ ...current, [question.id]: [...(current[question.id] ?? []), { score: result.score, words, seconds: recordingSeconds }] }));
    setMode("feedback");
  }

  function nextQuestion() {
    if (questionIndex === questions.length - 1) {
      setMode("summary");
      return;
    }
    setQuestionIndex((current) => current + 1);
    setAnswer("");
    clearRecording();
    setAnalysis(null);
    setMode("answer");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    setQuestionIndex(0);
    setAnswer("");
    clearRecording();
    setAnalysis(null);
    setScores({});
    setAttempts({});
    setMode("answer");
  }

  function selectFilter(nextFilter: InterviewFilter) {
    recognitionRef.current?.stop();
    setIsListening(false);
    setFilter(nextFilter);
    setQuestionIndex(0);
    setAnswer("");
    clearRecording();
    setAnalysis(null);
    setMode("answer");
  }

  const averageScore = Math.round(Object.values(scores).reduce((sum, score) => sum + score, 0) / Math.max(Object.values(scores).length, 1));

  return (
    <div className="interview-screen" style={styleFor(career.color)}>
      <AppHeader view="interview" onHome={onHome} onExplore={onExplore} onPractice={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
      <main className="interview-shell shell">
        <section className="practice-header" data-enter>
          <div><p className="eyebrow"><span /> Interview practice studio</p><h1>Practise until your answer sounds like you.</h1><p>Use role-specific prompts, a clear coaching rubric, and strong-answer comparisons to make your own evidence easier to hear under pressure.</p></div>
          <div className="practice-status"><span><Mic /> {recorderSupported ? "Record + replay ready" : voiceSupported ? "Voice dictation ready" : "Typing ready"}</span><span><Target /> {career.shortTitle} track</span></div>
        </section>

        <CareerTabs selected={selectedCareerId} onSelect={onSelectCareer} />

        <div className="interview-filters" aria-label="Filter practice questions">
          {(["All", "Technical", "Behavioral"] as InterviewFilter[]).map((item) => (
            <button className={filter === item ? "is-active" : ""} disabled={isRecording} key={item} onClick={() => selectFilter(item)} type="button">
              {item}
              <span>{item === "All" ? research.questions.length : research.questions.filter((questionItem) => questionItem.type === item).length}</span>
            </button>
          ))}
          <p><CheckCircle2 /> {Object.keys(scores).length} practiced</p>
        </div>

        {mode !== "summary" ? (
          <section className="interview-workspace" data-enter>
            <aside className="question-rail">
              <p>Practice set</p>
              {questions.map((item, index) => (
                <button
                  className={`${index === questionIndex ? "is-active" : ""} ${scores[item.id] ? "is-complete" : ""}`}
                  disabled={isRecording}
                  key={item.id}
                  onClick={() => {
                    setQuestionIndex(index);
                    setAnswer("");
                    clearRecording();
                    setAnalysis(null);
                    setMode("answer");
                  }}
                  type="button"
                >
                  <span>{scores[item.id] ? <Check /> : index + 1}</span>
                  <span><strong className={`question-type is-${item.type.toLowerCase()}`}>{item.type}</strong><small>{item.prompt}</small></span>
                </button>
              ))}
            </aside>

            <div className="practice-main">
              <div className="prompt-card">
                <div className="prompt-meta"><span className={`is-${question.type.toLowerCase()}`}>{question.type}</span><span>Question {questionIndex + 1} of {questions.length}</span></div>
                <h2>{question.prompt}</h2>
                <p><Lightbulb /> {question.why}</p>
              </div>

              {mode === "answer" ? (
                <div className="answer-card">
                  <div className="answer-heading"><div><p>Your answer · attempt {questionAttempts.length + 1}</p><span>Record and replay yourself, or type a draft. Aim for 60–120 seconds.</span></div><span className="answer-time"><Timer /> {recordingSeconds ? `${Math.floor(recordingSeconds / 60)}:${String(recordingSeconds % 60).padStart(2, "0")}` : "~90 sec"}</span></div>
                  <textarea
                    aria-label="Interview answer"
                    onChange={(event) => setAnswer(event.target.value)}
                    placeholder={question.type === "Behavioral" ? "Set the scene briefly, then focus on what you did and what changed…" : "Start with your assumptions, then walk through the approach in a clear sequence…"}
                    value={answer}
                  />
                  <div className="answer-footer">
                    <div>
                      <button
                        className={`voice-button ${isRecording || isListening ? "is-listening" : ""}`}
                        disabled={!recorderSupported && !voiceSupported}
                        onClick={() => recorderSupported ? (isRecording ? stopRecording() : startRecording()) : toggleListening()}
                        title={recorderSupported ? "Record an audio attempt locally in this browser" : voiceSupported ? "Use speech recognition" : "Voice tools are unavailable in this browser. You can still type your answer."}
                        type="button"
                      >
                        {isRecording || isListening ? <MicOff /> : <Mic />} {isRecording ? "Stop recording" : isListening ? "Stop listening" : recorderSupported ? "Record an attempt" : voiceSupported ? "Answer with voice" : "Voice unavailable"}
                      </button>
                      <span className="word-count">{answer.trim() ? answer.trim().split(/\s+/).length : 0} words</span>
                    </div>
                    <button className="button button-primary" disabled={answer.trim().length < 20 || isRecording} onClick={submitAnswer} type="button">Get coaching <ArrowRight /></button>
                  </div>
                  {(isRecording || isListening) && <div className="listening-bar" role="status"><span /><span /><span /><span /><p>{isRecording ? "Recording locally" : "Listening"}{voiceSupported ? "—your words will appear above." : "—add notes above when you finish."}</p></div>}
                  {audioUrl && <div className="audio-review"><div><Play /><span><strong>Replay this attempt</strong><small>Audio stays in this browser tab.</small></span></div><audio controls src={audioUrl}>Your browser does not support audio playback.</audio></div>}
                  {recordingError && <p className="recording-error" role="alert">{recordingError}</p>}
                </div>
              ) : analysis ? (
                <div className="feedback-stack">
                  <div className="feedback-hero">
                    <div className="score-ring"><span><strong>{analysis.score}</strong><small>/100</small></span></div>
                    <div><p>Coach readout</p><h2>{analysis.headline}</h2><span>{analysis.summary}</span></div>
                  </div>
                  {previousAttempt && latestAttempt && (
                    <div className="attempt-comparison">
                      <div><span>Attempt {questionAttempts.length}</span><strong>{latestAttempt.score}</strong><small>{latestAttempt.words} words{latestAttempt.seconds ? ` · ${latestAttempt.seconds}s` : ""}</small></div>
                      <ArrowRight />
                      <div><span>Change from last try</span><strong className={latestAttempt.score >= previousAttempt.score ? "is-positive" : ""}>{latestAttempt.score - previousAttempt.score >= 0 ? "+" : ""}{latestAttempt.score - previousAttempt.score}</strong><small>{latestAttempt.words - previousAttempt.words >= 0 ? "+" : ""}{latestAttempt.words - previousAttempt.words} words</small></div>
                      <p>{latestAttempt.score > previousAttempt.score ? "Your revision strengthened the coaching signal." : "A lower score can still be a better spoken answer—listen for clarity, confidence, and your own voice."}</p>
                    </div>
                  )}
                  <div className="feedback-grid">
                    {analysis.checks.map((check) => (
                      <div className={check.passed ? "is-passed" : ""} key={check.label}>
                        <span>{check.passed ? <Check /> : <ArrowRight />}</span><div><strong>{check.label}</strong><p>{check.detail}</p></div>
                      </div>
                    ))}
                  </div>
                  <div className="coach-note"><Lightbulb /><div><strong>One high-value edit</strong><p>{question.coachNote}</p></div></div>
                  <details className="answer-example">
                    <summary><span><Sparkles /> Compare with a strong answer</span><ChevronRight /></summary>
                    <div>{question.hasCode ? <pre>{question.strongAnswer}</pre> : <p>{question.strongAnswer}</p>}<small>Use the structure, not the wording. Your own evidence will sound more credible.</small></div>
                  </details>
                  <div className="feedback-actions">
                    <button className="button button-ghost" type="button" onClick={() => { clearRecording(); setMode("answer"); }}><RefreshCw /> Record attempt {questionAttempts.length + 1}</button>
                    <button className="button button-primary" type="button" onClick={nextQuestion}>{questionIndex === questions.length - 1 ? "See practice summary" : "Next question"} <ArrowRight /></button>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ) : (
          <section className="practice-summary" data-enter>
            <div className="summary-mark"><CheckCircle2 /></div>
            <p className="eyebrow centered">Practice set complete</p>
            <h2>Your {career.shortTitle.toLowerCase()} stories are taking shape.</h2>
            <p>You practiced {Object.keys(scores).length} of {research.questions.length} role-specific questions with an average coaching signal of {averageScore}. Treat that number as a revision aid—not a hiring prediction.</p>
            <div className="summary-scores">
              {research.questions.map((item, index) => <div key={item.id}><span>{index + 1}. {item.type}</span><strong>{scores[item.id] ?? "—"}</strong></div>)}
            </div>
            <div className="summary-next"><strong>Before the real interview</strong><p>Choose your two strongest stories, say each once without notes, and ask a teammate whether your personal contribution and result are obvious.</p></div>
            <div className="summary-actions"><button className="button button-primary" type="button" onClick={restart}>Practice again <RefreshCw /></button><button className="button button-ghost" type="button" onClick={onExplore}>Back to career plan</button></div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <Brand />
        <p>Student-built prototype for BYU Information Systems. Career matches are exploration prompts, not assessments or guarantees.</p>
        <div><a href="https://marriott.byu.edu/infosys/" target="_blank" rel="noreferrer">BYU Information Systems <ExternalLink /></a><span>Field trial build v3</span></div>
      </div>
    </footer>
  );
}

export default function LaunchpadApp() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [savedState] = useState(readSavedState);
  const [view, setView] = useState<View>("home");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(savedState.answers ?? {});
  const [selectedCareerId, setSelectedCareerId] = useState<CareerId>(
    savedState.selectedCareerId && careerOrder.includes(savedState.selectedCareerId) ? savedState.selectedCareerId : "build",
  );
  const [readiness, setReadiness] = useState<Record<string, boolean>>(savedState.readiness ?? {});
  const [trialResults, setTrialResults] = useState<Partial<Record<CareerId, TrialResult>>>(savedState.trialResults ?? {});

  const matches = useMemo(() => {
    if (Object.keys(answers).length === quizQuestions.length) return calculateMatches(answers);
    return careerOrder.map((id, index) => ({ id, raw: 4 - index, percent: 82 - index * 7 }));
  }, [answers]);

  useEffect(() => {
    try {
      window.localStorage.setItem("byu-is-launchpad-v2", JSON.stringify({ answers, selectedCareerId, readiness, trialResults }));
    } catch {
      // See note above: persistence is an enhancement, not a requirement.
    }
  }, [answers, selectedCareerId, readiness, trialResults]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view, selectedCareerId]);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          motionOK: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const reduceMotion = context.conditions?.reduceMotion;
          gsap.fromTo(
            "[data-enter]",
            { opacity: 0, y: reduceMotion ? 0 : 20 },
            { opacity: 1, y: 0, duration: reduceMotion ? 0.01 : 0.72, stagger: reduceMotion ? 0 : 0.07, ease: "power3.out", clearProps: "transform" },
          );
          if (!reduceMotion) {
            gsap.fromTo("[data-scene] img", { scale: 1.08, opacity: 0.55 }, { scale: 1, opacity: 1, duration: 1.2, ease: "power3.out" });
            gsap.to(".signal-halo-one", { rotate: 360, duration: 36, repeat: -1, ease: "none" });
            gsap.to(".signal-halo-two", { rotate: -360, duration: 48, repeat: -1, ease: "none" });
            gsap.to(".signal-scan", { rotate: 360, duration: 8, repeat: -1, ease: "none" });
            gsap.fromTo(".reveal-icon", { scale: 0.72, rotate: -8 }, { scale: 1, rotate: 0, duration: 1, ease: "elastic.out(1, 0.55)" });
            gsap.fromTo(".reveal-copy h1", { letterSpacing: "0.02em", opacity: 0 }, { letterSpacing: "-0.055em", opacity: 1, duration: 1.1, ease: "power3.out" });
          }
        },
        rootRef,
      );
      return () => media.revert();
    },
    { scope: rootRef, dependencies: [view, questionIndex, selectedCareerId] },
  );

  function startQuiz(reset = false) {
    if (!reset && Object.keys(answers).length === quizQuestions.length) {
      const result = calculateMatches(answers);
      setSelectedCareerId(result[0].id);
      setView("reveal");
      return;
    }
    if (reset) setAnswers({});
    setQuestionIndex(reset ? 0 : Math.min(Object.keys(answers).length, quizQuestions.length - 1));
    setView("quiz");
  }

  function continueQuiz() {
    if (questionIndex < quizQuestions.length - 1) {
      setQuestionIndex((current) => current + 1);
      return;
    }
    const result = calculateMatches(answers);
    setSelectedCareerId(result[0].id);
    setView("reveal");
  }

  function exploreCareer(id: CareerId) {
    setSelectedCareerId(id);
    setView("dashboard");
  }

  function goBackQuiz() {
    if (questionIndex === 0) setView("home");
    else setQuestionIndex((current) => current - 1);
  }

  return (
    <div ref={rootRef}>
      {view === "home" && (
        <HomeScreen onStart={() => startQuiz()} onExplore={() => exploreCareer(selectedCareerId)} onPractice={() => setView("interview")} onSelectCareer={exploreCareer} />
      )}
      {view === "quiz" && (
        <QuizScreen answers={answers} questionIndex={questionIndex} onAnswer={(optionId) => setAnswers((current) => ({ ...current, [questionIndex]: optionId }))} onBack={goBackQuiz} onContinue={continueQuiz} onExit={() => setView("home")} />
      )}
      {view === "reveal" && (
        <RevealScreen answers={answers} matches={matches} onContinue={() => setView("dashboard")} onTrial={() => setView("trial")} onPractice={() => setView("interview")} onRetake={() => startQuiz(true)} />
      )}
      {view === "dashboard" && (
        <DashboardScreen answers={answers} selectedCareerId={selectedCareerId} matches={matches} readiness={readiness} trialResults={trialResults} onSelectCareer={setSelectedCareerId} onToggleReadiness={(id) => setReadiness((current) => ({ ...current, [id]: !current[id] }))} onHome={() => setView("home")} onTrial={() => setView("trial")} onPractice={() => setView("interview")} onRetake={() => startQuiz(true)} />
      )}
      {view === "trial" && (
        <FieldTrialScreen key={selectedCareerId} selectedCareerId={selectedCareerId} existingResult={trialResults[selectedCareerId]} onSelectCareer={setSelectedCareerId} onComplete={(result) => setTrialResults((current) => ({ ...current, [selectedCareerId]: result }))} onHome={() => setView("home")} onExplore={() => setView("dashboard")} onPractice={() => setView("interview")} />
      )}
      {view === "interview" && (
        <InterviewScreen key={selectedCareerId} selectedCareerId={selectedCareerId} onSelectCareer={setSelectedCareerId} onHome={() => setView("home")} onExplore={() => setView("dashboard")} />
      )}
    </div>
  );
}
