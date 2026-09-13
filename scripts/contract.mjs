/*
llm machine contract
claim identifier: 4f6e0b5a-4f25-5b41-9e9e-2f9e4e70e0a1
execution identifier: 01999d4a-7c70-7a00-8a27-3f0126ab4d40
state: boundary validation
transition: untrusted JSON -> validated verification input
*/

const uuidv5Pattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const uuidv7Pattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const sourceRevisionPattern = /^(sha256:[0-9a-f]{64}|[0-9a-f]{40})$/i;
const verificationStatuses = new Set([
  'pass',
  'fail',
  'blocked',
  'staleEvidence',
]);
const browsers = new Set(['chrome', 'safari', 'firefox', 'edge']);
const expectedMeasurementProfile = Object.freeze({
  targetBrowsers: ['chrome', 'safari', 'firefox', 'edge'],
  coreTransferBudgetKibibytes: 200,
  htmlBudgetKibibytes: 30,
  javascriptBudgetKibibytes: 120,
  styleBudgetKibibytes: 20,
  fontBudgetKibibytes: 20,
  metadataBudgetKibibytes: 10,
  largestContentfulPaintMilliseconds: 2500,
  firstUsableArtworkMilliseconds: 3000,
});

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasOnlyKeys(value, allowedKeys, path, errors) {
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) {
      errors.push(path + '.' + key + ': unknown property');
    }
  }
}

function requireKeys(value, requiredKeys, path, errors) {
  for (const key of requiredKeys) {
    if (!(key in value)) {
      errors.push(path + '.' + key + ': required property is missing');
    }
  }
}

function requireString(value, path, errors) {
  if (typeof value !== 'string' || value.length === 0) {
    errors.push(path + ': expected a non-empty string');
    return false;
  }
  return true;
}

function requireBoolean(value, path, errors) {
  if (typeof value !== 'boolean') {
    errors.push(path + ': expected a boolean');
    return false;
  }
  return true;
}

function requireInteger(value, path, errors) {
  if (!Number.isInteger(value)) {
    errors.push(path + ': expected an integer');
    return false;
  }
  return true;
}

function validateIdentifier(value, pattern, path, errors) {
  if (!requireString(value, path, errors)) {
    return false;
  }
  if (!pattern.test(value)) {
    errors.push(path + ': invalid identifier format');
    return false;
  }
  return true;
}

function validateStringArray(value, path, errors, itemValidator = null) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(path + ': expected a non-empty array');
    return false;
  }
  const seen = new Set();
  value.forEach((item, index) => {
    if (typeof item !== 'string' || item.length === 0) {
      errors.push(path + '[' + index + ']: expected a non-empty string');
      return;
    }
    if (seen.has(item)) {
      errors.push(path + '[' + index + ']: duplicate value');
    }
    seen.add(item);
    if (itemValidator) {
      itemValidator(item, path + '[' + index + ']', errors);
    }
  });
  return true;
}

function validateMeasurementProfile(value, path, errors) {
  if (!isRecord(value)) {
    errors.push(path + ': expected an object');
    return false;
  }
  const allowedKeys = new Set(Object.keys(expectedMeasurementProfile));
  hasOnlyKeys(value, allowedKeys, path, errors);
  requireKeys(value, [...allowedKeys], path, errors);
  if (Array.isArray(value.targetBrowsers)) {
    const seen = new Set();
    value.targetBrowsers.forEach((browser, index) => {
      if (!browsers.has(browser)) {
        errors.push(path + '.targetBrowsers[' + index + ']: unsupported browser');
      }
      if (seen.has(browser)) {
        errors.push(path + '.targetBrowsers[' + index + ']: duplicate browser');
      }
      seen.add(browser);
    });
    if (seen.size !== browsers.size) {
      errors.push(path + '.targetBrowsers: all four browsers are required');
    }
  } else {
    errors.push(path + '.targetBrowsers: expected an array');
  }
  for (const [key, expected] of Object.entries(expectedMeasurementProfile)) {
    if (key === 'targetBrowsers') {
      continue;
    }
    if (value[key] !== expected) {
      errors.push(path + '.' + key + ': expected fixed value ' + expected);
    }
    requireInteger(value[key], path + '.' + key, errors);
  }
  return true;
}

