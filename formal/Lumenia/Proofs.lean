import Lumenia.Model

namespace Lumenia

/-!
llm machine contract
execution identifier (UUIDv7): 01a099bb-225c-7772-8fb8-869e4d9f9eec
state: constructive universal proof obligations
transition: unchanged theorem statements -> constructive proofs -> zero-axiom audit
Proof names and their UUIDv5 identifiers are indexed in contracts/claims.json.
-/

private theorem boolean_conjunction (first second : Bool) :
    (first && second) = true ↔ first = true ∧ second = true := by
  cases first <;> cases second <;> decide

private theorem boolean_disjunction (first second : Bool) :
    (first || second) = true ↔ first = true ∨ second = true := by
  cases first <;> cases second <;> decide

private theorem boolean_implication (required available : Bool) :
    (!required || available) = true ↔ (required = true → available = true) := by
  cases required <;> cases available <;> decide

private theorem boolean_exclusion (first second : Bool) :
    (!(first && second)) = true ↔ ¬ (first = true ∧ second = true) := by
  cases first <;> cases second <;> decide

-- claim identifier (UUIDv5): 543e95a7-25d9-53eb-addf-1eca7283be44
theorem asset_checks_iff_requirements (flags : RawAssetFlags)
    (options : AssetPipelineOptions) :
    assetChecks flags options = true ↔ AssetRequirementsSatisfied flags options := by
  constructor
  · intro checked
    rcases (boolean_conjunction _ _).mp checked with ⟨firstFive, extras⟩
    rcases (boolean_conjunction _ _).mp firstFive with ⟨firstFour, names⟩
    rcases (boolean_conjunction _ _).mp firstFour with ⟨firstThree, draco⟩
    rcases (boolean_conjunction _ _).mp firstThree with ⟨firstTwo, ktx2⟩
    rcases (boolean_conjunction _ _).mp firstTwo with ⟨exclusive, meshopt⟩
    exact ⟨(boolean_exclusion _ _).mp exclusive,
      fun required => (boolean_implication _ _).mp meshopt
        ((boolean_disjunction _ _).mpr required),
      (boolean_implication _ _).mp ktx2, (boolean_implication _ _).mp draco,
      (boolean_implication _ _).mp names, (boolean_implication _ _).mp extras⟩
  · rintro ⟨exclusive, meshopt, ktx2, draco, names, extras⟩
    have firstTwo := (boolean_conjunction _ _).mpr
      ⟨(boolean_exclusion _ _).mpr exclusive,
        (boolean_implication _ _).mpr (fun required =>
          meshopt ((boolean_disjunction _ _).mp required))⟩
    have firstThree := (boolean_conjunction _ _).mpr
      ⟨firstTwo, (boolean_implication _ _).mpr ktx2⟩
    have firstFour := (boolean_conjunction _ _).mpr
      ⟨firstThree, (boolean_implication _ _).mpr draco⟩
    have firstFive := (boolean_conjunction _ _).mpr
      ⟨firstFour, (boolean_implication _ _).mpr names⟩
    exact (boolean_conjunction _ _).mpr
      ⟨firstFive, (boolean_implication _ _).mpr extras⟩

-- claim identifier (UUIDv5): a0e5e544-3a28-588f-a04a-ecef28a75a68
theorem validate_raw_asset_accepts_iff (flags : RawAssetFlags)
    (options : AssetPipelineOptions) :
    (∃ asset, validateRawAsset flags options = some asset) ↔
      AssetRequirementsSatisfied flags options := by
  constructor
  · rintro ⟨asset, accepted⟩
    unfold validateRawAsset at accepted
    split at accepted
    · rename_i passed
      exact (asset_checks_iff_requirements flags options).mp passed
    · contradiction
  · intro requirements
    have passed := (asset_checks_iff_requirements flags options).mpr requirements
    exact ⟨⟨flags, options, passed⟩, dif_pos passed⟩

