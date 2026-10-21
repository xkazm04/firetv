"use client";
/**
 * A still world layer drawn as a bitmap: the sky, the hills and the side cliffs of a paper world do not move inside their
 * layer, so each is drawn once per page load into a canvas and every later lamp move or Back shows that canvas. Inside the
 * layer's SVG the canvas sits in a foreignObject; Chrome composites it as its own texture layer, so the GPU does not
 * raster the layer's tiles again (docs/concepts/STICK-PERFORMANCE-2026-10-21.md, "Pass 3"). The numbers are rules.ts.
 *
 * A still is declared once, at module scope, with `still(id, kind, d, node)`; it renders live (as the layer drew it
 * before) until its bitmap is ready, then the bitmap. Once one still has mounted, every declared still is baked in idle
 * time, one at a time, so the first lamp move to another world finds its bitmaps ready too. The bitmap bakes in the
 * shadow that design/desk-landing.css casts from each piece (rules.ts SHADOW), so the canvas casts none (pp-flat).
 */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { Defs } from "../shapes";
import { SHADOW, stdDeviation, stillBox, stillPixels, type Box, type StillKind } from "./rules";

interface Decl { id: string; kind: StillKind; d: number; node: ReactNode }
interface Baked { canvas: HTMLCanvasElement; box: Box; svg: string; bytes: number }

const SVGNS = "http://www.w3.org/2000/svg";
const declared = new Map<string, Decl>();
const baked = new Map<string, Baked>();
const waiting = new Map<string, Array<() => void>>();
const queue: string[] = [];
let px = 0, running = false, warmed = false;

/** Declare a still layer node (once, at module scope). Ids are unique per drawing. */
export function still(id: string, kind: StillKind, d: number, node: ReactNode): ReactNode {
  declared.set(id, { id, kind, d, node });
  return <Still id={id} />;
}

/** The declared stills and the bitmaps made so far (for the perf kit: window.__ppStills). */
export function stillStats() {
  return { declared: [...declared.keys()], px, baked: [...baked.entries()].map(([id, b]) => ({ id, w: b.canvas.width, h: b.canvas.height, bytes: b.bytes })),
    bytes: [...baked.values()].reduce((s, b) => s + b.bytes, 0) };
}

/** Mirror of `.pp-cast > :not(.pp-flat, .pp-each)` and its `.pp-each > ...` forms: the pieces that cast a shadow. */
function casters(root: Element, depth: number, out: Element[]) {
  for (const c of Array.from(root.children)) {
    if (c.tagName === "defs" || c.classList.contains("pp-flat")) continue;
    if (c.classList.contains("pp-each")) { if (depth < 2) casters(c, depth + 1, out); continue; }
    out.push(c);
  }
}

/** Draw one declared still into a canvas: render it off-screen, measure it, bake the shadow in, rasterise it as an image. */
async function bake(id: string): Promise<void> {
  const decl = declared.get(id); if (!decl) return;
  const host = document.createElementNS(SVGNS, "svg");
  host.setAttribute("width", "2200"); host.setAttribute("height", "1080"); host.setAttribute("viewBox", "-140 0 2200 1080");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:fixed;left:-30000px;top:0;visibility:hidden;pointer-events:none";
  document.body.appendChild(host);
  const root = createRoot(host);
  let svg = "", box: Box | null = null;
  try {
    flushSync(() => root.render(<><Defs /><g data-still="">{decl.node}</g></>));
    const g = host.querySelector("g[data-still]") as SVGGElement;
    box = stillBox(decl.d, g.getBBox().y);
    const sh = SHADOW[decl.kind];
    if (sh) {
      const f = document.createElementNS(SVGNS, "filter");
      f.setAttribute("id", "pp-still-sh"); f.setAttribute("x", "-50%"); f.setAttribute("y", "-50%"); f.setAttribute("width", "200%"); f.setAttribute("height", "200%");
      f.setAttribute("color-interpolation-filters", "sRGB");
      const ds = document.createElementNS(SVGNS, "feDropShadow");
      for (const [k, v] of [["dx", sh.dx], ["dy", sh.dy], ["stdDeviation", stdDeviation(sh.blur)], ["flood-color", sh.color], ["flood-opacity", sh.opacity]] as const) ds.setAttribute(k, String(v));
      f.appendChild(ds);
      host.insertBefore(f, host.firstChild);
      const out: Element[] = []; casters(g, 0, out);
      for (const c of out) c.setAttribute("filter", "url(#pp-still-sh)");
    }
    const q = stillPixels(box, px || 1, decl.kind);
    host.setAttribute("width", String(q.w)); host.setAttribute("height", String(q.h));
    host.setAttribute("viewBox", `${box.x} ${box.y} ${box.w} ${box.h}`);
    host.setAttribute("preserveAspectRatio", "none");
    host.removeAttribute("style"); host.setAttribute("xmlns", SVGNS);
    svg = new XMLSerializer().serializeToString(host);
  } finally {
    root.unmount(); host.remove();
  }
  if (!box) return;
  const canvas = document.createElement("canvas");
  const p = stillPixels(box, px || 1, decl.kind);
  canvas.width = p.w; canvas.height = p.h;
  canvas.style.cssText = "display:block;width:100%;height:100%";
  await paint(canvas, svg);
  // a lost GPU context clears a canvas: draw it again from its SVG when the context comes back
  canvas.addEventListener("contextrestored", () => { void paint(canvas, svg); });
  baked.set(id, { canvas, box, svg, bytes: p.w * p.h * 4 });
}

