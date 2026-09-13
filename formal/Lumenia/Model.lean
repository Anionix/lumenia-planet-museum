import Std

namespace Lumenia

/-!
llm machine contract
claim identifier (UUIDv5): 23a957e5-9f59-5c3b-bc34-893c4fd25630
execution identifier (UUIDv7): 01a0999c-a8aa-7f30-80ef-2e5f84ecdd54
state: specification repair
transition: unchecked tags -> executable checks -> witnessed acceptance

Flags describe an entire distribution asset, possibly containing many primitives
and textures. Only the two Meshopt variants are globally exclusive by Lumenia
policy. Decoder presence and the correspondence to actual asset bytes remain
external observations; Lean proves the rules over their supplied values.
-/

-- claim identifier (UUIDv5): 328fab0a-ee4e-5845-89f1-7bacbe429c1a
inductive MeshEncoding where
  | uncompressed | extensionMeshopt | khronosMeshopt | draco
  deriving DecidableEq, Repr

-- claim identifier (UUIDv5): e8570a8d-147e-5771-9ff5-157c229c1c8c
inductive TextureEncoding where
  | ordinaryImage | ktx2 | webp
  deriving DecidableEq, Repr

-- claim identifier (UUIDv5): 24feff3f-7ef4-581c-bcb8-3364697316f8
inductive DeploymentMode where
  | staticExport | serverRuntime
  deriving DecidableEq, Repr

-- claim identifier (UUIDv5): c18ba520-2736-5719-b0b6-9af365c11a87
inductive ArtifactStage where
  | source | optimized | validated | shipped | rejected
  deriving DecidableEq, Repr

-- claim identifier (UUIDv5): ac34bda1-1368-5cb2-b2d7-bacee4b4fd9e
inductive ArtifactEvent where
  | optimize | validate | ship | reject
  deriving DecidableEq, Repr

-- claim identifier (UUIDv5): 3b27ce6c-7dcf-5f7a-a71b-101cbfad963b
structure RawAssetFlags where
  usesExtensionMeshopt : Bool := false
  usesKhronosMeshopt : Bool := false
  usesKtx2 : Bool := false
  usesWebp : Bool := false
  usesDraco : Bool := false
  requiresNamedNodes : Bool := false
  requiresExtras : Bool := false
  deriving DecidableEq, Repr

-- claim identifier (UUIDv5): 13d93e80-57a8-5bc4-b93c-e683689b0140
structure AssetPipelineOptions where
  keepsNamedNodes : Bool := false
  keepsExtras : Bool := false
  hasMeshoptDecoder : Bool := false
  hasKtx2Loader : Bool := false
  hasDracoLoader : Bool := false
  deriving DecidableEq, Repr

/-- Declarative requirements; this definition does not call the checker. -/
-- claim identifier (UUIDv5): f514a394-cc9a-5056-9836-a5c47163454b
def AssetRequirementsSatisfied (flags : RawAssetFlags)
    (options : AssetPipelineOptions) : Prop :=
  ¬ (flags.usesExtensionMeshopt = true ∧ flags.usesKhronosMeshopt = true) ∧
  ((flags.usesExtensionMeshopt = true ∨ flags.usesKhronosMeshopt = true) →
    options.hasMeshoptDecoder = true) ∧
  (flags.usesKtx2 = true → options.hasKtx2Loader = true) ∧
  (flags.usesDraco = true → options.hasDracoLoader = true) ∧
  (flags.requiresNamedNodes = true → options.keepsNamedNodes = true) ∧
  (flags.requiresExtras = true → options.keepsExtras = true)

/-- Executable implementation, proved equivalent to the requirements in Proofs. -/
-- claim identifier (UUIDv5): 1935b9e4-32b9-55ac-a9ad-34630e915128
def assetChecks (flags : RawAssetFlags) (options : AssetPipelineOptions) : Bool :=
  !(flags.usesExtensionMeshopt && flags.usesKhronosMeshopt) &&
  (!(flags.usesExtensionMeshopt || flags.usesKhronosMeshopt) || options.hasMeshoptDecoder) &&
  (!flags.usesKtx2 || options.hasKtx2Loader) &&
  (!flags.usesDraco || options.hasDracoLoader) &&
  (!flags.requiresNamedNodes || options.keepsNamedNodes) &&
  (!flags.requiresExtras || options.keepsExtras)

/-- The proof refers to the executable check, not to an assumed policy conclusion. -/
-- claim identifier (UUIDv5): e88e77bc-c05b-51e9-a909-0d39fbc11c41
structure ValidatedAsset where
  sourceFlags : RawAssetFlags
  pipelineOptions : AssetPipelineOptions
  checksPassed : assetChecks sourceFlags pipelineOptions = true

