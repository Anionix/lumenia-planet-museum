import Lean
import ArtPlanetarium.Model
import ArtPlanetarium.Dimension

/-!
llm machine contract
artifact identifier (UUIDv5): e67bec4e-cc81-54b8-8de8-e04f06503867
execution identifier (UUIDv7): 01a09a86-bce5-77fe-8aff-ce403b00e379
state: exact integer boundary, not browser certification
transition: untrusted JSON fields -> checked parameters -> deterministic samples
The JavaScript adapter additionally rejects unknown fields and unsafe integers.
-/

open ArtPlanetarium Lean

def readParameters (json : Json) : Except String RawMaterialParameters := do
  return {
    repeatCount := ← json.getObjValAs? Nat "repeatCount"
    gridStep := ← json.getObjValAs? Nat "gridStep"
    durationMilliseconds := ← json.getObjValAs? Nat "durationMilliseconds"
    layerCount := ← json.getObjValAs? Nat "layerCount"
    opacityPercent := ← json.getObjValAs? Nat "opacityPercent"
    paletteSize := ← json.getObjValAs? Nat "paletteSize" }

def optionalQuarterTurn : {dimension : Nat} → Coordinates dimension → Json
  | 0, _ => Json.null
  | 1, _ => Json.null
  | _ + 2, coordinates => toJson (coordinatesToList (quarterTurnFirstPlane coordinates))

def readCoordinateProjection (json : Json) : Except String Json := do
  let rejected := Json.mkObj [("accepted", toJson false)]
  let object ← json.getObj?
  let keys := object.toList.map Prod.fst
  let expected := ["operation", "spaceDimensions", "components", "appendedAxis", "timeMilliseconds", "coordinateUnit"]
  if keys.length != expected.length || !keys.all (fun key => expected.contains key) then
    return rejected
  let operation ← json.getObjValAs? String "operation"
  let unit ← json.getObjValAs? String "coordinateUnit"
  let dimension ← json.getObjValAs? Nat "spaceDimensions"
  let components ← json.getObjValAs? (List Int) "components"
  let appendedAxis ← json.getObjValAs? Int "appendedAxis"
  let milliseconds ← json.getObjValAs? Nat "timeMilliseconds"
  if operation != "coordinateProjection" || unit != coordinateUnitName .integerGridUnit ||
      (validateSpaceDimension dimension).isNone || milliseconds > 120000000 ||
      appendedAxis.natAbs > 1000000 || !components.all (fun value => value.natAbs ≤ 1000000) then
    return rejected
  let some coordinates := decodeCoordinates dimension components | return rejected
  let sample := makeSpatiotemporalSample coordinates milliseconds
  let embedded := appendAxis sample.coordinates appendedAxis
  return Json.mkObj [
    ("accepted", toJson true), ("spaceDimensions", toJson dimension),
    ("coordinateUnit", toJson (coordinateUnitName .integerGridUnit)),
    ("components", toJson (coordinatesToList sample.coordinates)),
    ("embeddedComponents", toJson (coordinatesToList embedded)),
    ("restoredComponents", toJson (coordinatesToList (dropLastAxis embedded))),
    ("projectedComponents", toJson (coordinatesToList (projectToPlane sample.coordinates))),
    ("quarterTurnComponents", optionalQuarterTurn sample.coordinates),
    ("discardedAxisCount", toJson (dimension - 2)),
    ("timeMilliseconds", toJson sample.timeMilliseconds)]

def evaluateMaterialRequest (json : Json) : Except String Json := do
  let raw ← readParameters (← json.getObjVal? "parameters")
  if (validateMaterialParameters raw).isNone then
    return Json.mkObj [("accepted", toJson false)]
  let index ← json.getObjValAs? Nat "index"
  let elapsed ← json.getObjValAs? Nat "elapsed"
  let seed ← json.getObjValAs? Nat "seed"
  let reducedMotion ← json.getObjValAs? Bool "reducedMotion"
  let playing ← json.getObjValAs? Bool "playing"
  let firstChannel ← json.getObjValAs? Nat "firstChannel"
  let secondChannel ← json.getObjValAs? Nat "secondChannel"
  if firstChannel > 255 || secondChannel > 255 then
    return Json.mkObj [("accepted", toJson false)]
  let supportCount ← json.getObjValAs? Nat "supportCount"
  let contradictionCount ← json.getObjValAs? Nat "contradictionCount"
  let stale ← json.getObjValAs? Bool "stale"
  let decision := match reviewEvidence supportCount contradictionCount stale with
    | .pass => "pass" | .fail => "fail" | .blocked => "blocked" | .staleEvidence => "staleEvidence"
  let planeNormal := match planeNormalForIndex index with
    | .horizontal => "horizontal" | .vertical => "vertical" | .depth => "depth"
  return Json.mkObj [
    ("accepted", toJson true),
    ("tileCoordinate", toJson (tileCoordinate index raw.gridStep)),
    ("mirrorCoordinate", toJson (mirrorCoordinate 100 raw.opacityPercent)),
    ("gridCoordinate", toJson (gridCoordinate raw.gridStep index)),
    ("haloAngle", toJson (haloAngle index)),
    ("orthogonalAngle", toJson (orthogonalAngle index)),
    ("routeAngle", toJson (routeAngle index)),
    ("planeNormal", toJson planeNormal),
    ("paletteIndex", toJson (paletteIndex index raw.paletteSize)),
    ("motionPhase", toJson (motionPhase reducedMotion elapsed raw.durationMilliseconds)),
    ("playing", toJson (togglePlaying playing)),
    ("channelMixNumerator", toJson (channelMixNumerator firstChannel secondChannel raw.opacityPercent)),
    ("foldLeftWidth", toJson (foldLeftWidth seed)),
    ("foldRightWidth", toJson (foldRightWidth seed)),
    ("evidenceDecision", toJson decision)]

def evaluateRequest (input : String) : Except String Json := do
  let json ← Json.parse input
  match json.getObjVal? "operation" with
  | .ok _ =>
      match readCoordinateProjection json with
      | .ok result => return result
      | .error _ => return Json.mkObj [("accepted", toJson false)]
  | .error _ => evaluateMaterialRequest json

def main : IO Unit := do
  let input ← IO.getStdin
  let output ← IO.getStdout
  repeat
    let line ← input.getLine
    if line.isEmpty then break
    let result := match evaluateRequest line with
      | .ok value => value
      | .error reason => Json.mkObj [("accepted", toJson false), ("failureReason", toJson reason)]
    output.putStrLn result.compress