function validateVerificationRequest(value, errors) {
  const path = 'verificationRequest';
  const allowedKeys = new Set([
    'artifactIdentifier',
    'claimIdentifiers',
    'proofTargets',
    'sourceRevision',
    'measurementProfile',
  ]);
  if (!isRecord(value)) {
    errors.push(path + ': expected an object');
    return;
  }
  hasOnlyKeys(value, allowedKeys, path, errors);
  requireKeys(value, [...allowedKeys], path, errors);
  validateIdentifier(value.artifactIdentifier, uuidv5Pattern, path + '.artifactIdentifier', errors);
  validateStringArray(
    value.claimIdentifiers,
    path + '.claimIdentifiers',
    errors,
    (item, itemPath, itemErrors) => validateIdentifier(item, uuidv5Pattern, itemPath, itemErrors),
  );
  validateStringArray(value.proofTargets, path + '.proofTargets', errors);
  if (
    typeof value.sourceRevision !== 'string' ||
    !sourceRevisionPattern.test(value.sourceRevision)
  ) {
    errors.push(path + '.sourceRevision: expected a source content digest or a full commit identifier');
  }
  validateMeasurementProfile(value.measurementProfile, path + '.measurementProfile', errors);
}

function validateObservation(value, path, errors) {
  const allowedKeys = new Set([
    'gateIdentifier',
    'status',
    'observedValue',
    'limit',
    'unit',
    'checkedBy',
    'failureReason',
    'evidenceIdentifiers',
    'sourceRevision',
    'executionIdentifier',
  ]);
  if (!isRecord(value)) {
    errors.push(path + ': expected an object');
    return;
  }
  hasOnlyKeys(value, allowedKeys, path, errors);
  requireKeys(value, ['gateIdentifier', 'status', 'observedValue', 'limit', 'unit', 'checkedBy',
    'failureReason', 'sourceRevision', 'executionIdentifier'], path, errors);
  validateIdentifier(value.gateIdentifier, uuidv5Pattern, path + '.gateIdentifier', errors);
  if (!verificationStatuses.has(value.status)) {
    errors.push(path + '.status: unsupported verification status');
  }
  requireString(value.unit, path + '.unit', errors);
  validateStringArray(value.checkedBy, path + '.checkedBy', errors);
  if (!sourceRevisionPattern.test(value.sourceRevision ?? '')) {
    errors.push(path + '.sourceRevision: expected an immutable source revision');
  }
  validateIdentifier(value.executionIdentifier, uuidv7Pattern, path + '.executionIdentifier', errors);
  const measurable = (item) => typeof item === 'boolean' ||
    (typeof item === 'number' && Number.isFinite(item) && item >= 0);
  if (value.limit !== null && !measurable(value.limit)) {
    errors.push(path + '.limit: expected a finite non-negative number, boolean or null');
  }
  if (value.observedValue !== null && !measurable(value.observedValue)) {
    errors.push(path + '.observedValue: expected a finite non-negative number, boolean or null');
  }
  if (value.observedValue !== null && value.limit !== null && typeof value.observedValue !== typeof value.limit) {
    errors.push(path + ': observedValue and limit must have the same type');
  }
  if (value.status === 'pass') {
    if (value.failureReason !== null) errors.push(path + '.failureReason: pass requires null');
  } else {
    requireString(value.failureReason, path + '.failureReason', errors);
  }
  if ('evidenceIdentifiers' in value) {
    validateStringArray(
      value.evidenceIdentifiers,
      path + '.evidenceIdentifiers',
      errors,
      (item, itemPath, itemErrors) => validateIdentifier(item, uuidv5Pattern, itemPath, itemErrors),
    );
  }
}

function expectedOverallStatus(observations) {
  const statuses = new Set(observations.map((observation) => observation?.status));
  if (statuses.has('fail')) return 'fail';
  if (statuses.has('blocked')) return 'blocked';
  if (statuses.has('staleEvidence')) return 'staleEvidence';
  return 'pass';
}

