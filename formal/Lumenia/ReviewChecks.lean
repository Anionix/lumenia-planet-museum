import Std

namespace Lumenia.ReviewChecks

/- machine contract; record_identifier=7d4e6480-ec4d-5aef-9d05-661556e308cb.
Transition: uncovered mathematical obligations -> constructive model -> kernel audit.
Units: integer milliseconds, millimetres, and hundredth scores. The snapshot model
specifies successful completion; it does not assert that browser code implements it.
Runtime counterexamples and source bindings are checked separately. -/

-- declaration_identifier=4f2ee1a0-c480-5161-9649-c57578e7b5bd (UUIDv5)
def bounded (value limit : Nat) : Nat := if value ≤ limit then value else limit

-- declaration_identifier=5d0cdcb0-51d5-5ec5-85ed-59f9486bf6a2 (UUIDv5)
theorem bounded_at_most_limit (value limit : Nat) : bounded value limit ≤ limit := by
  unfold bounded
  split
  · assumption
  · exact Nat.le_refl limit

-- declaration_identifier=190bfbba-0571-546f-822d-25a158dfe6f4 (UUIDv5)
theorem batch_flight_at_most_twenty_four_metres (steps millimetres : Nat)
    (stepsBound : steps ≤ 60) (stepBound : millimetres ≤ 400) :
    steps * millimetres ≤ 24000 :=
  Nat.le_trans (Nat.mul_le_mul_left steps stepBound)
    (Nat.mul_le_mul_right 400 stepsBound)

-- declaration_identifier=3fb8acd1-1204-5dd0-a31a-7052bd2a2456 (UUIDv5)
theorem normal_step_is_four_hundred_millimetres : 8 * 50 = (400 : Nat) := rfl

-- declaration_identifier=c0ade4a6-847f-59cf-b60f-e6a4a9d05e93 (UUIDv5)
def weightSum {scale : Nat} : List (Nat × Fin (scale + 1)) → Nat
  | [] => 0
  | (weight, _) :: rest => weight + weightSum rest

-- declaration_identifier=11f2c4a9-0684-58f0-849f-39e0f6e346e0 (UUIDv5)
def weightedTotal {scale : Nat} : List (Nat × Fin (scale + 1)) → Nat
  | [] => 0
  | (weight, score) :: rest => weight * score.val + weightedTotal rest

-- declaration_identifier=7f50fc44-7057-508b-9a17-12a745b5e8ba (UUIDv5)
theorem weighted_sum_is_bounded {scale : Nat} (components : List (Nat × Fin (scale + 1))) :
    weightedTotal components ≤ weightSum components * scale := by
  induction components with
  | nil => exact Nat.zero_le _
  | cons component rest inductionHypothesis =>
    cases component with
    | mk weight score =>
      calc
        weightedTotal ((weight, score) :: rest) ≤ weight * scale + weightSum rest * scale :=
          Nat.add_le_add (Nat.mul_le_mul_left weight (Nat.le_of_lt_succ score.isLt)) inductionHypothesis
        _ = scale * (weight + weightSum rest) := by
          rw [Nat.mul_comm weight scale, Nat.mul_comm (weightSum rest) scale, Nat.mul_add]
        _ = weightSum ((weight, score) :: rest) * scale := Nat.mul_comm scale _

-- declaration_identifier=909cba90-8ffc-5834-b776-4d8167238256 (UUIDv5)
theorem normalized_recipe_stays_inside_score_range (components : List (Nat × Fin 101))
    (normalized : weightSum components = 100) : weightedTotal components ≤ 10000 := by
  have bound := weighted_sum_is_bounded components
  rw [normalized] at bound
  exact bound

-- declaration_identifier=0e1ad9fb-f9a7-5d3e-8242-f8141bd41612 (UUIDv5)
def advanceClock (running : Bool) (milliseconds elapsed : Nat) : Nat :=
  if running then bounded (milliseconds + bounded elapsed 100) 86400000 else milliseconds

-- declaration_identifier=b6052e32-9cb9-5f1d-89e8-bec10f89f1c1 (UUIDv5)
theorem clock_remains_inside_day (running : Bool) (milliseconds elapsed : Nat)
    (inside : milliseconds ≤ 86400000) : advanceClock running milliseconds elapsed ≤ 86400000 := by
  cases running
  · exact inside
  · exact bounded_at_most_limit _ _

