import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { createExhibitionState, createEventIdentifier } from '../model.mjs';

// Machine contract: current exhibition -> exact integer input -> independent Lean/Wolfram checks.
// Integer coordinates represent hundredths; no missing coordinate is converted to zero.
const directory = new URL('./',import.meta.url);
await mkdir(directory,{recursive:true});
const manifestBytes = await readFile(new URL('../exhibition.json',import.meta.url));
const manifest = JSON.parse(manifestBytes);
const state = createExhibitionState(manifest);
const known = manifest.items.filter(item=>item.semantic_position);
function integerUnits(value,scale) { const result=Math.round(value*scale);assert.ok(Math.abs(result/scale-value)<1e-12,'Exact input scale must fit the source value');return result; }
const coordinates = known.map(item=>item.semantic_position.values.map(value=>integerUnits(value,100)));
const presentation = manifest.items.map(item=>item.presentation_position.map(value=>integerUnits(value,10)));
const squared = coordinates.map(first=>coordinates.map(second=>first.reduce((sum,value,index)=>sum+(value-second[index])**2,0)));
let comparisons=0,maximumError=0;
for(let first=0;first<known.length;first++)for(let second=first+1;second<known.length;second++){
  const distance=state.semanticIndex.distanceBetween(known[first].record_id,known[second].record_id);
  const error=Math.abs(distance**2-squared[first][second]/10000);maximumError=Math.max(maximumError,error);
  assert.ok(error<1e-12);comparisons++;
}
assert.equal(manifest.fixed_time_step_seconds,1/60);assert.equal(manifest.maximum_steps_per_frame,5);
const audit={record_identifier:manifest.record_id,event_identifier:createEventIdentifier(),observed_at:new Date().toISOString(),state:'exact_inputs_prepared',manifest_sha256:createHash('sha256').update(manifestBytes).digest('hex'),coordinate_scale:100,presentation_scale:10,known_count:known.length,unknown_count:manifest.items.length-known.length,known_records:known.map(item=>({record_identifier:item.record_id,artist_name:item.artist_name})),coordinates,presentation,squared_distance_numerators:squared,squared_distance_denominator:10000,javascript_pair_comparisons:comparisons,maximum_squared_distance_error:maximumError};
await writeFile(new URL('exact-inputs.json',directory),JSON.stringify(audit,null,2)+'\n');

