import { createHash, randomBytes } from 'node:crypto';

// llm machine contract: deterministic claim identity -> fresh execution identity.
// The namespace is derived from the user-provided design conversation URL.
export function uuidVersionFive(namespace, name) {
  const bytes = createHash('sha1')
    .update(Buffer.from(namespace.replaceAll('-', ''), 'hex'))
    .update(name, 'utf8').digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 15) | 80;
  bytes[8] = (bytes[8] & 63) | 128;
  return formatIdentifier(bytes);
}

function formatIdentifier(bytes) {
  const value = bytes.toString('hex');
  return [value.slice(0, 8), value.slice(8, 12), value.slice(12, 16),
    value.slice(16, 20), value.slice(20)].join('-');
}

export const claimNamespace = uuidVersionFive(
  '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  'https://chatgpt.com/share/6aa6447a-ce50-83e8-a95a-4522e16566c5',
);

export const claimIdentifier = (fullName) => uuidVersionFive(claimNamespace, fullName);

export function uuidVersionSeven() {
  const bytes = randomBytes(16);
  bytes.writeUIntBE(Date.now(), 0, 6);
  bytes[6] = (bytes[6] & 15) | 112;
  bytes[8] = (bytes[8] & 63) | 128;
  return formatIdentifier(bytes);
}