-- claim identifier (UUIDv5): 884dc2e4-94c4-5622-904e-789dd2186b47
theorem validate_raw_asset_rejects_iff (flags : RawAssetFlags)
    (options : AssetPipelineOptions) :
    validateRawAsset flags options = none ↔ ¬ AssetRequirementsSatisfied flags options := by
  constructor
  · intro rejected requirements
    obtain ⟨asset, accepted⟩ :=
      (validate_raw_asset_accepts_iff flags options).mpr requirements
    cases rejected.symm.trans accepted
  · intro invalid
    have failed : assetChecks flags options ≠ true := fun passed =>
      invalid ((asset_checks_iff_requirements flags options).mp passed)
    exact dif_neg failed

-- claim identifier (UUIDv5): 2914c7f0-ea38-5cec-9c53-715cf16e3f2c
theorem validate_raw_asset_preserves_input (flags : RawAssetFlags)
    (options : AssetPipelineOptions) (asset : ValidatedAsset)
    (accepted : validateRawAsset flags options = some asset) :
    asset.sourceFlags = flags ∧ asset.pipelineOptions = options := by
  unfold validateRawAsset at accepted
  split at accepted
  · cases Option.some.inj accepted
    exact ⟨rfl, rfl⟩
  · contradiction

-- claim identifier (UUIDv5): 9ed18638-7432-544f-8710-0cde084b9195
theorem validate_raw_asset_sound (flags : RawAssetFlags)
    (options : AssetPipelineOptions) (asset : ValidatedAsset)
    (accepted : validateRawAsset flags options = some asset) :
    AssetRequirementsSatisfied flags options :=
  (validate_raw_asset_accepts_iff flags options).mp ⟨asset, accepted⟩

-- claim identifier (UUIDv5): b3467681-81a2-5183-929d-9afc9aaf60f0
theorem validated_asset_satisfies_requirements (asset : ValidatedAsset) :
    AssetRequirementsSatisfied asset.sourceFlags asset.pipelineOptions :=
  (asset_checks_iff_requirements _ _).mp asset.checksPassed

-- claim identifier (UUIDv5): 3e92b122-d2fe-5890-8c24-aafcd8fc5e33
theorem meshopt_variants_are_exclusive (flags : RawAssetFlags)
    (options : AssetPipelineOptions) (asset : ValidatedAsset)
    (accepted : validateRawAsset flags options = some asset) :
    ¬ (flags.usesExtensionMeshopt = true ∧ flags.usesKhronosMeshopt = true) :=
  (validate_raw_asset_sound flags options asset accepted).1

-- claim identifier (UUIDv5): 90c7faa1-9721-596d-a8db-5b581572be33
theorem extension_meshopt_requires_decoder (flags : RawAssetFlags)
    (options : AssetPipelineOptions) (asset : ValidatedAsset)
    (accepted : validateRawAsset flags options = some asset)
    (required : flags.usesExtensionMeshopt = true) :
    options.hasMeshoptDecoder = true :=
  (validate_raw_asset_sound flags options asset accepted).2.1 (Or.inl required)

-- claim identifier (UUIDv5): e76f697b-718a-5cbb-b937-3695710767a3
theorem khronos_meshopt_requires_decoder (flags : RawAssetFlags)
    (options : AssetPipelineOptions) (asset : ValidatedAsset)
    (accepted : validateRawAsset flags options = some asset)
    (required : flags.usesKhronosMeshopt = true) :
    options.hasMeshoptDecoder = true :=
  (validate_raw_asset_sound flags options asset accepted).2.1 (Or.inr required)

-- claim identifier (UUIDv5): 35ba9d6b-abfe-5438-bdcf-960f8eb0158f
theorem ktx2_requires_loader (flags : RawAssetFlags)
    (options : AssetPipelineOptions) (asset : ValidatedAsset)
    (accepted : validateRawAsset flags options = some asset)
    (required : flags.usesKtx2 = true) :
    options.hasKtx2Loader = true :=
  (validate_raw_asset_sound flags options asset accepted).2.2.1 required

