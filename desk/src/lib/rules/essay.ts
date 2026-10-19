/**
 * Essay forensics — the parts that are rules, done before any model is asked.
 *
 * Sentence splitting, length, connectors and a first-pass role guess are all deterministic. The
 * model is asked afterwards to *comment* on a text whose sentences are already numbered and
 * measured, and to return verdicts anchored to sentence numbers — so a highlight can only land on
 * a sentence that exists.
 */
import type { Band } from "./voice";
export type Role = "claim" | "evidence" | "link" | "context";
/** `para` (0-based) is set only when the text has more than one paragraph; a one-paragraph text reads as it always did. */
export interface Sentence { n: number; text: string; words: number; connectors: string[]; role: Role; para?: number; }

const CONNECTORS = /\b(because|therefore|however|although|which means|so that|as a result|for example|for instance|but|since|whereas|in contrast|this suggests|which suggests)\b/gi;
const EVIDENCE = /\b(\d+%?|per cent|percent|research|study|studies|report(ed|s)?|found|data|measured|according to|for example|for instance)\b/i;
const LINK = /^(therefore|so|this (means|shows|suggests)|as a result|in conclusion|which is why|that is why)\b/i;

/** Short forms whose full stop does not end a sentence, even when a capital follows. */
const ABBREVIATION = /\b(?:Dr|Mr|Mrs|Ms|Prof|St|etc|eg|ie|e\.g|i\.e|vs)\.$/i;

/**
 * A sentence ends at . ! or ? — optionally inside a closing quote or bracket — followed by a
 * capital or an opening quote. A piece that ends on an abbreviation is joined back to the next,
 * because a wrong split renumbers every sentence after it and every highlight is drawn on those numbers.
 */
export function splitSentences(text: string): Sentence[] {
  // Paragraphs first (paragraphsOf: a blank line ends one), so a sentence never runs across a paragraph break.
  // Numbering runs on through the piece, so a highlight still lands by number alone.
  // A title line (titleOf) is kept apart: it is never a sentence, and never fuses into sentence 1.
  const body = readTitle(text).body;
  const paras = rawParagraphs(body);
  if (paras.length <= 1) return splitParagraph(body, 0);
  const out: Sentence[] = [];
  paras.forEach((p, para) => { for (const sn of splitParagraph(p, out.length)) out.push({ ...sn, para }); });
  return out;
}
function splitParagraph(text: string, before: number): Sentence[] {
  const pieces = text.replace(/\s+/g, " ").trim().split(/(?<=[.!?]["'”’)\]]?)\s+(?=[\p{Lu}"“„])/u).filter(Boolean);
  const parts: string[] = [];
  for (const p of pieces) {
    if (parts.length && ABBREVIATION.test(parts[parts.length - 1])) parts[parts.length - 1] += " " + p;
    else parts.push(p);
  }
  return parts.map((t, i) => {
    const connectors = (t.match(CONNECTORS) || []).map((c) => c.toLowerCase());
    const role: Role = LINK.test(t) ? "link" : EVIDENCE.test(t) ? "evidence" : "claim";
    return { n: before + i + 1, text: t, words: t.split(/\s+/).length, connectors, role };
  });
}

/** The text of a set of sentences: one space inside a paragraph, a blank line between paragraphs. */
export function joinSentences(sentences: Pick<Sentence, "text" | "para">[]): string {
  return sentences.map((s, i) => (i === 0 ? "" : s.para !== sentences[i - 1].para ? "\n\n" : " ") + s.text).join("");
}

/** How many paragraphs a reading holds: 1 unless the sentences carry `para`. */
export const paragraphCount = (sentences: Pick<Sentence, "para">[]) => new Set(sentences.map((s) => s.para ?? 0)).size || 1;

/** The numbered lines a reading prompt shows the model; a "Paragraph k" line opens each paragraph of a longer piece. */
/** The same rows as numberedLines, for the prompt assembler: the learner's sentence as data, the desk's count and role as its note, the paragraph as its heading. */
export function sentenceRows(sentences: Sentence[]): { n: number; value: string; note: string; head?: string }[] {
  const many = paragraphCount(sentences) > 1;
  return sentences.map((s, i) => ({
    n: s.n, value: s.text, note: `[${s.words} words, first-pass role: ${s.role}]`,
    ...(many && (i === 0 || s.para !== sentences[i - 1].para) ? { head: `Paragraph ${(s.para ?? 0) + 1}:` } : {}),
  }));
}

export function numberedLines(sentences: Sentence[]): string {
  const many = paragraphCount(sentences) > 1;
  return sentences.map((s, i) => (many && (i === 0 || s.para !== sentences[i - 1].para) ? `${i ? "\n" : ""}Paragraph ${(s.para ?? 0) + 1}:\n` : "") +
    `${s.n}. ${s.text}  [${s.words} words, first-pass role: ${s.role}]`).join("\n");
}

// ---- text in: files and messages, one paragraph at a time ----

/**
 * The paragraphs of a text the learner sent (a .txt or .md file, or a message typed or dictated on the phone),
 * in order. The desk reads ONE paragraph at a time; this only says where one ends and the next begins. The rule is
 * deliberately plain: a blank line (any run of two or more line breaks, CRLF included, a line of only spaces counts
 * as blank) ends a paragraph; the line breaks inside one become single spaces; empties are dropped. A markdown
 * heading line (starts with 1-6 # and a space) is its own item, so a title never fuses with the first paragraph
 * under it; the learner steps past it with Next. A plain title line (titleOf) is left out entirely. Nothing cleverer than that is tried. No blank line means one
 * paragraph, and that one reads exactly as it did before this existed. Never throws; a non-string gives [].
 */
