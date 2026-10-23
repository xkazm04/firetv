# Study Desk, portable

A ready-built Study Desk. A desktop browser tab plays the TV, and your phone (or a second tab) plays the phone.
Nothing to install or build beyond Node.js.

## You need

- **Node.js 24** (`node -v`). Get it from https://nodejs.org.
- **The Claude Code CLI, signed in**, for the model features (see the table below). Install it with
  `npm install -g @anthropic-ai/claude-code`, run `claude` once and log in, then quit it. No API key is needed:
  the desk calls `claude -p` on your own sign-in.

## Start

1. Unzip `study-desk-portable.zip` anywhere.
2. Start the desk from the unzipped folder:
   - Windows: double-click `start.cmd` (or run it in a terminal).
   - macOS or Linux: `sh start.sh`
3. The terminal prints the TV link:

   ```
   TV: http://<your-ip>:3000/tv?key=...
   ```

   On Windows, allow Node.js on private networks when the firewall asks, or a phone cannot connect.

Port 3000 busy? Set another port first: `set PORT=3640` then `start.cmd` (Windows), or `PORT=3640 sh start.sh`.
Every address below follows it.

## Open the TV

> **The TV does not use the mouse.** Clicking does nothing. Use the keyboard: **arrow keys** to move, **Enter** to
> choose, **Backspace** or **Escape** to go back, **M** for the menu.

Open that exact link in a desktop browser and make the window full screen (F11). The key makes this browser the
desk's TV, then leaves the address. If the TV says "Not this desk's TV", open the printed link again.

The keyboard is the remote: arrows are the D-pad, Enter is Select, Backspace or Escape is Back, M is Menu,
Space is Play/Pause.

The desk opens with a demo learner, **Nell** (11, maths, English and essay), already at the desk. A second demo
learner, **Dana**, is an adult on Linga English; switch to her from the learner switcher on the TV.

## Pair a phone

The TV shows a 4-digit code and an address.

- **A real phone** on the same Wi-Fi: open `http://<your-ip>:3000/phone` (or scan the QR code on the TV) and type
  the code.
- **No phone:** open a second tab at `http://localhost:3000/phone` and type the code there. Use `localhost` for
  this tab, not the IP in the TV link: cookies are kept per host name, so the two tabs stay two devices.

The phone says "Joined" and the TV says "Paired". When the TV asks for a photo, the phone's Capture screen offers
three sample pages, so no camera is needed. A real phone on plain http cannot use its camera or microphone.

## Check the engines

In the TV tab, open `http://<your-ip>:3000/api/smoke`. It lists the five engines and what each needs, in about two
seconds with no model call. With the Claude CLI signed in, `text` and `vision` say ok; the other three say what is
missing, and that is fine.

## What needs the Claude CLI

| Feature | Needs |
|---|---|
| Every screen, pairing, the learner switcher, the Adult-mode Workroom and Twin Card | nothing |
| Hints, Linga's dialogue and coaching, essay readings, writing coaching | the Claude CLI, signed in |
| Reading a photographed page | the Claude CLI (`start.cmd` and `start.sh` set `DESK_VISION_ENGINE=claude-cli`) |
| Picking a lesson video for a mistake | Ollama with `ollama pull nomic-embed-text` (optional) |
| The TV's voice | nothing: the browser's own speech |

Without the CLI the desk still opens and every screen works, but the features in the second and third rows fail
with a message.

## Your data

The desk keeps learners, sessions and its TV key in `demo-data/` in this folder. Delete that folder's contents to
start from scratch (no demo learners); the desk then mints a new TV key. Set `DESK_DATA_DIR` before starting to
keep them elsewhere. Other settings are listed in `.env.example`; set any of them in the terminal before starting.

## Fire TV

To show the desk on a Fire TV Stick, install the release APK `study-desk-firetv.apk` from
https://github.com/xkazm04/firetv/releases/tag/v1.0-hackathon. With ADB debugging on (Settings, My Fire TV,
Developer options):

```sh
adb connect <stick-ip>:5555
adb -s <stick-ip>:5555 install -r study-desk-firetv.apk
adb -s <stick-ip>:5555 shell am start -n dev.studydesk.stick/.StickActivity --es url "'http://<your-ip>:3000/tv?key=<key>'"
```

The stick keeps only the desk's address, never the key. From then on, open "Study Desk" from the stick's launcher.

## Stop

Press Ctrl+C in the terminal that runs the desk.

Source, design docs and the full README: https://github.com/xkazm04/firetv