-- declaration_identifier=a47d447a-dcdb-5b4e-90ce-1eaf3b08e902 (UUIDv5)
theorem paused_clock_is_unchanged (milliseconds elapsed : Nat) :
    advanceClock false milliseconds elapsed = milliseconds := rfl

-- declaration_identifier=a6c197fa-891f-570c-9b59-dc0b7166dbdd (UUIDv5)
theorem clock_crosses_old_boundary_without_wrapping :
    advanceClock true 119950 100 = 120050 := by decide

-- declaration_identifier=3be095c0-740c-564a-87b9-38397aa6cbf1 (UUIDv5)
theorem trace_retention_is_bounded (previousLength : Nat) :
    bounded (previousLength + 1) 200 ≤ 200 := bounded_at_most_limit _ _

-- declaration_identifier=7bda9063-542c-5934-b342-b698ff87dbed (UUIDv5)
structure Snapshot where
  artist : Nat
  allImages : Bool
  playing : Bool
  physics : Bool
  gravity : Bool
  deriving DecidableEq

-- declaration_identifier=7288e382-2370-5816-8db2-fbd39941a5f0 (UUIDv5)
def allFieldsMatch (requested observed : Snapshot) : Bool := decide (requested = observed)
-- declaration_identifier=b30fb36b-368b-504d-ab51-c82c25235aa1 (UUIDv5)
def selectedArtistMatches (requested observed : Snapshot) : Bool := decide (requested.artist = observed.artist)

-- declaration_identifier=95d5f99e-439a-56cf-bfb8-ec58d45f2f9d (UUIDv5)
theorem successful_completion_requires_all_fields (requested observed : Snapshot)
    (accepted : allFieldsMatch requested observed = true) : requested = observed :=
  of_decide_eq_true accepted

-- declaration_identifier=37d62cbd-970f-55bf-9182-9fddba392fd1 (UUIDv5)
theorem identical_state_completes (state : Snapshot) : allFieldsMatch state state = true :=
  decide_eq_true rfl

-- declaration_identifier=8c127af7-301c-5352-9a70-60764b02c4f5 (UUIDv5)
theorem artist_only_check_misses_playback_change :
    selectedArtistMatches ⟨0, false, false, false, false⟩ ⟨0, false, true, false, false⟩ = true ∧
    allFieldsMatch ⟨0, false, false, false, false⟩ ⟨0, false, true, false, false⟩ = false := by decide

-- declaration_identifier=7ea486f2-9651-5bc0-a5b2-8bb8e770c914 (UUIDv5)
def mayExecute (readOnly busy aborted : Bool) : Bool := !aborted && (readOnly || !busy)

-- declaration_identifier=44d629d0-1d78-5a74-9bae-bfbbf2c753ff (UUIDv5)
theorem aborted_registration_cannot_execute (readOnly busy : Bool) :
    mayExecute readOnly busy true = false := by cases readOnly <;> cases busy <;> rfl

-- declaration_identifier=b65c34b2-f2d3-5184-a971-f97a74d11044 (UUIDv5)
theorem busy_writer_cannot_execute : mayExecute false true false = false := rfl
-- declaration_identifier=a9c9db3a-d289-57ce-8e02-0a35e1a07021 (UUIDv5)
theorem reader_can_observe_busy_writer : mayExecute true true false = true := rfl

-- declaration_identifier=37acd731-0135-5d8e-9d08-9d566f2be7cf (UUIDv5)
def receiptAccepted (sameRevision freshCapture completeInputs : Bool) : Bool :=
  sameRevision && freshCapture && completeInputs

-- declaration_identifier=75800f06-aca3-5026-b054-9f4b179c5e3c (UUIDv5)
theorem changed_revision_cannot_pass (freshCapture completeInputs : Bool) :
    receiptAccepted false freshCapture completeInputs = false := by cases freshCapture <;> cases completeInputs <;> rfl

-- declaration_identifier=c7eb4aec-776a-564f-b501-94be7f5b3743 (UUIDv5)
theorem rebound_old_execution_cannot_pass (sameRevision completeInputs : Bool) :
    receiptAccepted sameRevision false completeInputs = false := by cases sameRevision <;> cases completeInputs <;> rfl

-- declaration_identifier=7475fd1e-ff88-5570-aca5-f8cac8fd14ad (UUIDv5)
theorem missing_inputs_cannot_pass (sameRevision freshCapture : Bool) :
    receiptAccepted sameRevision freshCapture false = false := by cases sameRevision <;> cases freshCapture <;> rfl

end Lumenia.ReviewChecks
