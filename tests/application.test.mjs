import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { inspectSources } from '../scripts/source-inspection.mjs';
import { flagNames, optionNames, assetRulesSatisfied, validateArtworkManifest, registerRequiredDecoders, inspectGlb } from '../web/artwork/asset-contract.ts';
import { projectRoot } from '../scripts/source-revision.mjs';
import path from 'node:path';
import { solidPanels, majorSegments, minorSegments, radiusRatio } from '../web/artwork/css-geometry.ts';
import { artworkStages, artworkPieceCounts } from '../web/artwork/catalog.ts';

// llm machine contract; claim UUIDv5: 6c16261b-86c7-54d4-9712-99528cd7ca89
// execution UUIDv7 assigned by the report runner; transition: hostile or valid fixture -> checked verdict
test('actual browser validator agrees with compiled Lean over all 4096 assignments', () => {
  const fields = [...flagNames, ...optionNames];
  const inputs = Array.from({ length: 4096 }, (_, bits) => Object.fromEntries(fields.map((name, index) => [name, Boolean(bits & 1 << index)])));
  const result = spawnSync(path.join(projectRoot, '.lake/build/bin/lumenia_boundary'), [],
    { input: inputs.map(value => JSON.stringify(value)).join('\n') + '\n', encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr);
  const answers = result.stdout.trim().split('\n').map(JSON.parse); assert.equal(answers.length, 4096);
  inputs.forEach((input, index) => assert.equal(assetRulesSatisfied(input, input), answers[index].accepted, String(index)));
});
const validManifest = () => ({ artifactIdentifier: '6c16261b-86c7-54d4-9712-99528cd7ca89', resource: '/artworks/orbit.glb',
  sha256: 'a'.repeat(64), stage: 'validated', flags: Object.fromEntries(flagNames.map(name => [name, false])),
  options: Object.fromEntries(optionNames.map(name => [name, true])) });
test('runtime manifest rejects malformed flags, unvalidated stages, unknown keys and external resources', () => {
  assert.ok(validateArtworkManifest(validManifest()));
  for (const mutate of [value => value.flags.usesKtx2 = 'false', value => value.stage = 'optimized',
    value => value.resource = 'https://example.com/other.glb', value => value.resource = '/artworks/../private.glb',
    value => value.unchecked = true, value => delete value.options.keepsExtras,
    value => { value.flags.requiresNamedNodes = true; value.options.keepsNamedNodes = false; },
    value => { value.flags.usesExtensionMeshopt = true; value.flags.usesKhronosMeshopt = true; }]) {
    const value = validManifest(); mutate(value); assert.equal(validateArtworkManifest(value), null);
  }
});
test('decoders activate only for explicit asset flags, including Draco opt-in', async () => {
  for (const expected of [[], ['meshopt'], ['ktx2'], ['draco'], ['ktx2', 'draco']]) {
    const flags = validManifest().flags;
    flags.usesExtensionMeshopt = expected.includes('meshopt'); flags.usesKtx2 = expected.includes('ktx2'); flags.usesDraco = expected.includes('draco');
    const registered = []; await registerRequiredDecoders(flags, Object.fromEntries(['meshopt', 'ktx2', 'draco'].map(name => [name, async () => { registered.push(name); }])));
    assert.deepEqual(registered, expected);
  }
});
test('actual optimized binary declares Meshopt and passes the browser manifest parser', async () => {
  // Rebuild with the existing optimizer/validator instead of relying on ignored local output.
  const fixture = spawnSync(process.execPath, ['scripts/build-artwork.mjs'],
    { cwd: projectRoot, encoding: 'utf8', timeout: 60000 });
  assert.equal(fixture.status, 0, fixture.error?.message ?? fixture.stderr + fixture.stdout);
  const value = JSON.parse(await readFile(new URL('../artifacts/asset-fixtures/orbit.manifest.json', import.meta.url), 'utf8'));
  assert.ok(validateArtworkManifest(value));
  const bytes = await readFile(new URL('../artifacts/asset-fixtures/orbit.glb', import.meta.url));
  assert.equal(inspectGlb(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)).flags.usesExtensionMeshopt, true);
});
test('code gates accept module-scope Plumeria arrays inside a client boundary', () => {
  const sources = new Map([['web/app/page.tsx', `import {Client} from '../Client'; export default function Page(){return <Client/>}`],
    ['web/Client.tsx', `'use client'; import * as css from '@plumeria/core'; import {useState} from 'react'; const styles=css.create({box:{color:'red'}}); export function Client(){const [value,setValue]=useState(0);return <button classStyle={[styles.box]} onClick={()=>setValue(value+1)}>{value}</button>}`]]);
  assert.deepEqual(inspectSources(sources).issues, { plumeriaScope: [], plumeriaComposition: [], staticExport: [], componentBoundary: [] });
});

