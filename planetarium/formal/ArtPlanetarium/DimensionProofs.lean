import ArtPlanetarium.Dimension

namespace ArtPlanetarium

/-!
llm machine contract
artifact identifier (UUIDv5): e67bec4e-cc81-54b8-8de8-e04f06503867
execution identifier (UUIDv7): 01a09ab9-d6e6-735e-ad63-6db20639d0a6
recorded at: 2026-09-13T12:24:25.574Z
state: constructive dimension proof obligations
transition: indexed coordinate construction -> exact structural identities ->
  explicit information-loss and time-separation facts
Every theorem below is checked independently by Lean; no theorem asserts
artistic quality, historical truth, rasterization, or browser performance.
-/

-- declaration identifier (UUIDv5): 9a9c0ee7-fb1e-58f7-be05-6e2756747cb5
private theorem reconstructCoordinates {dimension : Nat}
    (coordinates : Coordinates (Nat.succ dimension)) :
    Coordinates.prepend (coordinateHeadAndTail coordinates).1
      (coordinateHeadAndTail coordinates).2 = coordinates :=
  Coordinates.rec
    (motive := fun dimension => match dimension with
      | 0 => fun _ => True
      | Nat.succ remaining => fun (coordinates : Coordinates (Nat.succ remaining)) =>
          Coordinates.prepend (coordinateHeadAndTail coordinates).1
            (coordinateHeadAndTail coordinates).2 = coordinates)
    True.intro (fun _ _ _ => rfl) coordinates

-- declaration identifier (UUIDv5): afcdb8f1-3c1e-5542-9e61-9004bf45861d
theorem coordinate_count_matches_dimension {dimension : Nat}
    (coordinates : Coordinates dimension) :
    (coordinatesToList coordinates).length = dimension :=
  Coordinates.rec
    (motive := fun dimension coordinates => (coordinatesToList coordinates).length = dimension)
    rfl (fun _ _ inductionHypothesis => congrArg Nat.succ inductionHypothesis) coordinates

-- declaration identifier (UUIDv5): 106a3d19-29b4-5edb-8b94-a429b7d614b7
theorem decoding_encoded_coordinates_recovers_input {dimension : Nat}
    (coordinates : Coordinates dimension) :
    decodeCoordinates dimension (coordinatesToList coordinates) = some coordinates :=
  Coordinates.rec
    (motive := fun dimension coordinates =>
      decodeCoordinates dimension (coordinatesToList coordinates) = some coordinates)
    rfl (fun value tail inductionHypothesis => by
      change (match decodeCoordinates _ (coordinatesToList tail) with
        | some rest => some (Coordinates.prepend value rest)
        | none => none) = some (Coordinates.prepend value tail)
      rw [inductionHypothesis]) coordinates

-- declaration identifier (UUIDv5): babd30e5-a7d9-58d0-91e6-18b382fdef3e
theorem embedding_then_dropping_axis_recovers_coordinates {dimension : Nat}
    (coordinates : Coordinates dimension) (appendedAxis : Int) :
    dropLastAxis (appendAxis coordinates appendedAxis) = coordinates :=
  Coordinates.rec
    (motive := fun _ coordinates => dropLastAxis (appendAxis coordinates appendedAxis) = coordinates)
    rfl (fun head _ inductionHypothesis => congrArg (Coordinates.prepend head) inductionHypothesis) coordinates

-- declaration identifier (UUIDv5): 46744f84-6213-53ee-b402-0830ac05ee84
theorem four_quarter_turns_recover_coordinates {dimension : Nat}
    (coordinates : Coordinates (dimension + 2)) :
    quarterTurnFirstPlane
        (quarterTurnFirstPlane
          (quarterTurnFirstPlane (quarterTurnFirstPlane coordinates))) = coordinates := by
  have outer := reconstructCoordinates coordinates
  have inner := reconstructCoordinates (coordinateHeadAndTail coordinates).2
  rw [← inner] at outer
  rw [← outer]
  change Coordinates.prepend (-(-((coordinateHeadAndTail coordinates).1)))
      (Coordinates.prepend (-(-((coordinateHeadAndTail (coordinateHeadAndTail coordinates).2).1)))
        (coordinateHeadAndTail (coordinateHeadAndTail coordinates).2).2) = _
  rw [Int.neg_neg, Int.neg_neg]

-- declaration identifier (UUIDv5): a5dcdfdd-7cc7-59fa-9d04-1831481591ac
theorem projection_ignores_additional_axis {dimension : Nat}
    (coordinates : Coordinates (dimension + 2)) (appendedAxis : Int) :
    projectToPlane (appendAxis coordinates appendedAxis) = projectToPlane coordinates := by
  have outer := reconstructCoordinates coordinates
  have inner := reconstructCoordinates (coordinateHeadAndTail coordinates).2
  rw [← inner] at outer
  rw [← outer]
  rfl

-- declaration identifier (UUIDv5): 2f2e4648-3de3-537a-8901-05f4fdf217ba
def fourDimensionalPointFirst : Coordinates 4 :=
  .prepend 1 (.prepend 2 (.prepend 3 (.prepend 4 .empty)))

-- declaration identifier (UUIDv5): 370eaadd-7ef5-5ed3-89a9-f27dcf9b0f7b
def fourDimensionalPointSecond : Coordinates 4 :=
  .prepend 1 (.prepend 2 (.prepend 3 (.prepend 5 .empty)))

-- declaration identifier (UUIDv5): 73c9bac3-9ee7-527a-ac14-e71379cedfb4
theorem projection_can_hide_fourth_axis :
    fourDimensionalPointFirst ≠ fourDimensionalPointSecond ∧
      projectToPlane fourDimensionalPointFirst =
        projectToPlane fourDimensionalPointSecond := by
  constructor
  · intro equality
    have fourth : (4 : Int) = 5 :=
      congrArg (fun coordinates => ((coordinatesToList coordinates).drop 3).headD 0) equality
    exact (by decide : (4 : Int) ≠ 5) fourth
  · rfl

-- declaration identifier (UUIDv5): 1a7894e1-0151-58fd-a3ed-556e7dc5b58e
theorem timestamp_is_not_a_spatial_axis {spaceDimension : Nat}
    (coordinates : Coordinates spaceDimension) (firstTimeMilliseconds secondTimeMilliseconds : Nat) :
    (makeSpatiotemporalSample coordinates firstTimeMilliseconds).coordinates =
        (makeSpatiotemporalSample coordinates secondTimeMilliseconds).coordinates := by
  rfl

end ArtPlanetarium
