/**
 * The paper theme's stamps: each app's world as a small picture in an arched window (112 x 112). One stands on the
 * shelf for each app, and the biggest of them is the emblem in the hand-off (the world opening). Same art states as
 * the full worlds (worlds.tsx), so a stamp says what its world says.
 */
import type { ArtState } from "@/landing/model";
import { Circ, Rr, UnitGradient, paint } from "./shapes";

function MathsStamp({ c }: { c: Extract<ArtState, { app: "maths" }> }) {
  const known = c.n != null, n = known ? c.n! : 0, m = c.m;
  return <>
    <defs><UnitGradient id="sMs" stops={[[0, "#5f76dc"], [0.6, "#a9b6ef"], [1, "#f6ecd9"]]} /></defs>
    <rect width="112" height="112" fill={paint("sMs")} />
    <path d="M62 50a24 24 0 0 1 48 0z" fill="#fff0b0" /><path d="M0 100Q30 84 60 96T112 90V112H0Z" fill="#8898e4" />
    {Array.from({ length: m }, (_, i) => {
      const x = 8 + i * 15, y = 100 - i * 10;
      return <g key={i}><rect x={x} y={y} width="15.5" height={120 - y} rx="2.5" fill={i < n ? paint("gButter") : paint("gIndigo")} /><rect x={x} y={y} width="15.5" height="3.5" rx="1.7" fill="#fdf6e6" /></g>;
    })}
    {known && n > 0 && <>
      <Circ x={8 + (n - 1) * 15 + 8} y={100 - (n - 1) * 10 - 13} r={4.5} fill="#f6ecd9" />
      <path d={`M${8 + (n - 1) * 15 + 3} ${100 - (n - 1) * 10 - 1}q5-11 10 0z`} fill="#e2603f" />
    </>}
    <Circ x={76} y={30} r={34} fill={paint("rWarm")} opacity={0.4} />
  </>;
}

function EnglishStamp({ c }: { c: Extract<ArtState, { app: "english" }> }) {
  const b = [5, 9, 6, 3];
  return <>
    <defs><UnitGradient id="sLs" stops={[[0, "#f28c62"], [0.6, "#f9b585"], [1, "#ffe2b4"]]} /></defs>
    <rect width="112" height="112" fill={paint("sLs")} />
    <Circ x={56} y={84} r={30} fill="#fff0b0" opacity={0.8} /><path d="M0 90Q30 76 60 88T112 82V112H0Z" fill="#c8607a" />
    {c.next && <><circle cx="24" cy="26" r="9" fill="#fff3c4" /><circle cx="29" cy="23" r="8" fill="#f6a06f" /></>}
    <path d="M32 104V62a24 24 0 0 1 48 0V104Z" fill={paint("gPlum")} /><path d="M38 104V62a18 18 0 0 1 36 0V104Z" fill={paint("gDoor")} />
    <path d="M0 92Q0 88 4 88H108Q112 88 112 92V112H0Z" fill={paint("gTerra")} /><Rr x={0} y={86} w={112} h={6} r={3} fill={paint("gCream")} />
    <path d="M72 86A11 11 0 0 1 94 86Z" fill={paint("gBrass")} />
    <Rr x={66} y={14} w={38} h={24} r={10} fill="#fefaee" />
    {b.map((h, i) => <Rr key={i} x={72 + i * 7} y={26 - h / 2} w={4} h={h + 4} r={2} fill="#d9563a" />)}
  </>;
}

function EssayStamp({ c }: { c: Extract<ArtState, { app: "essay" }> }) {
  const has = c.sent != null || c.paras > 0, W = [58, 48, 62, 54, 44, 58];
  return <>
    <defs><UnitGradient id="sEs" stops={[[0, "#77ad8b"], [0.6, "#c6dfb0"], [1, "#f2f1d3"]]} /></defs>
    <rect width="112" height="112" fill={paint("sEs")} />
    <path d="M0 96Q30 82 62 92T112 86V112H0Z" fill="#8dbb8c" />
    <g transform="translate(58 58) rotate(-4)"><Rr x={-40} y={-40} w={80} h={80} r={6} fill={paint("gPage")} />
      {Array.from({ length: 6 }, (_, i) => <Rr key={i} x={-32} y={-32 + i * 10.5} w={has ? W[i] * 0.9 : 50} h={6} r={3} fill={has ? (c.sent === i + 1 ? "#e2603f" : "#7db388") : "rgba(31,74,58,.16)"} />)}
    </g>
    {c.paras > 0 && <g transform="translate(20 88) rotate(-8)"><Rr x={-14} y={-18} w={28} h={36} r={3} fill={paint("gPage")} /></g>}
    <g transform="translate(78 78)"><circle r="17" fill="rgba(255,250,225,.5)" stroke="#d1a03a" strokeWidth="5" /><path d="M12 12L28 30" stroke="#94503c" strokeWidth="7" strokeLinecap="round" /></g>
  </>;
}

/** The arched window's picture, filling its box. */
export function Stamp({ art }: { art: ArtState }) {
  return (
    <svg viewBox="0 0 112 112" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {art.app === "maths" ? <MathsStamp c={art} /> : art.app === "english" ? <EnglishStamp c={art} /> : <EssayStamp c={art} />}
    </svg>
  );
}
