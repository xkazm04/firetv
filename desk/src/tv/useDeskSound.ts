"use client";
import { useCallback, useEffect, useRef } from "react";
import type { Session } from "@/lib/session/store";
import { cueBetween, musicFor, type Cue, type Track } from "@/lib/desk/sounds";

/**
 * The TV's effects and music (desk/public/audio, levelled from audition A1). `cue` plays a short effect, `duck` lowers the
 * music while the voice speaks. Session changes are sounded here (lib/desk/sounds.ts decides which); Select and Back are
 * sounded by the keymap's executor. The browser may refuse to start music before the first key press: the next cue retries.
 */
const LEVEL: Record<Cue, number> = { select: 0.45, back: 0.45, paired: 0.7, hint: 0.6, right: 0.7, again: 0.6, break: 0.7 };
const MUSIC = 0.22, DUCKED = 0.06;

export function useDeskSound(s: Session | null | undefined, on: boolean) {
  const fx = useRef<Partial<Record<Cue, HTMLAudioElement>>>({});
  const music = useRef<{ theme: Track; el: HTMLAudioElement } | null>(null);
  const ducked = useRef(false);
  const prev = useRef<Session | null>(null);
  const want = useRef<Track | undefined>(undefined);

  const startMusic = useCallback(() => {
    const m = music.current;
    if (on && m && m.el.paused) m.el.play().catch(() => { /* not allowed yet: the next key press retries */ });
  }, [on]);

  const cue = useCallback((c: Cue) => {
    if (!on) return;
    const el = fx.current[c] ?? (fx.current[c] = new Audio(`/audio/sfx/${c}.mp3`));
    el.volume = LEVEL[c]; el.currentTime = 0;
    el.play().catch(() => { /* blocked or missing: the screen still shows the moment */ });
    startMusic();
  }, [on, startMusic]);

  const duck = useCallback((d: boolean) => {
    ducked.current = d;
    if (music.current) music.current.el.volume = d ? DUCKED : MUSIC;
  }, []);

  // the theme follows the screen; a theme that stays is not restarted
  useEffect(() => {
    want.current = on && s ? musicFor(s) : undefined;
    const m = music.current;
    if (m && m.theme === want.current) return;
    if (m) { m.el.pause(); music.current = null; }
    if (!want.current) return;
    const el = new Audio(`/audio/music/${want.current}.mp3`);
    el.loop = true; el.volume = ducked.current ? DUCKED : MUSIC;
    music.current = { theme: want.current, el };
    startMusic();
  }, [s?.screen, on, startMusic]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!s) return;
    const c = cueBetween(prev.current, s);
    prev.current = s;
    if (c) cue(c);
  }, [s, cue]);

  useEffect(() => () => { music.current?.el.pause(); music.current = null; }, []);

  return { cue, duck };
}