-- claim identifier (UUIDv5): 097b066a-a5f0-5d12-adef-f1c342f5d2ec
def validateRawAsset (flags : RawAssetFlags) (options : AssetPipelineOptions) :
    Option ValidatedAsset :=
  if passed : assetChecks flags options = true then
    some ⟨flags, options, passed⟩
  else
    none

/-- Capabilities are available globally; activation is selected for this asset. -/
-- claim identifier (UUIDv5): 82a8d958-a488-5690-a85e-eb30de618353
structure AssetLoaderPlan where
  meshoptEnabled : Bool
  ktx2Enabled : Bool
  dracoEnabled : Bool
  deriving DecidableEq, Repr

-- claim identifier (UUIDv5): b2f8ba33-a6f3-5d03-820f-ff972f684c12
def selectAssetLoaders (flags : RawAssetFlags) : AssetLoaderPlan :=
  { meshoptEnabled := flags.usesExtensionMeshopt || flags.usesKhronosMeshopt
    ktx2Enabled := flags.usesKtx2
    dracoEnabled := flags.usesDraco }

-- claim identifier (UUIDv5): d31cd669-701d-51d0-be93-eeddf9a3445f
def RawAssetFlags.usesMeshEncoding (flags : RawAssetFlags) : MeshEncoding → Bool
  | .extensionMeshopt => flags.usesExtensionMeshopt
  | .khronosMeshopt => flags.usesKhronosMeshopt
  | .draco => flags.usesDraco
  | .uncompressed =>
      !(flags.usesExtensionMeshopt || flags.usesKhronosMeshopt || flags.usesDraco)

-- claim identifier (UUIDv5): e77a9263-3842-5155-a883-3847bc67ec9f
def RawAssetFlags.usesTextureEncoding (flags : RawAssetFlags) : TextureEncoding → Bool
  | .ktx2 => flags.usesKtx2
  | .webp => flags.usesWebp
  | .ordinaryImage => !(flags.usesKtx2 || flags.usesWebp)

-- claim identifier (UUIDv5): 3994c7e6-6387-590c-9922-3fad04fc482d
-- llm machine contract; execution UUIDv7: 01a099bb-225c-7772-8fb8-869e4d9f9eec
-- state: behavior preserved; transition: overlapping patterns -> disjoint exhaustive branches
def transition (stage : ArtifactStage) (event : ArtifactEvent) : Option ArtifactStage :=
  match stage with
  | .source => match event with
      | .optimize => some .optimized
      | .reject => some .rejected
      | .validate | .ship => none
  | .optimized => match event with
      | .validate => some .validated
      | .reject => some .rejected
      | .optimize | .ship => none
  | .validated => match event with
      | .ship => some .shipped
      | .reject => some .rejected
      | .optimize | .validate => none
  | .shipped | .rejected => none

-- claim identifier (UUIDv5): 788f1261-5eab-5834-9a12-7fbb0452b993
def runTransitions : ArtifactStage → List ArtifactEvent → Option ArtifactStage
  | stage, [] => some stage
  | stage, event :: events =>
      (transition stage event).bind (fun next => runTransitions next events)

-- claim identifier (UUIDv5): 8ecce8c5-3c1e-52ca-ab20-a454f7deeced
structure ArtifactIdentity where
  artifactIdentifier : String
  sourceRevision : String
  deriving DecidableEq, Repr

/-- Each constructor retains its predecessor and the same asset/revision/flags.
This records a model history, not proof that an external optimizer was executed. -/
-- claim identifier (UUIDv5): 067f873e-5ef3-5c49-a5ac-1fd13b3f0397
inductive ArtifactHistory (identity : ArtifactIdentity) (flags : RawAssetFlags)
    (options : AssetPipelineOptions) : ArtifactStage → Type where
  | source : ArtifactHistory identity flags options .source
  | optimize : ArtifactHistory identity flags options .source →
      ArtifactHistory identity flags options .optimized
  | validate : ArtifactHistory identity flags options .optimized →
      assetChecks flags options = true →
      ArtifactHistory identity flags options .validated
  | ship : ArtifactHistory identity flags options .validated →
      ArtifactHistory identity flags options .shipped
  | reject : ArtifactHistory identity flags options stage →
      (stage = .source ∨ stage = .optimized ∨ stage = .validated) →
      ArtifactHistory identity flags options .rejected

-- claim identifier (UUIDv5): e0d4f17c-0ccf-5a11-ba39-569277864561
inductive RuntimeCapability where
  | pureRendering
  | serverOnly
  | browserApi
  | state
  | eventHandler
  | threeDimensionalRendering
  deriving DecidableEq, Repr

