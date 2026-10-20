/** The Essay screens' caption words for a reading under way or not read, shared by the lens home and the Workroom (recert-6/L1-helena-46-EM5-3). */
export const READING_LABEL = "Reading";
export const NOT_READ_LABEL = "Not read";
export const READING_PIECE = "The desk is reading your piece, a paragraph at a time. Each one lands here.";

/** The one plain statement, on the lens home and the plan, of what the Essay desk reads (operator ruling 2026-10-20: English only, say so). */
export const ENGLISH_ONLY_STATEMENT = "Essay Master reads English texts.";
/** What a paragraph read as not English adds to its caption, so the outcome ties back to the statement. */
export const NOT_ENGLISH_TIE = `This reads as not English; ${ENGLISH_ONLY_STATEMENT}`;
/** A caption whose paragraph was not read for being not English ends on the statement; any other caption is returned as it is. */
export const tieNotEnglish = <C extends { label: string; text: string } | null>(c: C): C =>
  c && /is not in English, so the desk did not read it\.$/.test(c.text) ? { ...c, text: `${c.text} ${NOT_ENGLISH_TIE}` } : c;
