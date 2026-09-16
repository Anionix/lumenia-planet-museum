import Lumenia.Proofs

namespace Lumenia.Tests

/-!
llm machine contract
execution identifier (UUIDv7): 01a099bb-225c-7772-8fb8-869e4d9f9eec
state: regression witnesses
transition: universal claims -> positive witnesses and rejected counterexamples
These examples ensure acceptance is inhabited and exercise policy boundaries.
-/

def emptyAsset : RawAssetFlags := {}
def allLoaders : AssetPipelineOptions :=
  { hasMeshoptDecoder := true, hasKtx2Loader := true, hasDracoLoader := true
    keepsNamedNodes := true, keepsExtras := true }

example : (validateRawAsset emptyAsset {}).isSome = true := by decide
example : (validateRawAsset { usesExtensionMeshopt := true } allLoaders).isSome = true := by decide
example : (validateRawAsset { usesKhronosMeshopt := true } allLoaders).isSome = true := by decide
example : (validateRawAsset { usesKtx2 := true } allLoaders).isSome = true := by decide
example : (validateRawAsset { usesDraco := true } allLoaders).isSome = true := by decide

-- Asset-wide flags describe multiple textures/primitives; these mixes are allowed.
example : (validateRawAsset { usesKtx2 := true, usesWebp := true } allLoaders).isSome = true := by
  decide
example : (validateRawAsset { usesExtensionMeshopt := true, usesDraco := true }
    allLoaders).isSome = true := by decide
example : (selectAssetLoaders emptyAsset).dracoEnabled = false := by decide

example : (validateRawAsset { usesExtensionMeshopt := true, usesKhronosMeshopt := true }
    allLoaders).isSome = false := by decide
example : (validateRawAsset { usesExtensionMeshopt := true } {}).isSome = false := by decide
example : (validateRawAsset { usesKhronosMeshopt := true } {}).isSome = false := by decide
example : (validateRawAsset { usesKtx2 := true } {}).isSome = false := by decide
example : (validateRawAsset { usesDraco := true } {}).isSome = false := by decide
example : (validateRawAsset { requiresNamedNodes := true } {}).isSome = false := by decide
example : (validateRawAsset { requiresExtras := true } {}).isSome = false := by decide

example : runTransitions .source [.optimize, .validate, .ship] = some .shipped := by decide
example : runTransitions .source [.ship] = none := by decide
example : runTransitions .source [.validate, .ship] = none := by decide
example : runTransitions .source [.optimize, .ship] = none := by decide
example : runTransitions .source [.optimize, .validate, .validate, .ship] = none := by decide
example : runTransitions .source [.reject, .optimize, .validate, .ship] = none := by decide
example : runTransitions .source [.optimize, .validate, .ship, .ship] = none := by decide

def fixtureIdentity : ArtifactIdentity :=
  { artifactIdentifier := "regression-fixture", sourceRevision := "regression-fixture" }

example : Nonempty (ArtifactHistory fixtureIdentity emptyAsset {} .shipped) :=
  ⟨.ship (.validate (.optimize .source) (by decide))⟩

example : ¬ Nonempty
    (ArtifactHistory fixtureIdentity { usesKtx2 := true } {} .shipped) := by
  apply invalid_asset_has_no_shipped_history
  intro requirements
  have impossible := requirements.2.2.1 rfl
  cases impossible

-- Complete truth tables protect behavior when eliminating overlapping pattern compilation.
-- claim identifiers (UUIDv5): 3994c7e6-6387-590c-9922-3fad04fc482d,
-- ac27dc88-da25-51f7-8af5-c431e22cd72b, cf86cf5d-e0c7-58e4-aa77-ae4d0e72bf46
example : ([.source, .optimized, .validated, .shipped, .rejected] : List ArtifactStage).map
    (fun stage => ([.optimize, .validate, .ship, .reject] : List ArtifactEvent).map
      (transition stage)) =
    [[some .optimized, none, none, some .rejected],
     [none, some .validated, none, some .rejected],
     [none, none, some .shipped, some .rejected],
     [none, none, none, none], [none, none, none, none]] := by decide

example : ([.staticExport, .serverRuntime] : List DeploymentMode).map
    (fun mode => ([.pureRendering, .serverOnly, .browserApi, .state, .eventHandler,
      .threeDimensionalRendering] : List RuntimeCapability).map (deploymentCapabilityAllowed mode)) =
    [[true, false, true, true, true, true], [true, true, true, true, true, true]] := by decide

example : ([.server, .client] : List ComponentPlacement).map
    (fun placement => ([.pureRendering, .serverOnly, .browserApi, .state, .eventHandler,
      .threeDimensionalRendering] : List RuntimeCapability).map (componentPlacementAllowed placement)) =
    [[true, true, false, false, false, false], [true, false, true, true, true, true]] := by decide

example : componentRequirementsAllowed .staticExport .server [.pureRendering] = true := by
  decide
example : componentRequirementsAllowed .staticExport .client
    [.pureRendering, .browserApi, .state, .eventHandler, .threeDimensionalRendering] = true := by
  decide
example : componentRequirementsAllowed .staticExport .server [.serverOnly] = false := by decide
example : componentRequirementsAllowed .serverRuntime .client [.serverOnly] = false := by decide
example : componentRequirementsAllowed .serverRuntime .server [.serverOnly, .state] = false := by
  decide
example : componentRequirementsAllowed .serverRuntime .client [.serverOnly, .state] = false := by
  decide

example : CoreTransfer.withinBudget ⟨30720, 122880, 20480, 20480, 10240⟩ := by
  unfold CoreTransfer.withinBudget
  decide
example : ¬ CoreTransfer.withinBudget ⟨30721, 0, 0, 0, 0⟩ := by
  unfold CoreTransfer.withinBudget
  decide
example : ¬ CoreTransfer.withinBudget ⟨0, 122881, 0, 0, 0⟩ := by
  unfold CoreTransfer.withinBudget
  decide
example : evaluateMeasuredGate ⟨some 2500, 2500, "same", "same"⟩ = .pass := by decide
example : evaluateMeasuredGate ⟨some 2501, 2500, "same", "same"⟩ = .fail := by decide
example : evaluateMeasuredGate ⟨none, 2500, "same", "same"⟩ = .blocked := by decide
example : evaluateMeasuredGate ⟨some 1, 2500, "old", "new"⟩ = .staleEvidence := by decide

-- claimIdentifier=a9edc65d-7707-5763-bb76-176d2a2b21f6; executionIdentifier=01a0ab94-f361-737f-91a9-1dd9adeca578; transition=specified -> proved
-- Perm preserves multiplicity; regression tests check the JavaScript boundary, not this proof.
theorem checkNamePermutationIsInvariantUnderReversal (actual expected : List String) :
    List.Perm actual.reverse expected ↔ List.Perm actual expected := by
  let rec accumulated : (names reversed : List String) → List.Perm (names.reverseAux reversed) (names ++ reversed)
    | [], _ => .rfl
    | name :: names, reversed => (accumulated names (name :: reversed)).trans List.perm_middle
  have appendEmpty : actual ++ [] = actual := by
    induction actual with
    | nil => rfl
    | cons name names previous => exact congrArg (name :: ·) previous
  have reversal : actual.reverse.Perm actual := (accumulated actual []).trans (List.Perm.of_eq appendEmpty)
  exact ⟨fun permuted => reversal.symm.trans permuted, fun permuted => reversal.trans permuted⟩
#print axioms checkNamePermutationIsInvariantUnderReversal

end Lumenia.Tests
