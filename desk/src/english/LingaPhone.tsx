"use client";
import { useState } from "react";
import type { Event, Session } from "@/lib/session/store";
import { defaultPreferences } from "@/lib/english/curriculum";
import { BAND_NAME, isBand, MAX_TASKS, PLAN_MAX, ABOUT_QUESTIONS, TOPIC_ASK_MAX } from "@/lib/english/placement";
import { BANDS, type Band, type EnglishPreferences } from "@/lib/english/types";
import { PITCH_MAX } from "@/lib/english/pitch";
import { notesProblem } from "@/lib/english/rules";
import { accepts } from "@/lib/english/turn";
import { runningTake } from "@/lib/english/take";
import { beatOf } from "@/lib/english/duet";
import { activeCheck, lingaView, wordsJob, type WordsJob } from "@/lib/english/view";
import { LostPicture } from "./LostPicture";
import { ReplyBox } from "./ReplyBox";
import { useEnglish } from "./useEnglish";

type Ask = NonNullable<Session["ask"]>;
type Run = (action: string, extra?: Record<string, unknown>) => Promise<boolean>;
const KIND_WORD = { say: "Say it", listen: "Listen and answer", choose: "Choose the reply" } as const;

/**
 * Linga on the phone (TL-12): the TV drives, the phone speaks. It draws one of three panels, the one the TV's open hand-off
 * (s.ask) names - the reply, the words, the preferences - and nothing else: no tabs, no commands, no scene or plan or level
 * choices. Those are the TV row's. With no Linga hand-off open it says so in one line. Every answer carries the hand-off's id
 * (askId), which is how the desk knows the phone is answering what the TV asked.
 */
export function LingaPhone({ s, ask = s.ask, post }: { s: Session; ask?: Session["ask"]; post: (e: Event) => Promise<void> }) {
  const { run, busy, error } = useEnglish(s);
  const [lost, setLost] = useState("");
  const a = ask && ask.phase === "open" ? ask : null;
  // every post this panel makes answers the open hand-off
  const answer: Run = (action, extra) => run(action, { ...extra, askId: a?.id });
  // the TV's side of a words or preferences hand-off cannot see it is done, so the phone closes it once the desk took the answer
  const close = () => { if (a) post({ type: "ask.cancel", id: a.id }).catch(() => setLost("That did not reach the desk.")); };
  return <div className="pscreen linga-phone">
    <h3>Linga · {s.learner?.name}</h3>
    {a?.kind === "reply" && <ReplyPanel s={s} run={answer} busy={busy} />}
    {a?.kind === "words" && <WordsPanel s={s} run={answer} busy={busy} done={close} />}
    {a?.kind === "prefs" && <PrefsPanel s={s} run={answer} busy={busy} done={close} />}
    {!(a && (a.kind === "reply" || a.kind === "words" || a.kind === "prefs")) && <p data-role="linga-idle">Look at the TV. It will ask this phone when it needs your voice or your words.</p>}
    {(error || lost) && <p className="linga-error" role="alert">{error || lost}</p>}
  </div>;
}