// llm machine contract; claim UUIDv5: e9194426-a204-577c-9758-7bfe9644b8fc
// execution UUIDv7: 01a0a324-741b-715a-be47-5cd2936becb7; transition: framework link -> explicit static application capability
test('framework links work in server and client pages without admitting unknown framework modules', () => {
  for (const directive of ['', "'use client';"]) {
    const source = `${directive} import Link from 'next/link'; export default function Page(){return <Link href='/records/'>Records</Link>}`;
    const inspect = code => inspectSources(new Map([['web/app/page.tsx', code]])).issues;
    assert.deepEqual(inspect(source), { plumeriaScope: [], plumeriaComposition: [], staticExport: [], componentBoundary: [] });
    assert.ok(inspect(source.replace('next/link', 'next/unclassified')).componentBoundary.length);
  }
});
test('code gates distinguish literal object keys from browser access', () => {
  const inspect = code => inspectSources(new Map([['web/app/page.tsx', code]])).issues.componentBoundary;
  assert.deepEqual(inspect('export const styles = { window: { color: "red" }, document: {} };'), []);
  for (const code of ['export const value = { window };', 'export const value = { key: window };',
    'export const value = { [window.name]: 1 };', 'export const value = window.document;'])
    assert.ok(inspect(code).length > 0, code);
});
test('code gates reject nested create, className, nonarray styles, server events and transitive browser access', () => {
  const sources = new Map([['web/app/page.tsx', `import * as styles from '@plumeria/core'; import {read} from '../helper'; export default function Page(){const s=styles.create({a:{color:'red'}});return <button className='x' classStyle={s.a} onClick={read}/>}`],
    ['web/helper.ts', `export const read=()=>window.localStorage.getItem('x')`]]);
  const issues = inspectSources(sources).issues;
  assert.ok(issues.plumeriaScope.length); assert.equal(issues.plumeriaComposition.length, 2); assert.ok(issues.componentBoundary.length >= 2);
});
test('code gates reject request-time server functions and nonliteral imports', () => {
  const issues = inspectSources(new Map([['web/app/page.tsx', `import {cookies as readCookies} from 'next/headers'; export const revalidate=30; export default async function Page(){await import(getName());return readCookies()}`]])).issues;
  assert.equal(issues.staticExport.length, 2); assert.ok(issues.componentBoundary.length);
});
test('Plumeria namespace aliases and opaque JSX props cannot bypass code gates', () => {
  const issues = inspectSources(new Map([['web/app/page.tsx', `import * as css from '@plumeria/core'; const alias=css; export default function Page(){alias.create({a:{color:'red'}});return <div {...props}/>} `]])).issues;
  assert.ok(issues.plumeriaScope.length); assert.ok(issues.componentBoundary.length);
});

test('Plumeria keyframes must be module-level constants just like style declarations', () => {
  const source = `import * as css from '@plumeria/core'; const motion=css.keyframes({from:{transform:'rotate(0turn)'},to:{transform:'rotate(1turn)'}}); const styles=css.create({shape:{animationName:motion}}); export default function Page(){return <div classStyle={[styles.shape]}/>}`;
  assert.deepEqual(inspectSources(new Map([['web/app/page.tsx', source]])).issues.plumeriaScope, []);
  const nested = source.replace('const motion=', 'function nested(){const motion=').replace('; const styles=', '; return motion;} const styles=');
  assert.ok(inspectSources(new Map([['web/app/page.tsx', nested]])).issues.plumeriaScope.length);
});

