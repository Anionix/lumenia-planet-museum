// llm machine contract
// claim identifier (UUIDv5): 35302202-9761-5b5d-ac14-01302e53c2bc
// execution identifier (UUIDv7): 01a099bb-225c-7772-8fb8-869e4d9f9eec
// state: zero-axiom policy; transition: explicit dependency list -> accept only an empty list
export function axiomDependenciesAreEmpty(axioms) {
  return Array.isArray(axioms) && axioms.length === 0;
}

// machine contract; record_identifier=5c51405c-2fe3-5546-8621-278af8174a55.
// transition: fresh captured inputs -> exact before/after comparison -> admissible receipt.
// A manually rebound earlier execution is not a fresh run, even if selected inputs match.
export function languageServerReceiptMatchesSource(receipt, manifest) {
  return receipt?.sourceRevision === manifest.sourceRevision &&
    receipt.sourceRevisionBefore === manifest.sourceRevision &&
    receipt.sourceRevisionAfter === manifest.sourceRevision &&
    receipt.checkStartedAtSourceRevision === manifest.sourceRevision &&
    (!receipt.bindingHistory || Array.isArray(receipt.bindingHistory) && receipt.bindingHistory.length === 0) &&
    JSON.stringify(receipt.files) === JSON.stringify(manifest.files);
}

export function languageServerCheckSucceeded(check) {
  if (check.response?.isError) return false;
  let data = check.response?.structuredContent;
  if (!data) {
    try { data = JSON.parse(check.response?.content?.find((item) => item.type === 'text')?.text); }
    catch { return false; }
  }
  switch (check.tool) {
    case 'lean_build': return data?.success === true && data.errors?.length === 0;
    case 'lean_diagnostic_messages': {
      const diagnostics = data?.result ?? data;
      return diagnostics?.success === true && diagnostics.timed_out !== true &&
        Array.isArray(diagnostics.items) &&
        !diagnostics.items.some((item) => ['error', 'warning'].includes(item.severity)) &&
        diagnostics.failed_dependencies?.length === 0;
    }
    case 'lean_goal': return Array.isArray(data?.goals_after) && data.goals_after.length === 0 &&
      typeof data.line_context === 'string' && data.line_context.length > 0;
    case 'lean_hover_info': return typeof data?.info === 'string' && data.info.length > 0 &&
      typeof data.symbol === 'string' && data.symbol.includes(check.target.split('.').at(-1));
    case 'lean_file_outline': return Array.isArray(data?.declarations) && data.declarations.length > 0;
    case 'lean_verify': return axiomDependenciesAreEmpty(data?.axioms) &&
      Array.isArray(data.warnings) && data.warnings.length === 0;
    default: return false;
  }
}
