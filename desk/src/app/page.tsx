import { networkInterfaces } from "node:os";

export const dynamic = "force-dynamic";

export default function Home() {
  const ip = Object.values(networkInterfaces()).flat().find((n) => n && n.family === "IPv4" && !n.internal)?.address ?? "localhost";
  return (
    <main className="land">
      <div className="box">
        <h1>Study Desk<br /><span style={{ color: "#E23D28" }}>on air</span></h1>
        <p>Learn maths, rehearse conversations in English, and develop your writing. Open the television in a browser and use the arrow keys; open the phone on a device on this Wi-Fi.</p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <a href="/tv">The television</a>
          <a href="/tv?module=english">Linga · English</a>
          <a href="/phone">The phone</a>
          <a href="/api/smoke">Engine check</a>
        </div>
        <p>Phone address on this network: <b style={{ color: "#F2F3F5" }}>http://{ip}:{process.env.PORT ?? "3000"}/phone</b></p>
      </div>
    </main>
  );
}