test('line artwork uses HTML border rings and has no vector or canvas drawing implementation', async () => {
  const component = await readFile(new URL('../web/components/CssArtwork.tsx', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../web/components/CssArtwork.styles.ts', import.meta.url), 'utf8');
  const contract = JSON.parse(await readFile(new URL('../contracts/css-line-artwork.json', import.meta.url), 'utf8'));
  assert.equal(contract.ringCount, 48);
  assert.match(styles, /css\.keyframes\(/); assert.match(styles, /borderRadius: '50%'/);
  assert.doesNotMatch(component, /<(svg|canvas|img)\b|orbitPaths|orbitCoordinates|setInterval\(|setTimeout\(/);
  assert.equal((component.match(/requestAnimationFrame\(/g) ?? []).length, 2);
  assert.match(component, /secondPresentation = requestAnimationFrame\(\(\) => \{/);
  assert.doesNotMatch(styles, /\$\{(?:angle|horizontal|vertical)\}(?:deg|rad)/);
});

test('CSS diagonal circles satisfy the torus equation at sampled points', async () => {
  const styles = await readFile(new URL('../web/components/CssArtwork.styles.ts', import.meta.url), 'utf8');
  const ratio = Number(styles.match(/\* (0\.\d+)\)\) rotateY/)?.[1]);
  const tilt = Number(styles.match(/rotateY\(-([\d.]+)deg\)/)?.[1]) * Math.PI / 180;
  assert.ok(Number.isFinite(ratio) && Number.isFinite(tilt));
  assert.ok(Math.abs(ratio - 0.7 / 1.62) < 1e-14);
  for (let index = 0; index < 192; index++) {
    const angle = index * Math.PI / 96;
    const x = Math.cos(tilt) * Math.cos(angle), y = ratio + Math.sin(angle), z = Math.sin(tilt) * Math.cos(angle);
    const residual = (x*x + y*y + z*z + 1 - ratio*ratio) ** 2 - 4 * (x*x + y*y);
    assert.ok(Math.abs(residual) < 1e-12, String(residual));
  }
});

test('all artwork kinds use CSS and the solid consists of finite torus panels', () => {
  assert.deepEqual(artworkStages, ['empty', 'css', 'surface', 'solid']);
  assert.equal(solidPanels.length, majorSegments * minorSegments);
  assert.equal(solidPanels.length, artworkPieceCounts.solid);
  assert.equal(new Set(solidPanels.map(panel => panel.transform)).size, solidPanels.length);
  for (const panel of solidPanels) {
    assert.ok(Math.abs((panel.radial - 1) ** 2 + panel.depth ** 2 - radiusRatio ** 2) < 1e-12);
    assert.ok(Math.abs(panel.normal.reduce((sum, value) => sum + value * value, 0) - 1) < 1e-12);
    assert.doesNotMatch(panel.transform + panel.width + panel.height + panel.color, /NaN|Infinity|undefined/);
    const widthCoefficient = Number(panel.width.match(/\* ([0-9.]+)\)/)?.[1]);
    const outerEdge = panel.radial + Math.abs(panel.depth) * Math.tan(Math.PI / minorSegments);
    assert.ok(widthCoefficient / (2 * Math.tan(Math.PI / majorSegments)) > outerEdge,
      'The panel must cover the outer edge of the cell, including its seam overlap.');
  }
});

test('shared controls have no drawing loop or graphics dependency', async () => {
  const controls = await readFile(new URL('../web/components/ArtworkExperience.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(controls, /requestAnimationFrame|setInterval|setTimeout|three-artwork|orbitCoordinates|<canvas|<svg/);
});
