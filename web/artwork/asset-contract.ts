// llm machine contract; claim UUIDv5: 6c16261b-86c7-54d4-9712-99528cd7ca89
// execution UUIDv7: 01a099d4-9840-7179-b6e0-2b7759333103
// state: untrusted JSON; transition: exact schema + asset rules -> accepted manifest | rejection
export const flagNames = ['usesExtensionMeshopt', 'usesKhronosMeshopt', 'usesKtx2', 'usesWebp',
  'usesDraco', 'requiresNamedNodes', 'requiresExtras'] as const;
export const optionNames = ['hasMeshoptDecoder', 'hasKtx2Loader', 'hasDracoLoader', 'keepsNamedNodes', 'keepsExtras'] as const;
export type AssetFlags = Record<typeof flagNames[number], boolean>;
export type AssetOptions = Record<typeof optionNames[number], boolean>;
export type ArtworkManifest = { artifactIdentifier: string; resource: string; sha256: string;
  stage: 'validated'; flags: AssetFlags; options: AssetOptions };
const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (value: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
export function assetRulesSatisfied(flags: AssetFlags, options: AssetOptions) {
  return !(flags.usesExtensionMeshopt && flags.usesKhronosMeshopt) &&
    (!(flags.usesExtensionMeshopt || flags.usesKhronosMeshopt) || options.hasMeshoptDecoder) &&
    (!flags.usesKtx2 || options.hasKtx2Loader) && (!flags.usesDraco || options.hasDracoLoader) &&
    (!flags.requiresNamedNodes || options.keepsNamedNodes) && (!flags.requiresExtras || options.keepsExtras);
}
export function validateArtworkManifest(value: unknown): ArtworkManifest | null {
  if (!record(value) || !exactKeys(value, ['artifactIdentifier', 'resource', 'sha256', 'stage', 'flags', 'options']) ||
      typeof value.artifactIdentifier !== 'string' || !/^[\da-f]{8}-[\da-f]{4}-5[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/.test(value.artifactIdentifier) ||
      typeof value.resource !== 'string' || !/^\/artworks\/[a-z0-9-]+\.glb$/.test(value.resource) ||
      typeof value.sha256 !== 'string' || !/^[\da-f]{64}$/.test(value.sha256) || value.stage !== 'validated' ||
      !record(value.flags) || !exactKeys(value.flags, flagNames) || !record(value.options) || !exactKeys(value.options, optionNames)) return null;
  const flags = value.flags, options = value.options;
  if (!flagNames.every(key => typeof flags[key] === 'boolean') || !optionNames.every(key => typeof options[key] === 'boolean')) return null;
  const checkedFlags = flags as AssetFlags, checkedOptions = options as AssetOptions;
  if (!assetRulesSatisfied(checkedFlags, checkedOptions)) return null;
  return { artifactIdentifier: value.artifactIdentifier, resource: value.resource, sha256: value.sha256,
    stage: 'validated', flags: { ...checkedFlags }, options: { ...checkedOptions } };
}

export function inspectGlb(bytes: ArrayBuffer) {
  const view = new DataView(bytes);
  if (view.byteLength < 28 || view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2 ||
      view.getUint32(8, true) !== bytes.byteLength || view.getUint32(16, true) !== 0x4e4f534a ||
      20 + view.getUint32(12, true) > bytes.byteLength) throw new Error('Invalid binary glTF envelope');
  const description: unknown = JSON.parse(new TextDecoder().decode(new Uint8Array(bytes, 20, view.getUint32(12, true))));
  if (!record(description)) throw new Error('Invalid glTF JSON');
  const extensions = new Set<string>();
  function visit(value: unknown) {
    if (!record(value) && !Array.isArray(value)) return;
    if (record(value) && record(value.extensions)) Object.keys(value.extensions).forEach(name => extensions.add(name));
    Object.values(value).forEach(visit);
  }
  visit(description);
  for (const key of ['extensionsUsed', 'extensionsRequired']) {
    const names = description[key] ?? [];
    if (!Array.isArray(names) || !names.every(name => typeof name === 'string')) throw new Error('Invalid extension declaration');
    names.forEach(name => extensions.add(name));
  }
  // This app accepts self-contained, pipeline-generated binary assets, never external resource URLs.
  if ([...(Array.isArray(description.buffers) ? description.buffers : []),
      ...(Array.isArray(description.images) ? description.images : [])].some(value => record(value) && 'uri' in value))
    throw new Error('External glTF resources are outside this artifact contract');
  return { description, extensions: [...extensions].sort(), flags: {
    usesExtensionMeshopt: extensions.has('EXT_meshopt_compression'), usesKhronosMeshopt: extensions.has('KHR_meshopt_compression'),
    usesKtx2: extensions.has('KHR_texture_basisu'), usesWebp: extensions.has('EXT_texture_webp'), usesDraco: extensions.has('KHR_draco_mesh_compression'),
  } };
}

export async function registerRequiredDecoders(flags: AssetFlags, register: {
  meshopt: () => Promise<void>; ktx2: () => Promise<void>; draco: () => Promise<void>;
}) {
  if (flags.usesExtensionMeshopt && flags.usesKhronosMeshopt) throw new Error('Meshopt encodings cannot coexist');
  await Promise.all([
    flags.usesExtensionMeshopt || flags.usesKhronosMeshopt ? register.meshopt() : undefined,
    flags.usesKtx2 ? register.ktx2() : undefined,
    flags.usesDraco ? register.draco() : undefined,
  ]);
}