-- claim identifier (UUIDv5): e9ea1c09-7aa1-5873-a397-d90edbcf128c
inductive ComponentPlacement where
  | server | client
  deriving DecidableEq, Repr

/-- serverOnly means a request-time server feature, not build-time rendering. -/
-- claim identifier (UUIDv5): ac27dc88-da25-51f7-8af5-c431e22cd72b
-- llm machine contract; execution UUIDv7: 01a099bb-225c-7772-8fb8-869e4d9f9eec
-- state: behavior preserved; transition: overlapping patterns -> disjoint exhaustive branches
def deploymentCapabilityAllowed (mode : DeploymentMode) (capability : RuntimeCapability) : Bool :=
  match mode with
  | .staticExport => match capability with
      | .serverOnly => false
      | .pureRendering | .browserApi | .state | .eventHandler | .threeDimensionalRendering => true
  | .serverRuntime => true

-- claim identifier (UUIDv5): ef44795d-30c3-5407-8efb-e46ac3aaa78f
def capabilityRequiresClient : RuntimeCapability → Bool
  | .browserApi | .state | .eventHandler | .threeDimensionalRendering => true
  | .pureRendering | .serverOnly => false

-- claim identifier (UUIDv5): cf86cf5d-e0c7-58e4-aa77-ae4d0e72bf46
-- llm machine contract; execution UUIDv7: 01a099bb-225c-7772-8fb8-869e4d9f9eec
-- state: behavior preserved; transition: overlapping patterns -> disjoint exhaustive branches
def componentPlacementAllowed (placement : ComponentPlacement) (capability : RuntimeCapability) : Bool :=
  match capability with
  | .pureRendering => true
  | .serverOnly => match placement with
      | .server => true
      | .client => false
  | .browserApi | .state | .eventHandler | .threeDimensionalRendering => match placement with
      | .server => false
      | .client => true

-- claim identifier (UUIDv5): 26bb27a4-4f8b-51de-bbd5-9d23b3a9d23b
def componentRequirementsAllowed (mode : DeploymentMode) (placement : ComponentPlacement)
    (requirements : List RuntimeCapability) : Bool :=
  requirements.all (fun requirement =>
    deploymentCapabilityAllowed mode requirement &&
    componentPlacementAllowed placement requirement)

-- claim identifier (UUIDv5): ae9d764d-6bfb-5bd9-beb5-e708407e12b1
structure CoreTransfer where
  htmlBytes : Nat
  javascriptBytes : Nat
  styleBytes : Nat
  fontBytes : Nat
  metadataBytes : Nat
  deriving Repr

-- claim identifier (UUIDv5): 471831e6-c9e7-5f83-afc5-b2f5f9044a0b
def kibibyte : Nat := 1024

-- claim identifier (UUIDv5): b7490159-d572-5967-9a04-da0f7befc71c
def CoreTransfer.total (transfer : CoreTransfer) : Nat :=
  transfer.htmlBytes + transfer.javascriptBytes + transfer.styleBytes +
    transfer.fontBytes + transfer.metadataBytes

-- claim identifier (UUIDv5): 19a9a494-4780-53a7-9487-d5b487ab3566
def CoreTransfer.withinBudget (transfer : CoreTransfer) : Prop :=
  transfer.htmlBytes ≤ 30 * kibibyte ∧
  transfer.javascriptBytes ≤ 120 * kibibyte ∧
  transfer.styleBytes ≤ 20 * kibibyte ∧
  transfer.fontBytes ≤ 20 * kibibyte ∧
  transfer.metadataBytes ≤ 10 * kibibyte

-- claim identifier (UUIDv5): bc8c34a1-7f55-5852-b952-fdb76f91dc3b
def coreTransferBudget : Nat := 200 * kibibyte

-- claim identifier (UUIDv5): ade2aba3-a70f-589c-8875-2695d7d8c1c1
inductive VerificationStatus where
  | pass | fail | blocked | staleEvidence
  deriving DecidableEq, Repr

/-- Numeric comparison is meaningful only for the same revision and declared unit. -/
-- claim identifier (UUIDv5): e5855f44-d11c-5d3e-94cd-2bdbc4c2c8ea
structure MeasuredGate where
  observedValue : Option Nat
  upperBound : Nat
  measuredRevision : String
  requiredRevision : String
  deriving Repr

-- claim identifier (UUIDv5): 81fb117d-c99a-5475-a8de-030ca58c332b
def evaluateMeasuredGate (gate : MeasuredGate) : VerificationStatus :=
  if gate.measuredRevision ≠ gate.requiredRevision then .staleEvidence
  else match gate.observedValue with
    | none => .blocked
    | some value => if value ≤ gate.upperBound then .pass else .fail

end Lumenia
