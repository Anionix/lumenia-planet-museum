import Std

namespace Lumenia.CosmicExhibition

/-!
llm machine contract; claim UUIDv5: 796d5e27-8862-52a6-a331-776d0066b23b
execution UUIDv7: 01a0a466-8ef5-7ceb-9da0-c6195d4d86ab
transition: supplied integer scores -> bounded semantic coordinates;
display motion changes only display state. Calendar years are not animation time.
Signed differences use separate nonnegative positive/negative parts. This model proves
their magnitude bounds and state invariants, not floating point trigonometry,
historical truth, visual resemblance, browser speed, or a real physics engine.
-/

structure ExhibitionState where
  semantic : Option (Int × Int × Int)
  display : Int × Int × Int
  physicsEnabled : Bool := false
  deriving DecidableEq

def moveDisplay (state : ExhibitionState) (position : Int × Int × Int) : ExhibitionState :=
  { state with display := position }

-- declaration identifier: c0367b69-6031-554f-bf67-9117c026aebe
theorem display_motion_preserves_semantics (state : ExhibitionState) (position : Int × Int × Int) :
    (moveDisplay state position).semantic = state.semantic := rfl

-- declaration identifier: aef00b01-ac1f-5eab-839b-d1ec3dc9b86e
theorem display_motion_preserves_physics_setting (state : ExhibitionState) (position : Int × Int × Int) :
    (moveDisplay state position).physicsEnabled = state.physicsEnabled := rfl

-- declaration identifier: f7a5f56d-e88c-5f9d-9ce5-0710f0d51703
theorem missing_semantics_stay_missing (position next : Int × Int × Int) :
    (moveDisplay ⟨none, position, false⟩ next).semantic = none := rfl

-- declaration identifier: 3d4a7b4e-6916-5715-a7ed-adf59fb98603
theorem default_physics_is_disabled (position : Int × Int × Int) :
    ({ semantic := none, display := position } : ExhibitionState).physicsEnabled = false := rfl

-- declaration identifier: aae351a9-b097-595c-bb1f-7d9a8ed51cb9
theorem score_difference_parts_bound (first second scale : Nat)
    (firstUpper : first ≤ scale) (secondUpper : second ≤ scale) :
    first - second ≤ scale ∧ second - first ≤ scale :=
  ⟨Nat.le_trans (Nat.sub_le first second) firstUpper,
   Nat.le_trans (Nat.sub_le second first) secondUpper⟩

def overlaps (firstStart firstEnd secondStart secondEnd : Nat) : Prop :=
  firstStart ≤ secondEnd ∧ secondStart ≤ firstEnd

-- declaration identifier: 54fcbba8-4d50-548b-a7ab-8f57a372e284
theorem overlap_is_symmetric (a b c d : Nat) : overlaps a b c d ↔ overlaps c d a b := by
  constructor
  · intro ⟨left, right⟩; exact ⟨right, left⟩
  · intro ⟨left, right⟩; exact ⟨right, left⟩

-- declaration identifier: e63728e6-d47b-54e5-be0d-32e18f54fbca
theorem widening_range_preserves_overlap (a b c d lower upper : Nat)
    (overlap : overlaps a b c d) (left : lower ≤ c) (right : d ≤ upper) :
    overlaps a b lower upper :=
  ⟨Nat.le_trans overlap.1 right, Nat.le_trans left overlap.2⟩

end Lumenia.CosmicExhibition
