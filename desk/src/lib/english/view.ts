/**
 * One Linga screen model. What each Linga screen shows, says aloud, offers and takes as a typed answer is decided
 * here, once, from the session: the TV renders it, the phone's home and the PC test bar read it, and the LT driver
 * prints it (viewText) and takes its action ids from it (VIEW_ACTION_IDS). Pure data, no React and no filesystem, so
 * the TV (a client component) and a node test can both import it.
 *
 * An action says what it runs as data, never as a closure: an englishCommand action, a nav to a Screen, or a step
 * of the TV's own local state (the menu, the level picker, the situation and chapter browsers).
 */
import type { Screen, Session } from "../session/store";
import { defaultPreferences, eligibleScenes, ENGLISH_SCENES, ENGLISH_SKILLS, planDone, PROGRESS_LABEL, recommendScene } from "./curriculum";
import { ABOUT_QUESTIONS, BAND_CAN, BAND_NAME, easyBand, isBand, MAX_TASKS, PLAN_MAX, shift } from "./placement";
import type { Band, Conversation, LevelCheck, Progress, SkillId } from "./types";

/**
 * The picture behind the arch (english/art): one of the eight situations, or a piece for a state of the journey.
 * A plan topic has no picture of its own; it borrows the situation that practises the same skill.
 */
export const SCENE_ART = ["meet", "weekend", "rover", "team", "booking", "interview", "date", "conflict"] as const;
export type SceneArt = typeof SCENE_ART[number];
export type ArtKey = SceneArt | "check" | "plan" | "coach" | "done" | "start";
export const SKILL_ART: Record<SkillId, SceneArt> = { contact: "meet", describe: "weekend", repair: "rover", negotiate: "team", request: "booking", narrate: "interview", relate: "date", resolve: "conflict" };
export function artOf(sceneId: string, skill: SkillId): SceneArt { return (SCENE_ART as readonly string[]).includes(sceneId) ? sceneId as SceneArt : SKILL_ART[skill]; }
/** The sentence to take with you: a scene's cue without its "Try…:" lead. */
export function sentenceOf(cue: string): string { return cue.replace(/^Try(?: [a-z]+)?:\s*/, ""); }

/** The six states of Linga home, in the order they are decided. */
export const HOME_STATES = ["resume", "check-part-way", "no-placement", "no-plan", "plan-done", "next-topic"] as const;
export type HomeState = typeof HOME_STATES[number];

/** Every action id any Linga view can offer. The LT driver's decide enum is this list. */
export const VIEW_ACTION_IDS = [
  // home
  "carry-on", "choose-situation", "carry-on-check", "restart-check", "find-level", "pick-level", "see-topics", "new-topics", "talk-again", "start-talking",
  // the level picker
  "this-is-my-level", "lower", "higher", "picker-back",
  // the level check
  "hear-again", "show-words", "choose", "dont-know", "retry", "stop", "cancel",
  // the verdict and the topics
  "check-again", "skip-goal", "not-now", "agree", "swap", "renew",
  // situations and the learning map
  "start-situation", "next-situation", "previous-chapter", "next-chapter",
  // the conversation, the moment, the coach and the recap
  "resume", "finish", "retry-scene", "cue", "quiz", "pick-phrase", "coach", "replay", "back", "learning-map",
  // the menu
  "menu-back", "my-level", "my-topics", "phone-setup", "sentence-help",
  // the TV footer
  "menu", "repeat",
  // the phone: a typed or spoken answer, and the pickers that take a value
  "answer", "pick-situation", "pick-band", "add-topic",
] as const;
export type ActionId = typeof VIEW_ACTION_IDS[number];

/** The TV's own state, which never reaches the session. */
export interface LingaUi { menu: boolean; picking: Band | null; sceneIndex: number; chapter: number; }
export const NO_UI: LingaUi = { menu: false, picking: null, sceneIndex: 0, chapter: 0 };
/** What lingaView reads besides the session: the TV's state, and a request in flight or its error. */
export interface ViewInput extends Partial<LingaUi> { busy?: boolean; error?: string; }

