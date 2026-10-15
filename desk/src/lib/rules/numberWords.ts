/**
 * The one closed table of number words, for the leak checks only (X1b).
 *
 * English and Czech cardinals from zero to twenty and the tens to a hundred; fraction words from half to
 * twentieths, English and Czech, singular and plural. Czech is read with and without diacritics and in its gender
 * forms (jeden, jedna, jedno; dva, dve). `figuresOfCzech` turns Czech number words into figures ('tri trinactiny'
 * is 3/13) so a leak check compares figures, whatever the model wrote.
 *
 * A check, a settle or a marking path never takes a figure from this file. One gate that can only REFUSE a settle
 * (saidValue.ts, X5) reads it. Words still never settle on their own (X1c): a learner who says 'three quarters' or
 * 'tri ctvrtiny' still settles nothing.
 */

/** Zero to twenty and the tens to ninety, in English. */
export const EN_CARD: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};

/** English fraction words as a denominator (singular; the plural drops an 's', 'halves' is its own). */
export const EN_ORD: Record<string, number> = {
  half: 2, third: 3, quarter: 4, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12,
  thirteenth: 13, fourteenth: 14, fifteenth: 15, sixteenth: 16, seventeenth: 17, eighteenth: 18, nineteenth: 19, twentieth: 20,
  thirtieth: 30, fortieth: 40, fiftieth: 50, sixtieth: 60, seventieth: 70, eightieth: 80, ninetieth: 90, hundredth: 100,
};

/** Czech with its diacritics folded off: 'třináctiny' is 'trinactiny'. */
export const fold = (s: string): string => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Czech cardinals, folded: the gender forms of one and two included. */
const CS_CARD: Record<string, number> = {
  nula: 0, jeden: 1, jedna: 1, jedno: 1, dva: 2, dve: 2, tri: 3, ctyri: 4, pet: 5, sest: 6, sedm: 7, osm: 8, devet: 9, deset: 10,
  jedenact: 11, dvanact: 12, trinact: 13, ctrnact: 14, patnact: 15, sestnact: 16, sedmnact: 17, osmnact: 18, devatenact: 19, dvacet: 20,
  tricet: 30, ctyricet: 40, padesat: 50, sedesat: 60, sedmdesat: 70, osmdesat: 80, devadesat: 90, sto: 100,
};
const CS_TENS = new Set(["dvacet", "tricet", "ctyricet", "padesat", "sedesat", "sedmdesat", "osmdesat", "devadesat"]);

/** Czech fraction words, folded, singular and plural: polovina, poloviny, polovin ... dvacetina, dvacetiny, dvacetin. */
const CS_ORD: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  for (const e of ["a", "y", ""]) out[`polovin${e}`] = 2;
  const stems: [string, number][] = [
    ["tret", 3], ["ctvrt", 4], ["pet", 5], ["sest", 6], ["sedm", 7], ["osm", 8], ["devit", 9], ["deset", 10], ["jedenact", 11],
    ["dvanact", 12], ["trinact", 13], ["ctrnact", 14], ["patnact", 15], ["sestnact", 16], ["sedmnact", 17], ["osmnact", 18],
    ["devatenact", 19], ["dvacet", 20],
  ];
  for (const [stem, d] of stems) for (const e of ["ina", "iny", "in"]) out[`${stem}${e}`] = d;
  return out;
})();
const own = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);

/**
 * The line with its Czech number words as figures: 'tři třináctiny' is 3/13, 'dvacet jedna' is 21, a lone singular
 * fraction word ('polovina') is 1/2. The rest of the line is left as it was written.
 */
