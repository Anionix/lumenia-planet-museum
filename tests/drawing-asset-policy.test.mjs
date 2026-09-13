import assert from 'node:assert/strict';
import test from 'node:test';
import { isRegisteredInterfaceIcon } from '../scripts/drawing-asset-policy.mjs';

test('Only the source-identical tab icon is admitted as interface metadata', () => {
  const sha256 = 'a'.repeat(64), source = [{ path: 'web/public/favicon.svg', sha256 }];
  const icon = { path: 'favicon.svg', sha256, bytes: 267 };
  assert.equal(isRegisteredInterfaceIcon(icon, source), true);
  assert.equal(isRegisteredInterfaceIcon(icon, []), false);
  assert.equal(isRegisteredInterfaceIcon({ ...icon, sha256: 'b'.repeat(64) }, source), false);
  assert.equal(isRegisteredInterfaceIcon({ ...icon, bytes: 0 }, source), false);
  for (const candidate of ['artwork.svg', 'artworks/favicon.svg', 'characters/favicon.svg', 'favicon.png'])
    assert.equal(isRegisteredInterfaceIcon({ ...icon, path: candidate }, source), false);
});
