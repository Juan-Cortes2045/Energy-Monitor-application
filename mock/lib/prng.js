// Deterministic pseudo-random generator (mulberry32) so mock/seed.js produces
// a byte-identical db.json on every run given the same SEED constant.
// Never use Math.random() anywhere in the mock data pipeline.

export function createPrng(seed) {
  let state = seed >>> 0;
  return function rand() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInt(rand, min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

export function randFloat(rand, min, max, decimals = 2) {
  const value = rand() * (max - min) + min;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function pick(rand, list) {
  return list[randInt(rand, 0, list.length - 1)];
}

export function chance(rand, probability) {
  return rand() < probability;
}

export function shuffle(rand, list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randInt(rand, 0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function randomCode(rand, length, alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += alphabet[randInt(rand, 0, alphabet.length - 1)];
  }
  return code;
}
