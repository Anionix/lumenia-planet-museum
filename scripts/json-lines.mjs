import { readFile, writeFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';

// machine contract: UTF-8 records -> one JSON value per line; invalid lines -> rejected.
// Source: https://jsonlines.org/ . Protocol messages and required tool settings keep their own formats.
export function parseJsonLines(text) {
  if (text instanceof Uint8Array) text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(text);
  if (typeof text !== 'string') throw new TypeError('JSON Lines requires text or UTF-8 bytes.');
  if (text.startsWith('\uFEFF')) throw new Error('JSON Lines must not contain a byte order mark.');
  if (!text) return [];
  const lines = text.replace(/\n$/, '').split('\n');
  return lines.map((line, index) => {
    try { return JSON.parse(line); }
    catch { throw new Error(`Invalid JSON Lines record at line ${index + 1}.`); }
  });
}

export function serializeJsonLines(records) {
  if (!Array.isArray(records)) throw new TypeError('JSON Lines records must be an array.');
  return Array.from(records, record => {
    const text = JSON.stringify(record);
    if (text === undefined || !isDeepStrictEqual(JSON.parse(text), record))
      throw new TypeError('A record must retain its value and structure as JSON.');
    return text + '\n';
  }).join('');
}
export const readJsonLines = async file => parseJsonLines(await readFile(file));
export const writeJsonLines = (file, records) => writeFile(file, serializeJsonLines(records));
