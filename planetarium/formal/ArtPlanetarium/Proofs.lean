import ArtPlanetarium.Model
import ArtPlanetarium.ConstructiveArithmetic

namespace ArtPlanetarium

/-!
llm machine contract
artifact identifier (UUIDv5): e67bec4e-cc81-54b8-8de8-e04f06503867
execution identifier (UUIDv7): 01a09ab9-d6e6-735e-ad63-6db20639d0a6
recorded at: 2026-09-13T12:24:25.574Z
state: constructive proof obligations
transition: independent arithmetic and control-flow lemmas -> kernel check -> dependency audit
The declaration registry supplies stable UUIDv5 identifiers for every public name.
-/

-- declaration identifier (UUIDv5): 402b742e-4136-5355-899a-9961fe13d731
theorem accepted_parameters_iff (raw : RawMaterialParameters) :
    (∃ validated, validateMaterialParameters raw = some validated) ↔
      ParameterRequirements raw := by
  constructor
  · rintro ⟨validated, accepted⟩
    unfold validateMaterialParameters at accepted
    split at accepted
    · assumption
    · contradiction
  · intro checked
    exact ⟨⟨raw, checked⟩, dif_pos checked⟩

-- declaration identifier (UUIDv5): 82b668a3-b035-5249-8f4c-6a485a29da10
theorem accepted_parameters_preserve_input (raw : RawMaterialParameters)
    (validated : ValidatedMaterialParameters)
    (accepted : validateMaterialParameters raw = some validated) : validated.raw = raw := by
  unfold validateMaterialParameters at accepted
  split at accepted
  · cases Option.some.inj accepted
    rfl
  · contradiction

-- declaration identifier (UUIDv5): 5c5d6531-8da0-52ae-a83d-7e2b09c034e8
theorem tile_repeats_after_any_number_of_spans (coordinate span copies : Nat) :
    tileCoordinate (coordinate + span * copies) span = tileCoordinate coordinate span :=
  ConstructiveArithmetic.addManySpans coordinate span copies

-- declaration identifier (UUIDv5): a7cde63c-9907-5b39-ae6b-52d7619855f8
theorem tile_coordinate_remains_inside_span (coordinate span : Nat) (positive : 0 < span) :
    tileCoordinate coordinate span < span := Nat.mod_lt coordinate positive

-- declaration identifier (UUIDv5): 877ba798-c744-5eb0-b185-f3be495e3b90
theorem mirror_twice_recovers_coordinate (span coordinate : Nat) (inside : coordinate ≤ span) :
    mirrorCoordinate span (mirrorCoordinate span coordinate) = coordinate := by
  obtain ⟨remaining, equality⟩ := Nat.le.dest inside
  cases equality
  unfold mirrorCoordinate
  rw [ConstructiveArithmetic.cancelAddedLeft, ConstructiveArithmetic.cancelAddedRight]

-- declaration identifier (UUIDv5): 83947bb4-a245-5c80-9886-582d09120cf0
theorem mirrored_pair_preserves_span (span coordinate : Nat) (inside : coordinate ≤ span) :
    coordinate + mirrorCoordinate span coordinate = span := by
  exact (Nat.add_comm _ _).trans (ConstructiveArithmetic.restoreSubtracted span coordinate inside)

-- declaration identifier (UUIDv5): d945cf70-cb97-54bf-be14-2189e6abda31
theorem grid_coordinates_are_aligned (step index : Nat) :
    gridCoordinate step index % step = 0 := ConstructiveArithmetic.multipleHasZeroRemainder step index

-- declaration identifier (UUIDv5): 8c3a4859-4ab3-51c4-98da-82687b2e9899
theorem grid_coordinates_preserve_strict_order (step first second : Nat)
    (positive : 0 < step) (ordered : first < second) :
    gridCoordinate step first < gridCoordinate step second :=
  Nat.mul_lt_mul_of_pos_left ordered positive

-- declaration identifier (UUIDv5): c1f6787d-dcf6-55ff-8a04-accb6fe0fe65
theorem halo_closes_after_twelve_slots (index : Nat) : haloAngle (index + 12) = haloAngle index :=
  congrArg (fun value => 30 * value) (ConstructiveArithmetic.addOneSpan index 12)

-- declaration identifier (UUIDv5): fe15e7e0-7582-5632-a805-a9e45b2381d3
theorem halo_has_twelve_distinct_angles :
    ∀ first second : Fin 12, haloAngle first.val = haloAngle second.val → first = second := by
  decide

-- declaration identifier (UUIDv5): 38314214-5991-53c6-aaa5-2c060a65a45c
theorem halo_angles_remain_inside_turn (index : Nat) : haloAngle index < 360 :=
  Nat.mul_lt_mul_of_pos_left (Nat.mod_lt index (by decide : 0 < 12)) (by decide : 0 < 30)

-- declaration identifier (UUIDv5): 29c0bf35-24d1-5f7f-80b2-03be0b636ae4
theorem orthogonal_angles_are_quarter_turns (index : Nat) :
    orthogonalAngle index < 360 ∧ orthogonalAngle index % 90 = 0 :=
  ⟨Nat.mul_lt_mul_of_pos_left (Nat.mod_lt index (by decide : 0 < 4)) (by decide : 0 < 90),
    ConstructiveArithmetic.multipleHasZeroRemainder 90 (index % 4)⟩

