import Std

namespace LumeniaExploration

/- llm machine contract; UUIDv5: be15d308-d6c7-5b93-aca4-32206c14ac81; UUIDv7: 01a0abca-530f-79ff-8d8e-8ff29dd2b770.
State transition: source coordinate -> separate observer position -> optional collision.
This constructive integer model uses milliseconds and millimetres. Wolfram checks
the real-valued normalization; execution tests check JavaScript and actual Rapier.
The proof does not certify floating point shaders, browser timing or reconstructed history. -/

-- UUIDv5: f4d8a1eb-9181-56b2-b116-2cd965735f82
def cap : Nat → Nat → Nat
  | 0, _ => 0
  | _+1, 0 => 0
  | requested+1, limit+1 => cap requested limit + 1

-- Explicit recursion avoids propositional extensionality in library minimum lemmas.
-- UUIDv5: 6e3ccb75-67ea-5b56-b4cc-12c81a19149a
theorem capBound : (requested limit : Nat) → cap requested limit ≤ limit
  | 0, limit => Nat.zero_le limit
  | _+1, 0 => Nat.le_refl 0
  | requested+1, limit+1 => Nat.succ_le_succ (capBound requested limit)

-- UUIDv5: 0e1a402e-3608-56e6-8086-b934193d00ef
theorem elapsedTimeBound (elapsed : Nat) : cap elapsed 50 ≤ 50 := capBound elapsed 50

-- UUIDv5: 6c91f02b-ae5a-5ef3-8d30-f9d7c4c1a0bd; UUIDv7: 01a0abca-530f-79ff-8d8e-8ff29dd2b770.
theorem frameDeltaBound (delta : Int) : (if delta ≤ 0 then 0 else cap delta.toNat 50) ≤ 50 := by
  split
  · exact Nat.zero_le _
  · exact capBound _ _

-- Speed is metres per second, so speed times milliseconds gives millimetres.
-- UUIDv5: 94db9690-12d0-5335-ad02-e97b23494cdd
theorem displacementBound (speed elapsed : Nat) (boundedSpeed : speed ≤ 16) :
    speed * cap elapsed 50 ≤ 800 :=
  Nat.le_trans (Nat.mul_le_mul_left speed (elapsedTimeBound elapsed))
    (Nat.mul_le_mul_right 50 boundedSpeed)

-- UUIDv5: 27107964-8a39-5dd2-b3c3-916e3bbd6338
theorem observerMagnitudeBound (magnitude : Nat) : cap magnitude 400000 ≤ 400000 := capBound magnitude 400000

-- UUIDv5: 5c007b81-0818-5d6d-b798-8f5c89d95d4d
structure WorldState where
  source : Option (Int × Int × Int)
  observer : Int × Int × Int
  collisionEnabled : Bool := false

-- UUIDv5: 35f0bc48-8510-52db-a5a5-7b920bdc80c4
def moveObserver (state : WorldState) (next : Int × Int × Int) : WorldState := {state with observer := next}
-- UUIDv5: 58618c46-a638-5e20-a3fa-3fb8fdf19ad6
theorem movementPreservesSource (state : WorldState) (next : Int × Int × Int) :
    (moveObserver state next).source = state.source := rfl
-- UUIDv5: 6b50c501-0201-5ff1-9ab7-7e226d8adbd1
theorem missingSourceRemainsMissing (position next : Int × Int × Int) :
    (moveObserver ⟨none,position,false⟩ next).source = none := rfl
-- UUIDv5: e8a0eec4-5e77-583c-a7b8-7a1e27085c84
theorem collisionStartsDisabled (source : Option (Int × Int × Int)) (position : Int × Int × Int) :
    ({source := source, observer := position} : WorldState).collisionEnabled = false := rfl
-- UUIDv5: 371aeacb-aab8-5860-bcce-b68e8051de51
theorem movementPreservesCollisionChoice (state : WorldState) (next : Int × Int × Int) :
    (moveObserver state next).collisionEnabled = state.collisionEnabled := rfl
-- UUIDv5: 0b3566ed-b7e4-57e3-9735-cdb006f84865
theorem passageClearance : 3000 - 500 - 400 - 50 = (2050 : Nat) := rfl
-- UUIDv5: 01f224eb-b187-55d6-ad22-e4a6b8863200
theorem passageHasRoom : 400 + 50 < (3000 - 500 : Nat) := by decide

#print axioms capBound
#print axioms elapsedTimeBound
#print axioms frameDeltaBound
#print axioms displacementBound
#print axioms observerMagnitudeBound
#print axioms movementPreservesSource
#print axioms missingSourceRemainsMissing
#print axioms collisionStartsDisabled
#print axioms movementPreservesCollisionChoice
#print axioms passageClearance
#print axioms passageHasRoom
end LumeniaExploration