const tuple=values=>'('+values.join(', ')+')';
const lean=`import Std

namespace LumeniaExhibition

/- Machine contract: exact integer input, with denominator 100 for source coordinates.
Manifest SHA-256: ${audit.manifest_sha256}
Record UUID version 5: ${manifest.record_id}
This checks the mathematical model and current inputs, not the floating-point renderer or Rapier implementation. -/

abbrev Coordinate := Int × Int × Int
def knownCoordinates : List Coordinate := [${coordinates.map(tuple).join(', ')}]
def initialPresentationTenths : List Coordinate := [${presentation.map(tuple).join(', ')}]
def expectedSquaredDistances : List (List Nat) := ${JSON.stringify(squared)}

def squaredDistance (first second : Coordinate) : Nat :=
  (first.1-second.1).natAbs^2 + (first.2.1-second.2.1).natAbs^2 + (first.2.2-second.2.2).natAbs^2

structure Exhibition where
  semantic : Option Coordinate
  display : Coordinate
  physicsEnabled : Bool

def moveDisplay (state : Exhibition) (position : Coordinate) : Exhibition := {state with display := position}
def sourceDistance (first second : Exhibition) : Option Nat :=
  first.semantic.bind (fun a => second.semantic.map (squaredDistance a))

-- Explicit recursion and equality transport avoid inherited propositional extensionality.
theorem naturalSubtractionIsDifference (first second : Nat) :
    (first : Int)-(second : Int) = Int.subNatNat first second := by
  cases second with
  | zero => unfold Int.subNatNat; rw [Nat.zero_sub]; rfl
  | succ second => rfl

theorem subNatNatOrder : (first second : Nat) → Int.NonNeg (Int.subNatNat second first) → first ≤ second
  | 0, second, _ => Nat.zero_le second
  | first+1, 0, impossible => nomatch impossible
  | first+1, second+1, inside => by
      have difference : Int.subNatNat (second+1) (first+1) = Int.subNatNat second first := by
        unfold Int.subNatNat
        rw [Nat.succ_sub_succ_eq_sub, Nat.succ_sub_succ_eq_sub]
      exact Nat.succ_le_succ (subNatNatOrder first second ((congrArg Int.NonNeg difference).mp inside))

theorem naturalOrderFromInteger (first second : Nat) (inside : (first : Int) ≤ (second : Int)) : first ≤ second :=
  subNatNatOrder first second ((congrArg Int.NonNeg (naturalSubtractionIsDifference second first)).mp inside)

set_option maxRecDepth 10000 in
set_option maxHeartbeats 8000000 in
theorem finiteScoreBound : ∀ first second : Fin 101,
    -100 ≤ (first.val : Int)-(second.val : Int) ∧ (first.val : Int)-(second.val : Int) ≤ 100 := by decide

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

theorem squaredDistanceNonnegative (first second : Coordinate) : 0 ≤ squaredDistance first second := Nat.zero_le _
theorem movePreservesSource (state : Exhibition) (position : Coordinate) :
    (moveDisplay state position).semantic = state.semantic := rfl
theorem movePreservesDistance (first second : Exhibition) (p q : Coordinate) :
    sourceDistance (moveDisplay first p) (moveDisplay second q) = sourceDistance first second := rfl
theorem missingSourceStaysMissing (display position : Coordinate) (enabled : Bool) :
    (moveDisplay ⟨none,display,enabled⟩ position).semantic = none := rfl

def bounded (point : Coordinate) : Bool :=
  decide (-100 ≤ point.1 ∧ point.1 ≤ 100 ∧ -100 ≤ point.2.1 ∧ point.2.1 ≤ 100 ∧ -100 ≤ point.2.2 ∧ point.2.2 ≤ 100)
theorem allSourceCoordinatesBounded : knownCoordinates.all bounded = true := by decide
theorem exactSquaredDistanceMatrix :
    knownCoordinates.map (fun first=>knownCoordinates.map (squaredDistance first)) = expectedSquaredDistances := by decide
theorem allSquaredDistancesWithinCube : expectedSquaredDistances.all (fun row=>row.all (fun value=>decide (value ≤ 120000))) = true := by decide
def separated (first second : Coordinate) : Bool := decide (60 ≤ (first.1-second.1).natAbs ∨ 40 ≤ (first.2.1-second.2.1).natAbs)
theorem initialPanelsDoNotOverlap :
    initialPresentationTenths.all (fun first=>initialPresentationTenths.all (fun second=>decide (first=second) || separated first second)) = true := by decide
theorem initialPanelPositionsUnique : initialPresentationTenths.Nodup := by decide
theorem defaultPhysicsIsDisabled (source : Option Coordinate) (display : Coordinate) :
    (Exhibition.mk source display false).physicsEnabled = false := rfl

-- One unit below is 1/120 second. A simulation step occupies two units.
def requestedSteps (elapsedUnits : Nat) : Nat := min (elapsedUnits/2) 5
theorem constructiveMinRight (first second : Nat) : min first second ≤ second :=
  match Nat.decLe first second with
  | .isTrue inside => (congrArg (fun value=>value ≤ second) (Nat.min_def.trans (if_pos inside))).mpr inside
  | .isFalse outside => (congrArg (fun value=>value ≤ second) (Nat.min_def.trans (if_neg outside))).mpr (Nat.le_refl second)
theorem perFrameStepCap (elapsedUnits : Nat) : requestedSteps elapsedUnits ≤ 5 := constructiveMinRight _ _
theorem sixtyStepsEqualOneSecond : 60*2 = (120 : Nat) := by decide
theorem maximumFrameSpan : 5*2 = (10 : Nat) := by decide

end LumeniaExhibition
`;
const theoremNames=[...lean.matchAll(/^theorem (\w+)/gm)].map(match=>match[1]);
const annotated=lean.replace(/^(abbrev|def|structure|theorem) (\w+)/gm,(line,kind,name)=>{
  const hash=createHash('sha1').update(Buffer.from(manifest.record_id.replaceAll('-',''),'hex')).update(name).digest();hash[6]=(hash[6]&15)|80;hash[8]=(hash[8]&63)|128;
  const hex=hash.subarray(0,16).toString('hex'),identifier=[hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-');
  return '-- Declaration UUID version 5: '+identifier+'\n'+line;
});
await writeFile(new URL('Exhibition.lean',directory),annotated+'\n'+theoremNames.map(name=>'#print axioms LumeniaExhibition.'+name).join('\n')+'\n');
await writeFile(new URL('lean-toolchain',directory),'leanprover/lean4:v4.28.0\n');
await writeFile(new URL('lakefile.toml',directory),'name = "lumenia_exhibition_verification"\nversion = "0.1.0"\ndefaultTargets = ["Exhibition"]\n\n[[lean_lib]]\nname = "Exhibition"\n');

const wolframList=value=>JSON.stringify(value).replaceAll('[','{').replaceAll(']','}');
const code=`(* Exact values exported from the current exhibition. Manifest: ${audit.manifest_sha256} *)
coordinates = ${wolframList(coordinates)}/100;
presentation = ${wolframList(presentation)}/10;
expectedNumerators = ${wolframList(squared)};
squaredMatrix = Table[Total[(coordinates[[i]]-coordinates[[j]])^2],{i,Length[coordinates]},{j,Length[coordinates]}];
checks = <|
"real_score_difference_bounded" -> Resolve[ForAll[{a,b},Implies[0<=a<=1 && 0<=b<=1,-1<=a-b<=1]],Reals],
"normalized_two_component_mixture_bounded" -> Resolve[ForAll[{a,b,w},Implies[0<=a<=1 && 0<=b<=1 && 0<=w<=1,0<=w*a+(1-w)*b<=1]],Reals],
"coordinate_bounds" -> And@@Flatten[Map[-1<=#<=1&,coordinates,{2}]],
"exact_squared_distance_matrix_matches" -> (10000*squaredMatrix===expectedNumerators),
"distance_symmetry" -> (squaredMatrix===Transpose[squaredMatrix]),
"distance_diagonal_zero" -> (Diagonal[squaredMatrix]===ConstantArray[0,Length[coordinates]]),
"squared_distance_range" -> And@@Flatten[Map[0<=#<=12&,squaredMatrix,{2}]],
"initial_panels_do_not_overlap" -> And@@Flatten[Table[If[i==j,True,Abs[presentation[[i,1]]-presentation[[j,1]]]>=6 || Abs[presentation[[i,2]]-presentation[[j,2]]]>=4],{i,15},{j,15}]],
"sixty_steps_equal_one_second" -> (60*(1/60)==1),
"maximum_five_steps_equal_one_twelfth_second" -> (5*(1/60)==1/12)
|>;
ExportString[<|"checks"->checks,"all_passed"->And@@Values[checks],"known_count"->Length[coordinates],"unknown_count"->3,"unique_pairs"->Binomial[Length[coordinates],2],"squared_distance_numerators"->(10000*squaredMatrix),"squared_distance_denominator"->10000,"maximum_observed_distance"->N[Sqrt[Max[squaredMatrix]],12],"step_seconds"->N[1/60,12],"maximum_frame_seconds"->N[1/12,12]|>,"RawJSON"]
`;
await writeFile(new URL('wolfram.wl',directory),code);
console.log(JSON.stringify({known:audit.known_count,unknown:audit.unknown_count,pairs:comparisons,maximumError,theorems:theoremNames.length,manifest_sha256:audit.manifest_sha256}));
