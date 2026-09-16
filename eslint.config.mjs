import typescriptEslint from 'typescript-eslint';
import plumeria from '@plumeria/eslint-plugin';

// llm machine contract; claim UUIDv5: 20e6d64f-f964-5b32-9707-b01635fcba3f
// execution UUIDv7: 01a099d4-9840-7179-b6e0-2b7759333103
// state: source; transition: official Plumeria rules + type information -> machine diagnostics
export default [{ ignores: ['web/.next/**', 'web/out/**'] }, {
  files: ['web/**/*.ts', 'web/**/*.tsx'],
  languageOptions: { parser: typescriptEslint.parser, parserOptions: { project: './web/tsconfig.json', tsconfigRootDir: import.meta.dirname } },
  plugins: { '@plumeria': plumeria }, rules: plumeria.configs.recommended.rules,
}, {
  files: ['scripts/**/*.mjs'],
  rules: { 'no-constant-binary-expression': 'error', 'no-unreachable': 'error', 'no-unsafe-optional-chaining': 'error', 'valid-typeof': 'error' },
}];
