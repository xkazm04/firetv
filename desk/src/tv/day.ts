/** A day, in the words a person would use. Calendar days, not elapsed hours. */
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function day(at: number): string {
  const d = new Date(at), mid = (t: Date) => Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());
  const n = Math.round((mid(new Date()) - mid(d)) / 86400000);
  return n <= 0 ? "Today" : n === 1 ? "Yesterday" : n < 7 ? DAYS[d.getDay()] : `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