/** The learner's line: the question on screen and the reply box, for the turn, the level check's question or task, or a moment's try. */
function ReplyPanel({ s, run, busy }: { s: Session; run: Run; busy: boolean }) {
  const v = lingaView(s), ans = v.answer, c = s.conversation, lc = activeCheck(s);
  if (!ans || ans.action === "plan-goal") return <p data-role="linga-wait">Look at the TV.</p>;
  const onSend = (extra: Record<string, unknown>) => (text: string, mode: "speech" | "text", question: string | undefined, attempt: string) => run(ans.action, { text, mode, commandId: attempt, ...extra, ...(ans.action !== "check-task" ? { lastTurnId: question } : {}) });
  if (ans.action === "check-answer" && lc) {
    const answered = lc.turns.filter(t => t.role === "learner").length, q = lc.turns.at(-1);
    return <>
      <p><b>Find your level</b><br />Question {Math.min(answered + 1, ABOUT_QUESTIONS)} of {ABOUT_QUESTIONS}. Answer in English or in your own language; both tell Linga something.</p>
      {q?.role === "tutor" && <div className="linga-status">{q.text}</div>}
      <ReplyBox ready busy={busy} question={q?.id} onSend={onSend({})} />
    </>;
  }
  if (ans.action === "check-task" && lc?.task) {
    const t = lc.task;
    return <>
      <p><b>Find your level</b><br />Task {Math.min(lc.tasks.length + 1, MAX_TASKS)} of up to {MAX_TASKS}.</p>
      <div className="linga-status"><b>{KIND_WORD[t.kind]}</b><br />{t.kind === "listen" ? <>Listen to the TV, then answer: {t.prompt}</> : t.prompt}</div>
      {t.kind === "listen" && t.revealed && <p>“{t.line}”</p>}
      <ReplyBox key={t.id} ready busy={busy} onSend={onSend({ taskId: t.id })} />
    </>;
  }
  if (ans.action === "moment-try" && c?.moment) {
    const m = c.moment, r = m.repair;
    return <>
      <p><b>One thing to fix</b></p>
      <div className="linga-status" aria-live="polite">You said “{m.said}”<br />{!!m.better && !r?.held ? <>Try “{m.better}”</> : "Say it again, your way."}</div>
      {v.savedLine && <p className="linga-status" data-role="linga-saved">{v.savedLine}</p>}
      <ReplyBox ready busy={busy} question={m.turnId} stopWhen={!accepts(c, "capture")} onCapture={active => run("capture", { active })} onSend={onSend({})} note="A try is practice: it is not recorded as evidence." />
    </>;
  }
  if (ans.action === "turn" && c) {
    const line = (runningTake(c)?.turns ?? c.turns).at(-1), duet = c.duet;
    return <>
      <div className="linga-status" aria-live="polite">{line?.text}</div>
      {/* the lost jacket (lostfound.ts): the learner's own thing is this phone's alone; no other screen holds it */}
      {c.lost && !runningTake(c) && <LostPicture learnerId={s.learner?.id} episodeId={c.id} partner={c.partner} />}
      {v.savedLine && <p className="linga-status" data-role="linga-saved">{v.savedLine}</p>}
      {duet && <p className="linga-status" data-role="linga-beat"><b>{duet.beat === "costar" ? `${duet.coStar}'s turn` : `${s.learner?.name ?? "Your"}'s turn`}</b></p>}
      <ReplyBox key={beatOf(c)} ready busy={busy} question={line?.id} stopWhen={!accepts(c, "capture")} onCapture={active => run("capture", { active })}
        onSend={onSend(duet ? { speaker: beatOf(c) } : {})}
        note={runningTake(c) ? "A take is practice: nothing in it is recorded." : duet?.beat === "costar" ? (duet.coStarLearnerId ? `${duet.coStar}'s line counts on ${duet.coStar}'s own map.` : `${duet.coStar}'s line keeps the scene going; it is not recorded.`) : "Recorded as written practice. It counts toward On your own, as speaking does."} />
    </>;
  }
  return <p data-role="linga-wait">Look at the TV.</p>;
}

const WORDS: Record<WordsJob, { title: string; label: string; hint: string; max: number; send: string }> = {
  "plan-goal": { title: "Your topics", label: "What would you like to practise in English?", hint: "A situation you want to handle, or something you enjoy talking about. Any language is fine.", max: TOPIC_ASK_MAX, send: "Send" },
  "plan-add": { title: "Your topics", label: "Add a topic in your own words", hint: "Ordering food on holiday, talking about football…", max: TOPIC_ASK_MAX, send: "Send" },
  pitch: { title: "Pitch a scene", label: "Where are you, and who do you meet? Linga plays the other person.", hint: "A job interview at a fancy restaurant, and I know nothing about wine…", max: PITCH_MAX, send: "Play it" },
};

/** The words the TV asked for: one text field and Send, for a topic, the goal or a pitched scene. */
function WordsPanel({ s, run, busy, done }: { s: Session; run: Run; busy: boolean; done: () => void }) {
  const job = wordsJob(s);
  if (!job) return <p data-role="linga-wait">Look at the TV.</p>;
  const w = WORDS[job], pending = busy || !!activeCheck(s)?.pending, full = job === "plan-add" && (activeCheck(s)?.topics.length ?? 0) >= PLAN_MAX;
  return <>
    <p><b>{w.title}</b></p>
    <WordsBox label={w.label} hint={w.hint} max={w.max} send={w.send} off={pending || full} onSend={async text => { if (await run(job, { text })) { done(); return true; } return false; }} />
  </>;
}

