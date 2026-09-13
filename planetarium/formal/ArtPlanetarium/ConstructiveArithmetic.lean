import Std

namespace ArtPlanetarium.ConstructiveArithmetic

/-!
llm machine contract
artifact identifier (UUIDv5): e67bec4e-cc81-54b8-8de8-e04f06503867
execution identifier (UUIDv7): 01a09ab9-d6e6-735e-ad63-6db20639d0a6
recorded at: 2026-09-13T12:24:25.574Z
state: remove inherited propositional extensionality
transition: standard arithmetic lemmas -> explicit recursion and equality transport -> transitive audit
The modulo fuel argument follows Lean 4.28.0 Init/Data/Nat/Div/Basic.lean,
Copyright Microsoft Corporation, Apache-2.0, but avoids proposition-rewriting simplification.
-/

-- declaration identifier (UUIDv5): 11439aae-5886-5842-beec-17dad0d4f400
theorem cancelAddedRight (first second : Nat) : first + second - second = first := by
  induction second with
  | zero => rfl
  | succ second inductionHypothesis =>
      exact (Nat.succ_sub_succ_eq_sub (first + second) second).trans inductionHypothesis

-- declaration identifier (UUIDv5): 0ed75250-a5ef-5c60-874e-98b11b61c5c3
theorem cancelAddedLeft (first second : Nat) : first + second - first = second :=
  (congrArg (fun value => value - first) (Nat.add_comm first second)).trans
    (cancelAddedRight second first)

-- declaration identifier (UUIDv5): 7a63ea12-9170-590c-a3d2-9a692ef9d746
theorem restoreSubtracted (span coordinate : Nat) (inside : coordinate ≤ span) :
    span - coordinate + coordinate = span := by
  obtain ⟨remaining, equality⟩ := Nat.le.dest inside
  cases equality
  rw [cancelAddedLeft]
  exact Nat.add_comm remaining coordinate

private theorem fuelIndependent (coordinate span firstFuel secondFuel : Nat) (positive : 0 < span)
    (firstEnough : coordinate < firstFuel) (secondEnough : coordinate < secondFuel) :
    Nat.modCore.go span positive firstFuel coordinate firstEnough =
      Nat.modCore.go span positive secondFuel coordinate secondEnough := by
  match firstFuel, secondFuel with
  | 0, _ => exact False.elim (Nat.not_lt_zero coordinate firstEnough)
  | _, 0 => exact False.elim (Nat.not_lt_zero coordinate secondEnough)
  | firstFuel + 1, secondFuel + 1 =>
      simp only [Nat.modCore.go]
      split
      · exact fuelIndependent _ _ _ _ _ _ _
      · rfl
termination_by structural firstFuel

private theorem coreStep (coordinate span : Nat) (positive : 0 < span) (fits : span ≤ coordinate) :
    Nat.modCore coordinate span = Nat.modCore (coordinate - span) span := by
  unfold Nat.modCore
  rw [dif_pos positive, dif_pos positive, Nat.modCore.go, dif_pos fits]
  exact fuelIndependent _ _ _ _ _ _ _

private theorem coreUnchanged (coordinate span : Nat) (doesNotFit : ¬ span ≤ coordinate) :
    Nat.modCore coordinate span = coordinate := by
  unfold Nat.modCore
  split
  · rw [Nat.modCore.go, dif_neg doesNotFit]
  · rfl

private theorem coreEqualsModulo (coordinate span : Nat) : Nat.modCore coordinate span = coordinate % span := by
  cases coordinate with
  | zero =>
      unfold Nat.modCore
      split
      · rename_i positive
        rw [Nat.modCore.go, dif_neg (fun fits => Nat.not_lt_zero 0 (Nat.lt_of_lt_of_le positive fits))]
        rfl
      · rfl
  | succ coordinate =>
      change Nat.modCore (coordinate + 1) span =
        (if span ≤ coordinate + 1 then Nat.modCore (coordinate + 1) span else coordinate + 1)
      split
      · rfl
      · rename_i doesNotFit
        exact coreUnchanged _ _ doesNotFit

-- declaration identifier (UUIDv5): b716c140-b323-576b-9f4d-3826659f0754
theorem addOneSpan (coordinate span : Nat) : (coordinate + span) % span = coordinate % span := by
  cases span with
  | zero => rfl
  | succ span =>
      rw [← coreEqualsModulo, ← coreEqualsModulo]
      rw [coreStep _ _ (Nat.zero_lt_succ span) (Nat.le_add_left _ _), cancelAddedRight]

-- declaration identifier (UUIDv5): aa49a091-ee74-5c0d-ab4c-9972be7d2daf
theorem addManySpans (coordinate span copies : Nat) :
    (coordinate + span * copies) % span = coordinate % span := by
  induction copies with
  | zero => rfl
  | succ copies inductionHypothesis =>
      rw [Nat.mul_succ, ← Nat.add_assoc, addOneSpan]
      exact inductionHypothesis

-- declaration identifier (UUIDv5): ff90f68a-42a9-52fb-bc1b-c9fac0803c39
theorem multipleHasZeroRemainder (span copies : Nat) : (span * copies) % span = 0 := by
  have result := addManySpans 0 span copies
  rw [Nat.zero_add] at result
  exact result

end ArtPlanetarium.ConstructiveArithmetic
