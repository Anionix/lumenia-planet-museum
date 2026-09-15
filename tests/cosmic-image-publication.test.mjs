import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { isRegisteredReferenceImage } from '../scripts/drawing-asset-policy.mjs';

// llm machine contract; UUIDv5: 26c1a73e-a5ed-5a54-93c7-29888e27f48e; transition: approved references -> exact-byte admission; unrelated or changed images -> rejected.
const registration = JSON.parse(await readFile(new URL('../contracts/cosmic-reference-images.json', import.meta.url), 'utf8'));
test('the 15 supplied images match their publication registration', async () => {
  assert.equal(registration.images.length, 15);
  for (const image of registration.images) {
    const relative = 'reference-assets/artist-cosmos/' + image.path.slice('cosmos/'.length);
    const bytes = await readFile(new URL('../' + relative, import.meta.url));
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    assert.equal(sha256, image.sha256);
    assert.equal(isRegisteredReferenceImage({ path: image.path, sha256, bytes: bytes.length }, [{ path: relative, sha256 }], registration), true);
  }
});
test('an unregistered, altered, or source-missing image is not admitted', () => {
  const image = registration.images[0];
  const source = [{ path: 'reference-assets/artist-cosmos/' + image.path.slice('cosmos/'.length), sha256: image.sha256 }];
  const output = { path: image.path, sha256: image.sha256, bytes: 1 };
  assert.equal(isRegisteredReferenceImage({ ...output, path: 'cosmos/unregistered.png' }, source, registration), false);
  assert.equal(isRegisteredReferenceImage({ ...output, sha256: '0'.repeat(64) }, source, registration), false);
  assert.equal(isRegisteredReferenceImage(output, [], registration), false);
  assert.equal(isRegisteredReferenceImage(output, [{ ...source[0], sha256: '0'.repeat(64) }], registration), false);
});
