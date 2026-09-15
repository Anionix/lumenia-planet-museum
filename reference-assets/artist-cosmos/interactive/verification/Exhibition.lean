import Std

namespace LumeniaExhibition

/- Machine contract: exact integer input, with denominator 100 for source coordinates.
Manifest SHA-256: 108306a4418dd2b7740e2f7130cdac366adc5352d305722047dc41c1db96d616
Record UUID version 5: 812bd57c-a4b2-5b44-a893-e7740a3b032e
This checks the mathematical model and current inputs, not the floating-point renderer or Rapier implementation. -/

-- Declaration UUID version 5: 0cf59131-e6ad-58d5-bbbe-7693f36816b5
abbrev Coordinate := Int × Int × Int
-- Declaration UUID version 5: d4f5ff27-5482-59de-a3aa-633f100bfb57
def knownCoordinates : List Coordinate := [(-70, 5, -85), (-70, -45, -95), (25, 20, -25), (95, 60, 65), (95, 50, 50), (55, -65, -95), (85, 50, 55), (90, 65, 85), (85, 70, 85), (75, 80, 98), (45, 65, 98), (-35, -75, -10)]
-- Declaration UUID version 5: 4d84087b-cad7-507a-b5d8-a21e9d74ce28
def initialPresentationTenths : List Coordinate := [(-146, 52, 0), (-73, 52, 0), (0, 52, 0), (73, 52, 0), (146, 52, 0), (-146, 0, 0), (-73, 0, 0), (0, 0, 0), (73, 0, 0), (146, 0, 0), (-146, -52, 0), (-73, -52, 0), (0, -52, 0), (73, -52, 0), (146, -52, 0)]
-- Declaration UUID version 5: 4d7cd0ad-26b6-5fa1-9880-a9a2e63127f7
def expectedSquaredDistances : List (List Nat) := [[0,2600,12850,52750,47475,20625,45650,58100,57150,60139,50314,13250],[2600,0,18150,63850,57275,16025,55550,70100,69650,73899,62574,9350],[12850,18150,0,14600,11425,13025,10900,18350,18200,21229,17554,12850],[52750,63850,14600,0,325,42825,300,450,600,1889,3614,40750],[47475,57275,11425,325,0,35850,125,1475,1725,3604,5029,36125],[20625,16025,13025,42825,35850,0,36625,50525,51525,58674,54249,15425],[45650,55550,10900,300,125,36625,0,1150,1300,2849,3674,34250],[58100,70100,18350,450,1475,50525,1150,0,50,619,2194,44250],[57150,69650,18200,600,1725,51525,1300,50,0,369,1794,44450],[60139,73899,21229,1889,3604,58674,2849,619,369,0,1125,47789],[50314,62574,17554,3614,5029,54249,3674,2194,1794,1125,0,37664],[13250,9350,12850,40750,36125,15425,34250,44250,44450,47789,37664,0]]

-- Declaration UUID version 5: 6a57b8d7-7c7e-5d99-9bcd-7510a11d9180
def squaredDistance (first second : Coordinate) : Nat :=
  (first.1-second.1).natAbs^2 + (first.2.1-second.2.1).natAbs^2 + (first.2.2-second.2.2).natAbs^2

-- Declaration UUID version 5: f6d7ba8d-c198-5324-9163-de34158cbf42
structure Exhibition where
  semantic : Option Coordinate
  display : Coordinate
  physicsEnabled : Bool

-- Declaration UUID version 5: 757c8d4c-f130-540b-ae75-f1236cea02c3
def moveDisplay (state : Exhibition) (position : Coordinate) : Exhibition := {state with display := position}
-- Declaration UUID version 5: 5dd2fdf5-282a-56f1-ae95-dbecadade715
def sourceDistance (first second : Exhibition) : Option Nat :=
  first.semantic.bind (fun a => second.semantic.map (squaredDistance a))

-- Explicit recursion and equality transport avoid inherited propositional extensionality.
-- Declaration UUID version 5: 9ed31bf8-d11b-5fae-a735-378b8725733a
theorem naturalSubtractionIsDifference (first second : Nat) :
    (first : Int)-(second : Int) = Int.subNatNat first second := by
  cases second with
  | zero => unfold Int.subNatNat; rw [Nat.zero_sub]; rfl
  | succ second => rfl

