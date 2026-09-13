import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { sourceManifest, projectRoot } from './source-revision.mjs';
import { sourceManifest as mathematicsManifest, digest as mathematicsDigest } from '../planetarium/lib/revision.mjs';
import { claimIdentifier, uuidVersionSeven } from './identifiers.mjs';
import { outputManifest } from './build-web.mjs';
import { inspectCharacterAsset } from './inspect-character-asset.mjs';

// llm machine contract; claimIdentifier: 63c605f5-9e47-5b49-949f-cad7ce96b4ed
// executionIdentifier: fresh UUIDv7 below, recorded in every observation.
// transition: intent -> specification -> proof report -> source-bound integration report -> local attachments.
// Attachment publication is local only; it does not authorize deployment or certify artistic/historical truth.
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
export function aggregateIntegrationStatus(statuses) {
  if (!statuses.length || statuses.some(value => !['pass', 'fail', 'blocked', 'staleEvidence'].includes(value))) return 'blocked';
  return ['fail', 'staleEvidence', 'blocked'].find(value => statuses.includes(value)) ?? 'pass';
}
export async function publishMaterialSphereEvidence() {
  const current = await sourceManifest(), mathematics = await mathematicsManifest();
  const executionIdentifier = uuidVersionSeven(), gates = [], attachments = [];
  const read = async relative => JSON.parse(await readFile(path.join(projectRoot, relative), 'utf8'));
  const bridge = await read('reports/material-sphere-bridge.json');
  const mathematicalGates = await read('planetarium/reports/gate-report.json');
  const build = await read('reports/web-build-evidence.json');
  const application = await read('reports/application-report.json');
  const character = await inspectCharacterAsset(path.join(projectRoot, 'web/out'));
  const add = (name, status, value, limit, unit, tools, reason, sourceRevision = current.sourceRevision) => gates.push({
    gateName: name, gateIdentifier: claimIdentifier('Lumenia.PlanetMuseum.' + name), executionIdentifier,
    sourceRevision, status, observation: { value, limit, unit }, tools,
    failureReason: status === 'pass' ? null : reason,
  });
  const required = mathematicalGates.gates.filter(gate => !['MaterialSphereBrowserRendering', 'PlumeriaBuildRuntimeRemoval'].includes(gate.gateName));
  const mathematicalProblems = Math.abs(required.length - 10) + required.filter(gate => gate.status !== 'pass').length;
  add('MathematicalPrerequisites', mathematicalGates.sourceRevision !== mathematics.sourceRevision ? 'staleEvidence' : mathematicalProblems ? 'fail' : 'pass',
    mathematicalProblems, 0, 'violations', ['current mathematics manifest', 'original gate report'], 'Mathematical evidence is stale or incomplete', mathematics.sourceRevision);
  let changedOutputs = 0;
  for (const output of bridge.outputs) {
    if (mathematicsDigest(await readFile(path.join(projectRoot, output.file))) !== output.digest) changedOutputs++;
  }
  add('GeneratedBridgeIntegrity', bridge.sourceRevision !== mathematics.sourceRevision ? 'staleEvidence' : changedOutputs ? 'fail' : 'pass',
    changedOutputs, 0, 'changedFiles', ['SHA-256 of every generated bridge output'], 'Generated application input differs from its mathematical bridge');
  const outputCurrent = build.state === 'built' && JSON.stringify(await outputManifest()) === JSON.stringify(build.outputs);
  const applicationCurrent = build.sourceRevision === current.sourceRevision && application.sourceRevision === current.sourceRevision && outputCurrent;
  add('ApplicationBuildAndCodeInspection', !applicationCurrent ? 'staleEvidence' : application.status,
    application.observations.filter(item => item.status !== 'pass').length, 0, 'nonPassingGates',
    ['Next.js production build', 'application report', 'exported output digests'], 'Build or application inspection is incomplete, failed, or stale');
  add('CharacterAdmission', character.status, character.status === 'pass' ? 0 : null, 0, 'violations',
    ['character receipt admission', 'image and evidence digests'], character.failureReason);
  add('CurrentBuildBrowserVerification', 'blocked', null, 0, 'violations', ['browser observation receipt required'],
    'No complete browser observation receipt is attached to this exact application revision');
  add('FourBrowserPerformanceVerification', 'blocked', null, 0, 'violations', ['Chrome, Safari, Firefox, Edge measurement receipts required'],
    'Four-browser and performance acceptance has not been completed');
  const predecessorFiles = ['verification/planet-museum-intent.md', 'verification/planet-museum-spec.md', 'planetarium/reports/proof-report.json'];
  const predecessors = await Promise.all(predecessorFiles.map(async file => ({ file, sha256: digest(await readFile(path.join(projectRoot, file))) })));
  const directory = path.join(projectRoot, 'web/out/evidence/material-sphere');
  await mkdir(directory, { recursive: true });
  for (const name of ['proof-report.json', 'wolfram-receipt.json']) {
    const bytes = await readFile(path.join(projectRoot, 'planetarium/reports', name));
    await writeFile(path.join(directory, name), bytes);
    attachments.push({ file: name, sha256: digest(bytes), scope: 'Original mathematics receipt; inspect its own source revision' });
  }
  await writeFile(path.join(directory, 'rendering-plans.json'), JSON.stringify({ sourceRevision: bridge.sourceRevision, plans: bridge.plans }, null, 2) + '\n');
  const report = { artifactIdentifier: bridge.artifactIdentifier, executionIdentifier, recordedAt: new Date().toISOString(),
    sourceRevision: current.sourceRevision, mathematicsSourceRevision: mathematics.sourceRevision,
    status: aggregateIntegrationStatus(gates.map(gate => gate.status)), predecessors, attachments, gates,
    rendererBranches: bridge.rendererBranches,
    machineContract: { state: 'inspected', transition: 'source-bound evidence -> local report; missing checks remain blocked' },
    limitations: ['Local report, not a deployment receipt', 'Character image is not Material Sphere raster conversion',
      'Artistic quality and historical interpretation are not mathematical conclusions'] };
  if ((await sourceManifest()).sourceRevision !== current.sourceRevision || (await mathematicsManifest()).sourceRevision !== mathematics.sourceRevision)
    throw new Error('Source changed while publishing integration evidence');
  const json = JSON.stringify(report, null, 2) + '\n';
  await writeFile(path.join(projectRoot, 'reports/material-sphere-integration-report.json'), json);
  await writeFile(path.join(directory, 'integration-report.json'), json);
  const markdown = `---\ntitle: Lumenia Planet Museum integration report\nclaim_identifier: ${report.artifactIdentifier}\nexecution_identifier: ${executionIdentifier}\nstate: ${report.status}\n---\n\n# Integration report\n\nSource: ${current.sourceRevision}\n\n| Gate | Status | Observation | Limit | Reason |\n| --- | --- | --- | --- | --- |\n` +
    gates.map(gate => `| ${gate.gateName} | ${gate.status} | ${gate.observation.value ?? 'unmeasured'} ${gate.observation.unit} | ${gate.observation.limit} | ${gate.failureReason ?? 'none'} |`).join('\n') +
    '\n\nFull identifiers, tools, predecessor digests, and separate mathematical revision: [JSON report](material-sphere-integration-report.json).\n';
  await writeFile(path.join(projectRoot, 'reports/material-sphere-integration-report.md'), markdown);
  return report;
}
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const result = await publishMaterialSphereEvidence();
  console.log(JSON.stringify({ status: result.status, sourceRevision: result.sourceRevision,
    gates: result.gates.map(gate => ({ name: gate.gateName, status: gate.status })) }));
}
