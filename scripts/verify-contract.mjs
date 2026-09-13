#!/usr/bin/env node

/*
llm machine contract
claim identifier: 6dd3d6fb-52a1-5ea7-9f7b-2bf11cf2d67a
execution identifier: 01999d4a-7c70-7a00-8a27-3f0126ab4d40
state: contract command
transition: JSON document -> pass or fail
*/

import { readFile } from 'node:fs/promises';
import process from 'node:process';
import {
  validateAssetManifestDocument,
  validateVerificationDocument,
} from './contract.mjs';

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

let failed = false;
for (const path of process.argv.slice(2)) {
  try {
    const document = await readJson(path);
    const result =
      path.includes('asset-manifest')
        ? validateAssetManifestDocument(document)
        : validateVerificationDocument(document);
    if (!result.valid) {
      failed = true;
      console.error(path + ': invalid');
      for (const error of result.errors) {
        console.error('  ' + error);
      }
    } else {
      console.log(path + ': valid');
    }
  } catch (error) {
    failed = true;
    console.error(path + ': ' + error.message);
  }
}

if (process.argv.length <= 2) {
  console.error('Usage: node scripts/verify-contract.mjs <json-file> [...]');
  process.exitCode = 2;
} else if (failed) {
  process.exitCode = 1;
}
