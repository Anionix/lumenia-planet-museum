# Lumenia constraints

Last reviewed: 2026-09-13

## Floor

- No new suppression comments that disable verification.
- No skipped or deleted tests without a recorded reason.
- No unfinished stubs in the formal model or boundary validator.
- Files under sources/ remain read-only.
- A failed verification command must not be converted into a warning.

## Enforced constraints

| Dimension | Rule | Checked by | Runs at |
|---|---|---|---|
| Lean construction | Zero Lean errors and zero warnings | lake build | every task |
| Axiom dependencies | Zero transitive axiom dependencies for every registered theorem, including standard axioms | Lean #print axioms and lean_verify | every formal verification |
| Contract shape | All committed example requests and results pass the boundary validator | npm run verify:contracts | every task |
| Core transfer | HTML 30 KiB, JavaScript 120 KiB, CSS 20 KiB, fonts 20 KiB, metadata 10 KiB | formal theorem and contract validator | every task |
| Verification state | Only pass, fail, blocked, or staleEvidence is accepted | contract validator | every task |
| Asset safety | Meshopt variants are exclusive and required loaders are present | asset boundary validator | every task |

The byte limits are fixed project policy. They sum to exactly 200 kibibytes.
Artwork bytes are measured separately and are not included in the core transfer
budget.

## Measured when a runtime exists

| Metric | Limit | Direction |
|---|---:|---|
| Largest contentful paint | 2500 milliseconds | must not increase |
| First usable artwork | 3000 milliseconds | must not increase |
| Browser matrix | current Chrome, Safari, Firefox, and Edge | all must remain functional |

These runtime metrics require a running web application and are not reported as
pass until a browser measurement receipt exists.