-- claim identifier (UUIDv5): 935c5368-7869-56ac-9346-a3719e4c4a62
theorem draco_requires_loader (flags : RawAssetFlags)
    (options : AssetPipelineOptions) (asset : ValidatedAsset)
    (accepted : validateRawAsset flags options = some asset)
    (required : (selectAssetLoaders flags).dracoEnabled = true) :
    flags.usesDraco = true ∧ options.hasDracoLoader = true := by
  change flags.usesDraco = true at required
  exact ⟨required, (validate_raw_asset_sound flags options asset accepted).2.2.2.1 required⟩

-- claim identifier (UUIDv5): 7ba57ba1-7481-5f8b-bb84-1e94930879d9
theorem draco_is_enabled_iff_explicit (flags : RawAssetFlags) :
    (selectAssetLoaders flags).dracoEnabled = true ↔ flags.usesDraco = true := by
  rfl

-- claim identifier (UUIDv5): 13c791ec-40a2-5749-986c-7816c521b2ff
theorem named_nodes_require_preservation (flags : RawAssetFlags)
    (options : AssetPipelineOptions) (asset : ValidatedAsset)
    (accepted : validateRawAsset flags options = some asset)
    (required : flags.requiresNamedNodes = true) :
    options.keepsNamedNodes = true :=
  (validate_raw_asset_sound flags options asset accepted).2.2.2.2.1 required

-- claim identifier (UUIDv5): 12ebcc33-1640-5e81-b5a2-f400102331f1
theorem extras_require_preservation (flags : RawAssetFlags)
    (options : AssetPipelineOptions) (asset : ValidatedAsset)
    (accepted : validateRawAsset flags options = some asset)
    (required : flags.requiresExtras = true) :
    options.keepsExtras = true :=
  (validate_raw_asset_sound flags options asset accepted).2.2.2.2.2 required

-- claim identifier (UUIDv5): 947ff2cf-29cd-5a00-bb98-ef9e37ff7408
theorem both_meshopt_flags_reject (flags : RawAssetFlags) (options : AssetPipelineOptions)
    (extension : flags.usesExtensionMeshopt = true)
    (khronos : flags.usesKhronosMeshopt = true) :
    validateRawAsset flags options = none := by
  apply (validate_raw_asset_rejects_iff flags options).mpr
  intro requirements
  exact requirements.1 ⟨extension, khronos⟩

-- claim identifier (UUIDv5): 04f36807-d7c2-527f-b22c-dacbdd0aded0
theorem missing_meshopt_decoder_rejects (flags : RawAssetFlags)
    (options : AssetPipelineOptions)
    (required : flags.usesExtensionMeshopt = true ∨ flags.usesKhronosMeshopt = true)
    (missing : options.hasMeshoptDecoder = false) :
    validateRawAsset flags options = none := by
  apply (validate_raw_asset_rejects_iff flags options).mpr
  intro requirements
  have available := requirements.2.1 required
  cases missing.symm.trans available

-- claim identifier (UUIDv5): 92cfff56-17f5-5995-b0f2-00254f41e0af
theorem shipped_requires_validation (stage : ArtifactStage) (event : ArtifactEvent) :
    transition stage event = some .shipped ↔ stage = .validated ∧ event = .ship := by
  cases stage <;> cases event <;> decide

private theorem rejected_never_reaches_shipped (events : List ArtifactEvent) :
    runTransitions .rejected events ≠ some .shipped := by
  intro reached
  cases events with
  | nil => cases reached
  | cons event events => cases event <;> cases reached

private theorem shipped_trace_is_empty (events : List ArtifactEvent) :
    runTransitions .shipped events = some .shipped ↔ events = [] := by
  constructor
  · intro reached
    cases events with
    | nil => rfl
    | cons event events => cases event <;> cases reached
  · intro empty
    cases empty
    rfl