/** The field and its Send. onSend is how the desk's UAT surface reads what Send runs. */
function WordsBox({ label, hint, max, send, off, onSend }: { label: string; hint: string; max: number; send: string; off: boolean; onSend: (text: string) => Promise<boolean> }) {
  const [text, setText] = useState("");
  return <>
    <label>{label}<textarea value={text} maxLength={max} placeholder={hint} onChange={e => setText(e.target.value)} /><small className="linga-note">{text.length} of {max} characters</small></label>
    <button className="pbtn" data-signal="true" disabled={off || !text.trim()} onClick={async () => { if (await onSend(text)) setText(""); }}>{send}</button>
  </>;
}

/** Learning preferences (OD3 b): the form stays the phone's, opened from the TV's Linga menu. */
function PrefsPanel({ s, run, busy, done }: { s: Session; run: Run; busy: boolean; done: () => void }) {
  const profile = s.profiles.find(p => p.id === s.learner?.id), learning = s.englishLearning;
  const [prefs, setPrefs] = useState<EnglishPreferences>(learning.preferences ?? defaultPreferences(profile));
  const [notes, setNotes] = useState(learning.notes.join("\n"));
  const [message, setMessage] = useState("");
  const lines = notes.split("\n").map(n => n.trim()).filter(Boolean), notesRefused = notesProblem(lines);
  const save = async () => { if (await run("preferences", { preferences: prefs, notes: lines })) { setMessage("Your learning preferences are saved. They apply to your next situation."); done(); } };
  return <>
    <p>Choose what feels useful. English level, imagination and social challenge are separate.</p>
    <label>{learning.placement && isBand(prefs.level) && prefs.level !== learning.placement.band ? "Talk at" : "Your level"}<select value={isBand(prefs.level) ? prefs.level : "A1"} onChange={e => setPrefs({ ...prefs, level: e.target.value as Band })}>{BANDS.map(b => <option key={b} value={b}>{b} · {BAND_NAME[b]}</option>)}</select></label>
    <label>Interests<input value={prefs.interest} maxLength={160} placeholder="Games, music, travel, making things…" onChange={e => setPrefs({ ...prefs, interest: e.target.value })} /></label>
    <label>What would you like to practise?<input value={prefs.goal} maxLength={160} placeholder="An interview, meeting people, school…" onChange={e => setPrefs({ ...prefs, goal: e.target.value })} /></label>
    <label>Creativity<select value={prefs.creativity} onChange={e => setPrefs({ ...prefs, creativity: e.target.value as EnglishPreferences["creativity"] })}><option value="familiar">Familiar situations</option><option value="playful">Playful details</option><option value="surprising">A harmless surprise</option></select></label>
    <label>Social challenge<select value={prefs.challenge} onChange={e => setPrefs({ ...prefs, challenge: e.target.value as EnglishPreferences["challenge"] })}><option value="supportive">A supportive partner</option><option value="realistic">Everyday reactions</option><option value="stretch">More challenging follow-up questions</option></select></label>
    <label>Coaching preference<select value={prefs.correction} onChange={e => setPrefs({ ...prefs, correction: e.target.value as EnglishPreferences["correction"] })}><option value="as-needed">Stop me to fix a mistake or teach a word</option><option value="pauses">Only coach me when I ask</option></select></label>
    {profile?.type === "other" && profile.age === undefined && <label className="linga-check"><input type="checkbox" checked={prefs.adultConfirmed} onChange={e => setPrefs({ ...prefs, adultConfirmed: e.target.checked })} /><span>I am 18 or older. Include adult social situations.</span></label>}
    <label>What helps you learn? (one note per line)<textarea value={notes} maxLength={1900} placeholder="Give me time to think. Use short examples." onChange={e => setNotes(e.target.value)} /></label>
    <p className="linga-note">Up to eight short notes. You can edit or remove them here. Preferences are remembered; raw microphone audio is not saved by this app.</p>
    {/* the server's own rule (rules.ts notesProblem): a list it would refuse is not sent, and the form says why */}
    {notesRefused && <p className="linga-error" role="alert" data-role="linga-notes-refused">{notesRefused}</p>}
    <button className="pbtn" data-signal="true" disabled={busy || !!notesRefused} onClick={save}>Save preferences</button>
    {message && <p role="status">{message}</p>}
  </>;
}