-- Declaration UUID version 5: 9a846d2d-fc00-50a8-ab13-59380a944659
theorem subNatNatOrder : (first second : Nat) → Int.NonNeg (Int.subNatNat second first) → first ≤ second
  | 0, second, _ => Nat.zero_le second
  | first+1, 0, impossible => nomatch impossible
  | first+1, second+1, inside => by
      have difference : Int.subNatNat (second+1) (first+1) = Int.subNatNat second first := by
        unfold Int.subNatNat
        rw [Nat.succ_sub_succ_eq_sub, Nat.succ_sub_succ_eq_sub]
      exact Nat.succ_le_succ (subNatNatOrder first second ((congrArg Int.NonNeg difference).mp inside))

-- Declaration UUID version 5: 80fb4976-bf02-5c4f-a226-e1718dcdf8dd
theorem naturalOrderFromInteger (first second : Nat) (inside : (first : Int) ≤ (second : Int)) : first ≤ second :=
  subNatNatOrder first second ((congrArg Int.NonNeg (naturalSubtractionIsDifference second first)).mp inside)

set_option maxRecDepth 10000 in
set_option maxHeartbeats 8000000 in
-- Declaration UUID version 5: d96f4676-895f-568c-bc9e-fa77e7f5e688
theorem finiteScoreBound : ∀ first second : Fin 101,
    -100 ≤ (first.val : Int)-(second.val : Int) ∧ (first.val : Int)-(second.val : Int) ≤ 100 := by decide

-- Declaration UUID version 5: 48812016-59a2-5c55-9fda-970c479432ce
theorem scoreDifferenceBounded (first second : Int)
    (firstLow : 0 ≤ first) (firstHigh : first ≤ 100)
    (secondLow : 0 ≤ second) (secondHigh : second ≤ 100) :
    -100 ≤ first-second ∧ first-second ≤ 100 := by
  cases first with
  | negSucc first => exact False.elim (nomatch firstLow)
  | ofNat first =>
    cases second with
    | negSucc second => exact False.elim (nomatch secondLow)
    | ofNat second =>
      exact finiteScoreBound ⟨first,Nat.lt_succ_of_le (naturalOrderFromInteger first 100 firstHigh)⟩
        ⟨second,Nat.lt_succ_of_le (naturalOrderFromInteger second 100 secondHigh)⟩

-- Declaration UUID version 5: b29c824c-b4b3-541c-86d5-5fc39e10bc32
theorem squaredDistanceNonnegative (first second : Coordinate) : 0 ≤ squaredDistance first second := Nat.zero_le _
-- Declaration UUID version 5: 21d5cfc1-8f07-5d97-aeeb-ff99cccec82e
theorem movePreservesSource (state : Exhibition) (position : Coordinate) :
    (moveDisplay state position).semantic = state.semantic := rfl
-- Declaration UUID version 5: f08223ec-7647-52d5-b282-b6d30d6ef96d
theorem movePreservesDistance (first second : Exhibition) (p q : Coordinate) :
    sourceDistance (moveDisplay first p) (moveDisplay second q) = sourceDistance first second := rfl
-- Declaration UUID version 5: db3cec46-db5a-52f6-8e62-ca3bac87858e
theorem missingSourceStaysMissing (display position : Coordinate) (enabled : Bool) :
    (moveDisplay ⟨none,display,enabled⟩ position).semantic = none := rfl

-- Declaration UUID version 5: f8b70db4-454a-511c-ab76-f0d195545b7b
def bounded (point : Coordinate) : Bool :=
  decide (-100 ≤ point.1 ∧ point.1 ≤ 100 ∧ -100 ≤ point.2.1 ∧ point.2.1 ≤ 100 ∧ -100 ≤ point.2.2 ∧ point.2.2 ≤ 100)
-- Declaration UUID version 5: be249c93-44aa-50c7-b208-7c8fee7b672c
theorem allSourceCoordinatesBounded : knownCoordinates.all bounded = true := by decide
-- Declaration UUID version 5: 4cc597eb-7e02-5716-8cb1-ffeb5af04af1
theorem exactSquaredDistanceMatrix :
    knownCoordinates.map (fun first=>knownCoordinates.map (squaredDistance first)) = expectedSquaredDistances := by decide
