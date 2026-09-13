import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { plumeriaSource, compileMaterialSphere } from '../lib/material-sphere.mjs';
import { makeCoordinateRequest, compileSpatialPlacement } from '../lib/dimension.mjs';

// llm machine contract; artifact UUIDv5: e67bec4e-cc81-54b8-8de8-e04f06503867
// execution UUIDv7: 01a09a86-bce5-77fe-8aff-ce403b00e379
// state: derived review artifacts; transition: validated knowledge and declarations -> linked cards and Plumeria schemas.
export async function generateArtifacts(root, knowledge, declarations, sourceRevision, executionIdentifier) {
  const directory = path.join(root, 'generated');
  await mkdir(path.join(directory, 'people'), { recursive: true });
  const metadata = { artifactIdentifier: knowledge.artifactIdentifier, executionIdentifier, sourceRevision };
  const sources = new Map(knowledge.sources.map(source => [source.sourceIdentifier, source]));
  const evidence = new Map(knowledge.evidence.map(item => [item.evidenceIdentifier, item]));
  const claims = new Map(knowledge.claims.map(claim => [claim.claimIdentifier, claim]));
  const registry = new Map(declarations.map(item => [item.name, item]));
  const cards = [];
  for (const profile of knowledge.profiles) {
    const filename = profile.componentName + '.md';
    const statements = profile.sourceClaimIdentifiers.map(identifier => {
      const claim = claims.get(identifier);
      const references = claim.evidenceIdentifiers.map(value => sources.get(evidence.get(value).sourceIdentifier));
      return '- ' + (claim.object?.statement ?? claim.predicate) + ' ' +
        references.map(source => `[${source.title}](${source.url})`).join('、') +
        `\n\n  主張定義：${claim.claimDefinitionIdentifier} / 主張記録：${claim.claimIdentifier}`;
    });
    const proofs = profile.proofTargets.map(name => {
      const declaration = registry.get(name);
      return `- [${name}](../../${declaration.file}) — ${declaration.declarationIdentifier}`;
    });
    const content = `---\ntype: Material Interpretation\ntitle: ${JSON.stringify(profile.title)}\n` +
      `profile_identifier: ${profile.profileIdentifier}\nperson_identifier: ${profile.personIdentifier}\n` +
      `source_revision: ${sourceRevision}\nexecution_identifier: ${executionIdentifier}\ninterpretation_status: proposed\n---\n\n` +
      `# ${profile.title}\n\n参照範囲：${profile.referenceWork}（${profile.referencePeriod}）\n\n` +
      `## 資料から読んだ特徴\n\n${statements.join('\n\n')}\n\n` +
      `## Material Sphereの提案\n\n${profile.interpretation}\n\n` +
      `色は試作の選択値：${profile.palette.join('、')}。\n\n${profile.limitation}\n\n` +
      `## 接続した計算規則\n\n${proofs.join('\n')}\n\n` +
      `画面での見え方・操作・速度は未検査です。[検査報告](../../reports/gate-report.md)で確認範囲を示します。\n\n` +
      `<!-- llm machine contract; state: proposed interpretation; transition: claim-linked profile -> human review; ` +
      `artifact UUIDv5: ${knowledge.artifactIdentifier}; execution UUIDv7: ${executionIdentifier} -->\n`;
    await writeFile(path.join(directory, 'people', filename), content);
    cards.push(`- [${profile.title}](people/${filename}) — ${profile.referenceWork}`);
  }
  await writeFile(path.join(directory, 'declarations.json'), JSON.stringify({ ...metadata, declarations }, null, 2) + '\n');
  await writeFile(path.join(directory, 'MaterialSphere.styles.ts'), plumeriaSource(knowledge.profiles, metadata));
  await writeFile(path.join(directory, 'material-sphere-layouts.json'), JSON.stringify({ ...metadata,
    recipes: knowledge.profiles.map(compileMaterialSphere) }, null, 2) + '\n');
  const placements = [1, 2, 3, 4].map(dimension =>
    compileSpatialPlacement(makeCoordinateRequest([1, 2, 3, 4].slice(0, dimension), { timeMilliseconds: 1000 }), 8));
  await writeFile(path.join(directory, 'dimension-examples.json'), JSON.stringify({ ...metadata, placements }, null, 2) + '\n');
  const index = `---\ntype: Material Atlas\ntitle: Art Knowledge Planetarium — Material Sphere\n` +
    `artifact_identifier: ${knowledge.artifactIdentifier}\nexecution_identifier: ${executionIdentifier}\nsource_revision: ${sourceRevision}\n---\n\n` +
    '# Material Sphere\n\n15人の仕事を、参照作品・資料・表面表現・計算規則へ接続した試作台帳です。\n\n' +
    '空間の1〜4軸を同じ座標型で扱い、時刻は別の値として持ちます。画面投影が捨てる軸も記録します。\n\n' +
    '[仕様](../spec.md) · [証明報告](../reports/proof-report.md) · [検査報告](../reports/gate-report.md) · ' +
    '[次元別の入出力](dimension-examples.json) · [Plumeriaスタイル](MaterialSphere.styles.ts)\n\n' +
    cards.join('\n') + '\n\n色と形は提案です。ブラウザーでの見え方、動き、性能の測定は次の工程です。\n';
  await writeFile(path.join(directory, 'index.md'), index);
  return { peopleCards: cards.length, stylesFile: 'generated/MaterialSphere.styles.ts', coordinateExamples: placements.length };
}
