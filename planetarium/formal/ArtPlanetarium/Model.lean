import Std

namespace ArtPlanetarium

/-!
llm machine contract
artifact identifier (UUIDv5): e67bec4e-cc81-54b8-8de8-e04f06503867
execution identifier (UUIDv7): 01a09ab9-d6e6-735e-ad63-6db20639d0a6
recorded at: 2026-09-13T12:24:25.574Z
state: explicit design choices, not artist essences
transition: source-backed interpretation -> bounded parameters -> exact layout kernel
Natural numbers represent integer pixels, degrees, milliseconds and percentages.
No statement here establishes artistic quality, historical truth, rasterization,
floating-point accuracy, perceptual colour equality or browser performance.
-/

-- declaration identifier (UUIDv5): 9352bd0f-e257-587c-818a-bde8474f0159
structure RawMaterialParameters where
  repeatCount : Nat
  gridStep : Nat
  durationMilliseconds : Nat
  layerCount : Nat
  opacityPercent : Nat
  paletteSize : Nat
  deriving DecidableEq, Repr

-- declaration identifier (UUIDv5): f8f7120f-e2e2-5e6f-8def-bb6cf061b60d
def ParameterRequirements (raw : RawMaterialParameters) : Prop :=
  (1 ≤ raw.repeatCount ∧ raw.repeatCount ≤ 64) ∧
  (1 ≤ raw.gridStep ∧ raw.gridStep ≤ 64) ∧
  (1000 ≤ raw.durationMilliseconds ∧ raw.durationMilliseconds ≤ 120000) ∧
  (1 ≤ raw.layerCount ∧ raw.layerCount ≤ 32) ∧
  raw.opacityPercent ≤ 100 ∧ (2 ≤ raw.paletteSize ∧ raw.paletteSize ≤ 8)

instance (raw : RawMaterialParameters) : Decidable (ParameterRequirements raw) := by
  unfold ParameterRequirements
  infer_instance

-- declaration identifier (UUIDv5): 8f16f361-3136-5a84-846d-7150ff3d9526
structure ValidatedMaterialParameters where
  raw : RawMaterialParameters
  requirements : ParameterRequirements raw

-- declaration identifier (UUIDv5): 749402db-7719-56bf-bbee-22e969444fc2
def validateMaterialParameters (raw : RawMaterialParameters) :
    Option ValidatedMaterialParameters :=
  if checked : ParameterRequirements raw then some ⟨raw, checked⟩ else none

-- declaration identifier (UUIDv5): 3ce14ddf-9d24-5fdd-ab20-52c57694d745
def tileCoordinate (coordinate span : Nat) : Nat := coordinate % span
-- declaration identifier (UUIDv5): 499066b9-3669-5e0a-af79-81c89f651e8d
def mirrorCoordinate (span coordinate : Nat) : Nat := span - coordinate
-- declaration identifier (UUIDv5): 519b1577-bb63-50bf-b66e-ba16e7114d44
def gridCoordinate (step index : Nat) : Nat := step * index
-- declaration identifier (UUIDv5): cf63c5e8-2fc0-534e-8841-c80695f3e56a
def haloAngle (index : Nat) : Nat := 30 * (index % 12)
-- declaration identifier (UUIDv5): c4e31f84-c980-5bd4-aa6e-f25ed66f68ef
def orthogonalAngle (index : Nat) : Nat := 90 * (index % 4)
-- declaration identifier (UUIDv5): 563dcc9c-a78b-5d7f-8d6b-db15cb2be2f6
def routeAngle (index : Nat) : Nat := 45 * (index % 8)
-- declaration identifier (UUIDv5): 0b517c2d-d60d-5c85-85b5-4bb32c5a54bf
def paletteIndex (index size : Nat) : Nat := index % size
-- declaration identifier (UUIDv5): 9daae6c2-860b-53a8-8fcc-ba8306787460
def cyclePhase (elapsed duration : Nat) : Nat := elapsed % duration
-- declaration identifier (UUIDv5): 821c300e-8590-5846-a9fb-c9b4c7a636b4
def motionPhase (reducedMotion : Bool) (elapsed duration : Nat) : Nat :=
  if reducedMotion then 0 else cyclePhase elapsed duration
-- declaration identifier (UUIDv5): 2455dede-1263-58c0-835a-29d2d0e23f49
def togglePlaying (playing : Bool) : Bool := !playing

/-- Numerator with denominator 100; not a gamma-correct colour-space model. -/
-- declaration identifier (UUIDv5): 906ce419-6551-5fe9-af87-a23990b40804
def channelMixNumerator (first second weight : Nat) : Nat :=
  (100 - weight) * first + weight * second

/-- Controlled asymmetry is our interpretation, not a measured artist attribute. -/
-- declaration identifier (UUIDv5): f6e32dd8-6d22-5460-9694-dae3d1b743ed
def foldLeftWidth (seed : Nat) : Nat := 20 + seed % 10
-- declaration identifier (UUIDv5): b49e2bf2-16fb-5371-92a1-faed0615680f
def foldRightWidth (seed : Nat) : Nat := 40 + seed % 10

-- declaration identifier (UUIDv5): 56e7f041-f174-5a17-b0d8-37d9a94d784b
inductive PlaneNormal where
  | horizontal | vertical | depth
  deriving DecidableEq, Repr

-- declaration identifier (UUIDv5): a9a43db4-a6de-59ae-90e5-970daef18388
def normalVector : PlaneNormal → Nat × Nat × Nat
  | .horizontal => (1, 0, 0)
  | .vertical => (0, 1, 0)
  | .depth => (0, 0, 1)

-- declaration identifier (UUIDv5): 48d3afc8-f20f-5438-a339-022fa9f7aced
def planeNormalForIndex (index : Nat) : PlaneNormal :=
  match index % 3 with
  | 0 => .horizontal
  | 1 => .vertical
  | _ => .depth

-- declaration identifier (UUIDv5): dc3c152c-cb36-5f12-aa05-ad01839de0cd
def normalDot (first second : PlaneNormal) : Nat :=
  let (a, b, c) := normalVector first
  let (d, e, f) := normalVector second
  a * d + b * e + c * f

-- declaration identifier (UUIDv5): cfdc811d-db96-5afd-b317-7c199b1e4bf5
inductive RelationKind where
  | designedBy | manufacturedBy | collaboratedWith | associatedWith
  | sharesVisualFeatureWith | influencedBy | earlierThan | caused
  | cites | supports
  deriving DecidableEq, Repr

-- declaration identifier (UUIDv5): 77267089-1274-594a-a331-6b0c94a820a0
inductive EvidenceDecision where
  | pass | fail | blocked | staleEvidence
  deriving DecidableEq, Repr

/-- Counts refer to already selected, claim-specific evidence, not web hit counts. -/
-- declaration identifier (UUIDv5): b6a18395-d6c2-5042-a96e-048564f3e1ae
def reviewEvidence (supportCount contradictionCount : Nat) (stale : Bool) : EvidenceDecision :=
  match stale, contradictionCount, supportCount with
  | true, _, _ => .staleEvidence
  | false, _ + 1, _ => .fail
  | false, 0, 0 => .blocked
  | false, 0, _ + 1 => .pass

/-- A visual-distance calculation may only produce a visual relation. -/
-- declaration identifier (UUIDv5): 1aac7f3c-426a-537b-ac6c-41aca7f1126f
def relationFromVisualDistance (_distance : Nat) : RelationKind := .sharesVisualFeatureWith

end ArtPlanetarium