export function paragraphsOf(text: unknown): string[] {
  return rawParagraphs(readTitle(text).body);
}
function rawParagraphs(text: unknown): string[] {
  if (typeof text !== "string") return [];
  const out: string[] = [];
  let cur: string[] = [];
  const flush = () => { if (cur.length) { out.push(cur.join(" ")); cur = []; } };
  for (const raw of text.replace(/\r\n?|\u2028|\u2029/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) flush();
    else if (/^#{1,6}\s+\S/.test(line)) { flush(); out.push(line); }
    else cur.push(line);
  }
  flush();
  return out;
}

/** The longest a title line may be, in words. Not measured: a school-essay title is a phrase, and a longer line is read as writing. */
export const TITLE_MAX_WORDS = 12;

/**
 * A leading title line (recert-9 EM3-1, EM3-2). The first non-blank line is a title when it is at most TITLE_MAX_WORDS
 * words, starts with a letter or digit, ends on a letter, digit or closing quote or bracket (so no . ! ? : ; , or
 * ellipsis, and no stop inside: a question-mark heading is NOT a title and stays a paragraph, exactly as before), is not a markdown
 * "#" heading (those stay their own item in paragraphsOf), and is followed by more text. When the very next line
 * follows with no blank line between, that line must start with a capital, a digit or an opening quote, so a
 * hard-wrapped paragraph whose first line has no stop is not cut in two. A title is kept out of paragraphsOf and
 * splitSentences, so it is never sent for a reading and never fused into sentence 1. A non-string, or a text with no
 * title, gives { title: null, body: text } unchanged.
 */
export function readTitle(text: unknown): { title: string | null; body: string } {
  if (typeof text !== "string") return { title: null, body: "" };
  const lines = text.replace(/\r\n?|\u2028|\u2029/g, "\n").split("\n");
  const at = lines.findIndex((l) => l.trim());
  if (at < 0) return { title: null, body: text };
  const title = lines[at].trim();
  if (/[.!?](\s|$)/.test(title)) return { title: null, body: text };
  if (title.split(/\s+/).length > TITLE_MAX_WORDS || !/^[\p{L}\p{N}]/u.test(title) || !/[\p{L}\p{N}"'”’)\]]$/u.test(title)) return { title: null, body: text };
  const next = lines.findIndex((l, i) => i > at && l.trim());
  if (next < 0) return { title: null, body: text };
  if (next === at + 1 && !/^[\p{Lu}\p{N}"“„]/u.test(lines[next].trim())) return { title: null, body: text };
  return { title, body: lines.slice(at + 1).join("\n") };
}

/** The title line of a text, or null (see readTitle). paragraphsOf leaves it out; a caller that shows or keeps the piece reads it here. */
export const titleOf = (text: unknown): string | null => readTitle(text).title;

/**
 * Two limits on what the phone may send. Neither is measured: they are set conservatively (a file of a few pages
 * is well under 100 KB of plain text; 4000 characters is about 650 words, far past any one paragraph a learner of
 * 11-13 writes) and are to be revisited after live use.
 */
export const ESSAY_FILE_MAX_BYTES = 100 * 1024;
export const ESSAY_PARAGRAPH_MAX_CHARS = 4000;

/** The plain sentence for a paragraph over the cap, or null when it fits. Never truncates: the learner splits it. */
export function essayTooLong(text: unknown): string | null {
  if (typeof text !== "string" || text.length <= ESSAY_PARAGRAPH_MAX_CHARS) return null;
  return PARAGRAPH_TOO_LONG_LINE;
}
const PARAGRAPH_TOO_LONG_LINE = `That paragraph is too long to read in one go. Split it in two and send one part at a time (up to ${ESSAY_PARAGRAPH_MAX_CHARS} characters).`;

/**
 * A whole piece (v2 E1) is read one call per paragraph, so its size is a count of calls. 30 paragraphs is a long
 * school essay several times over; the cap is not measured (as the caps above) and is to be revisited after use.
 */
export const PIECE_PARAGRAPHS_MAX = 30;
export const PIECE_MAX_CHARS = 100 * 1024;

/** Why a whole piece cannot be read in one go, or null. Each paragraph must fit the paragraph cap; never truncates. */
export function pieceProblem(text: unknown): string | null {
  if (typeof text !== "string" || !text.trim()) return PIECE_EMPTY_LINE;
  if (text.length > PIECE_MAX_CHARS) return PIECE_TOO_LONG_LINE;
  const ps = paragraphsOf(text);
  if (ps.length > PIECE_PARAGRAPHS_MAX) return pieceParagraphsLine(ps.length);
  const long = ps.findIndex((p) => essayTooLong(p) !== null);
  if (long >= 0) return pieceParagraphLongLine(long + 1);
  return null;
}
const PIECE_EMPTY_LINE = "There is nothing to read. Write or send a piece first.";
const PIECE_TOO_LONG_LINE = `That piece is too long to read in one go. Keep it under ${PIECE_MAX_CHARS / 1024} KB.`;
const pieceParagraphsLine = (n: number) => `That is ${n} paragraphs. The desk reads up to ${PIECE_PARAGRAPHS_MAX} at a time: send it in parts.`;
const pieceParagraphLongLine = (n: number) => `Paragraph ${n} is too long to read in one go. Split it in two (up to ${ESSAY_PARAGRAPH_MAX_CHARS} characters each).`;

// ---- E3: the desk reads English writing; code decides, before any verdict or count, whether a paragraph is English ----

/** The line a paragraph that is not English gets, on the phone and on the TV. */
export const NOT_ENGLISH_LINE = "Essay Master reads English writing. This paragraph is not in English, so the desk did not read it.";

/**
 * E3-c: the caption the stage gives a refusal the desk said before any run, or null. The analyse route dispatches
 * it as one (session essayRefused), so this reads a value: no line is recognised by its wording, and a status that
 * merely reads like a refusal is not one.
 */
export function refusalCaption(s: { status?: unknown; essayRefused?: unknown }): { label: string; text: string } | null {
  return typeof s.status === "string" && s.status && s.essayRefused === s.status ? { label: "Not read", text: s.status } : null;
}

/** Words that are function words in both English and Czech (my, a, to, do, by, so, on...): a Czech paragraph made of them must not read as English, so they do not count toward the English share. */
const SHARED_WITH_CZECH = new Set("a to do by so on my ten pro ale i o u s v k z na no as at".split(" "));
const ENGLISH_WORDS = new Set(("the of and to a in is that it was for on are as with they be at this have from or by not but we you their would should can more than which also because " +
  "so if there them these most many my who will an his her its our your has had were been do does did about into when what one all some other only just very how why then too").split(" ").filter((w) => !SHARED_WITH_CZECH.has(w)));
/** Common Czech function words, written without diacritics (a text is folded before it is compared, so a piece typed without them reads the same). Words that are also English (to, a, by, do, so, on, ten, pro, ale) are left out. */
const CZECH_WORDS = new Set(("je se ze na jsou ve si byl byla bylo jako ktery ktera ktere aby nebo take vsak avsak proto podle nez tak uz jen jak mezi pri bez byt ho jeho jeji jejich ma neni nejsou " +
  "nich nim tim jsem jsme jste bude budou muze musi kdyz kde kdo ani tedy tudiz nicmene protoze pokud vsichni velmi " +
  "mely mel mela melo byly byt maji mit mam mame muzou musime chci chceme tohle toto tento tato tyto jsi nas vas nam vam tebe vsechno vsechny vice mene pouze stale vzdy nikdy proc jak kdy kolik cim cemu cem co nikdo nic neco nekdo skola skole skolu deti zaci ucitele " +
  "jich nesmi jinak nemaji mnoho prilis lidi mysli opak jedna velkou pak divi nektere nekteri uciteli meli casteji bez nej sve svuj svou moje moji kazdy kazda kazde vetsina jine jiny jina dobre spatne dobry spatny hodne moc proti pred po behem podle okolo bych bys bychom byste ktery ktera ktere ktereho kterym nasi vasi jejich ci ani zadny zadna zadne dnes dnesni dneska zde tam tady stejne prece vlastne asi snad treba hlavne spise take uz jeste mozna " +
  // round 3: plain-letter Czech, the words an eleven-year-old types (no English twin: me, ted, sest, mala stay out where they read as English)
  "chodi chodim chodil chodili chodila chodime jedu jede jedeme jeli jel jela hraje hraji hrajeme hral hrala hrali dela delam delas delaji delal delala nevim vim vime ja ty ona oni muj moje moji tvuj tva tvoje nase nasi nasich vase " +
  "rano vecer odpoledne dopoledne lete zime podzim tyden tydne tydnu vikend vikendu zapas zapasy hodin hodiny hodinu hodine roky roce rokem dny dni dlouha dlouhy dlouhe dlouho kratka kratky male velke velkou cely cela cele nejlepsi nejhorsi lepsi horsi dobra dobrou kazde kazdou kazdym ostatni ostatnimi " +
  "kamarad kamarady kamaradka kamaradi kamaradu sestra sestry bratr bratra maminka tatinek babicka dedecek rodice rodina rodinou rodinu autem autobusem vlakem " +
  "takze vzdycky nekdy obcas casto driv potom pozdeji nakonec nejdriv hned zase znovu zatim " +
  "jidelna jidelne obed obedu obeda vecere snidane snidani fronta fronty skolni uniformy uniforma naladu nalada tride trida tridy tridou tridu hodina hodinach predmet predmety ukol ukoly ukolu domaci zkouska pisemka prazdniny prazdnin " +
  "chalupu chalupa chalupe mesto mestem vesnice vesnici doma domu venku uvnitr " +
  "chce chtel chtela chteji muzeme muzete muzu muzes mohu mohl mohla mohli nejaky nejaka nejake nejakou zadny prsi prselo snezi snezilo svita hezky hezka hezke pekny pekna pekne " +
  "pravda pravdu ano dekuji dekuju prosim pomoc pomoci hlad zizen unaveny unavena unavene spokojeny rada rado mas meli " +
  "osme sedme deveme sedm osm pesky zhorsily zhorsit vstava vstavat vstavam vozi vozit prinesl prinesla tvori tvorit nosi nosit nese davaji davat dava dala dali slibil slibila " +
  "souhlasim souhlasime tebou mnou naucil naucila naucit naucili ucit uci ucila ucil zdravim ahoj nashledanou " +
  "umi umim umime umet vedi znam zname znat vidi videl videla videli vidime vidim slysi slysel budu budeme budete").split(" "));
/** Common German function words (E3: the desk reads English, so German is refused too). Words that are also English (in, an, so, man, will, was, war, die, hat) are left out. */
const GERMAN_WORDS = new Set(("der das und ist nicht ein eine einen zu mit auf fur von den dem des sich auch es wir sie ich aber wie oder wenn dass im aus bei nach nur noch werden wird sind haben kann uber " +
  "einem einer eines diese dieser dieses wurde wurden sein ihre ihr unser nicht kein keine mehr sehr schon dann denn weil doch ja nein hier dort " +
  // round 3: the rest of the everyday words; the ones English also has (hat, war, was, man, will, die) stay out
  "bin bist du mir mich dich dir mein meine meiner meinen meinem deine dein ihm ihn ihnen uns euch geht gehen gehe gern gerne ins ans zum zur beim vom am um jeden jede jeder jedem viele vielen alle alles allen schule schulen schuler schulerin lehrer lehrerin klasse hund katze haus buch bucher kino heute gestern immer gut gute guten danke bitte habe hast habt hatte hatten ohne acht neun sieben sechs zwei drei vier funf zehn mude helfen kannst konnen konnte muss musst mussen soll sollte sollen wo wer wann warum wieso gerade durch gegen wieder viel liest lesen spielt spielen spielst wohnst wohnen wohne lernen lerne lernt heisst arbeit uhr tag tage woche wochen wochenende jahr jahre freunde freund freunden familie mutter vater schwester bruder essen trinken kommen komme kommst kommt gehst fahren fahre fahrt beginnt anfang ende doch mal etwas nichts niemand jemand jetzt spater fruher bald schnell langsam gross klein neue neuen neuer neues alte alten schwer leicht").split(" "));
/** Common Italian function words, folded. Words that are also English (a, come, per, solo, dove, era, ma, tempo) are left out. */
const ITALIAN_WORDS = new Set(("il lo gli un una uno dei del della delle dello degli nel nella nei nelle sul sulla alla alle al ai dal dalla che non sono sei siamo siete stato stata anche piu mia mio miei mie suo sua suoi sue molto molti molte ogni mi ti ci vi si ho hai hanno abbiamo essere avere fare fatto cosa cose quando perche credo penso pensa dovrebbero dovrebbe devono deve possono puo studenti studente scuola scuole amici amico amiche casa torna tornare vado vai va andiamo vanno mattina sera giorno giorni settimana anno anni sorella fratello madre padre mamma universita lezione lezioni compiti libro libri bello bella belli belle buono buona grande piccolo piccola questo questa questi queste quello quella voglio vuole vogliamo posso giocare aperto tutti tutto tutte pero quindi invece ancora gia sempre mai oggi ieri domani adoro amo piace piacciono io tu lui lei noi voi loro").split(" "));
/** Common Dutch function words, folded. Words that are also English (is, van, met, was, over, door, we, dan, mama) are left out. */
const DUTCH_WORDS = new Set(("de het een en dat niet ik je jij hij zij wij ze maar ook voor op aan er te nog wel als bij naar uit om mijn jouw zijn haar ons onze hun hebben heb hebt heeft had hadden ben bent waren wordt worden werd werden wat dit deze die geen kan kunnen kon konden moeten moet mag mogen wil willen zal zullen zou zouden alle alles andere tussen tijdens na tot zonder tegen sinds elke elk dag dagen week weken jaar jaren zus broer moeder vader vriend vriende vrienden school scholen les lessen toets toetsen huiswerk leraar lerares klas thuis boeken boek lezen lees leest hou houd houdt spelen speelt speel buiten binnen vandaag gisteren altijd nooit soms vaak veel weinig meer minder beste goed goede slecht moeilijk makkelijk belangrijk belangrijke genoeg lange lang korte kort fiets fietsen gaat gaan ga omdat want dus toch al nu hier daar waar wanneer waarom hoe wie welke kinderen kind dieren dier mooi mooie leuk leuke ver samen alleen heel erg zeer echt gewoon").split(" "));
/** Common Polish function words, folded (ł is folded to l). Words that are also English (to, i, o, a, w) are left out. */
const POLISH_WORDS = new Set(("nie jest sie ze sa jak ale czy oraz poniewaz ktory ktora ktore ktorzy bardzo tylko moze powinien powinna powinno powinny jestem byc byl byla bylo jego jej ich dla przez od po lub gdy tak mnie moim zdaniem uwazam sa tez juz tego tym tej ten ta te na za przy jako gdzie kiedy wiec dlatego bo mam maja mozna trzeba szkola szkole uczniowie uczniow lekcjach ksiazek czlowieka rozwoju waznie wazne wazna wszystko wszyscy moja moj moje moi twoja twoj nasza nasz nasze siostra brat chodzi chodze lubi lubie lubimy klasy klasa klasie klase szostej nauczycielka nauczyciel nauczyciele mila mily zawsze pomaga pomagam wczoraj dzisiaj jutro bylismy bylam byly codziennie lekcji lekcje pilke pilka kolegami kolegow koledzy telefony telefon zakazane zakazany rozpraszaja rozpraszac dzieci dzieciom dziecko rodzice domu mieszkam mieszka widzielismy widzialem duzy duza duze maly mala male dobry dobra dobre zle wiele duzo malo teraz potem nigdy czasem czesto razem sam sama jestesmy mamy macie").split(" "));
/** Common French function words, folded. Words that are also English (on, me, a, as, son, pour...) are left out where they read as English. */
const FRENCH_WORDS = new Set(("le la les des du un une et est sont dans pour que qui ne pas je nous vous ils elles avec sur plus mais ou ce cette ces au aux se sa ses leur leurs tres tout tous etre avoir fait comme parce pense devrait ecole eleves classe trop aussi sans sous chez entre peut peuvent") .split(" "));
/** Common Spanish function words, folded. Words that are also English (no, me, a, he, son, era...) are left out. */
const SPANISH_WORDS = new Set(("el la los las de del que y en un una es por con para se su sus al como mas pero muy son esta estan estos esas porque creo tambien hay ser estar fue cuando donde todo todos todas sobre entre sin tiene tienen puede pueden deberia escuela estudiantes profesores alumnos ninos deberes importantes").split(" "));
/** Letters only Czech and Slovak use (or Polish: ą ę ł ń ś ź ż), kept apart from the word lists so a plain-text word list stays small. */
const CZECH_LETTERS = /[ěščřžýáíéúůďťňóąęłńśźż]/i;
/** Endings no English word has in six letters or more: Czech/Slovak adjective plurals, verbs in -ovat, -uji/-aji, -nost nouns. */
const SLAVIC_ENDING = /^.{4,}(ych|ymi|ovat|ejsi|ovani|nosti|nost|uji|aji|eji|ely|ili|ila|ali|ovali|ovala|ovaly|ujeme|ujete|ujou|ovym|ovou)$/;
/**
 * The shape of a plain-letter Czech word, which needs no list (round 4, L1-kristyna-17-EM1-5): a word of four letters or more that opens with a cluster
 * no English word opens with (zv-, zm-, zr-, zl-, zd-, zb-, hr-, hl-, kd-, vz-, ct-, krk-, rz-), or ends in an inflection English does not have (-ych, -ymi,
 * -eho, -emu, -uje, -ejte, -ujte, -ou, -ym, and -ci/-ni/-ti/-ri on five letters or more). A name can trip it; one word cannot turn a paragraph,
 * the share must still reach CZECH_FLOOR. Read on the folded word.
 */
const CZECH_SHAPE_START = /^(?:zv|zm|zr|zl|zd|zb|hr|hl|kd|vz|ct|krk|rz)/;
const CZECH_SHAPE_END = /(?:ych|ymi|eho|emu|uje|ejte|ujte|ovat|ou|ym)$|.{3}(?:ci|ni|ti|ri)$/;
/** The one-letter Czech prepositions: an English text has no stand-alone v, z or k. */
const CZECH_ONE_LETTER = new Set(["v", "z", "k"]);
const czechShape = (w: string) => CZECH_ONE_LETTER.has(w) || (w.length >= 4 && (CZECH_SHAPE_START.test(w) || CZECH_SHAPE_END.test(w)));
const fold = (w: string) => w.replace(/ł/g, "l").replace(/Ł/g, "L").normalize("NFD").replace(/[̀-ͯ]/g, "");

/** The shares behind the English rule: words, English function words over words, then each other language's signal over words. */
export function englishReading(text: unknown): { words: number; english: number; czech: number; german: number; polish: number; french: number; spanish: number; italian: number; dutch: number } {
  const ws = (typeof text === "string" ? text.toLowerCase().match(/[\p{L}']+/gu) : null) ?? [];
  if (!ws.length) return { words: 0, english: 0, czech: 0, german: 0, polish: 0, french: 0, spanish: 0, italian: 0, dutch: 0 };
  // an apostrophe elision (l'ecole, d'accord) leaves the word after it
  const fs = ws.map((w) => fold(w.replace(/^[a-z]{1,2}'(?=.)/, "")));
  const share = (n: number) => n / ws.length;
  const en = ws.filter((w) => ENGLISH_WORDS.has(w)).length;
  const cz = ws.filter((w, i) => CZECH_LETTERS.test(w) || CZECH_WORDS.has(fs[i]) || SLAVIC_ENDING.test(fs[i]) || czechShape(fs[i])).length;
  const de = fs.filter((w) => GERMAN_WORDS.has(w)).length;
  const pl = fs.filter((w) => POLISH_WORDS.has(w)).length;
  const fr = fs.filter((w) => FRENCH_WORDS.has(w)).length;
  const es = fs.filter((w) => SPANISH_WORDS.has(w)).length;
  const it = fs.filter((w) => ITALIAN_WORDS.has(w)).length;
  const nl = fs.filter((w) => DUTCH_WORDS.has(w)).length;
  return { words: ws.length, english: share(en), czech: share(cz), german: share(de), polish: share(pl), french: share(fr), spanish: share(es), italian: share(it), dutch: share(nl) };
}
/** The floors, set on the corpus in tools/essay-rules-test.cjs (E3-a, E3-d): a paragraph of at least ENGLISH_MIN_WORDS words is not English when another language's signal is at or over the floor and over the English share. */
export const ENGLISH_MIN_WORDS = 6;
export const ENGLISH_FLOOR = 0.15;
export const CZECH_FLOOR = 0.25;

/** Whether a paragraph reads as English. It says no only when it can tell; anything else, a short paragraph included, is English. */
export function paragraphIsEnglish(text: unknown): boolean {
  const r = englishReading(text);
  const other = Math.max(r.czech, r.german, r.polish, r.french, r.spanish, r.italian, r.dutch);
  // UD-19: a paragraph under ENGLISH_MIN_WORDS is English unless two or more of its words read as another language and beat the English ones (40% of the words, or a third when no English word is there); never on length alone
  if (r.words < ENGLISH_MIN_WORDS) return !(r.words > 0 && r.english < ENGLISH_FLOOR && other * r.words >= 2 && other > r.english && (other >= 0.4 || (r.english === 0 && other >= 1 / 3)));
  // E3-d: English words mixed into a foreign paragraph do not make it English: the foreign signal must lose to the English share
  return !(other >= CZECH_FLOOR && other > r.english);
}

/**
 * Whether a file the learner picked can be read as text, checked in the browser before anything is read into the
 * panel (nothing is uploaded or kept). Call it with the file's name, type and size, then again with the text once
 * it is read: a binary file that was renamed .txt shows itself in the text (a NUL, or a run of replacement marks).
 * Returns the desk's plain sentence for the problem, or null when the file is fine. Never throws.
 */
export function essayFileProblem(f: { name?: unknown; type?: unknown; size?: unknown }, text?: string): string | null {
  const name = typeof f?.name === "string" ? f.name.toLowerCase() : "";
  const type = typeof f?.type === "string" ? f.type.toLowerCase() : "";
  const size = typeof f?.size === "number" && Number.isFinite(f.size) ? f.size : -1;
  // a phone often cannot name the type of a .md file (empty, or a generic binary type), so those pass on the name
  const typeOk = type === "" || type.startsWith("text/") || type === "application/octet-stream";
  if (!/\.(txt|md)$/.test(name) || !typeOk) return "The desk reads .txt and .md files. Pick one of those, or type the paragraph here.";
  if (size === 0) return "That file is empty. Pick one with some writing in it.";
  if (size < 0 || size > ESSAY_FILE_MAX_BYTES) return `That file is too big. Keep it under ${ESSAY_FILE_MAX_BYTES / 1024} KB, or send a few paragraphs at a time.`;
  if (text !== undefined) {
    if (text.includes("\u0000") || (text.match(/\uFFFD/g) ?? []).length > 3) return "That does not look like plain text. Save it as a .txt or .md file and pick it again.";
    if (!text.trim()) return "That file is empty. Pick one with some writing in it.";
  }
  return null;
}

export function paragraphStats(sentences: Sentence[]) {
  const words = sentences.reduce((a, s) => a + s.words, 0);
  return {
    sentences: sentences.length, words,
    avgWords: sentences.length ? Math.round((words / sentences.length) * 10) / 10 : 0,
    claims: sentences.filter((s) => s.role === "claim").length,
    evidence: sentences.filter((s) => s.role === "evidence").length,
    links: sentences.filter((s) => s.role === "link").length,
    connectors: sentences.reduce((a, s) => a + s.connectors.length, 0),
  };
}

export const ANALYSIS_TYPES = [
  { id: "structure", name: "Structure", promise: "Which sentence does which job — claim, evidence, link — and what is missing.", lens: "Judge each sentence by its role in the paragraph: is there a claim, is it followed by evidence, is there a link back to the argument?" },
  { id: "argument", name: "Argument", promise: "Does the paragraph take a side, and does every sentence push the same way?", lens: "Judge whether the paragraph argues one thing consistently, and where a sentence weakens, contradicts or wanders from the claim." },
  { id: "evidence", name: "Evidence", promise: "What here is a fact a reader can check, and what is only an opinion.", lens: "Judge each sentence on whether it gives checkable support - a number, a mechanism, an example - or only asserts." },
  { id: "language", name: "Language", promise: "Sentence length, rhythm, connectors, repeated words.", lens: "Judge the writing itself: monotonous sentence length, missing connectors, repetition, vague words like 'bad' or 'important'." },
] as const;
export type AnalysisType = (typeof ANALYSIS_TYPES)[number]["id"];

/**
 * How to rephrase a faulty sentence: the move (a technique, named in 2-6 words) and the pattern (a
 * sentence frame whose content is left as [slots]). Teaching, not ghostwriting - so a "pattern" with no
 * slot, one that is mostly literal words, or one that copies the learner's own sentence is refused.
 */
export interface Fix { move: string; pattern: string; }
const SLOT = /\[[^[\]]{1,60}\]/g;
export const FIX_LIMITS = { moveWords: [2, 6], moveChars: 48, patternChars: 160, literalWords: 10, copiedRun: 4 } as const;
const wordsOf = (t: string) => t.toLowerCase().match(/[a-z0-9']+/g) ?? [];

/** The model's `fix`, cleaned, or undefined when it is not a move and a slotted pattern. Never throws. */
export function cleanFix(raw: unknown, sentences: string | readonly string[] = []): Fix | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const { move, pattern } = raw as Record<string, unknown>;
  if (typeof move !== "string" || typeof pattern !== "string") return undefined;
  const m = move.replace(/\s+/g, " ").trim(), p = pattern.replace(/\s+/g, " ").trim();
  const n = m.split(" ").filter(Boolean).length;
  if (n < FIX_LIMITS.moveWords[0] || n > FIX_LIMITS.moveWords[1] || m.length > FIX_LIMITS.moveChars || /[[\]]/.test(m)) return undefined;
  if (p.length > FIX_LIMITS.patternChars || !(p.match(SLOT) ?? []).length) return undefined;
  // brackets only as whole slots; the words around the slots are a frame, not a sentence
  const literal = p.replace(SLOT, " ");
  if (/[[\]]/.test(literal)) return undefined;
  const lit = wordsOf(literal);
  if (lit.length > FIX_LIMITS.literalWords) return undefined;
  // a run of the learner's own words in the frame is their sentence rewritten around a slot
  const own = typeof sentences === "string" ? [sentences] : [...sentences];
  if (copiesRun(own, lit)) return undefined;
  // a slot names what goes there; a slot holding a sentence (or a run of the learner's words) is the sentence handed over
  const slots = (p.match(SLOT) ?? []).map((x) => x.slice(1, -1).trim());
  if (slots.some((x) => sentenceShaped(x) || copiesRun(own, wordsOf(x)))) return undefined;
  // the frame's own words may scaffold (a connector, a move) but not state a clause that adds content
  if (addsContent(p)) return undefined;
  return { move: m, pattern: p };
}

/** Whether a slot's label reads as a sentence: it ends in terminal punctuation, or is a comma-joined clause, or runs long. */
function sentenceShaped(slot: string): boolean {
  const n = wordsOf(slot).length;
  return /[.!?]$/.test(slot) || (n >= 5 && slot.includes(",")) || n >= 8;
}

/** Words that open or join a frame without adding content: pronouns, determiners, connectors, prepositions. */
const SCAFFOLD = new Set(("this that these those it they he she we you i there here so thus therefore however because although though while whereas since if when then also and but or yet for example instance first second third next finally lastly in addition moreover furthermore according to by of the a an as who what which why how whom whose not no only even just still now such one both either neither another other each every all some many most more").split(" "));
/** Finite verbs a frame might use to state a claim of its own. */
const FINITE = /^(?:is|are|was|were|has|have|had|does|do|did|can|could|will|would|may|might|must|should|shows?|showed|found|finds?|says?|said|proves?|proved|makes?|made|means?|meant|causes?|caused|leads?|led|helps?|helped|stops?|stopped|walks?|walked|argues?|argued|claims?|claimed|suggests?|suggested|reveals?|revealed|states?|stated|reports?|reported|notes?|noted|explains?|explained|believes?|believed|thinks?|thought|agrees?|agreed|proved|demonstrates?|demonstrated|confirms?|confirmed|reduces?|reduced|increases?|increased)$/;

/** Whether a frame's literal words hold a subject of their own and a finite verb after it, a slot standing for a noun in between (a clause that adds content). */
function addsContent(pattern: string): boolean {
  return pattern.split(/[.!?;,]/).some((clause) => {
    const ws = wordsOf(clause.replace(SLOT, " slot "));
    const v = ws.findIndex((w) => FINITE.test(w));
    return v > 0 && ws.slice(0, v).some((w) => w !== "slot" && !SCAFFOLD.has(w));
  });
}

/** Whether `words` hold a run of FIX_LIMITS.copiedRun or more consecutive words of any of the learner's `sentences`. */
function copiesRun(sentences: string[], words: string[]): boolean {
  const k = FIX_LIMITS.copiedRun, runs = new Set<string>();
  for (const own of sentences.map(wordsOf)) for (let i = 0; i + k <= own.length; i++) runs.add(own.slice(i, i + k).join(" "));
  for (let i = 0; i + k <= words.length; i++) if (runs.has(words.slice(i, i + k).join(" "))) return true;
  return false;
}

/** A note's words that speak about the writing rather than supply it: a piece of a note with none of them is content. */
const ADDRESSES = /\b(?:this|these|those|here|you|your|yours|sentences?|paragraphs?|claims?|points?|evidence|links?|readers?|writers?|words?|opinions?|examples?|sides?|arguments?|reasons?|sources?|numbers?|facts?|connectors?|verbs?|moves?|patterns?|frames?|slots?|turns?|details?|names|naming|checkable|vague|specific|concrete)\b/i;
/** A piece of a note this long that names nothing of the writing reads as a sentence handed over. */
export const SUPPLIED_WORDS = 5;
const QUOTED = /"[^"]*"|“[^”]*”|‘[^’]*’|(?<![a-z0-9])'[^']*'(?![a-z0-9])/gi;

/**
 * Whether a line the model wrote would hand the learner a sentence (C1: teaching, not ghostwriting). One guard for every
 * note: it supplies one when (a) its words hold a run of FIX_LIMITS.copiedRun or more words of any of the learner's
 * `sentences` (the copied-run check cleanFix applies to a pattern, here against the whole text), or (b) outside a quoted
 * frame (quotes around a [slot]) and outside the slots, a piece of it (split at . ! ? ; : so 'Write: ...' is read
 * alone) runs to SUPPLIED_WORDS or more words, is not a question, and names nothing of the writing (ADDRESSES): a
 * complete declarative sentence about the topic, not about the text. Code cannot see every way a model can hand over
 * a sentence; how often one does is L2's count.
 */
export function suppliesSentence(note: string, sentences: string[]): boolean {
  if (copiesRun(sentences, wordsOf(note.replace(SLOT, " ")))) return true;
  const bare = note.replace(QUOTED, (q) => (q.match(SLOT) ? " | " : q)).replace(SLOT, " ");
  return bare.split(/(?<=[.!?;:])\s+|[;:]/).some((piece) => {
    const t = piece.replace(/["“”‘’']/g, " ").trim();
    return !t.endsWith("?") && wordsOf(t).length >= SUPPLIED_WORDS && !ADDRESSES.test(t);
  });
}

/** The note a learner sees: the line as written when it supplies no sentence, else `fallback` (the check's own line, or '' where there is none). */
export function guardNote(note: string, sentences: string[], fallback = ""): string {
  return suppliesSentence(note, sentences) ? fallback : note;
}

// ---- the verdicts: the model observes, code rules ----

/** A sentence over this many words is faulty on the Language lens. Counted by code, never asked of the model. */
export const LONG_SENTENCE_WORDS = 35;
/** The connectors that turn a sentence back on what it conceded: the only words that make an Argument turn real. */
const CONTRAST = new Set(["but", "however", "although", "whereas", "in contrast"]);

/** The connectors that explain what the evidence before them shows: a sentence that closes a paragraph with one is its Explain. */
const EXPLAINS = new Set(["because", "therefore", "since", "which means", "so that", "as a result", "this suggests", "which suggests"]);

/** What the model reports about one sentence, per lens. Nothing here is a verdict. */
export const JOBS = ["claim", "evidence", "link", "context", "none"] as const;
export const SIDES = ["pushes", "against", "wanders", "neutral"] as const;
export const SUPPORTS = ["checkable", "opinion", "context"] as const;
export const ISSUE_KINDS = ["vague", "repeated"] as const;
type Obs = Record<string, unknown>;

const oneOf = <T extends string>(set: readonly T[], v: unknown): v is T => typeof v === "string" && (set as readonly string[]).includes(v);
const wordIn = (word: string, sentence: string) => {
  const w = word.trim().toLowerCase();
  return !!w && (sentence.toLowerCase().match(/[a-z0-9']+/g) ?? [] as string[]).includes(w);
};
const validIssues = (o: Obs, text: string) =>
  (Array.isArray(o.issues) ? o.issues : []).filter((i): i is { kind: string; word: string } =>
    !!i && typeof i === "object" && oneOf(ISSUE_KINDS, (i as Obs).kind) && typeof (i as Obs).word === "string" && wordIn((i as Obs).word as string, text));

/** Whether an observation carries this lens's field with a value it knows. A rewrite with none is a failed run, never a verdict. */
export function observationOk(lens: string, o: unknown): boolean {
  if (!o || typeof o !== "object") return false;
  const x = o as Obs;
  switch (lens) {
    case "argument": return oneOf(SIDES, x.side);
    case "evidence": return oneOf(SUPPORTS, x.support);
    case "language": return Array.isArray(x.issues);
    default: return oneOf(JOBS, x.job);
  }
}

/**
 * The judged sentence numbers, ascending, that have no readable observation. Observations are read as decideVerdicts
 * reads them: the first one with a numeric n wins for that n, and one for a number outside `judged` does not count.
 */
export function unanswered(lens: string, judged: Set<number>, observations: unknown): number[] {
  const first = new Map<number, unknown>();
  for (const o of Array.isArray(observations) ? observations : []) {
    const n = (o as Obs | null)?.n;
    if (o && typeof o === "object" && typeof n === "number" && !first.has(n)) first.set(n, o);
  }
  return [...judged].filter((n) => !observationOk(lens, first.get(n))).sort((x, y) => x - y);
}

/** The line a faulty sentence gets as its note: the check that failed, in its own words. */
const ADULT_CHECKS = {
  unsupported: "This claim has no evidence after it that a reader can check.",
  floating: "This links back to nothing: no evidence comes before it.",
  noTurn: "It takes the other side but never turns back: a turn needs a word like 'but' or 'although'.",
  wanders: "This sentence wanders from the side the paragraph takes.",
  opinion: "This only asserts; nothing here is checkable.",
  unbacked: "No checkable sentence here backs this opinion.",
  long: (words: number) => `This sentence runs to ${words} words; split it.`,
  word: (word: string) => `'${word}' is doing too little here; say what you mean.`,
  repeated: (word: string) => `'${word}' is used again here; say it once or find another word.`,
};

/** The same lines for a learner of 13 or less (rules/voice bandOf): plain words, none a 12-year-old would look up. */
const YOUNG_CHECKS: typeof ADULT_CHECKS = {
  unsupported: "You say this, but nothing after it shows a reader it is true.",
  floating: "This points back to something, but nothing before it shows what.",
  noTurn: "It gives the other side but never comes back to yours: use a word like 'but' or 'although'.",
  wanders: "This sentence drifts away from the side your paragraph takes.",
  opinion: "This says what you think, but gives nothing a reader could check.",
  unbacked: "Nothing here gives a reader a way to check this opinion.",
  long: (words: number) => `This sentence is ${words} words long; cut it into two.`,
  word: (word: string) => `'${word}' does not say much here; say what you really mean.`,
  repeated: (word: string) => `'${word}' is here again; use it once or pick another word.`,
};

const NOTE_LABEL = /^\s*(?:strong|faulty|neutral|weak|good|great|excellent|solid|fine|ok|okay)\s*(?::|[-–—](?=\s))\s*/i;

/** The model's note without a leading verdict label ('Strong: ...'): the verdict is code's, so a note never carries one. Only the leading label goes. */
export function cleanNote(note: string): string {
  const rest = note.replace(NOTE_LABEL, "");
  return rest === note ? note : rest.replace(/^./, (c) => c.toUpperCase());
}

/**
 * The verdicts of a reading, decided here from the model's observations (one per sentence, by number) and the text.
 * The model never says strong or faulty. Only sentences in `judged` get a verdict; an observation for any other
 * number is ignored as a verdict, but still reads as context (a rewrite passes the other sentences' first-pass roles).
 * A sentence gets an entry when it was observed (an observation the lens cannot read is neutral) or when code alone
 * rules it faulty (a Language sentence over LONG_SENTENCE_WORDS). Under a verdict code decided the words are code's:
 * a faulty sentence's note is always the failed check's own line, never the model's; a strong or neutral sentence keeps
 * the model's note only when it supplies no sentence (guardNote), else it has none. A fix rides only on a faulty sentence, through cleanFix.
 *  structure: an observation may carry `supports: n` (evidence, or a claim backing an earlier claim); code accepts n
 *    only when n is another sentence the model observed as a claim, and anything else is no link. A claim is strong
 *    when a marked evidence observation (carrying an EVIDENCE marker) names it, or when a claim that is strong that
 *    way names it (one level, no chains). A claim nothing names is neutral when marked evidence between it and the
 *    next claim carries no accepted link (code cannot tell what that evidence backs), else unsupported: the FIRST
 *    unsupported claim is faulty, later ones neutral. Evidence with a marker is strong; a link with such evidence
 *    before it is strong, with none it is faulty. An accepted link rides on the verdict as `supports`.
 *  argument: pushes strong, wanders faulty, neutral neutral; against is a turn only when turnsBack is true AND the
 *    sentence holds a contrast connector, then strong, else faulty.
 *  evidence: checkable is strong only with an EVIDENCE marker or a number, else neutral. An observation may carry
 *    `backs: n`, the opinion a checkable sentence backs. Decided per paragraph (s.para; one paragraph is one paragraph):
 *    (a) code accepts n only when the support is checkable, n is an integer, not the sentence itself, in the same
 *    paragraph, and observed as opinion; anything else is no link. (b) An opinion a marked checkable sentence names
 *    through an accepted link is backed, so neutral. (c) In a paragraph where a marked checkable sentence carries an
 *    accepted link, an opinion nothing names is neutral when a marked checkable sentence between it and the next
 *    opinion carries no accepted link (code cannot tell what that evidence backs), else unbacked: the FIRST unbacked
 *    opinion among the judged sentences of the paragraph is faulty, later ones neutral. (d) A paragraph with a marked
 *    checkable sentence but no accepted link: every opinion is neutral. (e) A paragraph with no marked checkable
 *    sentence: every opinion is faulty. An accepted link rides on the verdict as `supports`.
 *  language: a vague or repeated word that is really in the sentence is faulty, and so is length over the limit.
 */
export function decideVerdicts(lens: string, sentences: Sentence[], judged: Set<number>, observations: unknown, band: Band = "teen"): VerdictLike[] {
  const CHECKS = band === "young" ? YOUNG_CHECKS : ADULT_CHECKS;
  const by = new Map<number, Obs>();
  for (const o of Array.isArray(observations) ? observations : []) {
    const n = (o as Obs | null)?.n;
    if (o && typeof o === "object" && typeof n === "number" && sentences.some((s) => s.n === n) && !by.has(n)) by.set(n, o as Obs);
  }
  const ok = (n: number) => (observationOk(lens, by.get(n)) ? by.get(n)! : null);
  const marked = (s: Sentence) => EVIDENCE.test(s.text);
  // structure: the link a sentence's observation carries, accepted only when it names another observed claim
  const linkOf = (s: Sentence): number | undefined => {
    if (lens !== "structure") return undefined;
    const o = ok(s.n), t = o?.supports;
    return (o?.job === "evidence" || o?.job === "claim") && typeof t === "number" && Number.isInteger(t) && t !== s.n && ok(t)?.job === "claim" ? t : undefined;
  };
  // evidence: the link a checkable sentence's observation carries, accepted only when it names an opinion of its own paragraph
  const paraOf = (s: Sentence) => s.para ?? 0;
  const backsOf = (s: Sentence): number | undefined => {
    if (lens !== "evidence") return undefined;
    const o = ok(s.n), t = o?.backs, target = typeof t === "number" ? sentences.find((x) => x.n === t) : undefined;
    return o?.support === "checkable" && target && target.n !== s.n && paraOf(target) === paraOf(s) && ok(target.n)?.support === "opinion" ? target.n : undefined;
  };
  const markedChecks = (para: number) => sentences.filter((t) => paraOf(t) === para && ok(t.n)?.support === "checkable" && marked(t));
  const backed = new Set<number>(), unbackedSeen = new Set<number>();
  if (lens === "evidence") for (const t of sentences) { const b = backsOf(t); if (b !== undefined && marked(t)) backed.add(b); }
  // piece: the opening and closing paragraphs of a multi-paragraph piece state and sum up what the body paragraphs prove,
  // so a bare thesis or conclusion is read against the body's marked evidence
  const paras = sentences.map(paraOf), firstPara = Math.min(...paras), lastPara = Math.max(...paras);
  const markedIn = (para: number) => sentences.some((t) => paraOf(t) === para && marked(t) && (lens === "evidence" ? ok(t.n)?.support === "checkable" : ok(t.n)?.job === "evidence"));
  const bodyProves = (s: Sentence) => {
    const p = paraOf(s);
    return lastPara - firstPara >= 2 && (p === firstPara || p === lastPara) && sentences.some((t) => { const q = paraOf(t); return q !== p && markedIn(q); });
  };
  // a sentence after the paragraph's last marked evidence that explains it or links back is its Explain or Link (PEEL), not a bare claim
  const closesAfterEvidence = (s: Sentence) => {
    if (!LINK.test(s.text) && !s.connectors.some((c) => EXPLAINS.has(c))) return false;
    const mine = sentences.filter((t) => paraOf(t) === paraOf(s));
    const proofs = mine.filter((t) => marked(t) && (lens === "evidence" ? ok(t.n)?.support === "checkable" : ok(t.n)?.job === "evidence"));
    return proofs.length > 0 && s.n > proofs[proofs.length - 1].n;
  };
  const named = new Set<number>(), direct = new Set<number>(), strongClaims = new Set<number>();
  if (lens === "structure") {
    for (const s of sentences) { const t = linkOf(s); if (t !== undefined) { named.add(t); if (ok(s.n)?.job === "evidence" && marked(s)) direct.add(t); } }
    for (const t of direct) strongClaims.add(t);
    for (const s of sentences) { const t = linkOf(s); if (t !== undefined && ok(s.n)?.job === "claim" && direct.has(s.n)) strongClaims.add(t); }
  }
  const out: VerdictLike[] = [];
  let unsupportedSeen = false;
  sentences.forEach((s, at) => {
    if (!judged.has(s.n)) return;
    const o = by.get(s.n), read = ok(s.n);
    let verdict: VerdictLike["verdict"] = "neutral", check = "";
    if (read) {
      if (lens === "argument") {
        if (read.side === "pushes") verdict = "strong";
        else if (read.side === "wanders") { verdict = "faulty"; check = CHECKS.wanders; }
        else if (read.side === "against") {
          if (read.turnsBack === true && s.connectors.some((c) => CONTRAST.has(c))) verdict = "strong";
          else { verdict = "faulty"; check = CHECKS.noTurn; }
        }
      } else if (lens === "evidence") {
        if (read.support === "checkable") verdict = marked(s) ? "strong" : "neutral";
        else if (read.support === "opinion") {
          const para = paraOf(s), marks = markedChecks(para);
          if (!marks.length) { if (bodyProves(s)) verdict = "neutral"; else { verdict = "faulty"; check = CHECKS.opinion; } }
          else if (closesAfterEvidence(s) && !backed.has(s.n)) verdict = "neutral";
          else if (backed.has(s.n)) verdict = "neutral";
          // no link in the paragraph: checkable sentences this call judged leave the opinion neutral (code cannot tell what they back);
          // one that is only context (a rewrite's neighbour) backs nothing here, so a rewrite that is still opinion does not hold
          else if (!marks.some((t) => backsOf(t) !== undefined)) {
            if (marks.some((t) => judged.has(t.n))) verdict = "neutral"; else { verdict = "faulty"; check = CHECKS.unbacked; }
          }
          else {
            const rest = sentences.slice(at + 1).filter((t) => paraOf(t) === para), stop = rest.findIndex((t) => ok(t.n)?.support === "opinion");
            const blind = (stop < 0 ? rest : rest.slice(0, stop)).some((t) => marks.includes(t) && backsOf(t) === undefined);
            if (!blind && !unbackedSeen.has(para)) { verdict = "faulty"; check = CHECKS.unbacked; unbackedSeen.add(para); }
          }
        }
      } else if (lens === "language") {
        const bad = validIssues(read, s.text)[0];
        if (bad) { verdict = "faulty"; check = bad.kind === "repeated" ? CHECKS.repeated(bad.word) : CHECKS.word(bad.word); }
      } else if (read.job === "claim") {
        const rest = sentences.slice(at + 1), stop = rest.findIndex((t) => ok(t.n)?.job === "claim");
        const between = stop < 0 ? rest : rest.slice(0, stop);
        const blind = !named.has(s.n) && between.some((t) => ok(t.n)?.job === "evidence" && marked(t) && linkOf(t) === undefined);
        if (strongClaims.has(s.n)) verdict = "strong";
        else if (blind || bodyProves(s) || closesAfterEvidence(s)) verdict = "neutral";
        else if (!unsupportedSeen) { verdict = "faulty"; check = CHECKS.unsupported; unsupportedSeen = true; }
      } else if (read.job === "evidence") verdict = marked(s) ? "strong" : "neutral";
      else if (read.job === "link") {
        if (sentences.slice(0, at).some((t) => ok(t.n)?.job === "evidence" && marked(t))) verdict = "strong";
        else { verdict = "faulty"; check = CHECKS.floating; }
      }
    }
    if (lens === "language" && verdict !== "faulty" && s.words > LONG_SENTENCE_WORDS) { verdict = "faulty"; check = CHECKS.long(s.words); }
    if (!o && verdict === "neutral") return;
    const said = typeof o?.note === "string" ? cleanNote(o.note) : "";
    // every note passes one guard (C1): a note that hands over a sentence falls back to the check's line, or to none
    const note = guardNote(verdict === "faulty" ? check : said, sentences.map((t) => t.text), check);
    const fix = verdict === "faulty" ? cleanFix(o?.fix, sentences.map((t) => t.text)) : undefined;
    const supports = lens === "evidence" ? backsOf(s) : linkOf(s);
    out.push({ n: s.n, verdict, note, ...(fix ? { fix } : {}), ...(supports !== undefined ? { supports } : {}) });
  });
  return out;
}

/** The state of a piece's reading as the desk holds it (session/store EssayAnalysis.piece): 0-based paragraph numbers. `notEnglish` is absent on an older session. */
export interface PieceLike { paragraphs: number; read: number[]; failed: number[]; notEnglish?: number[]; }

/** Whether a piece is still being read: its read, failed and not-English paragraphs number fewer than its paragraphs. */
export function pieceBeingRead(piece: PieceLike | undefined): boolean {
  return !!piece && piece.read.length + piece.failed.length + (piece.notEnglish?.length ?? 0) < piece.paragraphs;
}

/** The summary of a piece that is still being read (E2-b): it counts nothing yet. k is the paragraphs back plus one, at most N. */
export function pieceReadingLine(piece: PieceLike): string {
  const back = piece.read.length + piece.failed.length + (piece.notEnglish?.length ?? 0);
  return `Reading paragraph ${Math.min(back + 1, piece.paragraphs)} of ${piece.paragraphs}.`;
}

/**
 * The one summary of every essay reading, written by code from the verdicts it decided (E9): it reads only the sentences,
 * the verdicts and the piece, never the model's summary. A reading with no sentences has none (''). A piece still being
 * read gets pieceReadingLine (E2-b). A ruled piece is "N of M sentences to fix across P paragraphs.", then a line for each
 * paragraph the desk did not rule, then, when a sentence is faulty, " Start with paragraph p, sentence n: <note>" for the
 * first faulty sentence in sentence order, n numbered as the TV numbers it. One paragraph is "N of M sentences to fix.",
 * then, when N is 1 or more, " Start with sentence n: <note>" for the first faulty sentence (just " Start with sentence n."
 * when its note is empty). With none to fix the head stands alone.
 */
export function summaryLine(a: { sentences?: Pick<Sentence, "n" | "para">[]; verdicts?: Pick<VerdictLike, "n" | "verdict" | "note">[]; piece?: PieceLike }): string {
  const sentences = a.sentences ?? [];
  if (!sentences.length) return "";
  if (pieceBeingRead(a.piece)) return pieceReadingLine(a.piece!);
  const faulty = (a.verdicts ?? []).filter((v) => v.verdict === "faulty");
  const first = sentences.map((s) => faulty.find((v) => v.n === s.n)).find((v) => v), note = first?.note.trim() ?? "";
  if (a.piece) {
    const ruled = ruledSentences(sentences, a.piece).length;
    const head = [`${faulty.length} of ${ruled} sentence${ruled === 1 ? "" : "s"} to fix across ${a.piece.paragraphs} paragraphs.`, ...unruledLines(a.piece)].join(" ");
    const at = first ? sentences.find((s) => s.n === first.n) : undefined;
    return first && at ? `${head} Start with paragraph ${(at.para ?? 0) + 1}, sentence ${first.n}${note ? `: ${note}` : "."}` : head;
  }
  const m = sentences.length, head = `${faulty.length} of ${m} sentence${m === 1 ? "" : "s"} to fix.`;
  return first ? `${head} Start with sentence ${first.n}${note ? `: ${note}` : "."}` : head;
}

/** Whether the run on the desk reads a piece, from what the piece says (still being read) or the run's own start line (EM3-3: the first paragraph of a first piece has no piece on screen yet). */
export function readingAPiece(piece: PieceLike | undefined, start?: string): boolean {
  return pieceBeingRead(piece) || /^reading your piece/.test(start ?? "");
}

/** Where the forensic page is, in the crumb: "Paragraph p of P · Sentence n of N" for a piece, "Sentence n of N" for one paragraph (EM3-1). */
export function forensicPlace(sentences: Pick<Sentence, "n" | "para">[], at: number, piece?: PieceLike): string {
  const here = `Sentence ${sentences[at]?.n} of ${sentences.length}`;
  return piece ? `Paragraph ${(sentences[at]?.para ?? 0) + 1} of ${piece.paragraphs} · ${here}` : here;
}

/**
 * The line the forensic page carries under the crumb (EM3-1): how far a piece has got while it is read, then the sentence to
 * start with once it is ruled, and what "start" means (the earliest faulty one, in reading order). Empty with nothing to fix.
 */
export function forensicLead(a: Parameters<typeof summaryLine>[0]): string {
  const sentences = a.sentences ?? [];
  if (a.piece && pieceBeingRead(a.piece)) return pieceReadingLine(a.piece);
  const faulty = (a.verdicts ?? []).filter((v) => v.verdict === "faulty");
  const first = sentences.map((s) => faulty.find((v) => v.n === s.n)).find((v) => v);
  const at = first ? sentences.find((s) => s.n === first.n) : undefined;
  if (!first || !at) return "";
  return a.piece ? `Start with paragraph ${(at.para ?? 0) + 1}, sentence ${first.n}: the earliest to fix.` : `Start with sentence ${first.n}: the earliest to fix.`;
}

/** Why a sentence cannot be rewritten while the piece it is in is still being read. */
export const REWRITE_WHILE_READING = "The desk is still reading your piece. Rewrite a sentence once every paragraph is read.";

/**
 * One paragraph of a piece, in one word (E4-a): pending for every paragraph while the piece is still being read; then
 * read, not-read (it failed to come back) or not-english (the desk did not read it). A reading with no piece is read.
 */
export type ParagraphState = "pending" | "read" | "not-read" | "not-english";
export function paragraphState(piece: PieceLike | undefined, para: number): ParagraphState {
  if (!piece) return "read";
  if (pieceBeingRead(piece)) return "pending";
  return piece.notEnglish?.includes(para) ? "not-english" : piece.read.includes(para) ? "read" : "not-read";
}

/** Whether a paragraph of a piece is drawn as pending on the TV: only while the piece is still being read. A paragraph that never came back is not read, not pending. */
export function paragraphPending(piece: PieceLike | undefined, para: number): boolean {
  return paragraphState(piece, para) === "pending";
}

const NOT_READ = (para: number) => `Paragraph ${para + 1} did not come back. Send it again from the phone.`;
const NOT_ENGLISH = (para: number) => `Paragraph ${para + 1} is not in English, so the desk did not read it.`;

/** The caption of a sentence whose paragraph the desk did not rule: "Not read" and the paragraph's line; null for any other. */
export function unruledCaption(piece: PieceLike | undefined, para: number): { label: string; text: string } | null {
  const state = paragraphState(piece, para);
  return state === "not-read" ? { label: "Not read", text: NOT_READ(para) } : state === "not-english" ? { label: "Not read", text: NOT_ENGLISH(para) } : null;
}

/**
 * E4-b: why a sentence cannot be rewritten when its paragraph was not ruled - the paragraph's own line (unruledCaption) -
 * or null: a ruled paragraph, a reading with no piece, a sentence number the reading does not have.
 */
export function rewriteUnruledLine(reading: { piece?: PieceLike; sentences: { n: number; para?: number }[] } | null | undefined, n: number): string | null {
  const sn = reading?.sentences.find((x) => x.n === n);
  return sn ? (unruledCaption(reading?.piece, sn.para ?? 0)?.text ?? null) : null;
}

/** Whether the phone offers "send it again": a piece that is done and has a paragraph that did not come back. */
export function pieceAgainOffered(reading: { piece?: PieceLike } | null | undefined): boolean {
  return !!reading?.piece && !pieceBeingRead(reading.piece) && reading.piece.failed.length > 0;
}

/**
 * Why the paragraphs that did not come back cannot be sent again, in the desk's words, or null. Checked in code before
 * any run, in this order: no piece on the desk, the piece still being read, no paragraph failed, and a sentence rewritten
 * (a verdict carries `was`; ruling the piece again would undo it) or a reading that kept no observations.
 */
export function pieceAgainProblem(reading: { piece?: PieceLike & { observed?: unknown[] }; verdicts: Pick<VerdictLike, "was">[] } | null | undefined): string | null {
  const piece = reading?.piece;
  if (!reading || !piece) return "There is no piece on the desk. Read a whole piece from the Essay tab first.";
  if (pieceBeingRead(piece)) return "The desk is still reading your piece. Send the paragraphs that did not come back once every paragraph is read.";
  if (!piece.failed.length) return "No paragraph failed. There is nothing to send again.";
  if (reading.verdicts.some((v) => v.was) || !piece.observed) return "A sentence of the piece was rewritten, so reading some paragraphs again would undo it. Read the whole piece again.";
  return null;
}

/** The sentences of a piece the desk ruled: those of its paragraphs that came back and are English. */
export function ruledSentences<S extends Pick<Sentence, "para">>(sentences: S[], piece: PieceLike | undefined): S[] {
  return sentences.filter((s) => !piece?.notEnglish?.includes(s.para ?? 0) && !piece?.failed.includes(s.para ?? 0));
}

/** What a piece's summary says about each paragraph the desk did not rule, one line per paragraph, in paragraph order. */
export function unruledLines(piece: PieceLike | undefined): string[] {
  const lines = new Map<number, string>();
  for (const k of piece?.failed ?? []) lines.set(k, NOT_READ(k));
  for (const k of piece?.notEnglish ?? []) lines.set(k, NOT_ENGLISH(k));
  return [...lines].sort((x, y) => x[0] - y[0]).map((x) => x[1]);
}

/**
 * The other sentences of a paragraph as the first pass saw them, for a rewrite to be judged against (rules, not a model).
 * Under Structure a sentence whose verdict kept a `supports` link (`kept`, the reading's verdicts) comes back with that
 * link beside its job, so a rewritten claim is ruled against what the evidence named in the first reading. Under Evidence
 * the same kept link comes back as a checkable sentence with `backs`, whatever its first-pass role.
 */
export function contextObservations(lens: string, sentences: Sentence[], except: number, kept: (Pick<VerdictLike, "n" | "supports"> & Partial<Pick<VerdictLike, "note">>)[] = []): Obs[] {
  if (lens !== "structure" && lens !== "evidence") return [];
  return sentences.filter((s) => s.n !== except).flatMap((s): Obs[] => {
    if (lens !== "structure") {
      const own = kept.find((v) => v.n === s.n), backs = own?.supports;
      if (backs !== undefined) return [{ n: s.n, support: "checkable", backs }];
      if (s.role === "evidence") return [{ n: s.n, support: "checkable" }];
      // an opinion the reading ruled (flagged as one, or backed by a kept link) stays an opinion, so a link can resolve to it
      const ruledOpinion = [ADULT_CHECKS.opinion, ADULT_CHECKS.unbacked, YOUNG_CHECKS.opinion, YOUNG_CHECKS.unbacked].includes(own?.note ?? "") || kept.some((v) => v.supports === s.n);
      return ruledOpinion ? [{ n: s.n, support: "opinion" }] : [];
    }
    const link = kept.find((v) => v.n === s.n)?.supports;
    return [{ n: s.n, job: link !== undefined && s.role !== "claim" ? "evidence" : s.role, ...(link !== undefined ? { supports: link } : {}) }];
  });
}

// ---- rewriting one sentence in place ----

/** A reading as the desk holds it (session/store EssayAnalysis), in the shape these rules need. */
export interface VerdictLike { n: number; verdict: "strong" | "faulty" | "neutral"; note: string; fix?: Fix; was?: Was; supports?: number; }
/** The sentence a rewrite replaced, as the paragraph was first read: its text, its verdict and the fix it was taught. */
export interface Was { text: string; verdict: VerdictLike["verdict"]; fix?: Fix; }
export interface ReadingLike { text: string; type: string; sentences: Sentence[]; stats: Record<string, number>; verdicts: VerdictLike[]; summary: string; provider?: string; }

const norm = (t: string) => t.replace(/\s+/g, " ").trim();

/**
 * Sentence `n` of a reading, rewritten by the learner: one sentence in, one out. The new sentence is split,
 * measured and given its first-pass role by the same rule as a paragraph; the numbering stands, the stats are
 * recounted and the text is rebuilt from the sentences. No verdict is decided here. Refused, in the desk's words
 * and before any model is asked: no such sentence, a blank one, two sentences, the same sentence again (up to
 * case and spacing), and one that would run into its neighbour where it stands in the paragraph. Dictated text is
 * tidied first, the way a learner means it: trimmed, a lower-case first letter capitalised, a full stop added when it
 * ends without . ! or ?. The sentence is compared with the old one after that tidy.
 */
export function revise<R extends ReadingLike>(reading: R, n: number, text: string): { ok: true; reading: R } | { ok: false; error: string } {
  const at = Number.isInteger(n) ? reading.sentences.findIndex((s) => s.n === n) : -1;
  if (at < 0) return { ok: false, error: Number.isInteger(n) ? `The paragraph on the desk has no sentence ${n}.` : "Say which sentence: its number on the TV." };
  let t = norm(typeof text === "string" ? text : "");
  if (!t) return { ok: false, error: `Write sentence ${n} first, then send it.` };
  if (/^\p{Ll}/u.test(t)) t = t[0].toUpperCase() + t.slice(1);
  if (!/[.!?]$/.test(t)) t += ".";
  const one = splitSentences(t);
  if (one.length !== 1) return { ok: false, error: `That is ${one.length} sentences. Send sentence ${n} as one sentence.` };
  if (t.toLowerCase() === norm(reading.sentences[at].text).toLowerCase()) return { ok: false, error: `That is sentence ${n} as it was. Change it, then send it.` };
  const sentences = reading.sentences.map((s, i) => (i === at ? { ...one[0], n: s.n, ...(s.para !== undefined ? { para: s.para } : {}) } : s));
  const rebuilt = joinSentences(sentences);
  const again = splitSentences(rebuilt);
  if (again.length !== sentences.length || again.some((s, i) => s.text !== sentences[i].text || s.para !== sentences[i].para))
    return { ok: false, error: `Sentence ${n} would run into the sentence next to it. Start it with a capital letter and end it with a full stop.` };
  return { ok: true, reading: { ...reading, text: rebuilt, sentences, stats: paragraphStats(sentences) } };
}

/** Where a sentence stands after a rewrite: none yet, a rewrite that holds (no longer faulty), or one still faulty. */
export type RewriteState = "none" | "holds" | "still";
export function rewriteState(v: Pick<VerdictLike, "verdict" | "was"> | undefined): RewriteState {
  if (!v?.was) return "none";
  return v.verdict === "faulty" ? "still" : "holds";
}

/**
 * The move a sentence's page teaches: a faulty verdict's own fix, else the lens's playbook move (given); for a
 * rewrite that holds, the move that was taught before it (the one the ink now claims). Null where nothing is taught.
 */
export function taught(v: Pick<VerdictLike, "verdict" | "fix" | "was"> | undefined, playbook: Fix): { fix: Fix; own: boolean } | null {
  const from = v?.verdict === "faulty" ? v.fix : rewriteState(v) === "holds" && v?.was?.verdict === "faulty" ? v.was.fix : null;
  if (from === null) return null;
  const own = cleanFix(from);
  return own ? { fix: own, own: true } : { fix: playbook, own: false };
}

// ---- the plan: a paragraph written from its pattern, one sentence per slot ----

/** One slot of a pattern: its label (the words in the [brackets], as the playbook shows them) and the job its sentence does. */
export interface PlanSlot { label: string; role: Exclude<Role, "context">; }
/** A plan as the desk holds it: the lens it will be read through, and one sentence per slot ("" until written). */
export interface Plan { lens: string; slots: string[]; }

/**
 * The slots of a playbook pattern, in the pattern's order, with the role each one plays. The role is read from the
 * frame words between the slot and the one before it by the same first-pass rule as a sentence's (LINK, then EVIDENCE, else a claim),
 * so a pattern with its slots reordered gives the new order and nothing here is listed by hand.
 */
export function planSlots(play: { pattern: string }): PlanSlot[] {
  const out: PlanSlot[] = [];
  let from = 0;
  for (const m of play.pattern.matchAll(/\[([^[\]]+)\]/g)) {
    const frame = play.pattern.slice(from, m.index).replace(/\[[^[\]]+\]/g, " ").replace(/^[\s,.;:!?]+/, "").trim();
    out.push({ label: m[1], role: LINK.test(frame) ? "link" : EVIDENCE.test(frame) ? "evidence" : "claim" });
    from = m.index + m[0].length;
  }
  return out;
}

/**
 * The learner's sentence for slot `i`, checked by the rules of a one-sentence rewrite (revise): refused, in the desk's
 * words, when blank, over the paragraph cap, still holding a [bracket], more than one sentence, or not a sentence on
 * its own (a capital to begin, a full stop to end), which the joined text needs to split back into its slots. The plan
 * passed in is never changed; an accepted sentence is stored as written, spaces normalised.
 */
export function planFill(plan: Plan, i: number, text: string): { ok: true; plan: Plan } | { ok: false; error: string } {
  if (!Number.isInteger(i) || i < 0 || i >= plan.slots.length) return { ok: false, error: "That slot is not on the plan." };
  const t = norm(typeof text === "string" ? text : "");
  if (!t) return { ok: false, error: `Write slot ${i + 1} first, then send it.` };
  if (/[[\]]/.test(t)) return { ok: false, error: "Leave the [brackets] out. Write the sentence in your own words." };
  const long = essayTooLong(t); if (long) return { ok: false, error: long };
  const one = splitSentences(t);
  if (one.length !== 1) return { ok: false, error: `That is ${one.length} sentences. Send slot ${i + 1} as one sentence.` };
  if (!/^["“„]?\p{Lu}/u.test(t) || !/[.!?]["'”’)]?$/.test(t)) return { ok: false, error: "Start it with a capital and end it with a full stop." };
  return { ok: true, plan: { ...plan, slots: plan.slots.map((x, k) => (k === i ? t : x)) } };
}

/** What a sentence of this role is, said as the comment names it. */
const PLAN_READS: Record<PlanSlot["role"], string> = { claim: "a claim", evidence: "evidence", link: "a link back" };
const PLAN_WANTS: Record<PlanSlot["role"], string> = { claim: "your claim: the side you take", evidence: "your evidence: something a reader can check", link: "your link back: what the evidence shows" };

/**
 * A comment when the sentence in slot `i` reads as another job than the slot's, else null. A comment only: the slot
 * is inked because it is written, never because it fits. A bare sentence cannot open as a link ("This shows" is the
 * pattern's own frame), so a link slot is met by a claim or a link and flagged only for evidence.
 */
export function planFit(slots: PlanSlot[], i: number, text: string): string | null {
  const slot = slots[i], first = splitSentences(norm(text))[0];
  if (!slot || !first || first.role === slot.role) return null;
  if (slot.role === "link" && first.role === "claim") return null;
  return `That reads as ${PLAN_READS[first.role as PlanSlot["role"]]}. This slot wants ${PLAN_WANTS[slot.role]}.`;
}

/** The learner's sentences, in slot order, joined: never a frame word of the pattern. Splits back into exactly the written slots. */
export function planText(plan: Plan): string { return plan.slots.map(norm).filter(Boolean).join(" "); }
