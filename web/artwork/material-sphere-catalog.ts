// llm machine contract; claim UUIDv5: 63c605f5-9e47-5b49-949f-cad7ce96b4ed
// execution UUIDv7: 01a0a48b-cf79-770e-a05f-eee1d6a3021e
// mathematics source revision: sha256:9478a5e17024ef21aaf5239ea2f13ffac7885ead15d95ef4607e5be55fd781bd
// state: generated; transition: verified package -> static application input.
export const materialSphereCatalog = [
  {
    "profileIdentifier": "e9146e26-704e-5073-8222-11be30c6d0be",
    "personIdentifier": "4f7cc469-4d4a-5409-95f3-0691a8214497",
    "referenceScopeIdentifier": "960e77fa-b01c-5b9d-9798-5eb26dfe642e",
    "title": "ウィリアム・モリス — Material Sphere",
    "canonicalName": "William Morris",
    "componentName": "WilliamMorris",
    "referenceWork": "Strawberry Thief",
    "referencePeriod": "1883年のデザイン",
    "sourceClaimIdentifiers": [
      "01a09a97-f59f-7ba5-8380-19a3c2bd065f",
      "01a09a97-f59f-7e1a-8dd4-6238f5d16acc",
      "01a09a97-f59f-7d03-8db8-d1ebd40ee1ac"
    ],
    "family": "botanicalRepeat",
    "interpretation": "小さな葉の対をタイル状に繰り返し、濃い地色の上に花のアクセントを置く。",
    "interpretationStatus": "proposed",
    "limitation": "植物の細密さや織物の触感は再現しない。図柄の反復規則は証明できても、原作と同一とはしない。",
    "cssMechanisms": "radial-gradient / border-radius / background-size",
    "palette": [
      "#183b36",
      "#e4d4ac",
      "#9bad77",
      "#ac5148"
    ],
    "paletteStatus": "chosenForPrototypeNotSampledFromArtwork",
    "parameters": {
      "repeatCount": 24,
      "gridStep": 16,
      "durationMilliseconds": 36000,
      "layerCount": 4,
      "opacityPercent": 85,
      "paletteSize": 4
    },
    "proofTargets": [
      "ArtPlanetarium.tile_repeats_after_any_number_of_spans",
      "ArtPlanetarium.mirror_twice_recovers_coordinate",
      "ArtPlanetarium.mirrored_pair_preserves_span"
    ],
    "renderingStatus": "browserNotConnected",
    "prompt": "Material Sphere。小さな葉の対をタイル状に繰り返し、濃い地色の上に花のアクセントを置く。 球としての陰影は共通層。原作の複製・作者本人の制作物とは表示しない。植物の細密さや織物の触感は再現しない。図柄の反復規則は証明できても、原作と同一とはしない。",
    "slug": "william-morris",
    "name": "ウィリアム・モリス",
    "facts": [
      {
        "claimIdentifier": "01a09a97-f59f-7ba5-8380-19a3c2bd065f",
        "claimDefinitionIdentifier": "6b51ab95-9c2d-5555-a454-0d1b651dabff",
        "statement": "鳥・イチゴ・草花を組み合わせた室内用の綿布。モリスがデザインし、Morris & Co.が製造した。",
        "sources": [
          {
            "title": "Strawberry Thief — Victoria and Albert Museum",
            "url": "https://collections.vam.ac.uk/item/O78889/",
            "sourceIdentifier": "86cb342f-c0d4-5b25-bbb3-c89689f7c270"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-7e1a-8dd4-6238f5d16acc",
        "claimDefinitionIdentifier": "9b0ec772-04d0-56b9-9183-ec82ee0555b2",
        "statement": "藍の抜染と木版による印刷を用い、赤・黄を青白の地に加えた。",
        "sources": [
          {
            "title": "Strawberry Thief — Victoria and Albert Museum",
            "url": "https://collections.vam.ac.uk/item/O78889/",
            "sourceIdentifier": "86cb342f-c0d4-5b25-bbb3-c89689f7c270"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-7d03-8db8-d1ebd40ee1ac",
        "claimDefinitionIdentifier": "0c4ca8e1-9c98-5972-8382-c8149bb39ee9",
        "statement": "モリスのテキスタイルは反復模様と身近な草花を中心に発展した。技法や製造には協働があった。",
        "sources": [
          {
            "title": "William Morris textiles — Victoria and Albert Museum",
            "url": "https://www.vam.ac.uk/articles/willam-morris-textiles/",
            "sourceIdentifier": "0dd5a9c7-6077-510a-aa75-52ca0a452dc5"
          }
        ]
      }
    ],
    "proofs": [
      {
        "declarationIdentifier": "5c5d6531-8da0-52ae-a83d-7e2b09c034e8",
        "kind": "theorem",
        "name": "ArtPlanetarium.tile_repeats_after_any_number_of_spans",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 40,
        "column": 9,
        "sourceSignature": "theorem tile_repeats_after_any_number_of_spans (coordinate span copies : Nat) :\n    tileCoordinate (coordinate + span * copies) span = tileCoordinate coordinate span",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "877ba798-c744-5eb0-b185-f3be495e3b90",
        "kind": "theorem",
        "name": "ArtPlanetarium.mirror_twice_recovers_coordinate",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 49,
        "column": 9,
        "sourceSignature": "theorem mirror_twice_recovers_coordinate (span coordinate : Nat) (inside : coordinate ≤ span) :\n    mirrorCoordinate span (mirrorCoordinate span coordinate) = coordinate",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "83947bb4-a245-5c80-9886-582d09120cf0",
        "kind": "theorem",
        "name": "ArtPlanetarium.mirrored_pair_preserves_span",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 57,
        "column": 9,
        "sourceSignature": "theorem mirrored_pair_preserves_span (span coordinate : Nat) (inside : coordinate ≤ span) :\n    coordinate + mirrorCoordinate span coordinate = span",
        "category": "materialKernel"
      }
    ]
  },
  {
    "profileIdentifier": "c622c342-9799-5e44-84e0-bf659ef4ec94",
    "personIdentifier": "d2ccba89-2c3b-5fe9-b1dc-bd47ef62f6fe",
    "referenceScopeIdentifier": "3d0abcea-5fec-5d11-96c5-43acd6b811eb",
    "title": "アルフォンス・ミュシャ — Material Sphere",
    "canonicalName": "Alphonse Mucha",
    "componentName": "AlphonseMucha",
    "referenceWork": "Zodiac",
    "referencePeriod": "1896年のデザイン",
    "sourceClaimIdentifiers": [
      "01a09a97-f59f-7444-be28-cb85b8a1e59e",
      "01a09a97-f59f-7d0a-959f-c4b5cf2b3a66",
      "01a09a97-f59f-7dd2-bcd3-4a8fb7bac54f"
    ],
    "family": "zodiacHalo",
    "interpretation": "12個の等間隔スロットと二重の円環で、装飾的な額縁を球の表面に置く。",
    "interpretationStatus": "proposed",
    "limitation": "12個ある事実と等角配置の設計判断を分ける。人物画、十二宮の異なる図像、絵画全体の再現は含まない。",
    "cssMechanisms": "conic-gradient / radial-gradient / rotate",
    "palette": [
      "#374639",
      "#d0b97f",
      "#eadbbc"
    ],
    "paletteStatus": "chosenForPrototypeNotSampledFromArtwork",
    "parameters": {
      "repeatCount": 12,
      "gridStep": 24,
      "durationMilliseconds": 48000,
      "layerCount": 3,
      "opacityPercent": 90,
      "paletteSize": 3
    },
    "proofTargets": [
      "ArtPlanetarium.halo_closes_after_twelve_slots",
      "ArtPlanetarium.halo_has_twelve_distinct_angles",
      "ArtPlanetarium.halo_angles_remain_inside_turn"
    ],
    "renderingStatus": "browserNotConnected",
    "prompt": "Material Sphere。12個の等間隔スロットと二重の円環で、装飾的な額縁を球の表面に置く。 球としての陰影は共通層。原作の複製・作者本人の制作物とは表示しない。12個ある事実と等角配置の設計判断を分ける。人物画、十二宮の異なる図像、絵画全体の再現は含まない。",
    "slug": "alphonse-mucha",
    "name": "アルフォンス・ミュシャ",
    "facts": [
      {
        "claimIdentifier": "01a09a97-f59f-7444-be28-cb85b8a1e59e",
        "claimDefinitionIdentifier": "7414d840-022a-5046-8fcb-77383a09087e",
        "statement": "女性の頭の後ろに、黄道十二宮を含む円盤を配置した。印刷業者Champenoisのカレンダーが出発点だった。",
        "sources": [
          {
            "title": "Zodiac — Mucha Foundation",
            "url": "https://www.muchafoundation.org/en/gallery/browse-works/object/242",
            "sourceIdentifier": "0bc5195f-fed6-5097-b948-bfc639358c16"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-7d0a-959f-c4b5cf2b3a66",
        "claimDefinitionIdentifier": "830c3458-c919-57b1-bb38-5500a24a06b1",
        "statement": "文字のない装飾パネルを含む複数の版が存在する。",
        "sources": [
          {
            "title": "Zodiac — Mucha Foundation",
            "url": "https://www.muchafoundation.org/en/gallery/browse-works/object/242",
            "sourceIdentifier": "0bc5195f-fed6-5097-b948-bfc639358c16"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-7dd2-bcd3-4a8fb7bac54f",
        "claimDefinitionIdentifier": "a4061a62-dbbc-5da4-a134-d9109cf03e2e",
        "statement": "Sarah BernhardtのGismondaのポスターを契機にパリで広く知られた。",
        "sources": [
          {
            "title": "Alphonse Mucha Timeline — Mucha Foundation",
            "url": "https://muchafoundation.org/en/timeline",
            "sourceIdentifier": "7e6de424-1ec8-53c0-83e1-95f5b9e8ede0"
          }
        ]
      }
    ],
    "proofs": [
      {
        "declarationIdentifier": "c1f6787d-dcf6-55ff-8a04-accb6fe0fe65",
        "kind": "theorem",
        "name": "ArtPlanetarium.halo_closes_after_twelve_slots",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 72,
        "column": 9,
        "sourceSignature": "theorem halo_closes_after_twelve_slots (index : Nat) : haloAngle (index + 12) = haloAngle index",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "fe15e7e0-7582-5632-a805-a9e45b2381d3",
        "kind": "theorem",
        "name": "ArtPlanetarium.halo_has_twelve_distinct_angles",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 76,
        "column": 9,
        "sourceSignature": "theorem halo_has_twelve_distinct_angles :\n    ∀ first second : Fin 12, haloAngle first.val = haloAngle second.val → first = second",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "38314214-5991-53c6-aaa5-2c060a65a45c",
        "kind": "theorem",
        "name": "ArtPlanetarium.halo_angles_remain_inside_turn",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 81,
        "column": 9,
        "sourceSignature": "theorem halo_angles_remain_inside_turn (index : Nat) : haloAngle index < 360",
        "category": "materialKernel"
      }
    ]
  },
  {
    "profileIdentifier": "27ae05bc-5298-51fc-8e02-c16ab93048ce",
    "personIdentifier": "f341a7fe-8b14-5fd8-8b31-2b66d5e9446e",
    "referenceScopeIdentifier": "975a60d5-76de-5754-8d40-7076b3db8418",
    "title": "チャールズ・レニー・マッキントッシュ — Material Sphere",
    "canonicalName": "Charles Rennie Mackintosh",
    "componentName": "CharlesRennieMackintosh",
    "referenceWork": "後期テキスタイルのデザインスケッチ",
    "referencePeriod": "晩年のテキスタイル設計を対象",
    "sourceClaimIdentifiers": [
      "01a09a97-f59f-78ff-a175-c1640608c6b3",
      "01a09a97-f59f-7b7b-9d33-698bb1246363",
      "01a09a97-f59f-71dc-803c-e2d40c60a154"
    ],
    "family": "geometricBotanical",
    "interpretation": "細い格子と、格子から少し離れた丸い花形を重ねる。",
    "interpretationStatus": "proposed",
    "limitation": "抽象的な花形を特定の原画や夫婦どちらかの意匠と断定しない。格子の証明は布の色調を保証しない。",
    "cssMechanisms": "repeating-linear-gradient / radial-gradient",
    "palette": [
      "#f0e6cb",
      "#242d2b",
      "#ad6f76"
    ],
    "paletteStatus": "chosenForPrototypeNotSampledFromArtwork",
    "parameters": {
      "repeatCount": 16,
      "gridStep": 20,
      "durationMilliseconds": 40000,
      "layerCount": 3,
      "opacityPercent": 80,
      "paletteSize": 3
    },
    "proofTargets": [
      "ArtPlanetarium.grid_coordinates_are_aligned",
      "ArtPlanetarium.grid_coordinates_preserve_strict_order",
      "ArtPlanetarium.mirror_twice_recovers_coordinate"
    ],
    "renderingStatus": "browserNotConnected",
    "prompt": "Material Sphere。細い格子と、格子から少し離れた丸い花形を重ねる。 球としての陰影は共通層。原作の複製・作者本人の制作物とは表示しない。抽象的な花形を特定の原画や夫婦どちらかの意匠と断定しない。格子の証明は布の色調を保証しない。",
    "slug": "charles-rennie-mackintosh",
    "name": "チャールズ・レニー・マッキントッシュ",
    "facts": [
      {
        "claimIdentifier": "01a09a97-f59f-78ff-a175-c1640608c6b3",
        "claimDefinitionIdentifier": "510b21ee-7549-542e-b9f5-c3fdf75c9c0b",
        "statement": "所蔵スケッチには有機的な形と幾何学模様が併存し、デザイン・色の変奏が残る。",
        "sources": [
          {
            "title": "Taking a fresh look at Mackintosh — University of Glasgow",
            "url": "https://www.gla.ac.uk/news/archiveofnews/2008/september/headline_90636_en.html",
            "sourceIdentifier": "d48831e5-058e-5a3b-b3c7-269aa1e21699"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-7b7b-9d33-698bb1246363",
        "claimDefinitionIdentifier": "fa6440a2-3bea-5105-955a-3c818c4afe0d",
        "statement": "生前に実際に製造されたものは少数とされ、後世のデジタル布地は再解釈として展示された。",
        "sources": [
          {
            "title": "Taking a fresh look at Mackintosh — University of Glasgow",
            "url": "https://www.gla.ac.uk/news/archiveofnews/2008/september/headline_90636_en.html",
            "sourceIdentifier": "d48831e5-058e-5a3b-b3c7-269aa1e21699"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-71dc-803c-e2d40c60a154",
        "claimDefinitionIdentifier": "4fc6e939-aaab-54f1-bcd9-eb97a8d81808",
        "statement": "自邸の内部はMargaret Macdonald Mackintoshとの共同設計。単独作者として一括しない。",
        "sources": [
          {
            "title": "The Mackintosh House — The Hunterian",
            "url": "https://www.gla.ac.uk/hunterian/visit/our-venues/mackintosh-house/",
            "sourceIdentifier": "0feb047c-5ff6-5d39-a984-9a1e87bd4ab7"
          }
        ]
      }
    ],
    "proofs": [
      {
        "declarationIdentifier": "d945cf70-cb97-54bf-be14-2189e6abda31",
        "kind": "theorem",
        "name": "ArtPlanetarium.grid_coordinates_are_aligned",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 62,
        "column": 9,
        "sourceSignature": "theorem grid_coordinates_are_aligned (step index : Nat) :\n    gridCoordinate step index % step = 0",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "8c3a4859-4ab3-51c4-98da-82687b2e9899",
        "kind": "theorem",
        "name": "ArtPlanetarium.grid_coordinates_preserve_strict_order",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 66,
        "column": 9,
        "sourceSignature": "theorem grid_coordinates_preserve_strict_order (step first second : Nat)\n    (positive : 0 < step) (ordered : first < second) :\n    gridCoordinate step first < gridCoordinate step second",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "877ba798-c744-5eb0-b185-f3be495e3b90",
        "kind": "theorem",
        "name": "ArtPlanetarium.mirror_twice_recovers_coordinate",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 49,
        "column": 9,
        "sourceSignature": "theorem mirror_twice_recovers_coordinate (span coordinate : Nat) (inside : coordinate ≤ span) :\n    mirrorCoordinate span (mirrorCoordinate span coordinate) = coordinate",
        "category": "materialKernel"
      }
    ]
  },
  {
    "profileIdentifier": "2da4bfe7-d11a-5615-ae87-6143a563ab0e",
    "personIdentifier": "b54052dd-e206-5067-beb8-e19b11154606",
    "referenceScopeIdentifier": "488a68e0-9b13-595e-abb2-61ca0fe91c86",
    "title": "ピート・モンドリアン — Material Sphere",
    "canonicalName": "Piet Mondrian",
    "componentName": "PietMondrian",
    "referenceWork": "Composition with Red, Blue, Black, Yellow, and Gray",
    "referencePeriod": "1921年",
    "sourceClaimIdentifiers": [
      "01a09a97-f59f-7244-a87b-ca3a3e2af887",
      "01a09a97-f59f-751d-8e1a-53dd574067f5",
      "01a09a97-f59f-7725-845a-9d40e3662f83"
    ],
    "family": "orthogonalColourPlanes",
    "interpretation": "水平・垂直だけの色面と黒い区切りを使い、色は登録パレットからだけ選ぶ。",
    "interpretationStatus": "proposed",
    "limitation": "このレシピは1921年の作品群を参照する一案。球の陰影は別層とし、原作の配色そのものとは区別する。",
    "cssMechanisms": "linear-gradient / background-size / rotate",
    "palette": [
      "#e5dfcf",
      "#1c2222",
      "#cf4436",
      "#e4b536",
      "#366184"
    ],
    "paletteStatus": "chosenForPrototypeNotSampledFromArtwork",
    "parameters": {
      "repeatCount": 12,
      "gridStep": 20,
      "durationMilliseconds": 36000,
      "layerCount": 4,
      "opacityPercent": 100,
      "paletteSize": 5
    },
    "proofTargets": [
      "ArtPlanetarium.orthogonal_angles_are_quarter_turns",
      "ArtPlanetarium.palette_selection_stays_inside_palette"
    ],
    "renderingStatus": "browserNotConnected",
    "prompt": "Material Sphere。水平・垂直だけの色面と黒い区切りを使い、色は登録パレットからだけ選ぶ。 球としての陰影は共通層。原作の複製・作者本人の制作物とは表示しない。このレシピは1921年の作品群を参照する一案。球の陰影は別層とし、原作の配色そのものとは区別する。",
    "slug": "piet-mondrian",
    "name": "ピート・モンドリアン",
    "facts": [
      {
        "claimIdentifier": "01a09a97-f59f-7244-a87b-ca3a3e2af887",
        "claimDefinitionIdentifier": "ddaf855e-6b20-5b68-8d10-3b3aaf99916f",
        "statement": "参照作は1921年の油彩画。赤・青・黒・黄・灰色を題名に持つ。",
        "sources": [
          {
            "title": "Composition with Red, Blue, Black, Yellow, and Gray — MoMA",
            "url": "https://www.moma.org/collection/works/79002",
            "sourceIdentifier": "0cd2ba89-2413-52e5-8d4c-a139be157574"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-751d-8e1a-53dd574067f5",
        "claimDefinitionIdentifier": "92c56f9c-aa2c-5276-8ebc-f187e264a1ed",
        "statement": "水平・垂直と限定した配色は新造形主義の絵画に関する方針として説明される。",
        "sources": [
          {
            "title": "Broadway Boogie Woogie — MoMA",
            "url": "https://www.moma.org/collection/works/78682",
            "sourceIdentifier": "61a02caf-f1a4-5fea-a66a-2061b77e3765"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-7725-845a-9d40e3662f83",
        "claimDefinitionIdentifier": "7b1bc691-9c2e-5fff-b959-8d8542212cdf",
        "statement": "1942–43年のBroadway Boogie Woogieでは黒を省き、色の線を分節している。黒い格子は全作品共通ではない。",
        "sources": [
          {
            "title": "Broadway Boogie Woogie — MoMA",
            "url": "https://www.moma.org/collection/works/78682",
            "sourceIdentifier": "61a02caf-f1a4-5fea-a66a-2061b77e3765"
          }
        ]
      }
    ],
    "proofs": [
      {
        "declarationIdentifier": "29c0bf35-24d1-5f7f-80b2-03be0b636ae4",
        "kind": "theorem",
        "name": "ArtPlanetarium.orthogonal_angles_are_quarter_turns",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 85,
        "column": 9,
        "sourceSignature": "theorem orthogonal_angles_are_quarter_turns (index : Nat) :\n    orthogonalAngle index < 360 ∧ orthogonalAngle index % 90 = 0",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "fa38b9fc-c12a-52f7-b68a-5616749d009a",
        "kind": "theorem",
        "name": "ArtPlanetarium.palette_selection_stays_inside_palette",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 102,
        "column": 9,
        "sourceSignature": "theorem palette_selection_stays_inside_palette (index size : Nat) (positive : 0 < size) :\n    paletteIndex index size < size",
        "category": "materialKernel"
      }
    ]
  },
  {
    "profileIdentifier": "1af32ad1-c8f1-5c0c-a100-d5d9a5f83579",
    "personIdentifier": "b64f31b6-d52c-5b7a-975d-58b96b4166e6",
    "referenceScopeIdentifier": "ae700c39-3d4a-5d7f-a561-d830af6e00dc",
    "title": "ヘリット・リートフェルト — Material Sphere",
    "canonicalName": "Gerrit Rietveld",
    "componentName": "GerritRietveld",
    "referenceWork": "Red Blue Chair",
    "referencePeriod": "MoMAの記録では1918–1923年",
    "sourceClaimIdentifiers": [
      "01a09a97-f59f-7752-8259-e78e04e985c4",
      "01a09a97-f59f-7a65-9f9a-ad66d7553f72",
      "01a09a97-f59f-70e4-a989-afe45d8bbe44"
    ],
    "family": "perpendicularConstruction",
    "interpretation": "直交する三方向の平面を分けたまま重ね、輪郭に影を付けて立体風に見せる。",
    "interpretationStatus": "proposed",
    "limitation": "椅子を球として作り直す解釈。垂直な数学上の面でも透視投影後の画面上では直角に見えるとは限らない。",
    "cssMechanisms": "perspective / rotateX / rotateY / box-shadow",
    "palette": [
      "#1b2323",
      "#cb4438",
      "#e2b833",
      "#365d82"
    ],
    "paletteStatus": "chosenForPrototypeNotSampledFromArtwork",
    "parameters": {
      "repeatCount": 6,
      "gridStep": 24,
      "durationMilliseconds": 42000,
      "layerCount": 3,
      "opacityPercent": 90,
      "paletteSize": 4
    },
    "proofTargets": [
      "ArtPlanetarium.different_plane_normals_are_perpendicular",
      "ArtPlanetarium.orthogonal_angles_are_quarter_turns"
    ],
    "renderingStatus": "browserNotConnected",
    "prompt": "Material Sphere。直交する三方向の平面を分けたまま重ね、輪郭に影を付けて立体風に見せる。 球としての陰影は共通層。原作の複製・作者本人の制作物とは表示しない。椅子を球として作り直す解釈。垂直な数学上の面でも透視投影後の画面上では直角に見えるとは限らない。",
    "slug": "gerrit-rietveld",
    "name": "ヘリット・リートフェルト",
    "facts": [
      {
        "claimIdentifier": "01a09a97-f59f-7752-8259-e78e04e985c4",
        "claimDefinitionIdentifier": "0afc5280-65c0-5f54-ad76-2d88da9026a5",
        "statement": "標準寸法の木材と水平・垂直の面を使い、構造の簡潔さを追求した。原色と黒の配色は1923年頃に加わった。",
        "sources": [
          {
            "title": "Red Blue Chair — MoMA",
            "url": "https://www.moma.org/collection/works/4044",
            "sourceIdentifier": "b57e508a-f0aa-57ef-a447-409a455721fc"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-7a65-9f9a-ad66d7553f72",
        "claimDefinitionIdentifier": "bad9e25c-9695-541c-bf02-8716a37da1c7",
        "statement": "Stedelijkの所蔵個体は銀灰色も含み、1925年頃の制作と記録される。設計年と個体の製造年は分ける。",
        "sources": [
          {
            "title": "Rood-blauwe stoel — Stedelijk Museum",
            "url": "https://www.stedelijk.nl/en/collection/4720-gerrit-rietveld-rood-blauwe-stoel",
            "sourceIdentifier": "51ae5866-40a3-52f7-93e3-f3c41b0963f1"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-70e4-a989-afe45d8bbe44",
        "claimDefinitionIdentifier": "ee6d913f-1913-52ec-b867-765d42a70113",
        "statement": "Stedelijkは実作者としてG.A. van de Groenekanも記載する。",
        "sources": [
          {
            "title": "Rood-blauwe stoel — Stedelijk Museum",
            "url": "https://www.stedelijk.nl/en/collection/4720-gerrit-rietveld-rood-blauwe-stoel",
            "sourceIdentifier": "51ae5866-40a3-52f7-93e3-f3c41b0963f1"
          }
        ]
      }
    ],
    "proofs": [
      {
        "declarationIdentifier": "076962ce-578d-5093-8fcc-1c9051db002d",
        "kind": "theorem",
        "name": "ArtPlanetarium.different_plane_normals_are_perpendicular",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 97,
        "column": 9,
        "sourceSignature": "theorem different_plane_normals_are_perpendicular (first second : PlaneNormal)\n    (different : first ≠ second) : normalDot first second = 0",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "29c0bf35-24d1-5f7f-80b2-03be0b636ae4",
        "kind": "theorem",
        "name": "ArtPlanetarium.orthogonal_angles_are_quarter_turns",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 85,
        "column": 9,
        "sourceSignature": "theorem orthogonal_angles_are_quarter_turns (index : Nat) :\n    orthogonalAngle index < 360 ∧ orthogonalAngle index % 90 = 0",
        "category": "materialKernel"
      }
    ]
  },
  {
    "profileIdentifier": "eff6ec3c-4e67-5e2a-bc11-ed8d12f52a39",
    "personIdentifier": "d9d0b5bf-2276-585c-9eb2-15a79103957f",
    "referenceScopeIdentifier": "26c7f81a-c989-594d-ba19-afdaff443268",
    "title": "エットレ・ソットサス — Material Sphere",
    "canonicalName": "Ettore Sottsass",
    "componentName": "EttoreSottsass",
    "referenceWork": "Carlton / Bacterio",
    "referencePeriod": "Carltonは1981年",
    "sourceClaimIdentifiers": [
      "01a09a97-f59f-7111-a1ef-3082c14478b2",
      "01a09a97-f59f-7eb1-abd9-7158bebec0a6"
    ],
    "family": "laminateAndAccent",
    "interpretation": "色面の間に斜めの小片を置き、細かい反復模様と大きな色面を対比する。",
    "interpretationStatus": "proposed",
    "limitation": "ランダムさを芸術性の点数にしない。原作のBacterioを複製せず独自の小片を使う。メーカーの販売表現を美的事実として扱わない。",
    "cssMechanisms": "repeating-linear-gradient / conic-gradient",
    "palette": [
      "#d46476",
      "#e7bb4b",
      "#65a0a0",
      "#e7ddc9",
      "#272731"
    ],
    "paletteStatus": "chosenForPrototypeNotSampledFromArtwork",
    "parameters": {
      "repeatCount": 24,
      "gridStep": 14,
      "durationMilliseconds": 32000,
      "layerCount": 4,
      "opacityPercent": 90,
      "paletteSize": 5
    },
    "proofTargets": [
      "ArtPlanetarium.palette_selection_stays_inside_palette",
      "ArtPlanetarium.tile_repeats_after_any_number_of_spans",
      "ArtPlanetarium.route_angles_are_eighth_turns"
    ],
    "renderingStatus": "browserNotConnected",
    "prompt": "Material Sphere。色面の間に斜めの小片を置き、細かい反復模様と大きな色面を対比する。 球としての陰影は共通層。原作の複製・作者本人の制作物とは表示しない。ランダムさを芸術性の点数にしない。原作のBacterioを複製せず独自の小片を使う。メーカーの販売表現を美的事実として扱わない。",
    "slug": "ettore-sottsass",
    "name": "エットレ・ソットサス",
    "facts": [
      {
        "claimIdentifier": "01a09a97-f59f-7111-a1ef-3082c14478b2",
        "claimDefinitionIdentifier": "a93179a0-6565-566a-b490-f22a5f1af972",
        "statement": "Carltonは木に装飾ラミネートを張った家具で、書棚と空間の仕切りを兼ねる。",
        "sources": [
          {
            "title": "Carlton — Memphis Milano",
            "url": "https://memphis.it/en/products/carlton/",
            "sourceIdentifier": "36d41374-9c40-58f4-987c-d7e3cd8b1d0c"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-7eb1-abd9-7158bebec0a6",
        "claimDefinitionIdentifier": "c0b4c55d-fdad-5d85-a7c5-be4c0cf6ead3",
        "statement": "Bacterioはソットサスによる表面模様で、黒い曲がりくねった線の集まりとしてメーカーが説明する。",
        "sources": [
          {
            "title": "Bacterio — Abet Laminati",
            "url": "https://abetlaminati.com/en/collections/bacterio-ettore-sottsass/",
            "sourceIdentifier": "3b904738-9747-56bb-9110-a2175ad23571"
          }
        ]
      }
    ],
    "proofs": [
      {
        "declarationIdentifier": "fa38b9fc-c12a-52f7-b68a-5616749d009a",
        "kind": "theorem",
        "name": "ArtPlanetarium.palette_selection_stays_inside_palette",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 102,
        "column": 9,
        "sourceSignature": "theorem palette_selection_stays_inside_palette (index size : Nat) (positive : 0 < size) :\n    paletteIndex index size < size",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "5c5d6531-8da0-52ae-a83d-7e2b09c034e8",
        "kind": "theorem",
        "name": "ArtPlanetarium.tile_repeats_after_any_number_of_spans",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 40,
        "column": 9,
        "sourceSignature": "theorem tile_repeats_after_any_number_of_spans (coordinate span copies : Nat) :\n    tileCoordinate (coordinate + span * copies) span = tileCoordinate coordinate span",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "4bbe45d8-ebbb-56a3-b424-cd2c145f34ae",
        "kind": "theorem",
        "name": "ArtPlanetarium.route_angles_are_eighth_turns",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 91,
        "column": 9,
        "sourceSignature": "theorem route_angles_are_eighth_turns (index : Nat) :\n    routeAngle index < 360 ∧ routeAngle index % 45 = 0",
        "category": "materialKernel"
      }
    ]
  },
  {
    "profileIdentifier": "aa8db2eb-17e5-5771-8443-94445af34296",
    "personIdentifier": "8066869d-a972-5884-a2e3-8df1e3af3f52",
    "referenceScopeIdentifier": "ebf04286-32f4-52d1-be07-a88ddc7896b9",
    "title": "ヘルベルト・バイヤー — Material Sphere",
    "canonicalName": "Herbert Bayer",
    "componentName": "HerbertBayer",
    "referenceWork": "Universal alphabetとバウハウス期の文字構成",
    "referencePeriod": "1920年代の文字設計を対象",
    "sourceClaimIdentifiers": [
      "01a09a97-f59f-7a31-b2a2-270f4a75e514",
      "01a09a97-f59f-746c-aa9f-07ec5fd11f32",
      "01a09a97-f59f-7c13-93cc-b8d768866540"
    ],
    "family": "geometricLettering",
    "interpretation": "円弧と棒の組合せを共通の格子へ載せ、大小二段階の幾何学的な記号を作る。",
    "interpretationStatus": "proposed",
    "limitation": "既存書体の再実装ではない。文字が読めることや情報の理解しやすさは別途、人と画面で検査する。",
    "cssMechanisms": "border-radius / border / linear-gradient",
    "palette": [
      "#e8deca",
      "#212627",
      "#c8503d"
    ],
    "paletteStatus": "chosenForPrototypeNotSampledFromArtwork",
    "parameters": {
      "repeatCount": 8,
      "gridStep": 24,
      "durationMilliseconds": 44000,
      "layerCount": 3,
      "opacityPercent": 95,
      "paletteSize": 3
    },
    "proofTargets": [
      "ArtPlanetarium.grid_coordinates_are_aligned",
      "ArtPlanetarium.orthogonal_angles_are_quarter_turns"
    ],
    "renderingStatus": "browserNotConnected",
    "prompt": "Material Sphere。円弧と棒の組合せを共通の格子へ載せ、大小二段階の幾何学的な記号を作る。 球としての陰影は共通層。原作の複製・作者本人の制作物とは表示しない。既存書体の再実装ではない。文字が読めることや情報の理解しやすさは別途、人と画面で検査する。",
    "slug": "herbert-bayer",
    "name": "ヘルベルト・バイヤー",
    "facts": [
      {
        "claimIdentifier": "01a09a97-f59f-7a31-b2a2-270f4a75e514",
        "claimDefinitionIdentifier": "434d8cc1-9c10-5f8e-9204-4084bb884a23",
        "statement": "Universal alphabetは円弧・角・水平垂直線を用いて小文字の形を整理した。",
        "sources": [
          {
            "title": "Herbert Bayer biography — Cooper Hewitt",
            "url": "https://collection.cooperhewitt.org/people/18059359/bio",
            "sourceIdentifier": "dcbba08f-9fae-5fc6-9a7f-75eff86fbe7a"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-746c-aa9f-07ec5fd11f32",
        "claimDefinitionIdentifier": "b584280c-f997-5cbb-87f3-1e58f4919461",
        "statement": "情報の重要度に応じて文字の大きさや太さを変え、棒・長方形などで面を分けた。",
        "sources": [
          {
            "title": "Herbert Bayer biography — Cooper Hewitt",
            "url": "https://collection.cooperhewitt.org/people/18059359/bio",
            "sourceIdentifier": "dcbba08f-9fae-5fc6-9a7f-75eff86fbe7a"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-7c13-93cc-b8d768866540",
        "claimDefinitionIdentifier": "bee6e48e-4d19-5744-b494-937b005052f7",
        "statement": "写真・フォトモンタージュや展示の設計も行っており、幾何学的な文字だけが仕事ではない。",
        "sources": [
          {
            "title": "Herbert Bayer — MoMA",
            "url": "https://www.moma.org/collection/artists/399",
            "sourceIdentifier": "b3055c4e-856c-5978-9a3e-1bf19be39145"
          }
        ]
      }
    ],
    "proofs": [
      {
        "declarationIdentifier": "d945cf70-cb97-54bf-be14-2189e6abda31",
        "kind": "theorem",
        "name": "ArtPlanetarium.grid_coordinates_are_aligned",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 62,
        "column": 9,
        "sourceSignature": "theorem grid_coordinates_are_aligned (step index : Nat) :\n    gridCoordinate step index % step = 0",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "29c0bf35-24d1-5f7f-80b2-03be0b636ae4",
        "kind": "theorem",
        "name": "ArtPlanetarium.orthogonal_angles_are_quarter_turns",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 85,
        "column": 9,
        "sourceSignature": "theorem orthogonal_angles_are_quarter_turns (index : Nat) :\n    orthogonalAngle index < 360 ∧ orthogonalAngle index % 90 = 0",
        "category": "materialKernel"
      }
    ]
  },
  {
    "profileIdentifier": "200bbbd0-c4d4-5ebf-89e7-7bb100b9d737",
    "personIdentifier": "b9dfa052-7db4-5d65-b0d8-ceb5f041fbe9",
    "referenceScopeIdentifier": "cde80f0c-b7c1-58e7-8e0b-78385a5c58fd",
    "title": "ヨゼフ・ミューラー＝ブロックマン — Material Sphere",
    "canonicalName": "Josef Müller-Brockmann",
    "componentName": "JosefMullerBrockmann",
    "referenceWork": "Beethoven",
    "referencePeriod": "1955年のポスター",
    "sourceClaimIdentifiers": [
      "01a09a97-f59f-7e29-8542-5f5c8e9a7bcf",
      "01a09a97-f59f-7572-be4c-9c7673297ed4",
      "01a09a97-f59f-778b-a5ae-87d6b8c54a44"
    ],
    "family": "typographicGrid",
    "interpretation": "一定間隔の基準線に文字用の帯と円弧をそろえ、帯同士の距離を維持する。",
    "interpretationStatus": "proposed",
    "limitation": "余白の多さを固定点数にしない。画面上の読みやすさ、実際の文字組み、全経歴の代表性は未証明。",
    "cssMechanisms": "repeating-linear-gradient / radial-gradient / grid",
    "palette": [
      "#ddd6bf",
      "#283131",
      "#b65345"
    ],
    "paletteStatus": "chosenForPrototypeNotSampledFromArtwork",
    "parameters": {
      "repeatCount": 8,
      "gridStep": 12,
      "durationMilliseconds": 48000,
      "layerCount": 3,
      "opacityPercent": 85,
      "paletteSize": 3
    },
    "proofTargets": [
      "ArtPlanetarium.grid_coordinates_are_aligned",
      "ArtPlanetarium.grid_coordinates_preserve_strict_order"
    ],
    "renderingStatus": "browserNotConnected",
    "prompt": "Material Sphere。一定間隔の基準線に文字用の帯と円弧をそろえ、帯同士の距離を維持する。 球としての陰影は共通層。原作の複製・作者本人の制作物とは表示しない。余白の多さを固定点数にしない。画面上の読みやすさ、実際の文字組み、全経歴の代表性は未証明。",
    "slug": "josef-muller-brockmann",
    "name": "ヨゼフ・ミューラー＝ブロックマン",
    "facts": [
      {
        "claimIdentifier": "01a09a97-f59f-7e29-8542-5f5c8e9a7bcf",
        "claimDefinitionIdentifier": "0ca5a292-bd58-5b7f-af03-c69b5ae307ce",
        "statement": "Beethovenのポスターは1955年の石版印刷で、印刷会社の役割も所蔵記録に残る。",
        "sources": [
          {
            "title": "Poster, Beethoven — Cooper Hewitt",
            "url": "https://collection.cooperhewitt.org/objects/2318803418/",
            "sourceIdentifier": "4b93d51d-6fad-5769-adf9-7f3fd5d7d339"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-7572-be4c-9c7673297ed4",
        "claimDefinitionIdentifier": "7e6cfcd6-be42-5bab-92d4-5358f363a9cc",
        "statement": "財団は幾何学と文字の構成、内容に役立つ機能的な形、教育・グリッドに関する著作を説明している。",
        "sources": [
          {
            "title": "Josef Müller-Brockmann — Shizuko Yoshikawa and Josef Müller-Brockmann Foundation",
            "url": "https://syjmb.foundation/en/josef-mueller-brockmann/",
            "sourceIdentifier": "f6fd7cb6-0111-57fd-ba4e-fd472bde34ed"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-778b-a5ae-87d6b8c54a44",
        "claimDefinitionIdentifier": "a1e5b92b-5223-5624-8d36-450e00d6f1a6",
        "statement": "初期には挿絵的な仕事があり、1950年代初頭に転換した。後期にも明るい配色の作品がある。",
        "sources": [
          {
            "title": "Josef Müller-Brockmann — Shizuko Yoshikawa and Josef Müller-Brockmann Foundation",
            "url": "https://syjmb.foundation/en/josef-mueller-brockmann/",
            "sourceIdentifier": "f6fd7cb6-0111-57fd-ba4e-fd472bde34ed"
          }
        ]
      }
    ],
    "proofs": [
      {
        "declarationIdentifier": "d945cf70-cb97-54bf-be14-2189e6abda31",
        "kind": "theorem",
        "name": "ArtPlanetarium.grid_coordinates_are_aligned",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 62,
        "column": 9,
        "sourceSignature": "theorem grid_coordinates_are_aligned (step index : Nat) :\n    gridCoordinate step index % step = 0",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "8c3a4859-4ab3-51c4-98da-82687b2e9899",
        "kind": "theorem",
        "name": "ArtPlanetarium.grid_coordinates_preserve_strict_order",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 66,
        "column": 9,
        "sourceSignature": "theorem grid_coordinates_preserve_strict_order (step first second : Nat)\n    (positive : 0 < step) (ordered : first < second) :\n    gridCoordinate step first < gridCoordinate step second",
        "category": "materialKernel"
      }
    ]
  },
  {
    "profileIdentifier": "fda39095-201d-5703-a75a-072fceac56f4",
    "personIdentifier": "8f7c1bbe-3cde-5bbd-86e8-40cdf410482a",
    "referenceScopeIdentifier": "dece3d3e-34d7-50c2-a06d-1d4400ebb258",
    "title": "マッシモ・ヴィネッリ — Material Sphere",
    "canonicalName": "Massimo Vignelli",
    "componentName": "MassimoVignelli",
    "referenceWork": "New York Subway Map",
    "referencePeriod": "1970–1972年",
    "sourceClaimIdentifiers": [
      "01a09a97-f59f-7b1c-b8e6-68edf40fe79c",
      "01a09a97-f59f-73b9-856c-9132fc1eaf0c",
      "01a09a97-f59f-7576-9843-39bef074f325"
    ],
    "family": "transitDiagram",
    "interpretation": "45度刻みの線分と駅の点を少ない色で反復し、同じ路線は同色にそろえる。",
    "interpretationStatus": "proposed",
    "limitation": "これは使える路線案内図ではない。視覚的な近さから作者間の影響や共同制作を自動生成しない。",
    "cssMechanisms": "linear-gradient / rotate / radial-gradient",
    "palette": [
      "#ded8c7",
      "#cb5845",
      "#476c91",
      "#bba042"
    ],
    "paletteStatus": "chosenForPrototypeNotSampledFromArtwork",
    "parameters": {
      "repeatCount": 16,
      "gridStep": 12,
      "durationMilliseconds": 40000,
      "layerCount": 4,
      "opacityPercent": 95,
      "paletteSize": 4
    },
    "proofTargets": [
      "ArtPlanetarium.route_angles_are_eighth_turns",
      "ArtPlanetarium.palette_selection_stays_inside_palette",
      "ArtPlanetarium.visual_distance_does_not_establish_influence"
    ],
    "renderingStatus": "browserNotConnected",
    "prompt": "Material Sphere。45度刻みの線分と駅の点を少ない色で反復し、同じ路線は同色にそろえる。 球としての陰影は共通層。原作の複製・作者本人の制作物とは表示しない。これは使える路線案内図ではない。視覚的な近さから作者間の影響や共同制作を自動生成しない。",
    "slug": "massimo-vignelli",
    "name": "マッシモ・ヴィネッリ",
    "facts": [
      {
        "claimIdentifier": "01a09a97-f59f-7b1c-b8e6-68edf40fe79c",
        "claimDefinitionIdentifier": "abcd6972-7dae-5997-92fa-fbd146f8fa0e",
        "statement": "MoMAはMassimo Vignelli、Joan Charysyn、Bob Noorda、Unimarkを制作者として記録し、Charysynを主担当と説明する。",
        "sources": [
          {
            "title": "New York Subway Map — MoMA",
            "url": "https://www.moma.org/collection/works/89300",
            "sourceIdentifier": "667442d4-744b-5d54-8a48-343427d81871"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-73b9-856c-9132fc1eaf0c",
        "claimDefinitionIdentifier": "017b156c-281c-57fe-951f-ea2bdbd03b80",
        "statement": "路線を45度・90度の直線へ整理し、駅を点で表した。背景の地理的な形は簡略化されている。",
        "sources": [
          {
            "title": "New York Subway Map — MoMA",
            "url": "https://www.moma.org/collection/works/89300",
            "sourceIdentifier": "667442d4-744b-5d54-8a48-343427d81871"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-7576-9843-39bef074f325",
        "claimDefinitionIdentifier": "440ec54f-f8a2-59fa-bffd-a00cfd72e1ec",
        "statement": "交通博物館もUnimarkの共同作業と、情報を伝えるための地図の整理を説明する。",
        "sources": [
          {
            "title": "Towards a Better Way: The Vignelli Map at 50 — New York Transit Museum",
            "url": "https://www.nytransitmuseum.org/vignelli/",
            "sourceIdentifier": "1317d040-f91a-5948-a916-b545d3fdb303"
          }
        ]
      }
    ],
    "proofs": [
      {
        "declarationIdentifier": "4bbe45d8-ebbb-56a3-b424-cd2c145f34ae",
        "kind": "theorem",
        "name": "ArtPlanetarium.route_angles_are_eighth_turns",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 91,
        "column": 9,
        "sourceSignature": "theorem route_angles_are_eighth_turns (index : Nat) :\n    routeAngle index < 360 ∧ routeAngle index % 45 = 0",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "fa38b9fc-c12a-52f7-b68a-5616749d009a",
        "kind": "theorem",
        "name": "ArtPlanetarium.palette_selection_stays_inside_palette",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 102,
        "column": 9,
        "sourceSignature": "theorem palette_selection_stays_inside_palette (index size : Nat) (positive : 0 < size) :\n    paletteIndex index size < size",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "1442b214-77c1-54ac-aa17-411d14ad18e5",
        "kind": "theorem",
        "name": "ArtPlanetarium.visual_distance_does_not_establish_influence",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 136,
        "column": 9,
        "sourceSignature": "theorem visual_distance_does_not_establish_influence (distance : Nat) :\n    relationFromVisualDistance distance ≠ .influencedBy",
        "category": "materialKernel"
      }
    ]
  },
  {
    "profileIdentifier": "66355416-1298-53e7-af26-05303e93d7ad",
    "personIdentifier": "0c7444ac-0261-5cea-ad94-086616f052d6",
    "referenceScopeIdentifier": "58c1cc16-5fcf-55d4-a55b-40272e35f627",
    "title": "ディーター・ラムス — Material Sphere",
    "canonicalName": "Dieter Rams",
    "componentName": "DieterRams",
    "referenceWork": "606 Universal Shelving Systemと1976年の講演",
    "referencePeriod": "1960年に棚を発売、1976年に設計思想を講演",
    "sourceClaimIdentifiers": [
      "01a09a97-f59f-7fc5-ad0b-e3ec6f86eb65",
      "01a09a97-f59f-77e7-abd8-7409ffa02aaf",
      "01a09a97-f59f-7915-b6f8-a61500b11155"
    ],
    "family": "modularProduct",
    "interpretation": "中性色の繰り返す部品、整列した小さな点、控えめな面の陰影で構成する。",
    "interpretationStatus": "proposed",
    "limitation": "白い球だから機能的とは判定しない。装飾を減らす理由や実際の使いやすさは用途に照らして別に確認する。",
    "cssMechanisms": "repeating-linear-gradient / radial-gradient / box-shadow",
    "palette": [
      "#d9d9ce",
      "#454d4a",
      "#b2b7aa"
    ],
    "paletteStatus": "chosenForPrototypeNotSampledFromArtwork",
    "parameters": {
      "repeatCount": 6,
      "gridStep": 16,
      "durationMilliseconds": 60000,
      "layerCount": 3,
      "opacityPercent": 85,
      "paletteSize": 3
    },
    "proofTargets": [
      "ArtPlanetarium.grid_coordinates_are_aligned",
      "ArtPlanetarium.grid_coordinates_preserve_strict_order"
    ],
    "renderingStatus": "browserNotConnected",
    "prompt": "Material Sphere。中性色の繰り返す部品、整列した小さな点、控えめな面の陰影で構成する。 球としての陰影は共通層。原作の複製・作者本人の制作物とは表示しない。白い球だから機能的とは判定しない。装飾を減らす理由や実際の使いやすさは用途に照らして別に確認する。",
    "slug": "dieter-rams",
    "name": "ディーター・ラムス",
    "facts": [
      {
        "claimIdentifier": "01a09a97-f59f-7fc5-ad0b-e3ec6f86eb65",
        "claimDefinitionIdentifier": "51876fcf-75bd-5543-bff5-93f437807ac4",
        "statement": "606は壁に取り付ける収納システムとして1960年に発売された。",
        "sources": [
          {
            "title": "Dieter Rams — Vitsœ",
            "url": "https://www.vitsoe.com/us/about/dieter-rams",
            "sourceIdentifier": "fb4e80f5-43ea-558a-acba-911e86ef8626"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-77e7-abd8-7409ffa02aaf",
        "claimDefinitionIdentifier": "e7785092-3914-5714-ab68-c7ac746f2ad7",
        "statement": "1976年の本人の講演は、形・色・素材・構造をまとめて考え、用途と周囲の生活に役立つ設計を求めている。",
        "sources": [
          {
            "title": "Design by Vitsœ: 1976 speech by Dieter Rams",
            "url": "https://www.vitsoe.com/us/voice/design-by-vitsoe?",
            "sourceIdentifier": "cf2255f2-63b9-57e7-a243-fb2b3c771453"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-7915-b6f8-a61500b11155",
        "claimDefinitionIdentifier": "7362bddb-f40a-5184-a3d8-70c4b9770e9a",
        "statement": "Braun SK 4はHans Gugelotとの共同設計として掲載されている。Braun製品を一律にラムス単独作と扱わない。",
        "sources": [
          {
            "title": "Dieter Rams — Vitsœ",
            "url": "https://www.vitsoe.com/us/about/dieter-rams",
            "sourceIdentifier": "fb4e80f5-43ea-558a-acba-911e86ef8626"
          }
        ]
      }
    ],
    "proofs": [
      {
        "declarationIdentifier": "d945cf70-cb97-54bf-be14-2189e6abda31",
        "kind": "theorem",
        "name": "ArtPlanetarium.grid_coordinates_are_aligned",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 62,
        "column": 9,
        "sourceSignature": "theorem grid_coordinates_are_aligned (step index : Nat) :\n    gridCoordinate step index % step = 0",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "8c3a4859-4ab3-51c4-98da-82687b2e9899",
        "kind": "theorem",
        "name": "ArtPlanetarium.grid_coordinates_preserve_strict_order",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 66,
        "column": 9,
        "sourceSignature": "theorem grid_coordinates_preserve_strict_order (step first second : Nat)\n    (positive : 0 < step) (ordered : first < second) :\n    gridCoordinate step first < gridCoordinate step second",
        "category": "materialKernel"
      }
    ]
  },
  {
    "profileIdentifier": "4944ca35-5584-54dd-9b11-d3ab77dacad6",
    "personIdentifier": "682eabd5-5258-58d2-a6ad-7ba432f2126f",
    "referenceScopeIdentifier": "f653f412-bb32-5237-b618-c6f9f82f4286",
    "title": "深澤直人 — Material Sphere",
    "canonicalName": "Naoto Fukasawa",
    "componentName": "NaotoFukasawa",
    "referenceWork": "Wall mounted CD Player",
    "referencePeriod": "1999年",
    "sourceClaimIdentifiers": [
      "01a09a97-f59f-774a-a1df-689b6d72c13d",
      "01a09a97-f59f-7f3f-80b3-04e1d10759b2",
      "01a09a97-f59f-7b54-8e23-b8b578df47e6"
    ],
    "family": "familiarPullControl",
    "interpretation": "丸い中心と柔らかな角の器を組み合わせ、ひとつの操作で動く・止まるを切り替える。",
    "interpretationStatus": "proposed",
    "limitation": "静かな白さだけでは設計思想を表せない。操作の意味と見た目を一緒に扱い、再度操作すれば元に戻る規則を証明する。",
    "cssMechanisms": "border-radius / radial-gradient / animation-play-state",
    "palette": [
      "#e4e3d8",
      "#5d6763",
      "#bfc4b8"
    ],
    "paletteStatus": "chosenForPrototypeNotSampledFromArtwork",
    "parameters": {
      "repeatCount": 1,
      "gridStep": 24,
      "durationMilliseconds": 60000,
      "layerCount": 3,
      "opacityPercent": 90,
      "paletteSize": 3
    },
    "proofTargets": [
      "ArtPlanetarium.two_toggles_restore_playback",
      "ArtPlanetarium.reduced_motion_is_independent_of_time"
    ],
    "renderingStatus": "browserNotConnected",
    "prompt": "Material Sphere。丸い中心と柔らかな角の器を組み合わせ、ひとつの操作で動く・止まるを切り替える。 球としての陰影は共通層。原作の複製・作者本人の制作物とは表示しない。静かな白さだけでは設計思想を表せない。操作の意味と見た目を一緒に扱い、再度操作すれば元に戻る規則を証明する。",
    "slug": "naoto-fukasawa",
    "name": "深澤直人",
    "facts": [
      {
        "claimIdentifier": "01a09a97-f59f-774a-a1df-689b6d72c13d",
        "claimDefinitionIdentifier": "89c2e783-21f9-5ff5-bf9c-0be365441896",
        "statement": "本人の事務所が壁掛けCDプレーヤーを仕事として掲載している。",
        "sources": [
          {
            "title": "Wall mounted CD Player — Naoto Fukasawa Design",
            "url": "https://naotofukasawa.com/projects/540/",
            "sourceIdentifier": "227d61e8-ad76-5542-835c-bdc8015aad65"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-7f3f-80b3-04e1d10759b2",
        "claimDefinitionIdentifier": "91228925-fea9-58f7-a844-a68f2d75cdf1",
        "statement": "V&AはMUJI向けの1999年の製品を記録する。換気扇と回るディスクの類似に着想した。",
        "sources": [
          {
            "title": "CD-player — Victoria and Albert Museum",
            "url": "https://collections.vam.ac.uk/item/O1227135/",
            "sourceIdentifier": "c4cbf3a0-b3fd-5db3-89f6-7add1862a7ea"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-7b54-8e23-b8b578df47e6",
        "claimDefinitionIdentifier": "50d5c0e2-cca7-52db-92cc-e4577e247b45",
        "statement": "紐を引く既知の動作で再生を始める。Without Thoughtは無意識的な行動と機能の関係として説明されている。",
        "sources": [
          {
            "title": "CD-player — Victoria and Albert Museum",
            "url": "https://collections.vam.ac.uk/item/O1227135/",
            "sourceIdentifier": "c4cbf3a0-b3fd-5db3-89f6-7add1862a7ea"
          }
        ]
      }
    ],
    "proofs": [
      {
        "declarationIdentifier": "285a898b-c964-5d62-bf7e-c759d6454a81",
        "kind": "theorem",
        "name": "ArtPlanetarium.two_toggles_restore_playback",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 132,
        "column": 9,
        "sourceSignature": "theorem two_toggles_restore_playback (playing : Bool) : togglePlaying (togglePlaying playing) = playing",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "f403ed14-5236-5008-8a65-dbd7f780c596",
        "kind": "theorem",
        "name": "ArtPlanetarium.reduced_motion_is_independent_of_time",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 128,
        "column": 9,
        "sourceSignature": "theorem reduced_motion_is_independent_of_time (first second duration : Nat) :\n    motionPhase true first duration = motionPhase true second duration",
        "category": "materialKernel"
      }
    ]
  },
  {
    "profileIdentifier": "5240f8a5-f200-5127-9fe8-3f8a6e909188",
    "personIdentifier": "ffd3151d-c433-5546-9d95-e3afce1abc66",
    "referenceScopeIdentifier": "884c9bc1-8b6d-50b0-ba24-1838af95caaa",
    "title": "川久保玲 — Material Sphere",
    "canonicalName": "Rei Kawakubo",
    "componentName": "ReiKawakubo",
    "referenceWork": "2017年のArt of the In-Between展における衣服と造形",
    "referencePeriod": "1980年代以降の選択された作品",
    "sourceClaimIdentifiers": [
      "01a09a97-f59f-7096-b795-1787d9528bd4",
      "01a09a97-f59f-7d9a-8966-f6609625778b",
      "01a09a97-f59f-7324-ae1f-b2ae4d7f70f0"
    ],
    "family": "asymmetricVolume",
    "interpretation": "左右で幅が異なる折り重なりと空隙を、暗い面と少し明るい縁で見せる。",
    "interpretationStatus": "proposed",
    "limitation": "不均衡は今回の球の幾何学規則であり、川久保作品の本質を数値で証明するものではない。布の物理や着用性も対象外。",
    "cssMechanisms": "clip-path polygon / rotate / box-shadow",
    "palette": [
      "#1a2025",
      "#42494e",
      "#737879"
    ],
    "paletteStatus": "chosenForPrototypeNotSampledFromArtwork",
    "parameters": {
      "repeatCount": 12,
      "gridStep": 12,
      "durationMilliseconds": 54000,
      "layerCount": 8,
      "opacityPercent": 95,
      "paletteSize": 3
    },
    "proofTargets": [
      "ArtPlanetarium.fold_widths_are_deliberately_unequal",
      "ArtPlanetarium.colour_channel_mix_stays_bounded"
    ],
    "renderingStatus": "browserNotConnected",
    "prompt": "Material Sphere。左右で幅が異なる折り重なりと空隙を、暗い面と少し明るい縁で見せる。 球としての陰影は共通層。原作の複製・作者本人の制作物とは表示しない。不均衡は今回の球の幾何学規則であり、川久保作品の本質を数値で証明するものではない。布の物理や着用性も対象外。",
    "slug": "rei-kawakubo",
    "name": "川久保玲",
    "facts": [
      {
        "claimIdentifier": "01a09a97-f59f-7096-b795-1787d9528bd4",
        "claimDefinitionIdentifier": "4dd98129-cf82-5e29-8098-0578a646c659",
        "statement": "展覧会は衣服と非衣服、存在と不在などの境界を横断する表現を主題にした。",
        "sources": [
          {
            "title": "Rei Kawakubo/Comme des Garçons: Art of the In-Between — The Met",
            "url": "https://www.metmuseum.org/exhibitions/listings/2017/rei-kawakubo",
            "sourceIdentifier": "153b1c48-6930-5ed6-a8c9-8a21982d4d0a"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-7d9a-8966-f6609625778b",
        "claimDefinitionIdentifier": "801225b9-9064-5a0f-a2a0-e7f8595a73c8",
        "statement": "解説にはねじれた紙のような構成、重なり、不均衡、未完成などの具体例がある。",
        "sources": [
          {
            "title": "Exhibition Galleries — The Met",
            "url": "https://www.metmuseum.org/exhibitions/listings/2017/rei-kawakubo/exhibition-galleries",
            "sourceIdentifier": "760027c4-80b8-5422-8e2a-9c1849f60c10"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-7324-ae1f-b2ae4d7f70f0",
        "claimDefinitionIdentifier": "2afef82e-7d5c-54f9-be49-8e080e212578",
        "statement": "初期1980年代の黒を中心とする配色は一つの時期の特徴であり、展示には色のある別の仕事も含まれる。",
        "sources": [
          {
            "title": "Exhibition Galleries — The Met",
            "url": "https://www.metmuseum.org/exhibitions/listings/2017/rei-kawakubo/exhibition-galleries",
            "sourceIdentifier": "760027c4-80b8-5422-8e2a-9c1849f60c10"
          }
        ]
      }
    ],
    "proofs": [
      {
        "declarationIdentifier": "f2641249-e90f-543d-b3fe-41af59691635",
        "kind": "theorem",
        "name": "ArtPlanetarium.fold_widths_are_deliberately_unequal",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 119,
        "column": 9,
        "sourceSignature": "theorem fold_widths_are_deliberately_unequal (seed : Nat) : foldLeftWidth seed < foldRightWidth seed",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "520d5557-442c-57da-8f05-42be338699a1",
        "kind": "theorem",
        "name": "ArtPlanetarium.colour_channel_mix_stays_bounded",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 106,
        "column": 9,
        "sourceSignature": "theorem colour_channel_mix_stays_bounded (first second weight : Nat)\n    (firstBound : first ≤ 255) (secondBound : second ≤ 255) (weightBound : weight ≤ 100) :\n    channelMixNumerator first second weight ≤ 25500",
        "category": "materialKernel"
      }
    ]
  },
  {
    "profileIdentifier": "ea3de1f9-179b-5bca-89e0-289084190234",
    "personIdentifier": "10777ce7-f6db-56a6-8c73-86364cadba1b",
    "referenceScopeIdentifier": "86141cac-338c-5f13-93aa-c65f1e4bc557",
    "title": "チャールズ・イームズ — Material Sphere",
    "canonicalName": "Charles Eames",
    "componentName": "CharlesEames",
    "referenceWork": "Lounge Chair and Ottoman",
    "referencePeriod": "1956年に発表",
    "sourceClaimIdentifiers": [
      "01a09a97-f59f-7254-9c42-b31060f0f7b4",
      "01a09a97-f59f-7c5e-bcf5-e5e0637c9ae9"
    ],
    "family": "layeredMaterials",
    "interpretation": "暖色の薄い外殻、暗く柔らかい内側、細い支持部を別の層として重ねる。",
    "interpretationStatus": "proposed",
    "limitation": "レイの寄与を消さない。素材の見分け、柔らかさ、耐久性は色や陰影の計算だけでは証明しない。",
    "cssMechanisms": "radial-gradient / border-radius / box-shadow",
    "palette": [
      "#95664b",
      "#dfc6a0",
      "#303637",
      "#b4b8b1"
    ],
    "paletteStatus": "chosenForPrototypeNotSampledFromArtwork",
    "parameters": {
      "repeatCount": 3,
      "gridStep": 24,
      "durationMilliseconds": 48000,
      "layerCount": 4,
      "opacityPercent": 90,
      "paletteSize": 4
    },
    "proofTargets": [
      "ArtPlanetarium.palette_selection_stays_inside_palette",
      "ArtPlanetarium.colour_channel_mix_stays_bounded"
    ],
    "renderingStatus": "browserNotConnected",
    "prompt": "Material Sphere。暖色の薄い外殻、暗く柔らかい内側、細い支持部を別の層として重ねる。 球としての陰影は共通層。原作の複製・作者本人の制作物とは表示しない。レイの寄与を消さない。素材の見分け、柔らかさ、耐久性は色や陰影の計算だけでは証明しない。",
    "slug": "charles-eames",
    "name": "チャールズ・イームズ",
    "facts": [
      {
        "claimIdentifier": "01a09a97-f59f-7254-9c42-b31060f0f7b4",
        "claimDefinitionIdentifier": "bd808dd5-a3b7-57e0-99d9-25b7cbf1afca",
        "statement": "CharlesとRayは成形合板を共同で実験し、家具だけでなく複数の領域で設計した。",
        "sources": [
          {
            "title": "Charles and Ray biography — Eames Office",
            "url": "https://www.eamesoffice.com/about/biography/",
            "sourceIdentifier": "20065102-a071-5360-a709-f51b1d9ff83d"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-7c5e-bcf5-e5e0637c9ae9",
        "claimDefinitionIdentifier": "a85ac178-9b4d-5efd-aa01-aeeaa97ed05c",
        "statement": "椅子は成形合板、革のクッション、アルミの支持部を組み合わせ、部品の共通化も行っている。",
        "sources": [
          {
            "title": "Lounge Chair and Ottoman — Eames Foundation",
            "url": "https://eamesfoundation.org/work/lounge-chair-and-ottoman/",
            "sourceIdentifier": "fe8ce6fa-89fd-51a8-8ee8-fb963ab06e1a"
          }
        ]
      }
    ],
    "proofs": [
      {
        "declarationIdentifier": "fa38b9fc-c12a-52f7-b68a-5616749d009a",
        "kind": "theorem",
        "name": "ArtPlanetarium.palette_selection_stays_inside_palette",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 102,
        "column": 9,
        "sourceSignature": "theorem palette_selection_stays_inside_palette (index size : Nat) (positive : 0 < size) :\n    paletteIndex index size < size",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "520d5557-442c-57da-8f05-42be338699a1",
        "kind": "theorem",
        "name": "ArtPlanetarium.colour_channel_mix_stays_bounded",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 106,
        "column": 9,
        "sourceSignature": "theorem colour_channel_mix_stays_bounded (first second weight : Nat)\n    (firstBound : first ≤ 255) (secondBound : second ≤ 255) (weightBound : weight ≤ 100) :\n    channelMixNumerator first second weight ≤ 25500",
        "category": "materialKernel"
      }
    ]
  },
  {
    "profileIdentifier": "0fcb82c9-fa68-5fb0-bb38-41102237b725",
    "personIdentifier": "21709063-b8c0-5945-bdfd-b223eac44abc",
    "referenceScopeIdentifier": "c0d54e01-7555-5f17-9ed1-85773129570d",
    "title": "レイ・イームズ — Material Sphere",
    "canonicalName": "Ray Eames",
    "componentName": "RayEames",
    "referenceWork": "House of Cardsの菱形模様の試作",
    "referencePeriod": "1952年",
    "sourceClaimIdentifiers": [
      "01a09a97-f59f-70b1-a5d4-5fd3a0bd4f59",
      "01a09a97-f59f-74f0-bf46-de71c4fbe0fe"
    ],
    "family": "colourCollage",
    "interpretation": "同じ菱形を少しずつ異なる色で並べ、暖色・寒色と明暗を対比する。",
    "interpretationStatus": "proposed",
    "limitation": "特定の試作と共同製品の作者を区別する。配色の良さを数値の大小でランキングしない。",
    "cssMechanisms": "conic-gradient / rotate / repeating-linear-gradient",
    "palette": [
      "#ce695d",
      "#e5c477",
      "#6d9c9a",
      "#dab5c1",
      "#414945"
    ],
    "paletteStatus": "chosenForPrototypeNotSampledFromArtwork",
    "parameters": {
      "repeatCount": 16,
      "gridStep": 16,
      "durationMilliseconds": 42000,
      "layerCount": 4,
      "opacityPercent": 95,
      "paletteSize": 5
    },
    "proofTargets": [
      "ArtPlanetarium.grid_coordinates_are_aligned",
      "ArtPlanetarium.palette_selection_stays_inside_palette",
      "ArtPlanetarium.colour_channel_mix_stays_bounded"
    ],
    "renderingStatus": "browserNotConnected",
    "prompt": "Material Sphere。同じ菱形を少しずつ異なる色で並べ、暖色・寒色と明暗を対比する。 球としての陰影は共通層。原作の複製・作者本人の制作物とは表示しない。特定の試作と共同製品の作者を区別する。配色の良さを数値の大小でランキングしない。",
    "slug": "ray-eames",
    "name": "レイ・イームズ",
    "facts": [
      {
        "claimIdentifier": "01a09a97-f59f-70b1-a5d4-5fd3a0bd4f59",
        "claimDefinitionIdentifier": "bdb6ce71-ad6f-5cf5-9afc-edc7a205fd6a",
        "statement": "所蔵される菱形模様の試作はRayが紙のコラージュで作ったものと記録される。灰色の階調と多色の対比が検討された。",
        "sources": [
          {
            "title": "House of Cards Mock-up Process — Eames Institute",
            "url": "https://www.eamesinstitute.org/collection/artifacts/house-of-cards-mock-up-process-diamond-cards/",
            "sourceIdentifier": "1ad6f2f1-5819-5492-b3f2-04a4e0f8ef8e"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-74f0-bf46-de71c4fbe0fe",
        "claimDefinitionIdentifier": "6a7aa01d-711a-5526-a704-57844a0bc05e",
        "statement": "House of Cards製品自体はCharlesとRayの共同設計。カードの切り込みで組み立てられる。",
        "sources": [
          {
            "title": "Small House of Cards — Eames Office",
            "url": "https://www.eamesoffice.com/product/small-house-of-cards/",
            "sourceIdentifier": "7dd2584e-d9c6-51a6-ad1e-be3ad79314b0"
          }
        ]
      }
    ],
    "proofs": [
      {
        "declarationIdentifier": "d945cf70-cb97-54bf-be14-2189e6abda31",
        "kind": "theorem",
        "name": "ArtPlanetarium.grid_coordinates_are_aligned",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 62,
        "column": 9,
        "sourceSignature": "theorem grid_coordinates_are_aligned (step index : Nat) :\n    gridCoordinate step index % step = 0",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "fa38b9fc-c12a-52f7-b68a-5616749d009a",
        "kind": "theorem",
        "name": "ArtPlanetarium.palette_selection_stays_inside_palette",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 102,
        "column": 9,
        "sourceSignature": "theorem palette_selection_stays_inside_palette (index size : Nat) (positive : 0 < size) :\n    paletteIndex index size < size",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "520d5557-442c-57da-8f05-42be338699a1",
        "kind": "theorem",
        "name": "ArtPlanetarium.colour_channel_mix_stays_bounded",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 106,
        "column": 9,
        "sourceSignature": "theorem colour_channel_mix_stays_bounded (first second weight : Nat)\n    (firstBound : first ≤ 255) (secondBound : second ≤ 255) (weightBound : weight ≤ 100) :\n    channelMixNumerator first second weight ≤ 25500",
        "category": "materialKernel"
      }
    ]
  },
  {
    "profileIdentifier": "6956222e-f308-5e00-a3d5-d0129505f27e",
    "personIdentifier": "a7b5f284-c3af-5177-9aaf-74e58c313a63",
    "referenceScopeIdentifier": "94b80ea1-96f6-599b-93d8-93f090c52fc9",
    "title": "ヴァルター・グロピウス — Material Sphere",
    "canonicalName": "Walter Gropius",
    "componentName": "WalterGropius",
    "referenceWork": "Bauhaus Building, Dessau",
    "referencePeriod": "1926年に開校",
    "sourceClaimIdentifiers": [
      "01a09a97-f59f-74fb-9c67-b1164882dd01",
      "01a09a97-f59f-79e8-b823-61376c30dc1c",
      "01a09a97-f59f-73c4-b604-8f21df139452"
    ],
    "family": "transparentStructure",
    "interpretation": "透明感のある格子と不透明な面をずらして重ね、視点によって見える構成を変える。",
    "interpretationStatus": "proposed",
    "limitation": "ガラス風の半透明はガラスの物理を表さない。校舎の配色担当Hinnerk Scheperや事務所の共同作業を省略しない。",
    "cssMechanisms": "opacity / perspective / linear-gradient",
    "palette": [
      "#cfdbd8",
      "#334549",
      "#b6beb6"
    ],
    "paletteStatus": "chosenForPrototypeNotSampledFromArtwork",
    "parameters": {
      "repeatCount": 12,
      "gridStep": 20,
      "durationMilliseconds": 54000,
      "layerCount": 4,
      "opacityPercent": 45,
      "paletteSize": 3
    },
    "proofTargets": [
      "ArtPlanetarium.different_plane_normals_are_perpendicular",
      "ArtPlanetarium.grid_coordinates_are_aligned",
      "ArtPlanetarium.colour_channel_mix_stays_bounded"
    ],
    "renderingStatus": "browserNotConnected",
    "prompt": "Material Sphere。透明感のある格子と不透明な面をずらして重ね、視点によって見える構成を変える。 球としての陰影は共通層。原作の複製・作者本人の制作物とは表示しない。ガラス風の半透明はガラスの物理を表さない。校舎の配色担当Hinnerk Scheperや事務所の共同作業を省略しない。",
    "slug": "walter-gropius",
    "name": "ヴァルター・グロピウス",
    "facts": [
      {
        "claimIdentifier": "01a09a97-f59f-74fb-9c67-b1164882dd01",
        "claimDefinitionIdentifier": "0ccc1b11-794e-5a21-8fa0-95b9f977db72",
        "statement": "用途に応じて大きさ・高さの異なる棟を組み合わせ、全体を理解するには周囲を歩く必要がある配置を取った。",
        "sources": [
          {
            "title": "Bauhaus Building — Bauhaus Dessau Foundation",
            "url": "https://bauhaus-dessau.de/en/venues/bauhaus-building/",
            "sourceIdentifier": "5c5d1525-fe78-53fe-b221-7e805601df18"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-79e8-b823-61376c30dc1c",
        "claimDefinitionIdentifier": "9671d81b-2d89-5640-a7f5-fd0f18dc7977",
        "statement": "ガラスの外壁と構造の組合せが特徴。Gropiusの私設事務所が設計し、Carl Fieger、Ernst Neufert、Otto Meyer-Ottens、Bernhard Sturtzkopfが主要な役割を担った。",
        "sources": [
          {
            "title": "Bauhaus Building — Bauhaus Dessau Foundation",
            "url": "https://bauhaus-dessau.de/en/venues/bauhaus-building/",
            "sourceIdentifier": "5c5d1525-fe78-53fe-b221-7e805601df18"
          }
        ]
      },
      {
        "claimIdentifier": "01a09a97-f59f-73c4-b604-8f21df139452",
        "claimDefinitionIdentifier": "17315308-30b3-5133-931d-4504e9e7c1c0",
        "statement": "財団は素材を外見だけでなく、産業・製造・調達の歴史と結びつけて展示している。",
        "sources": [
          {
            "title": "Glass | Concrete | Metal — Bauhaus Dessau Foundation",
            "url": "https://bauhaus-dessau.de/en/exhibitions/glass-concrete-metal/?dt=20260328",
            "sourceIdentifier": "5c4a479b-3b2d-5134-a7c3-24f69132371f"
          }
        ]
      }
    ],
    "proofs": [
      {
        "declarationIdentifier": "076962ce-578d-5093-8fcc-1c9051db002d",
        "kind": "theorem",
        "name": "ArtPlanetarium.different_plane_normals_are_perpendicular",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 97,
        "column": 9,
        "sourceSignature": "theorem different_plane_normals_are_perpendicular (first second : PlaneNormal)\n    (different : first ≠ second) : normalDot first second = 0",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "d945cf70-cb97-54bf-be14-2189e6abda31",
        "kind": "theorem",
        "name": "ArtPlanetarium.grid_coordinates_are_aligned",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 62,
        "column": 9,
        "sourceSignature": "theorem grid_coordinates_are_aligned (step index : Nat) :\n    gridCoordinate step index % step = 0",
        "category": "materialKernel"
      },
      {
        "declarationIdentifier": "520d5557-442c-57da-8f05-42be338699a1",
        "kind": "theorem",
        "name": "ArtPlanetarium.colour_channel_mix_stays_bounded",
        "file": "formal/ArtPlanetarium/Proofs.lean",
        "line": 106,
        "column": 9,
        "sourceSignature": "theorem colour_channel_mix_stays_bounded (first second weight : Nat)\n    (firstBound : first ≤ 255) (secondBound : second ≤ 255) (weightBound : weight ≤ 100) :\n    channelMixNumerator first second weight ≤ 25500",
        "category": "materialKernel"
      }
    ]
  }
] as const;
export const materialSphereEvidence = {
  "artifactIdentifier": "e67bec4e-cc81-54b8-8de8-e04f06503867",
  "sourceRevision": "sha256:9478a5e17024ef21aaf5239ea2f13ffac7885ead15d95ef4607e5be55fd781bd",
  "executionIdentifier": "01a0a48b-cf79-770e-a05f-eee1d6a3021e",
  "profileCount": 15,
  "theoremCount": 38,
  "transitiveAxiomCount": 0,
  "rendererBranches": [
    {
      "renderer": "plumeriaCss",
      "label": "Plumeria / CSS",
      "availability": "connected",
      "rendererIdentifier": "2a04bcd8-e137-5616-aff8-6c81b2a0113e",
      "projectionPolicy": "firstTwoSpatialAxes",
      "limitation": "ブラウザーごとの検査は別に必要です。"
    },
    {
      "renderer": "rasterImage",
      "label": "画像",
      "availability": "notConnected",
      "rendererIdentifier": "11756f65-21cc-5be2-a7ab-439d40981f74",
      "projectionPolicy": "firstTwoSpatialAxes",
      "limitation": "変換処理と表示検査は未接続です。CSSとの見た目の一致も未検証です。"
    },
    {
      "renderer": "scalableVectorGraphics",
      "label": "SVG",
      "availability": "notConnected",
      "rendererIdentifier": "6114feb9-ca3d-54cd-8dbd-23c77a501dc1",
      "projectionPolicy": "firstTwoSpatialAxes",
      "limitation": "変換処理と表示検査は未接続です。CSSとの見た目の一致も未検証です。"
    },
    {
      "renderer": "canvasTwoDimensional",
      "label": "Canvas",
      "availability": "notConnected",
      "rendererIdentifier": "75c24328-6d06-52a3-8093-ab6613cfa6b9",
      "projectionPolicy": "firstTwoSpatialAxes",
      "limitation": "変換処理と表示検査は未接続です。CSSとの見た目の一致も未検証です。"
    },
    {
      "renderer": "threeDimensionalScene",
      "label": "Three.js",
      "availability": "notConnected",
      "rendererIdentifier": "093667d3-2e02-5dbd-9efe-975c2f7ab8c9",
      "projectionPolicy": "firstTwoSpatialAxes",
      "limitation": "変換処理と表示検査は未接続です。CSSとの見た目の一致も未検証です。"
    }
  ]
} as const;