async function paint(canvas: HTMLCanvasElement, svg: string) {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = new Image(); img.src = url; await img.decode();
    const x = canvas.getContext("2d"); if (!x) return;
    x.clearRect(0, 0, canvas.width, canvas.height);
    x.drawImage(img, 0, 0, canvas.width, canvas.height);
  } finally { URL.revokeObjectURL(url); }
}

/** Bake the queue one still per idle slot, so a bake never sits in a frame the D-pad is waiting on. */
function pump() {
  if (running) return;
  const id = queue.shift(); if (!id) return;
  running = true;
  const idle = (cb: () => void) => ("requestIdleCallback" in window ? window.requestIdleCallback(cb, { timeout: 1500 }) : setTimeout(cb, 50));
  idle(() => {
    bake(id).catch(() => { /* a still that cannot bake stays live */ }).finally(() => {
      running = false;
      for (const done of waiting.get(id) ?? []) done();
      waiting.delete(id);
      pump();
    });
  });
}
function request(id: string, done: () => void) {
  if (baked.has(id)) { done(); return; }
  waiting.set(id, [...(waiting.get(id) ?? []), done]);
  if (!queue.includes(id)) { queue.unshift(id); pump(); }
}
function warmAll() {
  if (warmed) return; warmed = true;
  for (const id of declared.keys()) if (!baked.has(id) && !queue.includes(id)) queue.push(id);
  pump();
}

function Still({ id }: { id: string }) {
  const [ready, setReady] = useState(() => baked.has(id));
  const live = useRef<SVGGElement>(null), slot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!px && live.current) {
      // device pixels per layer unit: the layer's SVG is 2200 units wide
      const svg = live.current.ownerSVGElement, w = svg?.getBoundingClientRect().width ?? 0;
      if (w > 0) px = (w * (window.devicePixelRatio || 1)) / 2200;
    }
    if (typeof window !== "undefined") (window as unknown as { __ppStills: typeof stillStats }).__ppStills = stillStats;
    let on = true;
    if (!baked.has(id)) request(id, () => { if (on && baked.has(id)) setReady(true); });
    warmAll();
    return () => { on = false; };
  }, [id]);
  useLayoutEffect(() => {
    const b = baked.get(id), at = slot.current; if (!ready || !b || !at) return;
    // one canvas per still; if another layer shows it (a world leaving while the same one arrives), show a copy
    let c = b.canvas;
    if (c.isConnected) {
      c = document.createElement("canvas"); c.width = b.canvas.width; c.height = b.canvas.height; c.style.cssText = b.canvas.style.cssText;
      c.getContext("2d")?.drawImage(b.canvas, 0, 0);
    }
    at.appendChild(c);
    return () => { c.remove(); };
  }, [id, ready]);
  const b = ready ? baked.get(id) : undefined;
  if (!b) return <g ref={live} className="pp-each">{declared.get(id)?.node}</g>;
  return <foreignObject className="pp-flat" x={b.box.x} y={b.box.y} width={b.box.w} height={b.box.h}><div ref={slot} style={{ width: "100%", height: "100%" }} /></foreignObject>;
}