private theorem validated_trace_is_ship (events : List ArtifactEvent) :
    runTransitions .validated events = some .shipped ↔ events = [.ship] := by
  constructor
  · intro reached
    cases events with
    | nil => cases reached
    | cons event events =>
        cases event with
        | optimize => cases reached
        | validate => cases reached
        | ship =>
            have empty := (shipped_trace_is_empty events).mp reached
            cases empty
            rfl
        | reject => exact False.elim (rejected_never_reaches_shipped events reached)
  · intro canonical
    cases canonical
    rfl

private theorem optimized_trace_is_validate_ship (events : List ArtifactEvent) :
    runTransitions .optimized events = some .shipped ↔ events = [.validate, .ship] := by
  constructor
  · intro reached
    cases events with
    | nil => cases reached
    | cons event events =>
        cases event with
        | optimize => cases reached
        | validate =>
            have suffix := (validated_trace_is_ship events).mp reached
            cases suffix
            rfl
        | ship => cases reached
        | reject => exact False.elim (rejected_never_reaches_shipped events reached)
  · intro canonical
    cases canonical
    rfl

-- claim identifier (UUIDv5): a968cd0f-8c5d-5953-906c-e40769388abd
theorem shipment_trace_is_exactly_optimize_validate_ship (events : List ArtifactEvent) :
    runTransitions .source events = some .shipped ↔
      events = [.optimize, .validate, .ship] := by
  constructor
  · intro reached
    cases events with
    | nil => cases reached
    | cons event events =>
        cases event with
        | optimize =>
            have suffix := (optimized_trace_is_validate_ship events).mp reached
            cases suffix
            rfl
        | validate => cases reached
        | ship => cases reached
        | reject => exact False.elim (rejected_never_reaches_shipped events reached)
  · intro canonical
    cases canonical
    rfl

-- claim identifier (UUIDv5): f781bfd5-a32e-534e-ac60-9ea5a9e9288a
theorem shipped_history_requires_asset_requirements
    {identity : ArtifactIdentity} {flags : RawAssetFlags} {options : AssetPipelineOptions}
    (history : ArtifactHistory identity flags options .shipped) :
    AssetRequirementsSatisfied flags options := by
  cases history with
  | ship previous =>
      cases previous with
      | validate optimized passed => exact (asset_checks_iff_requirements flags options).mp passed

-- claim identifier (UUIDv5): b4f27f24-d941-5e95-80fb-e70b2bb3eea9
theorem invalid_asset_has_no_shipped_history
    {identity : ArtifactIdentity} {flags : RawAssetFlags} {options : AssetPipelineOptions}
    (invalid : ¬ AssetRequirementsSatisfied flags options) :
    ¬ Nonempty (ArtifactHistory identity flags options .shipped) := by
  rintro ⟨history⟩
  exact invalid (shipped_history_requires_asset_requirements history)

-- claim identifier (UUIDv5): bc433078-b2a0-5ce6-9fc1-4eab157d6651
theorem browser_capability_requires_client_component (capability : RuntimeCapability)
    (placement : ComponentPlacement)
    (required : capabilityRequiresClient capability = true)
    (allowed : componentPlacementAllowed placement capability = true) :
    placement = .client := by
  cases capability <;> cases placement <;>
    solve | rfl | cases required | cases allowed

private theorem all_checked_at_member {Element : Type} (predicate : Element → Bool)
    {values : List Element} {value : Element}
    (checked : values.all predicate = true) (member : value ∈ values) :
    predicate value = true := by
  induction values with
  | nil => cases member
  | cons first rest induction =>
      have parts := (boolean_conjunction _ _).mp checked
      cases member with
      | head => exact parts.1
      | tail _ next => exact induction parts.2 next

