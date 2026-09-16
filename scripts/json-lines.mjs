import { readFile, writeFile } from 'node:fs/promises';

// machine contract: UTF-8 records -> one JSON value per line; invalid lines -> rejected.
// Source: https://jsonlines.org/ . Protocol messages and required tool settings keep their own formats.
export function parseJsonLines(text) {
  if (text.startsWith('\uFEFF')) throw new Error('JSON Lines must not contain a byte order mark.');
  if (!text) return [];
  const lines = text.replace(/\n$/, '').split('\n');
  return lines.map((line, index) => {
    try { return JSON.parse(line); }
    catch { throw new Error(`Invalid JSON Lines record at line ${index + 1}.`); }
  });
}
export function serializeJsonLines(records) {
  return records.map(record => {
    const text = JSON.stringify(record);
    if (text === undefined) throw new Error('A record must be a JSON value.');
    return text + '\n';
  }).join('');
}
export const readJsonLines = async file => parseJsonLines(await readFile(file, 'utf8'));
export const writeJsonLines = (file, records) => writeFile(file, serializeJsonLines(records));
