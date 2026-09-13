import Std

namespace ArtPlanetarium

/-!
llm machine contract
artifact identifier (UUIDv5): e67bec4e-cc81-54b8-8de8-e04f06503867
execution identifier (UUIDv7): 01a09ab9-d6e6-735e-ad63-6db20639d0a6
recorded at: 2026-09-13T12:24:25.574Z
state: dimension-generic integer-grid coordinate kernel
transition: external coordinateProjection request -> exact indexed coordinates ->
  append/drop/projection/optional first-plane rotation
The spatial dimension is an index of Coordinates. Time is a field of
SpatiotemporalSample and is never silently converted into a spatial axis.
The coordinate unit is an integer grid unit; CSS scaling is outside this kernel.
-/

-- declaration identifier (UUIDv5): 9e1598c9-6515-5266-a95d-7b52359e03f0
inductive CoordinateUnit where
  | integerGridUnit
  deriving DecidableEq, Repr

-- declaration identifier (UUIDv5): 60d222e0-f432-5d74-bc6c-f12064678377
def coordinateUnitName : CoordinateUnit → String
  | .integerGridUnit => "integerGridUnit"

-- declaration identifier (UUIDv5): 187b451c-d11c-5255-9602-96b2a9736799
def supportedSpaceDimension (dimension : Nat) : Prop :=
  1 ≤ dimension ∧ dimension ≤ 4

instance (dimension : Nat) : Decidable (supportedSpaceDimension dimension) := by
  unfold supportedSpaceDimension
  infer_instance

-- declaration identifier (UUIDv5): 9c930190-fb5f-5144-8c2f-baa329bed16b
def validateSpaceDimension (dimension : Nat) : Option Nat :=
  if _ : supportedSpaceDimension dimension then some dimension else none

-- declaration identifier (UUIDv5): 1f608e96-3b46-5655-8b36-2bec63067142
inductive Coordinates : Nat → Type where
  | empty : Coordinates 0
  | prepend {dimension : Nat} (value : Int) (tail : Coordinates dimension) :
      Coordinates (Nat.succ dimension)
  deriving DecidableEq, Repr

-- declaration identifier (UUIDv5): fa468782-1b31-5de0-8c1a-bf5771d1274f
def coordinatesToList {dimension : Nat} : Coordinates dimension → List Int
  | .empty => []
  | .prepend value tail => value :: coordinatesToList tail

/-- Eliminate the indexed type directly, without an arithmetic index matcher. -/
-- declaration identifier (UUIDv5): c37344c9-f2dc-5f4d-8cae-86d242521665
def coordinateHeadAndTail {dimension : Nat} (coordinates : Coordinates dimension) :
    match dimension with
    | 0 => Unit
    | Nat.succ remaining => Int × Coordinates remaining :=
  Coordinates.casesOn
    (motive := fun dimension _ => match dimension with
      | 0 => Unit
      | Nat.succ remaining => Int × Coordinates remaining)
    coordinates () (fun head tail => (head, tail))

-- declaration identifier (UUIDv5): 97361373-d8ed-5392-8c88-abc387267781
def decodeCoordinates : (dimension : Nat) → List Int → Option (Coordinates dimension)
  | 0, [] => some .empty
  | 0, _ :: _ => none
  | dimension + 1, value :: rest =>
      match decodeCoordinates dimension rest with
      | some tail => some (.prepend value tail)
      | none => none
  | _ + 1, [] => none

-- declaration identifier (UUIDv5): 402608dc-c1ba-5334-a63f-d9f97d30acc6
def appendAxis {dimension : Nat} :
    Coordinates dimension → Int → Coordinates (dimension + 1)
  | .empty, value => .prepend value .empty
  | .prepend head tail, value => .prepend head (appendAxis tail value)

-- declaration identifier (UUIDv5): 76adb1a5-8764-5a14-a615-411e484d5f3b
def dropLastAxis {dimension : Nat} (coordinates : Coordinates (Nat.succ dimension)) :
    Coordinates dimension :=
  match dimension with
  | 0 => .empty
  | _ + 1 =>
      let (head, tail) := coordinateHeadAndTail coordinates
      .prepend head (dropLastAxis tail)

-- declaration identifier (UUIDv5): 11ceca75-0c77-56af-9607-82ed71862747
def quarterTurnFirstPlane {dimension : Nat}
    (coordinates : Coordinates (Nat.succ (Nat.succ dimension))) :
    Coordinates (Nat.succ (Nat.succ dimension)) :=
  let (first, tail) := coordinateHeadAndTail coordinates
  let (second, rest) := coordinateHeadAndTail tail
  .prepend (-second) (.prepend first rest)

-- declaration identifier (UUIDv5): 59a36d4f-aa6c-50d1-b179-b18cf1219482
def twoCoordinates (first second : Int) : Coordinates 2 :=
  .prepend first (.prepend second .empty)

-- declaration identifier (UUIDv5): 3369aa36-69c3-5e12-a481-4928b65a4a4e
def projectToPlane {dimension : Nat} (coordinates : Coordinates dimension) : Coordinates 2 :=
  match coordinates with
  | .empty => twoCoordinates 0 0
  | .prepend first tail =>
      match tail with
      | .empty => twoCoordinates first 0
      | .prepend second _ => twoCoordinates first second

-- declaration identifier (UUIDv5): eaf50046-fb04-5dd6-84ef-5fd07102883e
structure SpatiotemporalSample (spaceDimension : Nat) where
  coordinates : Coordinates spaceDimension
  timeMilliseconds : Nat

-- declaration identifier (UUIDv5): d8785f8e-2c76-5127-bd52-2bee41b3bb7d
def makeSpatiotemporalSample {spaceDimension : Nat}
    (coordinates : Coordinates spaceDimension) (timeMilliseconds : Nat) :
    SpatiotemporalSample spaceDimension :=
  ⟨coordinates, timeMilliseconds⟩

-- declaration identifier (UUIDv5): 95f01ef6-7976-58d2-ba05-1a4ac17426f8
structure CoordinateProjectionRequest where
  spaceDimensions : Nat
  components : List Int
  appendedAxis : Int
  timeMilliseconds : Nat
  coordinateUnit : CoordinateUnit
  deriving DecidableEq, Repr

end ArtPlanetarium
