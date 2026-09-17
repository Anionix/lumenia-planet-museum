import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { sourceManifest, digest, planetariumRoot } from '../planetarium/lib/revision.mjs';
import { compileMaterialSphere, plumeriaSource } from '../planetarium/lib/material-sphere.mjs';
import { claimIdentifier } from './identifiers.mjs';
import { projectRoot } from './source-revision.mjs';
import { ESLint } from 'eslint';

// llm machine contract; claim UUIDv5: 63c605f5-9e47-5b49-949f-cad7ce96b4ed
// execution UUIDv7: 01a09ad3-4fb7-78b0-bbc0-77a8f7eb5016
// transition: current verified mathematics -> reproducible application inputs; stale evidence -> rejected.
// No edits to the independently verified package. Generated files are never hand-maintained.
export async function formatMaterialSphereSchemas(profiles, report) {
  const source = plumeriaSource(profiles, report);
  const [formatted] = await new ESLint({ cwd: projectRoot, fix: true }).lintText(source,
    { filePath: path.join(projectRoot, 'web/components/MaterialSphere.generated.styles.ts') });
  assert.equal(formatted.errorCount + formatted.warningCount, 0, 'Generated Plumeria schema diagnostics');
  return formatted.output ?? source;
}
export async function connectPlanetarium() {
  const read = async name => JSON.parse(await readFile(path.join(planetariumRoot, name), 'utf8'));
  const manifest = await sourceManifest();
  const [knowledge, report, declarations] = await Promise.all([
    read('knowledge.json'), read('reports/gate-report.json'), read('generated/declarations.json'),
  ]);
  assert.equal(report.sourceRevision, manifest.sourceRevision, 'Material Sphere evidence is stale');
  const required = report.gates.filter(gate => !['MaterialSphereBrowserRendering', 'PlumeriaBuildRuntimeRemoval'].includes(gate.gateName));
  assert.equal(required.length, 10);
  assert.ok(required.every(gate => gate.status === 'pass'), 'Material Sphere prerequisite gate failed');
  const declarationList = Array.isArray(declarations) ? declarations : declarations.declarations;
  const header = `// llm machine contract; claim UUIDv5: 63c605f5-9e47-5b49-949f-cad7ce96b4ed\n// execution UUIDv7: ${report.executionIdentifier}\n// mathematics source revision: ${manifest.sourceRevision}\n// state: generated; transition: verified package -> static application input.\n`;
  const profiles = knowledge.profiles.map(profile => ({
    ...profile,
    slug: profile.componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
    name: profile.title.replace(' — Material Sphere', ''),
    facts: profile.sourceClaimIdentifiers.map(identifier => {
      const claim = knowledge.claims.find(item => item.claimIdentifier === identifier);
      assert.ok(claim);
      return { claimIdentifier: identifier, claimDefinitionIdentifier: claim.claimDefinitionIdentifier,
        statement: claim.object.statement, sources: claim.evidenceIdentifiers.map(evidenceIdentifier => {
          const evidence = knowledge.evidence.find(item => item.evidenceIdentifier === evidenceIdentifier);
          const source = knowledge.sources.find(item => item.sourceIdentifier === evidence?.sourceIdentifier);
          assert.ok(source && source.url.startsWith('https://'));
          return { title: source.title, url: source.url, sourceIdentifier: source.sourceIdentifier };
        }) };
    }),
    proofs: profile.proofTargets.map(name => {
      const declaration = declarationList.find(item => item.name === name);
      assert.ok(declaration, name);
      return declaration;
    }),
  }));
  const recipes = knowledge.profiles.map(compileMaterialSphere);
  const rendererBranches = [
    ['plumeriaCss', 'Plumeria / CSS', 'connected'],
    ['rasterImage', '画像', 'notConnected'],
    ['scalableVectorGraphics', 'SVG', 'notConnected'],
    ['canvasTwoDimensional', 'Canvas', 'notConnected'],
    ['threeDimensionalScene', 'Three.js', 'notConnected'],
  ].map(([renderer, label, availability]) => ({ renderer, label, availability,
    rendererIdentifier: claimIdentifier('Lumenia.MaterialSphereRenderer.' + renderer),
    projectionPolicy: 'firstTwoSpatialAxes',
    limitation: availability === 'connected' ? 'ブラウザーごとの検査は別に必要です。' : '変換処理と表示検査は未接続です。CSSとの見た目の一致も未検証です。',
  }));
  const bridge = { artifactIdentifier: knowledge.artifactIdentifier, sourceRevision: manifest.sourceRevision,
    executionIdentifier: report.executionIdentifier, profileCount: profiles.length,
    theoremCount: report.gates.find(gate => gate.gateName === 'LeanTransitiveAxioms').observation.theorems,
    transitiveAxiomCount: 0, rendererBranches };
  const outputs = new Map([
    ['web/artwork/material-sphere-catalog.ts', header + `export const materialSphereCatalog = ${JSON.stringify(profiles, null, 2)} as const;\nexport const materialSphereEvidence = ${JSON.stringify(bridge, null, 2)} as const;\n`],
    ['web/components/MaterialSphere.generated.styles.ts', await formatMaterialSphereSchemas(knowledge.profiles, report)],
  ]);
  let component = header + `import '@plumeria/core';\nimport { materialSphereStyles } from './MaterialSphere.generated.styles';\nimport { sphereMotionStyles } from './MaterialSphere.styles';\n\nexport function MaterialSphereArtwork({ profileIdentifier }: { profileIdentifier: string }) {\n  switch (profileIdentifier) {\n`;
  profiles.forEach((profile, index) => {
    const name = profile.componentName;
    component += `    case ${JSON.stringify(profile.profileIdentifier)}: return <div data-material-sphere=${JSON.stringify(profile.profileIdentifier)} classStyle={[materialSphereStyles.${name}Sphere, sphereMotionStyles.inheritedTiming]}>\n      <div data-material-pattern="true" classStyle={[sphereMotionStyles.pattern]}>\n`;
    recipes[index].layers.forEach((_, layer) => { component += `        <span aria-hidden="true" data-material-surface="${layer}" classStyle={[materialSphereStyles.${name}Surface${layer}]} />\n`; });
    component += `      </div><div aria-hidden="true" classStyle={[materialSphereStyles.${name}Shading]} /></div>;\n`;
  });
  component += '    default: throw new Error("Unknown Material Sphere profile");\n  }\n}\n';
  outputs.set('web/components/MaterialSphere.generated.tsx', component);
  for (const [relative, content] of outputs) {
    await mkdir(path.dirname(path.join(projectRoot, relative)), { recursive: true });
    await writeFile(path.join(projectRoot, relative), content);
  }
  const plans = profiles.map((profile, index) => ({ artifactIdentifier: knowledge.artifactIdentifier,
    profileIdentifier: profile.profileIdentifier, sourceRevision: manifest.sourceRevision,
    family: profile.family, palette: profile.palette, parameters: profile.parameters,
    coordinateUnit: 'integerGridUnit', spaceDimensionsSupported: [1, 2, 3, 4], timeIsSpatialAxis: false,
    samples: recipes[index].requests, renderingBranches: rendererBranches,
    // Neutral numerical input is shared. CSS properties are not a universal scene description.
    interpretationStatus: 'proposed', visualEquivalenceAcrossRenderers: 'notVerified' }));
  const evidence = { ...bridge, createdAt: report.recordedAt,
    machineContract: { state: 'generated', transition: 'verified source -> shared numerical imports -> renderer-specific build' },
    inputs: manifest.files, outputs: [...outputs].map(([file, content]) => ({ file, digest: digest(content) })), plans };
  await mkdir(path.join(projectRoot, 'reports'), { recursive: true });
  await writeFile(path.join(projectRoot, 'reports/material-sphere-bridge.json'), JSON.stringify(evidence, null, 2) + '\n');
  assert.equal((await sourceManifest()).sourceRevision, manifest.sourceRevision);
  return evidence;
}
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const bridge = await connectPlanetarium();
  console.log(JSON.stringify({ state: 'generated', profiles: bridge.profileCount, sourceRevision: bridge.sourceRevision }));
}