-- claim identifier (UUIDv5): 21c3fceb-8154-5259-a619-ccfab976b7ee
theorem static_export_cannot_require_server_only (placement : ComponentPlacement)
    (requirements : List RuntimeCapability)
    (allowed : componentRequirementsAllowed .staticExport placement requirements = true) :
    RuntimeCapability.serverOnly ∉ requirements := by
  intro member
  have checked := all_checked_at_member _ allowed member
  have impossible := (boolean_conjunction _ _).mp checked |>.1
  cases impossible

-- claim identifier (UUIDv5): f248748f-077d-55e1-bda4-cff8afc69b06
theorem accepted_component_places_browser_requirements_on_client
    (mode : DeploymentMode) (placement : ComponentPlacement)
    (requirements : List RuntimeCapability) (capability : RuntimeCapability)
    (member : capability ∈ requirements)
    (required : capabilityRequiresClient capability = true)
    (allowed : componentRequirementsAllowed mode placement requirements = true) :
    placement = .client := by
  have checked := all_checked_at_member _ allowed member
  exact browser_capability_requires_client_component capability placement required
    ((boolean_conjunction _ _).mp checked).2

-- claim identifier (UUIDv5): 0aa200fe-8e88-529c-a69e-88c174a6df03
theorem client_component_cannot_require_server_only (mode : DeploymentMode)
    (requirements : List RuntimeCapability)
    (allowed : componentRequirementsAllowed mode .client requirements = true) :
    RuntimeCapability.serverOnly ∉ requirements := by
  intro member
  have checked := all_checked_at_member _ allowed member
  have impossible := (boolean_conjunction _ _).mp checked |>.2
  cases impossible

-- claim identifier (UUIDv5): bb538e9e-fbbb-5ca6-8ec2-1e1fb756eeb2
theorem core_transfer_total_within_budget (transfer : CoreTransfer)
    (bounded : transfer.withinBudget) : transfer.total ≤ coreTransferBudget := by
  have combined := Nat.add_le_add
    (Nat.add_le_add (Nat.add_le_add (Nat.add_le_add bounded.1 bounded.2.1)
      bounded.2.2.1) bounded.2.2.2.1) bounded.2.2.2.2
  exact combined

-- claim identifier (UUIDv5): 03b95321-0d34-58a2-9486-a88ac41889a5
theorem category_budget_total_is_204800_bytes :
    30 * kibibyte + 120 * kibibyte + 20 * kibibyte +
      20 * kibibyte + 10 * kibibyte = coreTransferBudget ∧
      coreTransferBudget = 204800 := by
  decide

-- claim identifier (UUIDv5): f5b5cea2-0aae-5d44-b5d6-4a1b36e192c5
theorem measured_gate_pass_iff (gate : MeasuredGate) :
    evaluateMeasuredGate gate = .pass ↔
      gate.measuredRevision = gate.requiredRevision ∧
      ∃ value, gate.observedValue = some value ∧ value ≤ gate.upperBound := by
  unfold evaluateMeasuredGate
  by_cases current : gate.measuredRevision = gate.requiredRevision
  · rw [if_neg (fun outdated => outdated current)]
    cases observed : gate.observedValue with
    | none =>
        constructor
        · intro impossible
          cases impossible
        · rintro ⟨_, value, present, _⟩
          cases present
    | some value =>
        dsimp only
        by_cases bounded : value ≤ gate.upperBound
        · rw [if_pos bounded]
          exact ⟨fun _ => ⟨current, value, rfl, bounded⟩, fun _ => rfl⟩
        · rw [if_neg bounded]
          constructor
          · intro impossible
            cases impossible
          · rintro ⟨_, claimed, present, within⟩
            cases Option.some.inj present
            exact False.elim (bounded within)
  · rw [if_pos current]
    constructor
    · intro impossible
      cases impossible
    · intro accepted
      exact False.elim (current accepted.1)

end Lumenia