-- declaration identifier (UUIDv5): 4bbe45d8-ebbb-56a3-b424-cd2c145f34ae
theorem route_angles_are_eighth_turns (index : Nat) :
    routeAngle index < 360 ∧ routeAngle index % 45 = 0 :=
  ⟨Nat.mul_lt_mul_of_pos_left (Nat.mod_lt index (by decide : 0 < 8)) (by decide : 0 < 45),
    ConstructiveArithmetic.multipleHasZeroRemainder 45 (index % 8)⟩

-- declaration identifier (UUIDv5): 076962ce-578d-5093-8fcc-1c9051db002d
theorem different_plane_normals_are_perpendicular (first second : PlaneNormal)
    (different : first ≠ second) : normalDot first second = 0 := by
  cases first <;> cases second <;> first | rfl | exact False.elim (different rfl)

-- declaration identifier (UUIDv5): fa38b9fc-c12a-52f7-b68a-5616749d009a
theorem palette_selection_stays_inside_palette (index size : Nat) (positive : 0 < size) :
    paletteIndex index size < size := Nat.mod_lt index positive

-- declaration identifier (UUIDv5): 520d5557-442c-57da-8f05-42be338699a1
theorem colour_channel_mix_stays_bounded (first second weight : Nat)
    (firstBound : first ≤ 255) (secondBound : second ≤ 255) (weightBound : weight ≤ 100) :
    channelMixNumerator first second weight ≤ 25500 := by
  have combined := Nat.add_le_add
    (Nat.mul_le_mul_left (100 - weight) firstBound) (Nat.mul_le_mul_left weight secondBound)
  have weights : 100 - weight + weight = 100 := ConstructiveArithmetic.restoreSubtracted 100 weight weightBound
  calc
    channelMixNumerator first second weight ≤ (100 - weight) * 255 + weight * 255 := combined
    _ = 255 * (100 - weight + weight) := by
      rw [Nat.mul_comm (100 - weight) 255, Nat.mul_comm weight 255, Nat.mul_add]
    _ = 25500 := congrArg (fun value => 255 * value) weights

-- declaration identifier (UUIDv5): f2641249-e90f-543d-b3fe-41af59691635
theorem fold_widths_are_deliberately_unequal (seed : Nat) : foldLeftWidth seed < foldRightWidth seed :=
  Nat.add_lt_add_right (by decide : 20 < 40) (seed % 10)

-- declaration identifier (UUIDv5): 229fad8f-1ccf-5fae-8398-72627d4273a1
theorem cycle_returns_after_any_number_of_periods (elapsed duration cycles : Nat) :
    cyclePhase (elapsed + duration * cycles) duration = cyclePhase elapsed duration :=
  ConstructiveArithmetic.addManySpans elapsed duration cycles

-- declaration identifier (UUIDv5): f403ed14-5236-5008-8a65-dbd7f780c596
theorem reduced_motion_is_independent_of_time (first second duration : Nat) :
    motionPhase true first duration = motionPhase true second duration := rfl

-- declaration identifier (UUIDv5): 285a898b-c964-5d62-bf7e-c759d6454a81
theorem two_toggles_restore_playback (playing : Bool) : togglePlaying (togglePlaying playing) = playing := by
  cases playing <;> rfl

-- declaration identifier (UUIDv5): 1442b214-77c1-54ac-aa17-411d14ad18e5
theorem visual_distance_does_not_establish_influence (distance : Nat) :
    relationFromVisualDistance distance ≠ .influencedBy := by
  intro impossible
  cases impossible

-- declaration identifier (UUIDv5): 8aa86c95-3282-5def-bc4d-2424d7b78d05
theorem stale_evidence_cannot_pass (supports contradicts : Nat) :
    reviewEvidence supports contradicts true = .staleEvidence := rfl

-- declaration identifier (UUIDv5): 4a634b09-1c93-5015-b263-c85ad944b010
theorem contradiction_cannot_pass (supports contradictions : Nat) :
    reviewEvidence supports (contradictions + 1) false = .fail := rfl

-- declaration identifier (UUIDv5): b20a4eb7-5aa7-5d4d-b085-9ab58818968b
theorem neutral_only_evidence_cannot_pass : reviewEvidence 0 0 false = .blocked := rfl

-- declaration identifier (UUIDv5): 02dfd26a-aa61-5fe4-a900-f6d7dabc61e6
theorem evidence_pass_requires_support_without_contradiction (supports contradicts : Nat) (stale : Bool) :
    reviewEvidence supports contradicts stale = .pass ↔
      0 < supports ∧ contradicts = 0 ∧ stale = false := by
  cases stale with
  | true =>
      constructor
      · intro impossible
        cases impossible
      · intro checked
        cases checked.2.2
  | false =>
      cases contradicts with
      | succ count =>
          constructor
          · intro impossible
            cases impossible
          · intro checked
            cases checked.2.1
      | zero =>
          cases supports with
          | zero =>
              constructor
              · intro impossible
                cases impossible
              · intro checked
                exact False.elim (Nat.not_lt_zero 0 checked.1)
          | succ count =>
              exact ⟨fun _ => ⟨Nat.zero_lt_succ count, rfl, rfl⟩, fun _ => rfl⟩

end ArtPlanetarium