function validateVerificationResult(value, errors) {
  const path = 'verificationResult';
  const allowedKeys = new Set([
    'artifactIdentifier',
    'claimIdentifiers',
    'proofTargets',
    'sourceRevision',
    'measurementProfile',
    'executionIdentifier',
    'createdAt',
    'status',
    'observations',
  ]);
  if (!isRecord(value)) {
    errors.push(path + ': expected an object');
    return;
  }
  hasOnlyKeys(value, allowedKeys, path, errors);
  requireKeys(value, [...allowedKeys], path, errors);
  validateIdentifier(value.artifactIdentifier, uuidv5Pattern, path + '.artifactIdentifier', errors);
  validateStringArray(
    value.claimIdentifiers,
    path + '.claimIdentifiers',
    errors,
    (item, itemPath, itemErrors) => validateIdentifier(item, uuidv5Pattern, itemPath, itemErrors),
  );
  validateStringArray(value.proofTargets, path + '.proofTargets', errors);
  if (
    typeof value.sourceRevision !== 'string' ||
    !sourceRevisionPattern.test(value.sourceRevision)
  ) {
    errors.push(path + '.sourceRevision: expected a source content digest or a full commit identifier');
  }
  validateMeasurementProfile(value.measurementProfile, path + '.measurementProfile', errors);
  validateIdentifier(value.executionIdentifier, uuidv7Pattern, path + '.executionIdentifier', errors);
  if (typeof value.createdAt !== 'string' || Number.isNaN(Date.parse(value.createdAt))) {
    errors.push(path + '.createdAt: expected an ISO date-time');
  }
  if (!verificationStatuses.has(value.status)) {
    errors.push(path + '.status: unsupported verification status');
  }
  if (!Array.isArray(value.observations) || value.observations.length === 0) {
    errors.push(path + '.observations: expected a non-empty array');
  } else {
    const seenGates = new Set();
    value.observations.forEach((observation, index) => {
      validateObservation(observation, path + '.observations[' + index + ']', errors);
      if (!isRecord(observation)) return;
      if (seenGates.has(observation.gateIdentifier)) errors.push(path + ': duplicate gate observation');
      seenGates.add(observation.gateIdentifier);
      if (observation.executionIdentifier !== value.executionIdentifier) {
        errors.push(path + ': observation execution identifier must match its result');
      }
      const expectedStatus = evaluateObservation(observation, value.sourceRevision);
      if (observation.status !== expectedStatus) {
        errors.push(path + '.observations[' + index + '].status: expected ' + expectedStatus);
      }
    });
    if (verificationStatuses.has(value.status)) {
      const expectedStatus = expectedOverallStatus(value.observations);
      if (value.status !== expectedStatus) {
        errors.push(path + '.status: expected ' + expectedStatus + ' from observations');
      }
    }
  }
}

function validateAssetManifest(value, errors) {
  const path = 'assetManifest';
  const allowedKeys = new Set([
    'artifactIdentifier',
    'format',
    'usesExtensionMeshopt',
    'usesKhronosMeshopt',
    'usesKtx2',
    'usesWebp',
    'usesDraco',
    'requiresNamedNodes',
    'requiresExtras',
    'keepsNamedNodes',
    'keepsExtras',
    'hasMeshoptDecoder',
    'hasKtx2Loader',
    'hasDracoLoader',
  ]);
  if (!isRecord(value)) {
    errors.push(path + ': expected an object');
    return;
  }
  hasOnlyKeys(value, allowedKeys, path, errors);
  requireKeys(value, [...allowedKeys], path, errors);
  validateIdentifier(value.artifactIdentifier, uuidv5Pattern, path + '.artifactIdentifier', errors);
  if (!['glb', 'gltf'].includes(value.format)) {
    errors.push(path + '.format: expected glb or gltf');
  }
  for (const key of [...allowedKeys].slice(2)) {
    requireBoolean(value[key], path + '.' + key, errors);
  }
  if (value.usesExtensionMeshopt && value.usesKhronosMeshopt) {
    errors.push(path + ': extensionMeshopt and khronosMeshopt are mutually exclusive');
  }
  if ((value.usesExtensionMeshopt || value.usesKhronosMeshopt) && !value.hasMeshoptDecoder) {
    errors.push(path + ': Meshopt decoder is required');
  }
  if (value.usesKtx2 && !value.hasKtx2Loader) {
    errors.push(path + ': KTX2 loader is required');
  }
  if (value.usesDraco && !value.hasDracoLoader) {
    errors.push(path + ': Draco loader is required');
  }
  if (value.requiresNamedNodes && !value.keepsNamedNodes) {
    errors.push(path + ': named-node preservation is required');
  }
  if (value.requiresExtras && !value.keepsExtras) {
    errors.push(path + ': extras preservation is required');
  }
}

export function validateVerificationDocument(value) {
  const errors = [];
  if (isRecord(value) && 'executionIdentifier' in value) {
    validateVerificationResult(value, errors);
  } else {
    validateVerificationRequest(value, errors);
  }
  return { valid: errors.length === 0, errors };
}

export function validateAssetManifestDocument(value) {
  const errors = [];
  validateAssetManifest(value, errors);
  return { valid: errors.length === 0, errors };
}

export { expectedMeasurementProfile };

// Corresponds to Lumenia.measured_gate_pass_iff for numeric upper-bound gates.
// Boolean gates compare equality; missing or old evidence cannot produce pass.
export function evaluateObservation(observation, requiredRevision) {
  if (observation.sourceRevision !== requiredRevision) return 'staleEvidence';
  if (observation.observedValue === null || observation.limit === null) return 'blocked';
  const withinLimit = typeof observation.observedValue === 'number'
    ? observation.observedValue <= observation.limit
    : observation.observedValue === observation.limit;
  return withinLimit ? 'pass' : 'fail';
}