/** The value a phone-side action takes from the learner. */
export type Need = "text" | "option" | "band" | "topicId" | "sceneId";
export interface ViewRun {
  /** an englishCommand action; a `needs` value is added to extra by the caller */
  command?: { action: string; extra?: Record<string, unknown> };
  nav?: { screen: Screen; from?: Screen };
  /** a local step, applied at once */
  ui?: Partial<LingaUi>;
  focus?: number;
  /** a local step applied only once the command succeeded */
  after?: Partial<LingaUi>;
}
export interface ViewAction { id: ActionId; label: string; help: string; run: ViewRun; disabled?: boolean; needs?: Need; }
/** What takes a typed or spoken answer on this screen: the phone's reply box, the PC test bar, the driver's "answer". */
export interface Answer { id: "answer"; action: "check-answer" | "check-task" | "plan-goal" | "turn"; label: string; lastTurnId?: string; taskId?: string; }
/** The line the TV speaks. A new key plays it again; blocked keeps it silent. */
export interface Spoken { line: string; key: string; blocked: boolean; slow: boolean; speaker: string; }
export interface Recap { title: string; replies: number; spoken: number; moments: Array<{ kind: "fix" | "word"; said: string; better: string; why: string }>; }
export type Hero =
  | { kind: "intro"; kicker: string; title: string; subtitle: string; art: ArtKey; nameTag: string }
  | { kind: "ladder"; kicker: string; title: string; band: Band; note: string }
  | { kind: "message"; kicker: string; text: string; note: string }
  | { kind: "heading"; kicker: string; title: string }
  | { kind: "choices"; kicker: string; prompt: string; options: string[]; small: boolean }
  | { kind: "topics"; kicker: string; title: string; topics: Array<{ id: string; title: string; skill: string; why: string; art: SceneArt }>; selected: number }
  | { kind: "scene"; kicker: string; title: string; who: string; said: string; subtitle: string; art: string; small: boolean;
      /** the scene's partner, for the name tag; its cue as a sentence to take with you; its picture; the level and length */
      partner: string; sentence: string; illustration: SceneArt; band: Band; minutes: string }
  | { kind: "track"; kicker: string; title: string; progress: Progress; subtitle: string; illustration: ArtKey }
  | { kind: "comparison"; before: { kicker: string; quote: string }; after: { kicker: string; quote: string }; note: string }
  | { kind: "menu"; kicker: string; title: string; entries: string[]; selected: number }
  | { kind: "plain"; title: string };
export interface LingaView {
  /** the TV's data-view: "menu", the picker's "linga-verdict", else the session screen */
  screen: string;
  /** set on Linga home (linga or tonight), null elsewhere */
  home: HomeState | null;
  tag: string; title: string; captionTag: string;
  /** the caption before focus help and errors; what the driver prints */
  baseCaption: string;
  /** what the TV caption slot shows: the focused action's help, or an error */
  caption: string;
  error: string;
  hero: Hero;
  /** the TV action row */
  actions: ViewAction[];
  /** the TV footer: the menu, and Repeat audio during a conversation */
  footer: ViewAction[];
  /** what the paired phone adds that takes a value or lives only there */
  phone: ViewAction[];
  answer: Answer | null;
  spoken: Spoken;
  /** the TV may speak now (no menu or picker over it, a speaking screen) */
  audible: boolean;
  waiting: boolean;
  recap: Recap | null;
  /** lines the phone shows beyond the TV, for the driver */
  details: string[];
}

const TASK_TITLE = { say: "Say it", listen: "Listen and answer", choose: "Choose the reply" } as const;
const CHECK_SCREENS: Screen[] = ["linga-check", "linga-verdict", "linga-plan"];
const skillName = (id: string) => ENGLISH_SKILLS.find(x => x.id === id)?.name ?? "";
const cmd = (action: string, extra?: Record<string, unknown>): ViewRun => ({ command: extra ? { action, extra } : { action } });
const go = (screen: Screen): ViewRun => ({ nav: { screen } });
const act = (id: ActionId, label: string, help: string, run: ViewRun, more: Partial<ViewAction> = {}): ViewAction => ({ id, label, help, run, ...more });

/** The caption tag over each rung of the rescue ladder (lib/english/help.ts): the rung names itself. */
export const RUNG_TAG = { 1: "Said more simply", 2: "What it means", 3: "A way to start" } as const;
const RUNG_NEXT = {
  1: "Hear the question said more simply, then answer on your phone.",
  2: "Hear what the question means, then answer on your phone.",
  3: "Get a way to start your reply. A reply after this counts as helped.",
} as const;
/**
 * The help button as every screen shows it, from the ladder's shape on the session (never its words): its label,
 * what it gives next, the tag over a revealed rung, and whether it is offered at all. At the top of a ladder it is
 * not: "Choose a phrase" stays the recognition fallback. A line with no ladder gets the scene's cue, as before.
 */
export function helpOf(c: Conversation): { label: string; help: string; tag: string; offered: boolean } {
  const h = c.help, next = h?.rungs.find(r => r > h.rung);
  return {
    label: h?.rung ? "More help" : "Help me answer",
    help: next ? RUNG_NEXT[next] : "Get a phrase starter, then try your own reply on the phone.",
    tag: h?.shown && h.rung ? RUNG_TAG[h.rung] : "A little support",
    offered: !h?.rung || !!next,
  };
}

/** The level check of the learner at the desk, if one is under way. */
export function activeCheck(s: Session): LevelCheck | null { return s.check && s.check.learnerId === s.learner.id ? s.check : null; }

export function lingaHome(s: Session): HomeState {
  const c = s.conversation, lc = activeCheck(s), l = s.englishLearning;
  if (c && c.phase !== "finished" && c.turns.length > 0) return "resume";
  if (lc && (lc.stage === "about" || lc.stage === "tasks")) return "check-part-way";
  if (!l.placement) return "no-placement";
  if (!l.plan || lc?.stage === "plan" || lc?.stage === "verdict") return "no-plan";
  if (planDone(l)) return "plan-done";
  return "next-topic";
}

