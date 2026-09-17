import assert from 'node:assert/strict';
import test from 'node:test';
import { axiomDependenciesAreEmpty, languageServerCheckSucceeded } from '../scripts/language-server-evidence.mjs';

const verifyAxioms = (axioms, arguments_ = { theorem_name: 'Lumenia.Proof' }) => languageServerCheckSucceeded({
  tool: 'lean_verify', target: 'Lumenia.Proof', arguments: arguments_,
  response: { structuredContent: { axioms, warnings: [] } },
});

test('an inconclusive axiom response cannot become pass merely through a success label', () => {
  assert.equal(languageServerCheckSucceeded({ tool: 'lean_verify', success: true,
    response: { isError: false, content: [{ type: 'text', text: 'No axiom output; inconclusive' }] } }), false);
  assert.equal(verifyAxioms(['sorryAx']), false);
  assert.equal(verifyAxioms([]), true);
  assert.equal(verifyAxioms([], {}), false);
});

test('the shared command-line and language-server policy rejects every axiom, including standard axioms', () => {
  assert.equal(axiomDependenciesAreEmpty([]), true);
  for (const dependencies of [undefined, null, '[]', {}, ['propext'], ['Quot.sound'],
    ['Classical.choice'], ['unreviewedAxiom'], ['propext', 'Quot.sound']]) {
    assert.equal(axiomDependenciesAreEmpty(dependencies), false);
    assert.equal(verifyAxioms(dependencies), false);
  }
});

test('time-limited diagnostics and unknown goal states are not a clean verification', () => {
  assert.equal(languageServerCheckSucceeded({ tool: 'lean_diagnostic_messages',
    response: { structuredContent: { result: { success: true, timed_out: true,
      items: [], failed_dependencies: [] } } } }), false);
  assert.equal(languageServerCheckSucceeded({ tool: 'lean_goal',
    response: { structuredContent: { line_context: 'simp', goals_after: null } } }), false);
});

test('hover must resolve the requested declaration rather than a nearby tactic', () => {
  assert.equal(languageServerCheckSucceeded({ tool: 'lean_hover_info',
    target: 'Lumenia.validate_raw_asset_accepts_iff',
    response: { structuredContent: { symbol: 'simp', info: 'A simplification tactic' } } }), false);
});
