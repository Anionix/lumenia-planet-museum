import Lean
import Lumenia.Model

namespace Lumenia

/-!
llm machine contract
execution identifier (UUIDv7): 01a0999c-a8aa-7f30-80ef-2e5f84ecdd54
state: external input decoding
transition: JSON Boolean fields -> RawAssetFlags -> validateRawAsset
The wire schema also checks identifiers, format and unknown properties in Node.
This adapter requires all twelve fields and rejects Boolean coercions.
-/

-- claim identifier (UUIDv5): 82eb7ebe-90bf-5c16-be17-6b46b4ff56fa
def parseAssetFields (json : Lean.Json) :
    Except String (RawAssetFlags × AssetPipelineOptions) := do
  let flags : RawAssetFlags := {
    usesExtensionMeshopt := ← json.getObjValAs? Bool "usesExtensionMeshopt"
    usesKhronosMeshopt := ← json.getObjValAs? Bool "usesKhronosMeshopt"
    usesKtx2 := ← json.getObjValAs? Bool "usesKtx2"
    usesWebp := ← json.getObjValAs? Bool "usesWebp"
    usesDraco := ← json.getObjValAs? Bool "usesDraco"
    requiresNamedNodes := ← json.getObjValAs? Bool "requiresNamedNodes"
    requiresExtras := ← json.getObjValAs? Bool "requiresExtras" }
  let options : AssetPipelineOptions := {
    keepsNamedNodes := ← json.getObjValAs? Bool "keepsNamedNodes"
    keepsExtras := ← json.getObjValAs? Bool "keepsExtras"
    hasMeshoptDecoder := ← json.getObjValAs? Bool "hasMeshoptDecoder"
    hasKtx2Loader := ← json.getObjValAs? Bool "hasKtx2Loader"
    hasDracoLoader := ← json.getObjValAs? Bool "hasDracoLoader" }
  return (flags, options)

-- claim identifier (UUIDv5): e2bef015-5b73-543c-8dc2-acad405cb0ea
def checkAssetJson (input : String) : Except String Bool := do
  let json ← Lean.Json.parse input
  let (flags, options) ← parseAssetFields json
  return (validateRawAsset flags options).isSome

end Lumenia