/** The screen's typed or spoken answer, if it takes one now. A choice is answered with the remote, not here. */
function answerOf(s: Session, lc: LevelCheck | null, c: Conversation | null): Answer | null {
  if (s.screen === "linga-check" && lc && !lc.pending) {
    const q = lc.turns.at(-1);
    if (lc.stage === "about" && q?.role === "tutor") return { id: "answer", action: "check-answer", label: "Answer the question", lastTurnId: q.id };
    if (lc.stage === "tasks" && lc.task && lc.task.kind !== "choose") return { id: "answer", action: "check-task", label: lc.task.kind === "listen" ? "Answer the listening task" : "Answer the task", taskId: lc.task.id };
  }
  if (s.screen === "linga-plan" && lc?.askGoal && !lc.pending) return { id: "answer", action: "plan-goal", label: "Say what to practise" };
  // The phone keeps its reply box during the recognition quiz, and a turn is accepted there.
  const said = c?.turns.at(-1);
  if (s.screen === "linga-talk" && c && !c.pending && !c.paused && !c.moment && c.phase !== "finished" && c.phase !== "coaching" && said?.role === "partner") return { id: "answer", action: "turn", label: `Reply to ${c.partner}`, lastTurnId: said.id };
  return null;
}

export function lingaView(s: Session, input: ViewInput = {}): LingaView {
  const ui: LingaUi = { ...NO_UI, ...Object.fromEntries(Object.entries(input).filter(([k, v]) => k in NO_UI && v !== undefined)) };
  const { menu, picking, sceneIndex, chapter } = ui;
  const p = s.profiles.find(p => p.id === s.learner.id), l = s.englishLearning, prefs = l.preferences ?? defaultPreferences(p);
  const level: Band = l.placement?.band ?? (isBand(prefs.level) ? prefs.level : "A1");
  const scenes = eligibleScenes(p, prefs, l), recommended = recommendScene(p, l), c = s.conversation;
  const lc = activeCheck(s), placement = lc?.placement ?? l.placement;
  const isHome = s.screen === "linga" || s.screen === "tonight", onCheck = CHECK_SCREENS.includes(s.screen);
  const last = c?.turns.at(-1), asked = lc?.turns.at(-1);
  const waiting = !!input.busy || (onCheck ? !!lc?.pending : !!c?.pending);
  const spoken: Spoken = s.screen === "linga-check" && lc
    ? { line: lc.stage === "about" ? (asked?.role === "tutor" ? asked.text : "") : lc.task?.kind === "listen" ? lc.task.line : lc.task?.kind === "say" ? lc.task.prompt : "", key: `${lc.id}:${asked?.id}:${lc.task?.id}:${lc.audioNonce}`, blocked: !!lc.pending, slow: easyBand(lc.task?.band ?? "A2"), speaker: "Linga" }
    : { line: c?.phase === "coaching" ? c.coaching?.note ?? "" : last?.role === "partner" ? last.text : "", key: `${c?.id}:${c?.phase}:${last?.id}:${c?.audioNonce}`, blocked: !c || c.paused || c.capture || !!c.pending || c.phase === "finished", slow: easyBand(c && isBand(c.preferences.level) ? c.preferences.level : "A1"), speaker: "Partner" };
  const audible = !menu && !picking && (s.screen === "linga-check" || !isHome && ["linga-talk", "linga-coach"].includes(s.screen));
  const pickAt = (band: Band): ViewRun => ({ ui: { picking: band }, focus: 0 });
  const stopCheck = act("stop", "Stop for now", "Leave the level check. You can carry on from here later.", cmd("check-leave"));
  const chooseSituation = (help: string, label = "Choose a situation") => act("choose-situation", label, help, go("linga-scenes"));
  let tag = "Tonight", title = "", caption = "", captionTag = "Your mission", hero: Hero = { kind: "plain", title: "A place to practise" };
  let actions: ViewAction[] = [], home: HomeState | null = null, recap: Recap | null = null;
  const details: string[] = [];

  if (picking) {
    tag = "Your level"; title = `${picking} · ${BAND_NAME[picking]}`; caption = BAND_CAN[picking]; captionTag = "Pick your level";
    hero = { kind: "ladder", kicker: "Self-chosen · Linga can find it with you any time", title, band: picking, note: "" };
    actions = [
      act("this-is-my-level", "This is my level", BAND_CAN[picking], { command: { action: "level-self", extra: { band: picking } }, after: { picking: null } }),
      act("lower", "Lower", picking === "A1" ? "A1 is the first level." : `${shift(picking, -1)} · ${BAND_CAN[shift(picking, -1)]}`, { ui: { picking: shift(picking, -1) } }),
      act("higher", "Higher", picking === "C2" ? "C2 is the top level." : `${shift(picking, 1)} · ${BAND_CAN[shift(picking, 1)]}`, { ui: { picking: shift(picking, 1) } }),
      act("picker-back", "Not sure · go back", "Go back without choosing. Linga can find your level with you instead.", { ui: { picking: null }, focus: 0 }),
    ];
  } else if (isHome) {
    home = lingaHome(s);
    const intro = (kicker: string, subtitle: string, art: ArtKey, nameTag: string) => ({ kind: "intro" as const, kicker, title, subtitle, art, nameTag });
    const self = l.placement?.source === "self" ? " · self-chosen" : "";
    switch (home) {
      case "resume": {
        const cv = c!;
        title = cv.title; caption = "Your conversation is waiting. Carry on from the last question.";
        hero = intro("Continue your rehearsal", skillName(cv.focusSkill), artOf(cv.sceneId, cv.scene?.skill ?? cv.focusSkill), cv.partner);
        actions = [act("carry-on", "Carry on talking", caption, cmd("resume")), chooseSituation("Choose a goal and practise it in a conversation.")];
        break;
      }
      case "check-part-way": {
        const k = lc!;
        tag = "Your level"; title = "Find your level"; caption = "You stopped part way. Carry on from where you were.";
        hero = intro(k.stage === "about" ? `About you · ${k.turns.filter(t => t.role === "learner").length} of ${ABOUT_QUESTIONS} answered` : `Tasks · ${k.tasks.length} of up to ${MAX_TASKS} done`, "Answer on your phone", "check", "Your place is saved");
        actions = [act("carry-on-check", "Carry on", caption, cmd("check-resume")), act("restart-check", "Start again", "Begin the level check again from the first question.", cmd("check-start"))];
        break;
      }
      case "no-placement":
        tag = "Welcome"; title = "Let's find your level"; caption = "Three questions about you, then a few short tasks. About seven minutes, answered on your phone.";
        hero = intro("Before your first conversation", "A1 to C2 · about 7 minutes", "check", "Your first step");
        actions = [act("find-level", "Find my level", caption, cmd("check-start")), act("pick-level", "I'll pick my level", "Choose a level from A1 to C2 yourself. Linga can find it with you later.", pickAt(level))];
        break;
      case "no-plan": {
        const choosing = lc?.stage === "plan";
        tag = "Your topics"; title = "Choose your topics"; caption = "Linga picks conversations for your level and interests. Swap any you don't want.";
        hero = intro(`${level} · ${BAND_NAME[level]}${self}`, "Conversations picked for you", "plan", "Your own conversations");
        actions = [act("see-topics", choosing ? "Carry on choosing" : "See my topics", caption, cmd(choosing ? "check-resume" : "plan-propose")), chooseSituation("Skip the topics and pick a situation yourself.")];
        break;
      }
      case "plan-done":
        tag = "Your topics"; title = "Every topic talked through"; caption = "Ask Linga for a fresh set of conversations, or go back to one you enjoyed.";
        hero = intro(`${level} · ${BAND_NAME[level]}`, `${l.plan!.topics.length} conversations`, "done", "Plan complete");
        actions = [act("new-topics", "New topics", "Linga suggests a fresh set of conversations for your level.", cmd("plan-propose")), act("talk-again", "Talk again", recommended.goal, cmd("start", { sceneId: recommended.id, replace: true }))];
        break;
      case "next-topic":
        title = recommended.name; caption = recommended.goal;
        hero = intro(`${level} · ${BAND_NAME[level]}${self}`, skillName(recommended.skill), artOf(recommended.id, recommended.skill), recommended.partner);
        actions = [act("start-talking", "Start talking", caption, cmd("start", { sceneId: recommended.id, replace: true })), chooseSituation("Choose a goal and practise it in a conversation.")];
        break;
    }
  } else if (s.screen === "linga-check" && lc) {
    tag = "Find your level";
    const cancel = act("cancel", "Cancel & come back later", "Stop here. Everything so far is kept.", cmd("check-leave"));
    if (lc.stage === "about") {
      const answered = lc.turns.filter(t => t.role === "learner").length;
      hero = { kind: "message", kicker: `About you · question ${Math.min(answered + 1, ABOUT_QUESTIONS)} of ${ABOUT_QUESTIONS}`, text: asked?.role === "tutor" ? asked.text : "", note: "" };
      caption = lc.pending ? "Take a moment. Linga is reading your answer." : lc.error || "Answer on your phone, in English or in your own language.";
      captionTag = lc.pending ? "Preparing" : "Your turn";
      actions = lc.pending ? [cancel] : !lc.turns.length ? [act("retry", "Try again", "Start the level check again.", cmd("check-retry")), stopCheck] : [act("hear-again", "Hear it again", "Linga asks the question again. Answer on your phone, in English or your own language.", cmd("check-repeat")), stopCheck];
    } else {
      const t = lc.task, n = Math.min(lc.tasks.length + 1, MAX_TASKS);
      tag = `Task ${n} of up to ${MAX_TASKS}`;
      if (!t) {
        hero = { kind: "heading", kicker: "Find your level · some tasks are easy, some are hard", title: lc.tasks.length ? "Next task" : "A few short tasks" };
        caption = lc.pending ? "Take a moment. Linga is getting the task ready." : lc.error || "Getting the task ready."; captionTag = "Preparing";
        actions = lc.pending ? [cancel] : [act("retry", "Try again", "Ask Linga for the task again.", cmd("check-retry")), stopCheck];
      } else if (t.kind === "choose") {
        hero = { kind: "choices", kicker: `Task ${n} · ${TASK_TITLE.choose} · pick with the remote`, prompt: t.prompt, options: [...t.options], small: false };
        caption = lc.pending ? "Take a moment." : "Pick the reply that fits. Not sure? Say so; that helps too."; captionTag = "Your task";
        actions = lc.pending ? [cancel] : [...t.options.map((x, i) => act("choose", `Reply ${i + 1}`, x, cmd("check-task", { taskId: t.id, option: i }))), act("dont-know", "I don't know", "Skip this one. That tells Linga something too.", cmd("check-task", { taskId: t.id, skip: true }))];
      } else {
        hero = { kind: "message", kicker: `Task ${n} · ${TASK_TITLE[t.kind]}`, text: t.prompt, note: t.kind === "listen" && t.revealed ? `“${t.line}”` : "" };
        caption = lc.pending ? "Take a moment. Linga is reading your answer." : t.kind === "listen" ? "Listen to the TV, then answer on your phone." : "Answer on your phone: speak or type."; captionTag = lc.pending ? "Preparing" : "Your turn";
        actions = lc.pending ? [cancel] : [act("hear-again", t.kind === "listen" ? "Hear it again" : "Hear the task", "Linga says it again.", cmd("check-repeat")), ...(t.kind === "listen" && !t.revealed ? [act("show-words", "Show the words", "Read the line instead of hearing it.", cmd("check-reveal"))] : []), act("dont-know", "I don't know", "Skip this one. That tells Linga something too.", cmd("check-task", { taskId: t.id, skip: true }))];
      }
    }
  } else if (s.screen === "linga-verdict" && placement) {
    const b = placement.band, self = placement.source === "self";
    tag = "Your level"; title = `${b} · ${BAND_NAME[b]}`;
    hero = { kind: "ladder", kicker: self ? "Self-chosen" : "Linga's read · not a certificate", title, band: b, note: placement.summary || BAND_CAN[b] };
    caption = self ? "This is the level you picked." : "See the conversations Linga picks for this level, or find your level again."; captionTag = self ? "Your pick" : "What next";
    actions = [act("see-topics", "See my topics", "Linga picks conversations for this level. Swap any you don't want.", cmd(l.plan && lc?.stage !== "verdict" ? "plan-open" : "plan-propose")), act("check-again", self ? "Find my level with Linga" : "Find my level again", "Three questions and a few short tasks, about seven minutes.", cmd("check-start")), act("pick-level", "Pick it myself", "Choose a level from A1 to C2 yourself.", pickAt(b))];
    if (placement.focus && !self) details.push(`On the phone, next to practise: ${placement.focus}`);
    if (!self && placement.confidence !== "medium") details.push(`On the phone: ${placement.confidence === "low" ? "your answers were mixed, so try the check again another day for a firmer read" : "your answers agreed with each other"}.`);
  } else if (s.screen === "linga-plan" && lc && lc.askGoal) {
    tag = `Your topics · ${level}`;
    hero = { kind: "message", kicker: "Before Linga picks your topics", text: "What would you like to practise in English? A situation you want to handle, or something you enjoy talking about.", note: "" };
    caption = lc.pending ? "Take a moment." : "Say or type it on your phone, in English or in your own language."; captionTag = "Your turn";
    actions = [act("skip-goal", "Let Linga pick", "Linga picks conversations for your level without a goal. You can swap any of them.", cmd("plan-goal", { skip: true })), act("not-now", "Not now", "Leave for now. Linga asks again when you come back to your topics.", cmd("check-leave"))];
  } else if (s.screen === "linga-plan" && lc) {
    tag = `Your topics · ${level}`; title = lc.topics.length ? `${lc.topics.length} conversations for you` : "Your topics";
    hero = { kind: "topics", kicker: lc.pending ? "Linga is working on your topics" : "Swap any topic · add your own on the phone", title, topics: lc.topics.map(t => ({ id: t.id, title: t.title, skill: skillName(t.skill), why: t.why, art: SKILL_ART[t.skill] })), selected: s.focus - 1 };
    caption = lc.pending ? (lc.topics.length ? "Take a moment. Linga is finding another topic." : "Take a moment. Linga is picking conversations for your level and interests.") : lc.error || "Add a topic in your own words on the phone."; captionTag = lc.pending ? "Preparing" : "Your topics";
    actions = lc.pending ? [act("cancel", "Cancel & come back later", "Stop here. Your topics so far are kept.", cmd("check-leave"))]
      : lc.topics.length ? [act("agree", "Agree to these topics", "Save these as your plan. Linga starts with the first one.", cmd("plan-agree")), ...lc.topics.map(t => act("swap", "Swap this topic", t.why, cmd("plan-swap", { topicId: t.id }))), act("renew", "All new topics", "Replace every topic with a fresh set.", cmd("plan-renew"))]
      : [act("retry", "Try again", "Ask Linga for topics again.", cmd("check-retry"))];
  } else if (s.screen === "linga-scenes") {
    const i = sceneIndex % scenes.length, scene = scenes[i];
    tag = `Situation ${i + 1} of ${scenes.length}`; title = scene.name; caption = scene.goal;
    hero = { kind: "scene", kicker: `${scene.partner} · ${scene.minutes} minutes`, title, who: "", said: "", subtitle: skillName(scene.skill), art: scene.id, small: false,
      partner: scene.partner, sentence: sentenceOf(scene.cue), illustration: artOf(scene.id, scene.skill), band: level, minutes: scene.minutes };
    actions = [act("start-situation", "Start this situation", scene.goal, cmd("start", { sceneId: scene.id, replace: true })), act("next-situation", "Next situation", scenes[(i + 1) % scenes.length].goal, { ui: { sceneIndex: (i + 1) % scenes.length } })];
  } else if (s.screen === "linga-map") {
    const skill = ENGLISH_SKILLS[chapter % 8], progress = l.achievements[skill.id] ?? "not-tried";
    const typed = l.evidence.filter(e => e.skill === skill.id && e.mode === "text").length;
    tag = `Chapter ${chapter % 8 + 1} of 8`; title = skill.name; caption = skill.goal;
    hero = { kind: "track", kicker: `Speaking progress · ${PROGRESS_LABEL[progress]}`, title, progress, subtitle: typed > 0 ? `${typed} written practice observations · speaking assessed separately` : "", illustration: SKILL_ART[skill.id] };
    actions = [act("previous-chapter", "Previous chapter", ENGLISH_SKILLS[(chapter + 7) % 8].goal, { ui: { chapter: (chapter + 7) % 8 } }), act("next-chapter", "Next chapter", ENGLISH_SKILLS[(chapter + 1) % 8].goal, { ui: { chapter: (chapter + 1) % 8 } })];
  } else if (c && s.screen === "linga-moment" && c.moment) {
    const m = c.moment; tag = "A moment";
    hero = { kind: "comparison", before: { kicker: m.kind === "fix" ? "You said" : "You wanted to say", quote: m.said }, after: { kicker: m.kind === "fix" ? "Try" : "In English", quote: m.better }, note: m.why };
    caption = "Then carry on from where the scene stopped."; captionTag = m.kind === "fix" ? "One thing to fix" : "A word for this scene";
    actions = [act("back", "Back to the conversation", "Carry on from where the scene stopped.", cmd("moment-done"))];
  } else if (c && s.screen === "linga-coach" && c.coaching) {
    tag = "One useful change";
    hero = { kind: "comparison", before: { kicker: "You said", quote: c.coaching.before }, after: { kicker: "One way to try it", quote: c.coaching.after }, note: c.coaching.note };
    caption = "Replay the moment with a new question, or finish for today."; captionTag = "Coach";
    actions = [act("replay", "Replay the moment", "Try the same intention with a new question. The first retry is supported practice.", cmd("replay")), act("finish", "Finish for today", "Save this rehearsal and see what you practised.", cmd("finish"))];
  } else if (c && s.screen === "linga-recap") {
    tag = "Your rehearsal"; title = "Take it somewhere new";
    const attempts = c.turns.filter(t => t.role === "learner"), spokenCount = attempts.filter(t => t.mode === "speech").length, moments = c.moments ?? [];
    recap = { title: c.title, replies: attempts.length, spoken: spokenCount, moments: moments.map(({ kind, said, better, why }) => ({ kind, said, better, why })) };
    hero = { kind: "track", kicker: c.title, title, progress: l.achievements[c.focusSkill] ?? "not-tried", subtitle: `${spokenCount} spoken · ${attempts.length - spokenCount} written replies${moments.length ? ` · ${moments.length} ${moments.length === 1 ? "moment" : "moments"} to keep` : ""}`, illustration: "done" };
    caption = attempts.length ? `Next, try ${recommended.name.toLowerCase()}. Your notes and learning map are on the phone.` : "You explored the scene. Try a reply next time; no speaking progress was recorded.";
    actions = [chooseSituation("Choose a fresh context for your next conversation.", "Another situation"), act("learning-map", "Learning map", "See saved evidence for each ability; printing is on the phone.", go("linga-map"))];
  } else if (c) {
    tag = c.phase === "replay" ? "Try it again" : "Conversation";
    const scene = c.scene ?? ENGLISH_SCENES.find(x => x.id === c.sceneId)!;
    const said = last?.role === "partner" ? last.text : "", hasReply = c.turns.some(t => t.role === "learner");
    caption = c.pending ? "Take a moment. Your partner is preparing the next turn." : c.paused ? "The scene is paused. Resume when you are ready." : c.capture ? "Listening on your phone. Stop when you are ready to review your words." : c.cue || (said ? "Answer on your phone: speak or type." : "Preparing a situation that fits your goal.");
    const help = helpOf(c);
    captionTag = c.cue ? help.tag : c.pending ? "Preparing" : c.capture ? "Your turn" : said ? "Your turn" : "Preparing";
    if (c.quizOpen) {
      hero = { kind: "choices", kicker: "A little support · recognition practice", prompt: scene.quiz.question, options: [...scene.quiz.options], small: true };
      actions = scene.quiz.options.map((x, i) => act("pick-phrase", `Option ${i + 1}`, x, cmd("choice", { option: i })));
    } else {
      hero = { kind: "scene", kicker: `${c.title} · ${c.partner}`, title: c.goal, who: c.partner, said, subtitle: said ? c.goal : "", art: c.sceneId, small: true,
        partner: c.partner, sentence: sentenceOf(scene.cue), illustration: artOf(c.sceneId, scene.skill), band: isBand(c.preferences.level) ? c.preferences.level : level, minutes: scene.minutes };
      const quiz = act("quiz", "Choose a phrase", "Compare two phrases before returning to speaking.", cmd("quiz"), { disabled: waiting });
      const second = hasReply ? act("coach", "Pause & coach", "Work on one useful change, then replay this moment.", cmd("coach"), { disabled: waiting }) : quiz;
      // At the top of the ladder the help button gives way to the recognition fallback.
      const first = c.pending ? act("cancel", "Cancel & go back", "Cancel the pending reply and keep the conversation for later.", cmd("leave")) : help.offered ? act("cue", help.label, help.help, cmd("cue")) : second === quiz ? null : quiz;
      actions = !c.turns.length && !c.pending ? [act("retry-scene", "Retry the scene", "Try preparing this situation again.", cmd("start", { sceneId: c.sceneId, replace: true })), chooseSituation("Choose a different situation.", "Choose another")]
        : c.paused ? [act("resume", "Resume", "Return to the last question. Your words are kept.", cmd("resume")), act("finish", "Finish rehearsal", "End here and keep your learning evidence.", cmd("finish"))]
        : [...(first ? [first] : []), second];
    }
  } else { caption = "Choose a situation to begin."; actions = [chooseSituation(caption)]; }

  if (menu) {
    const rehearsing = c && c.phase !== "finished";
    const close = { menu: false };
    actions = [
      act("menu-back", "Back to the scene", "Return to where you were.", { ui: close, focus: -1 }),
      act("learning-map", "Learning map", "Explore the abilities you can practise and your speaking progress.", go("linga-map")),
      chooseSituation("Choose a new scene; your existing evidence stays saved."),
      act("my-level", "My level", l.placement ? `${level} · ${BAND_NAME[level]}. See it, find it again, or pick it yourself.` : "Find your level with three questions and a few short tasks.", l.placement ? go("linga-verdict") : { ...cmd("check-start"), ui: close }),
      act("my-topics", "My topics", "See the conversations in your plan, swap them or ask for new ones.", { ...cmd(l.plan ? "plan-open" : "plan-propose"), ui: close }),
      act("phone-setup", "Phone setup", "Open Linga on the phone to set your interests, goals and learning preferences.", { nav: { screen: "pair", from: s.screen } }),
      act("sentence-help", "Sentence help", "Open Say it on the phone for help with a particular sentence.", go("sentence")),
      ...(rehearsing ? [act("finish", "Finish rehearsal", "End this scene and save a recap.", { ...cmd("finish"), ui: close })] : []),
    ];
    tag = "Your controls"; captionTag = "Your choice"; title = "Make it work for you";
    hero = { kind: "menu", kicker: "Linga", title, entries: actions.map(a => a.label), selected: s.focus };
    caption = actions[Math.max(0, s.focus)]?.help ?? actions[0].help;
  }

  const baseCaption = caption;
  if (s.focus >= 0 && !waiting && !c?.capture && actions[s.focus]) caption = actions[s.focus].help;
  const error = input.error || (!isHome && (onCheck ? lc?.error : c?.error)) || "";
  if (error) { caption = error; captionTag = "Try again"; }

  const footer = [
    act("menu", "Menu · M", menu ? "Close the menu." : "Open the menu.", { ui: { menu: !menu, picking: null }, focus: 0 }),
    ...(c && !isHome && !onCheck ? [act("repeat", "Repeat audio", "Hear the last line again.", cmd("repeat"))] : []),
  ];

  // The phone. While no check or live conversation holds it, its start panel can start any situation from a list.
  // That list is offered with the situations screen and never on home: the first LT run listed situations on the
  // first-visit home and five Characters skipped the level check. Before a level, the start panel also takes a band
  // by hand. On the topics screen it takes a topic in the learner's own words; during a rehearsal it can finish.
  const phone: ViewAction[] = [];
  const idle = !lc && (!c || c.phase === "finished");
  if (idle && s.screen === "linga-scenes" && !menu && !picking) {
    phone.push(act("pick-situation", "Choose a situation from the phone's list", "Start any situation from the phone's list.", cmd("start", { replace: true }), { needs: "sceneId" }));
    details.push(`On the phone, every situation:\n${scenes.map(x => `  [${x.id}] ${x.name} — ${x.goal}`).join("\n")}`);
  }
  if (idle && home === "no-placement" && !menu) phone.push(act("pick-band", "Pick my level on the phone (A1 to C2)", "Use a level from A1 to C2 you choose yourself.", cmd("level-self"), { needs: "band" }));
  if (s.screen === "linga-plan" && lc && !lc.askGoal && !lc.pending && lc.topics.length && lc.topics.length < PLAN_MAX)
    phone.push(act("add-topic", "Add a topic in your own words on the phone", "Linga adds a conversation for what you describe.", cmd("plan-add"), { needs: "text" }));
  if (c && c.phase !== "finished" && !lc && s.screen === "linga-talk" && !c.paused && !menu)
    phone.push(act("finish", "Finish rehearsal (phone)", "End this scene and save a recap.", cmd("finish")));

  return { screen: menu ? "menu" : picking ? "linga-verdict" : s.screen, home, tag, title, captionTag, baseCaption, caption, error, hero, actions, footer, phone, answer: answerOf(s, lc, c), spoken, audible, waiting, recap, details };
}

