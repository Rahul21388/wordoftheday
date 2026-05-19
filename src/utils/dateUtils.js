import { TOTAL_WORDS } from "../data/words";

// Epoch start: 2024-01-01. Determines deterministic "day index".
const EPOCH = new Date(2024, 0, 1).getTime();

function dayIndexFromDate(date) {
  const local = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
  const days = Math.floor((local - EPOCH) / (24 * 60 * 60 * 1000));
  // Avoid negative when device clock is older than epoch.
  return ((days % TOTAL_WORDS) + TOTAL_WORDS) % TOTAL_WORDS;
}

export function getWordIndexForToday() {
  return dayIndexFromDate(new Date());
}

export function getWordIndexForOffset(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return dayIndexFromDate(d);
}

export function getDateForOffset(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

export function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