export function figuresOfCzech(line0: string): string {
  // a figure before a fraction word ('3 trinactiny') first
  const line = line0.replace(/(\d+)\s+(\p{L}+)/gu, (m, n: string, w: string) => (own(CS_ORD, fold(w.toLowerCase())) ? `${n}/${CS_ORD[fold(w.toLowerCase())]}` : m));
  const toks = [...line.matchAll(/\p{L}+/gu)].map((m) => ({ w: fold(m[0].toLowerCase()), s: m.index ?? 0, e: (m.index ?? 0) + m[0].length }));
  const near = (i: number) => i + 1 < toks.length && /^\s+$/.test(line.slice(toks[i].e, toks[i + 1].s));
  let out = "", from = 0;
  for (let i = 0; i < toks.length;) {
    const w = toks[i].w;
    let n: number | null = null, j = i + 1;
    if (own(CS_CARD, w)) {
      n = CS_CARD[w];
      if (CS_TENS.has(w) && near(i) && own(CS_CARD, toks[i + 1].w) && CS_CARD[toks[i + 1].w] >= 1 && CS_CARD[toks[i + 1].w] <= 9) { n += CS_CARD[toks[i + 1].w]; j = i + 2; }
    }
    let rep: string | null = null;
    if (n !== null) {
      if (near(j - 1) && own(CS_ORD, toks[j].w)) { rep = `${n}/${CS_ORD[toks[j].w]}`; j++; }
      else rep = String(n);
    } else if (own(CS_ORD, w) && (w.endsWith("ina") || w === "polovina")) rep = `1/${CS_ORD[w]}`;
    if (rep === null) { i++; continue; }
    out += line.slice(from, toks[i].s) + rep;
    from = toks[j - 1].e;
    i = j;
  }
  return out + line.slice(from);
}

/** The one English word the closed tables above lack: 'nought' is 0. */
const EN_NOUGHT = new Set(["nought", "naught"]);
const enNum = (w: string): number | null => own(EN_CARD, w) ? EN_CARD[w] : EN_NOUGHT.has(w) ? 0 : null;
/** An English fraction word as a denominator: 'third', 'thirds', 'halves'. */
const enFrac = (w: string): number | null => own(EN_ORD, w) ? EN_ORD[w] : w === "halves" ? 2 : w.endsWith("s") && own(EN_ORD, w.slice(0, -1)) ? EN_ORD[w.slice(0, -1)] : null;

/**
 * The line with its English number words as figures: 'thirty-five' is 35, 'eleven twelfths' is 11/12, '3 quarters' is 3/4,
 * 'a quarter' and a lone 'half' are 1/4 and 1/2, 'nought' is 0, and digit words after 'point' make one decimal
 * ('seven point one five' is 7.15). The rest of the line is left as it was written.
 */
export function figuresOfEnglish(line: string): string {
  const toks = [...line.matchAll(/\d+|\p{L}+/gu)].map((m) => ({ w: m[0].toLowerCase(), s: m.index ?? 0, e: (m.index ?? 0) + m[0].length }));
  const near = (i: number) => i >= 0 && i + 1 < toks.length && /^[\s-]+$/.test(line.slice(toks[i].e, toks[i + 1].s));
  let out = "", from = 0;
  for (let i = 0; i < toks.length;) {
    const w = toks[i].w;
    let rep: string | null = null, j = i + 1;
    if (/^\d/.test(w)) {
      const d = near(i) ? enFrac(toks[i + 1].w) : null;
      if (d !== null) { rep = `${w}/${d}`; j = i + 2; }
    } else {
      let n = enNum(w);
      if (n !== null) {
        if (n >= 20 && n % 10 === 0 && near(i)) {
          const u = enNum(toks[i + 1].w);
          if (u !== null && u >= 1 && u <= 9) { n += u; j = i + 2; }
        }
        if (near(j - 1) && toks[j].w === "point") {
          let k = j + 1, ds = "";
          while (k < toks.length && near(k - 1)) {
            const u = enNum(toks[k].w);
            if (u === null || u > 9) break;
            ds += u; k++;
          }
          if (ds) { rep = `${n}.${ds}`; j = k; }
        }
        if (rep === null) {
          const d = near(j - 1) ? enFrac(toks[j].w) : null;
          if (d !== null) { rep = `${n}/${d}`; j++; } else rep = String(n);
        }
      } else if (w === "a" && near(i) && own(EN_ORD, toks[i + 1].w)) { rep = `1/${EN_ORD[toks[i + 1].w]}`; j = i + 2; }
      else if (w === "half") rep = "1/2";
    }
    if (rep === null) { i++; continue; }
    out += line.slice(from, toks[i].s) + rep;
    from = toks[j - 1].e;
    i = j;
  }
  return out + line.slice(from);
}