/**
 * Where the learner is in a sequence with a known length, one mark each: the level check's questions or tasks, or
 * the agreed plan's topics on home. Null when there is no such sequence. The TV draws it as the footer's dots.
 */
export type Dot = "done" | "current" | "open";
export function progressDots(s: Session): Dot[] | null {
  const lc = activeCheck(s), l = s.englishLearning, home = s.screen === "linga" || s.screen === "tonight";
  const marks = (total: number, done: number): Dot[] => Array.from({ length: total }, (_, i) => i < done ? "done" : i === done ? "current" : "open");
  const state = home ? lingaHome(s) : null;
  if (lc && (s.screen === "linga-check" || state === "check-part-way") && (lc.stage === "about" || lc.stage === "tasks"))
    return lc.stage === "about" ? marks(ABOUT_QUESTIONS, Math.min(lc.turns.filter(t => t.role === "learner").length, ABOUT_QUESTIONS)) : marks(MAX_TASKS, Math.min(lc.tasks.length, MAX_TASKS));
  const topics = l.plan?.topics ?? [];
  if (home && topics.length && state !== "no-plan" && state !== "no-placement") {
    const started = new Set(l.sessions.map(x => x.sceneId)), next = topics.findIndex(t => !started.has(t.id));
    return topics.map((t, i) => started.has(t.id) ? "done" : i === next ? "current" : "open");
  }
  return null;
}

