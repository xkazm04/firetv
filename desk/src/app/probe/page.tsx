"use client";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";

/** Does anything hydrate on this dev server? If this counter never appears, the fault is not in the desk's pages. A dev tool: a production build answers 404. */
export default function Probe() {
  if (process.env.NODE_ENV === "production") notFound();
  const [n, setN] = useState(0);
  useEffect(() => { (window as unknown as { __probe: number }).__probe = 1; setN(1); }, []);
  return <main style={{ padding: 40, fontSize: 24 }}>probe: {n ? "hydrated" : "server html only"} <button onClick={() => setN((x) => x + 1)}>+{n}</button></main>;
}
