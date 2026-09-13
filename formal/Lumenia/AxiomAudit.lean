import Lumenia.Proofs

/-!
llm machine contract
state: zero-axiom audit
transition: compiled proofs -> explicit transitive dependencies -> reject every nonempty list
execution identifier (UUIDv7): 01a099bb-225c-7772-8fb8-869e4d9f9eec
-/

-- claim identifier (UUIDv5): 543e95a7-25d9-53eb-addf-1eca7283be44
#print axioms Lumenia.asset_checks_iff_requirements

-- claim identifier (UUIDv5): a0e5e544-3a28-588f-a04a-ecef28a75a68
#print axioms Lumenia.validate_raw_asset_accepts_iff

-- claim identifier (UUIDv5): 884dc2e4-94c4-5622-904e-789dd2186b47
#print axioms Lumenia.validate_raw_asset_rejects_iff

-- claim identifier (UUIDv5): 2914c7f0-ea38-5cec-9c53-715cf16e3f2c
#print axioms Lumenia.validate_raw_asset_preserves_input

-- claim identifier (UUIDv5): 9ed18638-7432-544f-8710-0cde084b9195
#print axioms Lumenia.validate_raw_asset_sound

-- claim identifier (UUIDv5): b3467681-81a2-5183-929d-9afc9aaf60f0
#print axioms Lumenia.validated_asset_satisfies_requirements

-- claim identifier (UUIDv5): 3e92b122-d2fe-5890-8c24-aafcd8fc5e33
#print axioms Lumenia.meshopt_variants_are_exclusive

-- claim identifier (UUIDv5): 90c7faa1-9721-596d-a8db-5b581572be33
#print axioms Lumenia.extension_meshopt_requires_decoder

-- claim identifier (UUIDv5): e76f697b-718a-5cbb-b937-3695710767a3
#print axioms Lumenia.khronos_meshopt_requires_decoder

-- claim identifier (UUIDv5): 35ba9d6b-abfe-5438-bdcf-960f8eb0158f
#print axioms Lumenia.ktx2_requires_loader

-- claim identifier (UUIDv5): 935c5368-7869-56ac-9346-a3719e4c4a62
#print axioms Lumenia.draco_requires_loader

-- claim identifier (UUIDv5): 7ba57ba1-7481-5f8b-bb84-1e94930879d9
#print axioms Lumenia.draco_is_enabled_iff_explicit

-- claim identifier (UUIDv5): 13c791ec-40a2-5749-986c-7816c521b2ff
#print axioms Lumenia.named_nodes_require_preservation

-- claim identifier (UUIDv5): 12ebcc33-1640-5e81-b5a2-f400102331f1
#print axioms Lumenia.extras_require_preservation

-- claim identifier (UUIDv5): 947ff2cf-29cd-5a00-bb98-ef9e37ff7408
#print axioms Lumenia.both_meshopt_flags_reject

-- claim identifier (UUIDv5): 04f36807-d7c2-527f-b22c-dacbdd0aded0
#print axioms Lumenia.missing_meshopt_decoder_rejects

-- claim identifier (UUIDv5): 92cfff56-17f5-5995-b0f2-00254f41e0af
#print axioms Lumenia.shipped_requires_validation

-- claim identifier (UUIDv5): a968cd0f-8c5d-5953-906c-e40769388abd
#print axioms Lumenia.shipment_trace_is_exactly_optimize_validate_ship

-- claim identifier (UUIDv5): f781bfd5-a32e-534e-ac60-9ea5a9e9288a
#print axioms Lumenia.shipped_history_requires_asset_requirements

-- claim identifier (UUIDv5): b4f27f24-d941-5e95-80fb-e70b2bb3eea9
#print axioms Lumenia.invalid_asset_has_no_shipped_history

-- claim identifier (UUIDv5): bc433078-b2a0-5ce6-9fc1-4eab157d6651
#print axioms Lumenia.browser_capability_requires_client_component

-- claim identifier (UUIDv5): 21c3fceb-8154-5259-a619-ccfab976b7ee
#print axioms Lumenia.static_export_cannot_require_server_only

-- claim identifier (UUIDv5): f248748f-077d-55e1-bda4-cff8afc69b06
#print axioms Lumenia.accepted_component_places_browser_requirements_on_client

-- claim identifier (UUIDv5): 0aa200fe-8e88-529c-a69e-88c174a6df03
#print axioms Lumenia.client_component_cannot_require_server_only

-- claim identifier (UUIDv5): bb538e9e-fbbb-5ca6-8ec2-1e1fb756eeb2
#print axioms Lumenia.core_transfer_total_within_budget

-- claim identifier (UUIDv5): 03b95321-0d34-58a2-9486-a88ac41889a5
#print axioms Lumenia.category_budget_total_is_204800_bytes

-- claim identifier (UUIDv5): f5b5cea2-0aae-5d44-b5d6-4a1b36e192c5
#print axioms Lumenia.measured_gate_pass_iff
