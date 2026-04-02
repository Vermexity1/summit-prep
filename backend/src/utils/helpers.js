export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function choice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle(items) {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

export function sampleWithoutReplacement(items, count) {
  return shuffle(items).slice(0, count);
}

export function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function createId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function formatSeconds(seconds = 0) {
  const safe = Math.max(seconds, 0);
  const minutes = Math.floor(safe / 60);
  const remainingSeconds = safe % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export function round(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function normalizeAnswer(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function mean(values = []) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function groupBy(items, keySelector) {
  return items.reduce((groups, item) => {
    const key = keySelector(item);
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
  }, {});
}

export function createHttpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}
