// Original envelope briefs. One shared guarded session across every X3 wave.
export const session='x3-2026-10-02';
const diesel='Dry close industrial metal, dirty low mechanical weight, hard midrange, tiny outdoor reflection. Original isolated effect; no music or voice.';
const noir='Dry intimate worn mechanisms, felt-damped steel, restrained dark resonance. Original isolated effect; no beep, music or voice.';
const sfx=(id,cue,text,seconds=1.5,loop=false,palette=diesel)=>({id,cue,category:'sfx',seconds,loop,prompt:`${text} ${palette}`,kind:'sfx'});
export const effects=[
  sfx('tyre','movement.tyre','Tyres rolling over rough asphalt. Immediate steady rubber grain and road hiss; constant body, no acceleration or distinct bumps. Seamless repeating bed.',2,true),
  sfx('skid','movement.skid','Loaded tyres scrubbing sideways. Immediate rough rubber rasp, low strained body, constant skid friction. No impact, engine or changing speed. Seamless repeating bed.',2,true),
  sfx('drift','movement.drift','Controlled hard drift on dry asphalt. Constant singing rubber edge over gritty low scrub, steady load, no impact or end release. Seamless repeating bed.',2,true),
  sfx('crunch-retry','collision.car','Heavy car side impact: instantaneous thick steel buckle, deep chassis crush, torn panels grinding for half a second, short falling debris. Weighty metal collision, no glass shower, explosion or engine.',1.5),
  sfx('wall','collision.wall','Car chassis hits a concrete retaining wall. Hard dull crack, steel dragging on abrasive concrete, crushed grit falls and dies quickly. No explosion.',1.5),
  sfx('barrier','collision.barrier','Car strikes a loose steel road barrier. Immediate hollow rail bang, bolts rattling in a short cascading decay, final metal tick. No explosion.',1.5),
  sfx('rivet-hit','weapon.rivet.hit','Single rivet strikes armoured steel: sharp small metal puncture, compact dull body and tiny falling fragment. Fast dry decay.',.5),
  sfx('hammer-fire','weapon.hammer.fire','Heavy vehicle cannon launch: sharp bolt release, deep pneumatic thump, short barrel ring and fast dry stop. One launch only.',1),
  sfx('hammer-hit','weapon.hammer.hit','Heavy shell strikes road metal: immediate hard crack, compressed low blast, heavy fragments tumble briefly and stop. One impact, no rolling fireball.',2),
  sfx('mine-drop','weapon.mine.drop','Road mine drops from a crude rack: latch snaps, heavy steel disk thumps onto asphalt, brief rattling settle. No blast.',.7),
  sfx('mine-arm','weapon.mine.arm','A road mine arms: spring winds tightly then a distinct short steel catch seats. Compact tense ratchet, dry stop. No electronic beep or explosion.',.6),
  sfx('scatter','weapon.scatter.fire','One vehicle scatter cannon discharge: abrupt broad gravelly slap, three nearly simultaneous metal cracks, short mechanical cycling, dry release.',.8),
  sfx('pickup-ammo','pickup.ammo','One ammunition collection: crisp rack latch, a short dry stack of steel cartridges seating, quick tactile stop.',.6,'', 'Dry exposed scrap metal and dusty mechanical foley, light space. Original isolated effect; no coin, beep, music or voice.'),
  sfx('pickup-repair','pickup.repair','One repair collection: crisp clamp bite, short satisfying ratchet tightening a plate, dry release.',.7,false,'Dry exposed scrap metal and dusty mechanical foley, light space. Original isolated effect; no coin, beep, music or voice.'),
  sfx('wreck','race.wreck','Vehicle wreck: violent steel tearing at onset, deep collapsing chassis and engine choke, short debris falling to a dead stop. No voices or long fire.',2),
  sfx('countdown','race.countdown','One firm start marshal mechanism knock: solid iron hammer hits a damped steel plate, weighty compact knock with tiny decay. Only one hit.',.5),
  sfx('start','race.start','Race gate releases: abrupt spring-loaded steel crack, compressed air punch, fast rising mechanical rush and dry stop. One clear starting signal.',1),
  sfx('lap','race.lap','Lap completed signal: two quick dry steel ratchet knocks, second slightly brighter, a compact resonant plate tail. Physical and readable, no beep.',.8),
  sfx('victory','race.victory','Short victory punctuation made of junkyard percussion: low drum strike, rising three metal hits, strong final anvil accent, brief ringing resolution. Three seconds, original nonmelodic sting.',3),
  sfx('defeat','race.defeat','Short defeat punctuation: a tired low drum, two sagging resonant steel knocks, an exhausted spring unwinding, damped final stop. Three seconds, original nonmelodic sting.',3),
  sfx('ui-focus','ui.focus','One small worn switch tooth catches: quiet precise click, tiny damped body and immediate release.',.5,false,noir),
  sfx('ui-back','ui.back','One worn latch opens: dry soft double click, a little spring retracts, intimate short release.',.5,false,noir),
  sfx('ui-denied','ui.denied','One jammed latch refuses to close: dry compact knock, brief strained spring rasp, dull stop.',.5,false,noir),
  sfx('ui-purchase','ui.purchase','One shop purchase receipt mechanism: heavy dry stamp, short ratchet seating, quiet final steel click. Satisfying tactile stop.',.7,false,noir),
  ...[
    ['steel-flick','Tensioned leaf spring draws and snaps forward into a short exhaust rip. Fast rising mechanical warning, dry release.'],
    ['flywheel','Clutch catches into a rising flywheel whirr, thick spinning iron briefly strains and releases.'],
    ['shoulder','Armoured ram plates draw tight, thick steel preload groans then one hard latch seats. Heavy forward-charge warning, no impact.'],
    ['turbine','Small crude turbine spools sharply: narrow air whine rises over dirty bearings, short pressure release.'],
    ['ground-bite','Driven treads bite into loose grit: sharp rubber catch, dense short gravel grind, dry grip release.'],
    ['punch-lance','Tensioned steel lance charges: three tightening ratchet teeth accelerate, a heavy bolt snaps and rings briefly.'],
    ['bone-rack','Steel spike rack extends: loaded rails scrape, loose spikes chatter, final hard lock.'],
    ['scrambler','Crude electrical canister activates: initial metal tumble, gritty irregular electrical sputter, brief tearing static and stop.'],
    ['arc-harpoon','Tensioned cable spool winds hard: ratchet strain, sharp cable zip and a short rough electrical arc crack.'],
    ['plate-brace','Armour braces lock: two thick steel clamps slam together, deep short chassis strain, tight latch stop.']
  ].map(([id,text])=>sfx('ability-'+id,'ability.'+id,text,1))
];
export const reuse=[
  {id:'engine-base',cue:'engine.base',source:'diesel-engine',seconds:2,loop:true},
  {id:'rivet-base',cue:'weapon.rivet.fire',source:'diesel-rivet',seconds:1.5,loop:false},
  {id:'mine-base',cue:'weapon.mine.blast',source:'diesel-mine',seconds:2,loop:false},
  {id:'crunch-base',cue:null,source:'diesel-crunch',seconds:1.5,loop:false},
  {id:'pickup-base',cue:'pickup.cash',source:'dust-pickup',seconds:1,loop:false},
  {id:'confirm-base',cue:'ui.confirm',source:'noir-confirm',seconds:1,loop:false}
].map(r=>({...r,category:'sfx',kind:'reuse'}));
const classes={
  Needle:['small strained single-cylinder buzz with papery exhaust','thin racing rasp with loose high mechanical chatter'],
  Line:['uneven old coupe throb with worn valve chatter','chunky midrange twin pulse and rattling intake'],
  Bastion:['slow heavy diesel knock and low chassis resonance','dense tractor diesel chug with loaded bearing growl'],
  Comet:['raw turbine whine over dirty air intake','hot rising metallic turbine harmonics at steady speed'],
  Trail:['rally motor sputter with dry intake bark','coarse rally boxer rumble and gravelly exhaust'],
  Flint:['short-stroke brawler growl with hard exhaust edges','compact angry V motor snarl with rattling mounts'],
  Quill:['medium-mass dry engine growl and loose rack resonance','even low coupe throb with tight mechanical ticking'],
  Vandal:['lumpy boosted motor with uneven exhaust pulses','rough supercharger whirr over a ragged bass motor'],
  Kestrel:['electric traction whine with restrained rough arc crackle','low electric motor buzz and high strained inverter harmonics'],
  Bulwark:['armoured low diesel with enclosed heavy body','deep slow truck diesel throb through thick steel panels']
};
export const engines=Object.entries(classes).flatMap(([car,variants])=>variants.map((timbre,i)=>({...sfx(`${car.toLowerCase()}-${i+1}`,null,`Small engine character proof: ${timbre}. Constant low rev body, already running; no ignition, acceleration or fade. Seamless steady bed.`,2,true),car,variant:i+1,production:false})));
export const voices=[
  ['announcer.debt','Your engine is collateral. Every race buys another day. Marrow keeps the books.','campaign opening: survival debt'],
  ['announcer.boss','Beat the division boss. Give them a reason to stand beside you.','boss briefing'],
  ['announcer.ally','A beaten rival. A new ally. Their backing keeps you on the road.','boss turns ally; payout type undecided'],
  ['announcer.seizure','Marrow has taken your car. The debt was never meant to end.','car seizure'],
  ['announcer.duel','No laps. No points. The last car running ends this.','death duel rules'],
  ['announcer.freedom','The ledger is closed. This road belongs to the living.','final victory'],
  ['mechanic.welcome','You made it. Good. Let me check that engine before Marrow sends you out again.','shop introduction'],
  ['mechanic.repair','Easy. I can hold this together. Just bring it back in one piece, all right?','shop repair'],
  ['mechanic.books','I checked the receipts. You keep winning, but his numbers never let you go.','debt twist; no unsupported money destination'],
  ['mechanic.ally','That boss is backing you now. Money, a car, parts. We finally have some help.','ally reward types; no choice mechanic assumed'],
  ['mechanic.seizure','He took your car? Right. Right... I thought he might. Come round the back.','seizure response'],
  ['mechanic.rig','It is basic. I know. But I fitted a mine dispatcher. Keep moving and let him follow.','secret basic car and mine rig'],
  ['mechanic.duel','No finish line this time. You come back. Marrow does not.','duel setup'],
  ['mechanic.after','You are back. I kept listening for the engine. Thought I had lost you.','aftermath without promising seized car return']
].map(([id,prompt,beat])=>({id,cue:'voice.'+id,category:'tts',kind:'tts',prompt,beat,seconds:null,loop:false,
  voiceId:id.startsWith('announcer')?'N2lVS1w4EtoT3dr4eOWO':'SOYHLrjzK2X1ezoPC6cr',
  stability:id.startsWith('announcer')?.55:.45,style:id.startsWith('announcer')?.3:.25}));
export const waves={effects,engines,voices};
export function argv(row,wave){
  const a=[row.kind,'--out',`audio/x3/${wave}/raw/${row.id}.mp3`,'--session',session,'--session-cap','9000'];
  if(row.kind==='sfx')a.push('--text',row.prompt,'--seconds',String(row.seconds),'--influence','0.7',...(row.loop?['--loop']:[]));
  else if(row.kind==='tts')a.push('--text',row.prompt,'--voice',row.voiceId,'--stability',String(row.stability),'--style',String(row.style),'--similarity','0.75');
  return a;
}
