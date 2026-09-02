"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BadgeCheck,
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
import {
  analyzeInterviewAnswer,
  calculateMatches,
  type AnswerAnalysis,
  type QuizAnswers,
} from "@/lib/scoring";

gsap.registerPlugin(useGSAP);

type View = "home" | "quiz" | "reveal" | "dashboard" | "interview";
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

function readSavedState(): {
  answers?: QuizAnswers;
  selectedCareerId?: CareerId;
  readiness?: Record<string, boolean>;
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
      <span className="brand-mark" aria-hidden="true">Y</span>
      <span className="brand-copy">
        <strong>BYU IS</strong>
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
        const Icon = iconMap[careerId];
        return (
          <div
            className={`signal-node signal-node-${index + 1} ${active === careerId ? "is-active" : ""}`}
            key={careerId}
            style={styleFor(careers[careerId].color)}
          >
            <Icon />
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
            <p className="eyebrow"><span /> Built for BYU IS junior recruiting</p>
            <h1>Find the IS work that fits how you think.</h1>
            <p className="hero-lede">
              An interactive career signal that turns your instincts into a promising role, an honest preview of the work, and a focused plan for recruiting.
            </p>
            <div className="hero-actions">
              <button className="button button-primary" type="button" onClick={onStart}>
                Find my career signal <ArrowRight />
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
            <p className="visual-kicker">Your signal is waiting</p>
            <SignalVisual active="analyze" />
            <div className="visual-caption">
              <Sparkles /> Four paths. One place to start.
            </div>
          </div>
        </section>

        <section className="path-preview shell" aria-labelledby="paths-heading">
          <div className="section-heading" data-enter>
            <div>
              <p className="eyebrow">The IS landscape</p>
              <h2 id="paths-heading">Different work. Shared foundation.</h2>
            </div>
            <p>Explore the broad directions BYU IS students recruit into, then use the signal to learn where your energy may fit best.</p>
          </div>
          <div className="path-grid">
            {careerOrder.map((careerId, index) => {
              const career = careers[careerId];
              const Icon = iconMap[careerId];
              return (
                <button
                  className="path-card"
                  data-enter
                  key={careerId}
                  onClick={() => onSelectCareer(careerId)}
                  style={styleFor(career.color)}
                  type="button"
                >
                  <span className="path-number">0{index + 1}</span>
                  <span className="path-icon"><Icon /></span>
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
              <p className="eyebrow">Not another personality test</p>
              <h2 id="how-heading">A direction, plus the receipts.</h2>
            </div>
            <div className="how-steps">
              <div><span>01</span><strong>Notice your pattern</strong><p>Eight situational choices surface how you prefer to solve problems.</p></div>
              <div><span>02</span><strong>Meet the real work</strong><p>See a representative day, the friction, and related entry-level roles.</p></div>
              <div><span>03</span><strong>Move this week</strong><p>Turn junior-core work into evidence, check readiness, and rehearse aloud.</p></div>
            </div>
          </div>
        </section>

        <section className="home-cta shell" data-enter>
          <div>
            <p className="eyebrow">Recruiting gets easier with a target</p>
            <h2>Start with curiosity. Leave with a plan.</h2>
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
      <section className="quiz-stage shell-narrow" aria-labelledby="question-heading">
        <div className="quiz-intro" data-enter>
          <p className="question-count">Question {questionIndex + 1} of {quizQuestions.length}</p>
          <p className="eyebrow centered">{question.eyebrow}</p>
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
          <button className="button button-primary" disabled={!selected} type="button" onClick={onContinue}>
            {questionIndex === quizQuestions.length - 1 ? "Reveal my signal" : "Continue"} <ArrowRight />
          </button>
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
  onContinue,
  onPractice,
  onRetake,
}: {
  matches: ReturnType<typeof calculateMatches>;
  onContinue: () => void;
  onPractice: () => void;
  onRetake: () => void;
}) {
  const winner = careers[matches[0].id];
  const Icon = iconMap[winner.id];

  return (
    <main className="reveal-screen" style={styleFor(winner.color)}>
      <div className="reveal-topbar"><Brand compact /><span>Your career signal</span></div>
      <section className="reveal-stage shell">
        <div className="reveal-orbit" data-enter>
          <SignalVisual active={winner.id} compact />
        </div>
        <div className="reveal-copy" data-enter>
          <p className="eyebrow centered"><Sparkles /> Your strongest signal</p>
          <div className="reveal-icon"><Icon /></div>
          <h1>The {winner.signal}</h1>
          <p className="reveal-role">{winner.title}</p>
          <p className="reveal-tagline">{winner.tagline}</p>
          <p className="reveal-description">{winner.description}</p>
        </div>
        <div className="reveal-matches" data-enter>
          <MatchBars matches={matches} />
          <p>This is a direction to investigate, not a box. Your full result keeps the adjacent paths visible.</p>
        </div>
        <div className="reveal-actions" data-enter>
          <button className="button button-light" type="button" onClick={onContinue}>Open my game plan <ArrowRight /></button>
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

function DashboardScreen({
  selectedCareerId,
  matches,
  readiness,
  onSelectCareer,
  onToggleReadiness,
  onHome,
  onPractice,
  onRetake,
}: {
  selectedCareerId: CareerId;
  matches: ReturnType<typeof calculateMatches>;
  readiness: Record<string, boolean>;
  onSelectCareer: (id: CareerId) => void;
  onToggleReadiness: (id: string) => void;
  onHome: () => void;
  onPractice: () => void;
  onRetake: () => void;
}) {
  const career = careers[selectedCareerId];
  const research = careerResearch[selectedCareerId];
  const Icon = iconMap[career.id];
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
              <span className="result-icon"><Icon /></span>
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
            </section>
          </>
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
  const [isListening, setIsListening] = useState(false);
  const voiceSupported = useSyncExternalStore(emptySubscribe, getVoiceSupport, getServerVoiceSupport);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const transcriptBaseRef = useRef("");
  const career = careers[selectedCareerId];
  const research = careerResearch[selectedCareerId];
  const questions = filter === "All" ? research.questions : research.questions.filter((item) => item.type === filter);
  const question = questions[questionIndex];

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

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
    recognition.start();
    setIsListening(true);
  }

  function submitAnswer() {
    recognitionRef.current?.stop();
    setIsListening(false);
    const result = analyzeInterviewAnswer(answer, question.type, question.keyTerms);
    setAnalysis(result);
    setScores((current) => ({ ...current, [question.id]: result.score }));
    setMode("feedback");
  }

  function nextQuestion() {
    if (questionIndex === questions.length - 1) {
      setMode("summary");
      return;
    }
    setQuestionIndex((current) => current + 1);
    setAnswer("");
    setAnalysis(null);
    setMode("answer");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    setQuestionIndex(0);
    setAnswer("");
    setAnalysis(null);
    setScores({});
    setMode("answer");
  }

  function selectFilter(nextFilter: InterviewFilter) {
    recognitionRef.current?.stop();
    setIsListening(false);
    setFilter(nextFilter);
    setQuestionIndex(0);
    setAnswer("");
    setAnalysis(null);
    setMode("answer");
  }

  const averageScore = Math.round(Object.values(scores).reduce((sum, score) => sum + score, 0) / Math.max(Object.values(scores).length, 1));

  return (
    <div className="interview-screen" style={styleFor(career.color)}>
      <AppHeader view="interview" onHome={onHome} onExplore={onExplore} onPractice={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
      <main className="interview-shell shell">
        <section className="practice-header" data-enter>
          <div><p className="eyebrow"><span /> Interview practice lab</p><h1>Build an answer you can trust under pressure.</h1><p>Role-specific prompts, a useful coaching rubric, and a strong-answer comparison—without pretending a word count is human judgment.</p></div>
          <div className="practice-status"><span><Mic /> {voiceSupported ? "Voice ready" : "Typing ready"}</span><span><Target /> {career.shortTitle} track</span></div>
        </section>

        <CareerTabs selected={selectedCareerId} onSelect={onSelectCareer} />

        <div className="interview-filters" aria-label="Filter practice questions">
          {(["All", "Technical", "Behavioral"] as InterviewFilter[]).map((item) => (
            <button className={filter === item ? "is-active" : ""} key={item} onClick={() => selectFilter(item)} type="button">
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
                  key={item.id}
                  onClick={() => {
                    setQuestionIndex(index);
                    setAnswer("");
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
                  <div className="answer-heading"><div><p>Your answer</p><span>Speak naturally or type a draft. Aim for 60–120 seconds.</span></div><span className="answer-time"><Timer /> ~90 sec</span></div>
                  <textarea
                    aria-label="Interview answer"
                    onChange={(event) => setAnswer(event.target.value)}
                    placeholder={question.type === "Behavioral" ? "Set the scene briefly, then focus on what you did and what changed…" : "Start with your assumptions, then walk through the approach in a clear sequence…"}
                    value={answer}
                  />
                  <div className="answer-footer">
                    <div>
                      <button
                        className={`voice-button ${isListening ? "is-listening" : ""}`}
                        disabled={!voiceSupported}
                        onClick={toggleListening}
                        title={voiceSupported ? "Use speech recognition" : "Speech recognition is not supported in this browser. You can still type your answer."}
                        type="button"
                      >
                        {isListening ? <MicOff /> : <Mic />} {isListening ? "Stop listening" : voiceSupported ? "Answer with voice" : "Voice unavailable"}
                      </button>
                      <span className="word-count">{answer.trim() ? answer.trim().split(/\s+/).length : 0} words</span>
                    </div>
                    <button className="button button-primary" disabled={answer.trim().length < 20} onClick={submitAnswer} type="button">Get coaching <ArrowRight /></button>
                  </div>
                  {isListening && <div className="listening-bar" role="status"><span /><span /><span /><span /><p>Listening—your words will appear above.</p></div>}
                </div>
              ) : analysis ? (
                <div className="feedback-stack">
                  <div className="feedback-hero">
                    <div className="score-ring"><span><strong>{analysis.score}</strong><small>/100</small></span></div>
                    <div><p>Coach readout</p><h2>{analysis.headline}</h2><span>{analysis.summary}</span></div>
                  </div>
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
                    <button className="button button-ghost" type="button" onClick={() => setMode("answer")}><RefreshCw /> Revise this answer</button>
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
        <div><a href="https://marriott.byu.edu/infosys/" target="_blank" rel="noreferrer">BYU Information Systems <ExternalLink /></a><span>Research build v2</span></div>
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

  const matches = useMemo(() => {
    if (Object.keys(answers).length === quizQuestions.length) return calculateMatches(answers);
    return careerOrder.map((id, index) => ({ id, raw: 4 - index, percent: 82 - index * 7 }));
  }, [answers]);

  useEffect(() => {
    try {
      window.localStorage.setItem("byu-is-launchpad-v2", JSON.stringify({ answers, selectedCareerId, readiness }));
    } catch {
      // See note above: persistence is an enhancement, not a requirement.
    }
  }, [answers, selectedCareerId, readiness]);

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
            gsap.to(".signal-halo-one", { rotate: 360, duration: 36, repeat: -1, ease: "none" });
            gsap.to(".signal-halo-two", { rotate: -360, duration: 48, repeat: -1, ease: "none" });
            gsap.to(".signal-scan", { rotate: 360, duration: 8, repeat: -1, ease: "none" });
            gsap.fromTo(".reveal-icon", { scale: 0.72, rotate: -8 }, { scale: 1, rotate: 0, duration: 1, ease: "elastic.out(1, 0.55)" });
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
        <RevealScreen matches={matches} onContinue={() => setView("dashboard")} onPractice={() => setView("interview")} onRetake={() => startQuiz(true)} />
      )}
      {view === "dashboard" && (
        <DashboardScreen selectedCareerId={selectedCareerId} matches={matches} readiness={readiness} onSelectCareer={setSelectedCareerId} onToggleReadiness={(id) => setReadiness((current) => ({ ...current, [id]: !current[id] }))} onHome={() => setView("home")} onPractice={() => setView("interview")} onRetake={() => startQuiz(true)} />
      )}
      {view === "interview" && (
        <InterviewScreen key={selectedCareerId} selectedCareerId={selectedCareerId} onSelectCareer={setSelectedCareerId} onHome={() => setView("home")} onExplore={() => setView("dashboard")} />
      )}
    </div>
  );
}
