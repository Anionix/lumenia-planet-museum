import ArtPlanetarium

/-!
llm machine contract
artifact identifier (UUIDv5): e67bec4e-cc81-54b8-8de8-e04f06503867
execution identifier (UUIDv7): 01a09ab9-d6e6-735e-ad63-6db20639d0a6
state: transitive dependency audit
transition: compiled public claims -> enumerate dependencies -> reject every nonempty axiom list
Includes material rules, dimension rules, and constructive arithmetic helpers.
-/

-- claim definition identifier (UUIDv5): 11439aae-5886-5842-beec-17dad0d4f400
#print axioms ArtPlanetarium.ConstructiveArithmetic.cancelAddedRight

-- claim definition identifier (UUIDv5): 0ed75250-a5ef-5c60-874e-98b11b61c5c3
#print axioms ArtPlanetarium.ConstructiveArithmetic.cancelAddedLeft

-- claim definition identifier (UUIDv5): 7a63ea12-9170-590c-a3d2-9a692ef9d746
#print axioms ArtPlanetarium.ConstructiveArithmetic.restoreSubtracted

-- claim definition identifier (UUIDv5): b716c140-b323-576b-9f4d-3826659f0754
#print axioms ArtPlanetarium.ConstructiveArithmetic.addOneSpan

-- claim definition identifier (UUIDv5): aa49a091-ee74-5c0d-ab4c-9972be7d2daf
#print axioms ArtPlanetarium.ConstructiveArithmetic.addManySpans

-- claim definition identifier (UUIDv5): ff90f68a-42a9-52fb-bc1b-c9fac0803c39
#print axioms ArtPlanetarium.ConstructiveArithmetic.multipleHasZeroRemainder

-- claim definition identifier (UUIDv5): afcdb8f1-3c1e-5542-9e61-9004bf45861d
#print axioms ArtPlanetarium.coordinate_count_matches_dimension

-- claim definition identifier (UUIDv5): 106a3d19-29b4-5edb-8b94-a429b7d614b7
#print axioms ArtPlanetarium.decoding_encoded_coordinates_recovers_input

-- claim definition identifier (UUIDv5): babd30e5-a7d9-58d0-91e6-18b382fdef3e
#print axioms ArtPlanetarium.embedding_then_dropping_axis_recovers_coordinates

-- claim definition identifier (UUIDv5): 46744f84-6213-53ee-b402-0830ac05ee84
#print axioms ArtPlanetarium.four_quarter_turns_recover_coordinates

-- claim definition identifier (UUIDv5): a5dcdfdd-7cc7-59fa-9d04-1831481591ac
#print axioms ArtPlanetarium.projection_ignores_additional_axis

-- claim definition identifier (UUIDv5): 73c9bac3-9ee7-527a-ac14-e71379cedfb4
#print axioms ArtPlanetarium.projection_can_hide_fourth_axis

-- claim definition identifier (UUIDv5): 1a7894e1-0151-58fd-a3ed-556e7dc5b58e
#print axioms ArtPlanetarium.timestamp_is_not_a_spatial_axis

-- claim definition identifier (UUIDv5): 402b742e-4136-5355-899a-9961fe13d731
#print axioms ArtPlanetarium.accepted_parameters_iff

-- claim definition identifier (UUIDv5): 82b668a3-b035-5249-8f4c-6a485a29da10
#print axioms ArtPlanetarium.accepted_parameters_preserve_input

-- claim definition identifier (UUIDv5): 5c5d6531-8da0-52ae-a83d-7e2b09c034e8
#print axioms ArtPlanetarium.tile_repeats_after_any_number_of_spans

-- claim definition identifier (UUIDv5): a7cde63c-9907-5b39-ae6b-52d7619855f8
#print axioms ArtPlanetarium.tile_coordinate_remains_inside_span

