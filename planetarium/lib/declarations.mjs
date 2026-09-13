import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { claimIdentifier } from '../../scripts/identifiers.mjs';

// llm machine contract; artifact UUIDv5: e67bec4e-cc81-54b8-8de8-e04f06503867
// execution UUIDv7: 01a09a86-bce5-77fe-8aff-ce403b00e379
// state: source index; transition: fully named declarations -> UUIDv5 registry -> LSP outline comparison.
// This source index handles the project's top-level declarations; the Lean compiler checks their meaning.
export async function declarationRegistry(root) {
  const declarations = [];
  const files = (await readdir(path.join(root, 'formal/ArtPlanetarium')))
    .filter(name => name.endsWith('.lean') && name !== 'AxiomAudit.lean').sort();
  for (const file of files) {
    const relative = 'formal/ArtPlanetarium/' + file;
    const source = await readFile(path.join(root, relative), 'utf8');
    const lines = source.split('\n');
    const namespaces = [];
    let commentDepth = 0;
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      // Every block-comment delimiter is counted; the input is this package's controlled Lean source.
      const before = commentDepth;
      for (const token of line.matchAll(/\/-|-\//g)) commentDepth += token[0] === '/-' ? 1 : -1;
      if (before > 0 || line.trimStart().startsWith('/-') || line.trimStart().startsWith('--')) continue;
      const namespace = line.match(/^namespace (\S+)/);
      if (namespace) { namespaces.push(namespace[1]); continue; }
      if (/^end(?:\s|$)/.test(line)) { namespaces.pop(); continue; }
      const declaration = line.match(/^(?:noncomputable )?(theorem|def|structure|inductive|abbrev)\s+([A-Za-z_][\w']*)/);
      if (!declaration) continue;
      const name = [...namespaces, declaration[2]].join('.');
      const remainder = lines.slice(index).join('\n');
      const headerEnd = remainder.search(/:=|\bwhere\b/);
      declarations.push({ declarationIdentifier: claimIdentifier(name), kind: declaration[1], name,
        file: relative, line: index + 1, column: line.indexOf(declaration[2]) + 1,
        sourceSignature: (headerEnd < 0 ? line : remainder.slice(0, headerEnd)).trim(),
        category: file === 'ConstructiveArithmetic.lean' ? 'arithmeticHelper' :
          file.startsWith('Dimension') ? 'dimensionKernel' : 'materialKernel' });
    }
  }
  if (new Set(declarations.map(item => item.name)).size !== declarations.length) {
    throw new Error('Duplicate public Lean declaration');
  }
  return declarations;
}