-- Declaration UUID version 5: 2124d38d-43aa-5df7-9d20-c2ec25301071
theorem allSquaredDistancesWithinCube : expectedSquaredDistances.all (fun row=>row.all (fun value=>decide (value ≤ 120000))) = true := by decide
-- Declaration UUID version 5: 0a0a06af-44d3-5e05-9d0e-34d668dc78e7
def separated (first second : Coordinate) : Bool := decide (60 ≤ (first.1-second.1).natAbs ∨ 40 ≤ (first.2.1-second.2.1).natAbs)
-- Declaration UUID version 5: 26657d5f-5c1e-5b44-a14c-041f2195863a
theorem initialPanelsDoNotOverlap :
    initialPresentationTenths.all (fun first=>initialPresentationTenths.all (fun second=>decide (first=second) || separated first second)) = true := by decide
-- Declaration UUID version 5: 4b4e2d2a-2302-547b-8820-c51a72330ac5
theorem initialPanelPositionsUnique : initialPresentationTenths.Nodup := by decide
-- Declaration UUID version 5: a95a3850-dcdc-5612-8db7-5c314a2fca25
theorem defaultPhysicsIsDisabled (source : Option Coordinate) (display : Coordinate) :
    (Exhibition.mk source display false).physicsEnabled = false := rfl

-- One unit below is 1/120 second. A simulation step occupies two units.
-- Declaration UUID version 5: 58b6b8ca-e454-5b27-9e4c-4f88a064463a
def requestedSteps (elapsedUnits : Nat) : Nat := min (elapsedUnits/2) 5
-- Declaration UUID version 5: 848b4488-9b29-5105-9504-1ba9c135090e
theorem constructiveMinRight (first second : Nat) : min first second ≤ second :=
  match Nat.decLe first second with
  | .isTrue inside => (congrArg (fun value=>value ≤ second) (Nat.min_def.trans (if_pos inside))).mpr inside
  | .isFalse outside => (congrArg (fun value=>value ≤ second) (Nat.min_def.trans (if_neg outside))).mpr (Nat.le_refl second)
-- Declaration UUID version 5: 3b521d4d-4904-5c8c-be78-4dbd4dba6524
theorem perFrameStepCap (elapsedUnits : Nat) : requestedSteps elapsedUnits ≤ 5 := constructiveMinRight _ _
-- Declaration UUID version 5: 7ca1f9b1-0f7f-5073-a121-ffdea0b40946
theorem sixtyStepsEqualOneSecond : 60*2 = (120 : Nat) := by decide
-- Declaration UUID version 5: 9d06338d-b364-5817-9801-c832c5258abe
theorem maximumFrameSpan : 5*2 = (10 : Nat) := by decide

end LumeniaExhibition

#print axioms LumeniaExhibition.naturalSubtractionIsDifference
#print axioms LumeniaExhibition.subNatNatOrder
#print axioms LumeniaExhibition.naturalOrderFromInteger
#print axioms LumeniaExhibition.finiteScoreBound
#print axioms LumeniaExhibition.scoreDifferenceBounded
#print axioms LumeniaExhibition.squaredDistanceNonnegative
#print axioms LumeniaExhibition.movePreservesSource
#print axioms LumeniaExhibition.movePreservesDistance
#print axioms LumeniaExhibition.missingSourceStaysMissing
#print axioms LumeniaExhibition.allSourceCoordinatesBounded
#print axioms LumeniaExhibition.exactSquaredDistanceMatrix
#print axioms LumeniaExhibition.allSquaredDistancesWithinCube
#print axioms LumeniaExhibition.initialPanelsDoNotOverlap
#print axioms LumeniaExhibition.initialPanelPositionsUnique
#print axioms LumeniaExhibition.defaultPhysicsIsDisabled
#print axioms LumeniaExhibition.constructiveMinRight
#print axioms LumeniaExhibition.perFrameStepCap
#print axioms LumeniaExhibition.sixtyStepsEqualOneSecond
#print axioms LumeniaExhibition.maximumFrameSpan