/** Every action a person at the desk can take on this view: the TV row, the footer and the phone. */
export function offeredActions(v: LingaView): ViewAction[] { return [...v.actions, ...v.footer, ...v.phone]; }

/** The view in words, for a reader who cannot see the screen: the LT driver's Character. */
export function viewText(v: LingaView): string {
  const h = v.hero, out: string[] = [`[${v.tag}]${v.title && h.kind !== "plain" ? ` ${v.title}` : ""}`];
  const spoken = v.spoken.line && !v.spoken.blocked ? v.spoken.line : "";
  const said = (text: string, who: string) => text === spoken ? `${who} says (spoken on the TV, written on the phone): "${text}"` : `On screen: "${text}"`;
  switch (h.kind) {
    case "intro": out.push(`${h.kicker}${h.subtitle ? ` · ${h.subtitle}` : ""}`); break;
    case "ladder": out.push(h.kicker, `Ladder A1 A2 B1 B2 C1 C2, marker on ${h.band}.`, ...(h.note ? [`Linga says: ${h.note}`] : [])); break;
    case "message": out.push(h.kicker, ...(h.text ? [said(h.text, v.spoken.speaker)] : []), ...(h.note ? [`The words, now shown: ${h.note}`] : [])); break;
    case "heading": out.push(h.kicker, h.title); break;
    case "choices": out.push(h.kicker, h.prompt, ...h.options.map((x, i) => `  option ${i}: ${x}`)); break;
    case "topics": out.push(h.kicker, ...h.topics.map(t => `  [${t.id}] ${t.title} — ${t.skill}\n      why: ${t.why}`)); break;
    case "scene": out.push(h.kicker, ...(h.said ? [said(h.said, h.who || v.spoken.speaker)] : []), h.said ? `Goal: ${h.subtitle}` : `${h.title}${h.subtitle ? ` · ${h.subtitle}` : ""}`); break;
    case "track": out.push(h.kicker, `Speaking progress: ${PROGRESS_LABEL[h.progress]}`, ...(h.subtitle ? [h.subtitle] : [])); break;
    case "comparison": out.push(`${h.before.kicker}: "${h.before.quote}"`, `${h.after.kicker}: "${h.after.quote}"`, h.note); break;
    case "menu": out.push(`${h.kicker} menu · ${h.title}`); break;
    case "plain": out.push(h.title); break;
  }
  // A line the TV speaks but does not show: a listening task is heard, not read.
  if (spoken && !JSON.stringify(h).includes(JSON.stringify(spoken).slice(1, -1))) out.push(`The TV says aloud: "${spoken}"`);
  if (v.baseCaption) out.push(`${v.captionTag}: ${v.baseCaption}`);
  if (v.error) out.push(`Error on screen: ${v.error}`);
  if (v.recap) {
    out.push(`Rehearsal saved: ${v.recap.title}. ${v.recap.replies} ${v.recap.replies === 1 ? "reply" : "replies"}, ${v.recap.spoken} spoken.`);
    if (v.recap.moments.length) out.push("On the phone, from this rehearsal:", ...v.recap.moments.map(m => m.kind === "fix" ? `  "${m.said}" → "${m.better}" (${m.why})` : `  "${m.said}": ${m.better} (${m.why})`));
  }
  out.push(...v.details);
  if (v.answer) out.push(`On the phone: ${v.answer.label}, by speaking or typing.`);
  return out.join("\n");
}
