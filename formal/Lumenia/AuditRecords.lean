namespace Lumenia.AuditRecords

-- machine contract; executionIdentifier=01a0ab5d-57e2-7e6c-b529-afce06142914.
-- Transition: validated status, predecessor, summary and material comparison -> acceptance.
-- The theorem covers this Boolean obligation model; actual record parsing is tested separately.
-- declaration_identifier=4dac72e7-32f1-5f09-8ce2-370ed58a6a27 (UUIDv5)
def accepted (status predecessor summary material : Bool) : Bool :=
  status && predecessor && summary && material

-- declaration_identifier=b2f81eac-e8f5-5485-8551-70377b64c25e (UUIDv5)
theorem acceptance_requires_every_obligation (status predecessor summary material : Bool) :
    accepted status predecessor summary material = true ↔
      status = true ∧ predecessor = true ∧ summary = true ∧ material = true := by
  cases status <;> cases predecessor <;> cases summary <;> cases material <;> decide

#print axioms acceptance_requires_every_obligation
end Lumenia.AuditRecords
