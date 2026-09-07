import { networkInterfaces } from "node:os";

export const dynamic = "force-dynamic";

export default function Home() {
  const ip = Object.values(networkInterfaces()).flat().find((n) => n && n.family === "IPv4" && !n.internal)?.address ?? "localhost";
  return (
    <main className="land">
      <div className="box">
        <h1>Study Desk<br /><span style={{ color: "#E23D28" }}>on air</span></h1>
        <p>The homework desk on the TV, as a working prototype. Open the television in a browser at 1920×1080 and drive it with the arrow keys; open the phone on a real phone on this Wi-Fi.</p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <a href="/tv">The television</a>
          <a href="/phone">The phone</a>
          <a href="/api/smoke">Engine check</a>
        </div>
        <p>Phone address on this network: <b style={{ color: "#F2F3F5" }}>http://{ip}:3000/phone</b></p>
      </div>
    </main>
  );
}
