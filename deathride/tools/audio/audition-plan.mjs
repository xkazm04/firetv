export const session = 'x2-2026-10-02';
export const cap = 9000;
export const line = 'The road keeps no promises. Hold your line, save your steel, and watch the smoke. Out here, the last engine running tells the story.';
export const voices = {
  callum: { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', reason: 'Account description: deceptively gravelly, unsettling edge. Close rival menace.' },
  harry: { id: 'SOYHLrjzK2X1ezoPC6cr', name: 'Harry', reason: 'Account description: rough, fierce warrior. Aggressive machine-yard challenge.' },
  adam: { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', reason: 'Account description: dominant, firm, brash and slightly aggressive. Spectacle announcer.' },
};
export const directions = [
  {
    id: 'dust', name: 'Dust and drums', tag: 'Space / grit / horizon', voice: 'callum',
    philosophy: 'The road is bigger than the driver. Sparse drums make room for exposed machinery; distant guitar carries the horizon. Violence arrives as a dry interruption.',
    listenFor: 'Does the empty space feel dangerous, or does the race lose momentum? Can the dry impacts stay legible against the drums?',
    music: 'Sparse huge skin war drums with dry attacks, low toms and rim knocks, distant tape-echo baritone guitar fragments, dust-dry bass, broad empty space between hits. An exposed outdoor wasteland, raw analog grain, tense forward motion without a busy rock arrangement.',
    material: 'Dust-dry outdoor metal and leather, exposed close attack, short air tail, tape grain.',
    colours: ['loose exhaust rasp and a thin rattling chassis', 'dry bolt chatter and small brass ticks', 'earthy low thump with gravel and a short dusty debris hiss', 'buckled thin steel and a hard chassis knock', 'a scavenged ammunition tin latch and a brief loose metal jingle', 'a heavy weathered lever locking into a leather-damped notch'],
  },
  {
    id: 'diesel', name: 'Diesel brutalism', tag: 'Pressure / machine / mass', voice: 'harry',
    philosophy: 'The engine is the centre of the score. Repeating machine rhythm and low pressure turn the race into a working foundry; impacts are dense, clipped punctuation.',
    listenFor: 'Does the weight remain readable on small speakers? Does relentless machinery become fatiguing or bury the driver feedback?',
    music: 'Heavy industrial metal-on-metal percussion, piston rhythms, low distorted bass drones, abrasive resonant steel, nearly no melody. Dense but separated transients, engine-forward mechanical insistence, threatening close physical pressure, deliberately unpolished analog saturation.',
    material: 'Close foundry steel, blunt low-mid weight, analog grit, short concrete reflection.',
    colours: ['heavy uneven diesel piston knocks and vibrating steel casing', 'a hard pneumatic rivet mechanism and rattling steel bolt', 'a compressed concussive steel drum thud with torn plate debris', 'a dense chassis crush and wrenching heavy steel', 'a power relay slamming into an iron latch with a pressure release', 'a massive industrial toggle closing with a hard spring snap'],
  },
  {
    id: 'funk', name: 'Grindhouse funk', tag: 'Swagger / break / punch', voice: 'adam',
    philosophy: 'Danger has swagger. A dirty bass groove and raw breaks give the race comic momentum; mechanical gestures bounce against the rhythm and the voice sells the spectacle.',
    listenFor: 'Does the groove fit Hot Ink without making combat harmless? Are brass and wah leaving space for weapons and speech?',
    music: 'Gritty syncopated electric bass riff, raw live drum break, short blunt brass stabs and scratchy wah guitar, dry room, worn tape, crooked comic swagger with real danger. Tight restrained arrangement, punchy and dirty, not glossy disco, no smooth lounge finish.',
    material: 'Dirty close garage foley, springy snap, loose metal, short raw room, dangerous comic punch.',
    colours: ['a throaty coupe idle with a loose spring rattle', 'a snappy stuttering gun mechanism and loose brass clacks', 'a punchy low blast followed by a loose spring-metal debris rattle', 'a blunt car panel crunch followed by a quick loose bumper twang', 'a sprung parts-tray latch snapping and two loose hardware clacks', 'a chunky mechanical pushbutton with a short spring bounce'],
  },
  {
    id: 'noir', name: 'Soot noir', tag: 'Restraint / threat / shadow', voice: 'callum',
    philosophy: 'Threat comes from what is withheld. Low strings and sub pulses keep tension under the wheels; intimate, damped details and quiet menace make each collision matter.',
    listenFor: 'Does restraint feel tense or merely slow? Can the intimate detail survive the engine, and does the sub pulse translate beyond headphones?',
    music: 'Dark low bowed strings, restrained dry sub-bass pulses, sparse brushed metal ticks, uneasy short low-string motif, smoky tense cinema atmosphere. Close intimate detail, rough bow texture, long gaps, no lush swelling orchestra, no sentimental melody.',
    material: 'Intimate damped metal, low gritty resonance, restrained high end, tiny dry reflection.',
    colours: ['a low muffled motor throb with subtle strained bearing grit', 'a tight damped bolt crack and dark hollow shell tick', 'a low compact concussive thud and brief dark fractured-metal tail', 'a deep restrained chassis groan with one sharp panel crease', 'a small cold steel catch closing with one low hollow resonance', 'a dry worn ratchet tooth seating into a felt-damped latch'],
  },
];
const effects = [
  { id: 'engine', label: 'Engine · low rev', seconds: 2, loop: true, brief: 'Battered road coupe at steady low revs. Constant body, seamlessly repeating; no ignition, acceleration, fade or backfire' },
  { id: 'rivet', label: 'Rivet · gun burst', seconds: 1.5, brief: 'One crude vehicle rivet-gun burst. Immediate attack, three cracks in 0.6 s, short metal body, decay to silence; no reload' },
  { id: 'mine', label: 'Mine · blast', seconds: 2, brief: 'One compact road-mine blast. Hard attack, short low concussive body, torn metal and grit rapidly decaying. Close, no sustained fireball' },
  { id: 'crunch', label: 'Car-to-car · crunch', seconds: 1.5, brief: 'One car-to-car side collision. Sharp steel contact, short buckling grind, debris settling. No engine bed or tyre squeal' },
  { id: 'pickup', label: 'Pickup · collect', seconds: 1, brief: 'One tactile collection confirmation. Crisp small latch attack, short satisfying body, quickly decaying tail. No coins or bleep' },
  { id: 'confirm', label: 'Menu · confirm', seconds: 1, brief: 'One physical menu confirm. Immediate quiet click-clunk, tiny mechanical body, short dry release to silence. No beep or chime' },
];
export const samples = directions.flatMap(d => [
  { id: `${d.id}-race`, direction: d.id, category: 'music', label: 'Race · Hunt intensity', seconds: 20, loop: true,
    prompt: `Original instrumental combat-racing music. ${d.music} Exactly 96 BPM, 4/4, eight bars, 20 seconds. A steady main-intensity racing loop already in motion at the beginning. The eighth bar must lead directly into bar one with matching harmony and energy. No intro, no ending cadence, no fade in or fade out, no vocals, no speech, no sound effects. Compose original material; do not quote any existing recording or melody.` },
  ...effects.map((e, i) => ({ id: `${d.id}-${e.id}`, direction: d.id, category: 'sfx', cue: e.id, label: e.label,
    seconds: e.seconds, loop: !!e.loop, prompt: `${e.brief}. Timbre: ${d.colours[i]}. ${d.material} ${e.seconds} seconds. Original isolated effect; no music, no voice.` })),
  { id: `${d.id}-voice`, direction: d.id, category: 'tts', label: `Rival / announcer · ${voices[d.voice].name}`,
    seconds: null, loop: false, voice: d.voice, voiceId: voices[d.voice].id, prompt: line },
]);
export function cli(sample) {
  const command = [sample.category, '--out', `audio/audition/raw/${sample.id}.mp3`, '--session', session, '--session-cap', String(cap)];
  if (sample.category === 'music') command.push('--prompt', sample.prompt, '--seconds', String(sample.seconds));
  else if (sample.category === 'sfx') {
    command.push('--text', sample.prompt, '--seconds', String(sample.seconds), '--influence', '0.7');
    if (sample.loop) command.push('--loop');
  } else command.push('--voice', sample.voiceId, '--text', sample.prompt, '--stability', '0.55', '--similarity', '0.75', '--style', '0.3');
  return command;
}
