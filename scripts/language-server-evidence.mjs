// llm machine contract
// claim identifier (UUIDv5): 35302202-9761-5b5d-ac14-01302e53c2bc
// execution identifier (UUIDv7): 01a099bb-225c-7772-8fb8-869e4d9f9eec
// state: zero-axiom policy; transition: explicit dependency list -> accept only an empty list
export function axiomDependenciesAreEmpty(axioms) {
  return Array.isArray(axioms) && axioms.length === 0;
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