-- claim definition identifier (UUIDv5): 877ba798-c744-5eb0-b185-f3be495e3b90
#print axioms ArtPlanetarium.mirror_twice_recovers_coordinate

-- claim definition identifier (UUIDv5): 83947bb4-a245-5c80-9886-582d09120cf0
#print axioms ArtPlanetarium.mirrored_pair_preserves_span

-- claim definition identifier (UUIDv5): d945cf70-cb97-54bf-be14-2189e6abda31
#print axioms ArtPlanetarium.grid_coordinates_are_aligned

-- claim definition identifier (UUIDv5): 8c3a4859-4ab3-51c4-98da-82687b2e9899
#print axioms ArtPlanetarium.grid_coordinates_preserve_strict_order

-- claim definition identifier (UUIDv5): c1f6787d-dcf6-55ff-8a04-accb6fe0fe65
#print axioms ArtPlanetarium.halo_closes_after_twelve_slots

-- claim definition identifier (UUIDv5): fe15e7e0-7582-5632-a805-a9e45b2381d3
#print axioms ArtPlanetarium.halo_has_twelve_distinct_angles

-- claim definition identifier (UUIDv5): 38314214-5991-53c6-aaa5-2c060a65a45c
#print axioms ArtPlanetarium.halo_angles_remain_inside_turn

-- claim definition identifier (UUIDv5): 29c0bf35-24d1-5f7f-80b2-03be0b636ae4
#print axioms ArtPlanetarium.orthogonal_angles_are_quarter_turns

-- claim definition identifier (UUIDv5): 4bbe45d8-ebbb-56a3-b424-cd2c145f34ae
#print axioms ArtPlanetarium.route_angles_are_eighth_turns

-- claim definition identifier (UUIDv5): 076962ce-578d-5093-8fcc-1c9051db002d
#print axioms ArtPlanetarium.different_plane_normals_are_perpendicular

-- claim definition identifier (UUIDv5): fa38b9fc-c12a-52f7-b68a-5616749d009a
#print axioms ArtPlanetarium.palette_selection_stays_inside_palette

-- claim definition identifier (UUIDv5): 520d5557-442c-57da-8f05-42be338699a1
#print axioms ArtPlanetarium.colour_channel_mix_stays_bounded

-- claim definition identifier (UUIDv5): f2641249-e90f-543d-b3fe-41af59691635
#print axioms ArtPlanetarium.fold_widths_are_deliberately_unequal

-- claim definition identifier (UUIDv5): 229fad8f-1ccf-5fae-8398-72627d4273a1
#print axioms ArtPlanetarium.cycle_returns_after_any_number_of_periods

-- claim definition identifier (UUIDv5): f403ed14-5236-5008-8a65-dbd7f780c596
#print axioms ArtPlanetarium.reduced_motion_is_independent_of_time

-- claim definition identifier (UUIDv5): 285a898b-c964-5d62-bf7e-c759d6454a81
#print axioms ArtPlanetarium.two_toggles_restore_playback

-- claim definition identifier (UUIDv5): 1442b214-77c1-54ac-aa17-411d14ad18e5
#print axioms ArtPlanetarium.visual_distance_does_not_establish_influence

-- claim definition identifier (UUIDv5): 8aa86c95-3282-5def-bc4d-2424d7b78d05
#print axioms ArtPlanetarium.stale_evidence_cannot_pass

-- claim definition identifier (UUIDv5): 4a634b09-1c93-5015-b263-c85ad944b010
#print axioms ArtPlanetarium.contradiction_cannot_pass

-- claim definition identifier (UUIDv5): b20a4eb7-5aa7-5d4d-b085-9ab58818968b
#print axioms ArtPlanetarium.neutral_only_evidence_cannot_pass

-- claim definition identifier (UUIDv5): 02dfd26a-aa61-5fe4-a900-f6d7dabc61e6
#print axioms ArtPlanetarium.evidence_pass_requires_support_without_contradiction
