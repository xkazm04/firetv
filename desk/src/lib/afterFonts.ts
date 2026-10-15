/**
 * Run a measure-and-place step again once the web fonts have loaded, after the caller has already run it once with
 * whatever face was there. fonts.ready only settles; if a browser ever rejects it, the first placement stands, so
 * there is nothing more to say or do. One place for that judgment instead of a bare .catch at every caller.
 */
export function afterFonts(fn: () => void): void {
  document.fonts?.ready.then(fn).catch(() => { /* the first placement stands (see above) */ });
}
