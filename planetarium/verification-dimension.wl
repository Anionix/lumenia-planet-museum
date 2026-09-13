(*
  llm machine contract
  artifactIdentifier: e67bec4e-cc81-54b8-8de8-e04f06503867
  executionIdentifier: 01a09a86-bce5-77fe-8aff-ce403b00e379
  state: dimension-contract-written
  transition: dimension-contract-written -> independent-Wolfram-evaluation

  This file is the independent Wolfram calculation for Material Sphere.
  It uses exact integer arithmetic only.  It does not evaluate aesthetics,
  artistic essence, authorship, or symbolic visual quality.
  The external boundary is strict: spaceDimensions is 1..4 and the integer
  coordinate list has exactly that length.  timeMilliseconds is a separate
  field; three-dimensional-space-plus-time is not four-dimensional space.
  The first-plane rotation is intentionally undefined for one dimension and
  is represented by Null, which is exported as JSON null.  Matrix tests cover
  dimensions 2..4 only.
*)

ClearAll[
  validCoordinateQ, encodeCoordinates, appendAxis, dropLastAxis,
  projectToPlane, sameExceptLastAxisQ, spaceTimeSample,
  firstPlaneRotationMatrix, haloAngle, routeAngle, orthogonalAngle,
  channelMixNumerator, evidenceDecision, evidenceExpected
];

validCoordinateQ[spaceDimensions_, coordinates_] :=
  IntegerQ[spaceDimensions] && 1 <= spaceDimensions <= 4 &&
    ListQ[coordinates] && Length[coordinates] === spaceDimensions &&
    AllTrue[coordinates, IntegerQ];

encodeCoordinates[spaceDimensions_, coordinates_] :=
  If[validCoordinateQ[spaceDimensions, coordinates], coordinates, Null];

appendAxis[coordinates_List, axis_Integer] := Append[coordinates, axis];

dropLastAxis[coordinates_List] :=
  If[coordinates === {}, Null, Most[coordinates]];

(* Projection is an explicit two-dimensional view; extra spatial axes are dropped. *)
projectToPlane[coordinates_List] := Take[Join[coordinates, {0, 0}], 2];

sameExceptLastAxisQ[first_List, second_List] :=
  Length[first] === Length[second] && Length[first] >= 1 &&
    Take[first, Length[first] - 1] === Take[second, Length[second] - 1] &&
    Last[first] =!= Last[second];

spaceTimeSample[spaceDimensions_, coordinates_, timeMilliseconds_] :=
  <|
    "spaceDimensions" -> spaceDimensions,
    "coordinates" -> coordinates,
    "timeMilliseconds" -> timeMilliseconds
  |>;

(* R is the exact first-plane 90-degree rotation, embedded in dimensions 2..4. *)
firstPlaneRotationMatrix[spaceDimensions_Integer] :=
  If[MemberQ[{2, 3, 4}, spaceDimensions],
    Table[
      Which[
        row === 1 && column === 2, -1,
        row === 2 && column === 1, 1,
        row === column && row > 2, 1,
        True, 0
      ],
      {row, spaceDimensions}, {column, spaceDimensions}
    ],
    Null
  ];

haloAngle[index_Integer] := 30*Mod[index, 12];
routeAngle[index_Integer] := 45*Mod[index, 8];
orthogonalAngle[index_Integer] := 90*Mod[index, 4];

channelMixNumerator[firstChannel_Integer, secondChannel_Integer, weight_Integer] :=
  (100 - weight)*firstChannel + weight*secondChannel;

evidenceDecision[supportCount_Integer, contradictionCount_Integer, stale_] :=
  Which[
    stale === True, "staleEvidence",
    contradictionCount > 0, "fail",
    supportCount === 0, "blocked",
    True, "pass"
  ];

(* A separately evaluated contract table keeps the decision rows machine-checkable. *)
evidenceExpected[supportCount_Integer, contradictionCount_Integer, stale_] :=
  If[stale === True, "staleEvidence",
    If[contradictionCount > 0, "fail",
      If[supportCount === 0, "blocked", "pass"]
    ]
  ];

coordinateRows = Table[
  With[
    {coordinates = Take[{-3, 0, 2, 7}, spaceDimensions]},
    With[
      {encoded = encodeCoordinates[spaceDimensions, coordinates]},
      <|
        "spaceDimensions" -> spaceDimensions,
        "inputLength" -> Length[coordinates],
        "encodedCoordinates" -> encoded,
        "expectedLength" -> spaceDimensions,
        "pass" -> (encoded =!= Null && Length[encoded] === spaceDimensions &&
          AllTrue[encoded, IntegerQ])
      |>
    ]
  ],
  {spaceDimensions, 1, 4}
];

invalidCoordinateRows = Map[
  Function[input,
    With[
      {encoded = encodeCoordinates[input["spaceDimensions"], input["coordinates"]]},
      <|
        "spaceDimensions" -> input["spaceDimensions"],
        "input" -> input["coordinates"],
        "accepted" -> (encoded =!= Null),
        "pass" -> (encoded === Null)
      |>
    ]
  ],
  {
    <|"spaceDimensions" -> 2, "coordinates" -> {1}|>,
    <|"spaceDimensions" -> 3, "coordinates" -> {1, 2, 3, 4}|>,
    <|"spaceDimensions" -> 4, "coordinates" -> {1, 2, 3.0, 4}|>,
    <|"spaceDimensions" -> 5, "coordinates" -> {1, 2, 3, 4, 5}|>
  }
];

appendDropRows = Table[
  With[
    {original = Take[{-3, 0, 2, 7}, spaceDimensions], appendedAxis = 100 + spaceDimensions},
    With[
      {appended = appendAxis[original, appendedAxis]},
      With[
        {restored = dropLastAxis[appended]},
        <|
          "spaceDimensions" -> spaceDimensions,
          "original" -> original,
          "appended" -> appended,
          "restored" -> restored,
          "pass" -> (restored === original && Length[appended] === spaceDimensions + 1)
        |>
      ]
    ]
  ],
  {spaceDimensions, 1, 4}
];

rotationRows = Table[
  With[
    {matrix = firstPlaneRotationMatrix[spaceDimensions]},
    With[
      {powerFour = If[matrix === Null, Null, MatrixPower[matrix, 4]]},
      <|
        "spaceDimensions" -> spaceDimensions,
        "rotationMatrix" -> matrix,
        "powerFour" -> powerFour,
        "expectedForOneDimension" -> If[spaceDimensions === 1, Null, "matrix-test-not-applicable"],
        "pass" -> If[
          spaceDimensions === 1,
          matrix === Null && powerFour === Null,
          MemberQ[{2, 3, 4}, spaceDimensions] && powerFour === IdentityMatrix[spaceDimensions]
        ]
      |>
    ]
  ],
  {spaceDimensions, 1, 4}
];

projectionRows = Table[
  With[
    {coordinates = Take[{-2, 4, 7, 11}, spaceDimensions]},
    With[
      {projection = projectToPlane[coordinates], expected = Take[Join[coordinates, {0, 0}], 2]},
      <|
        "spaceDimensions" -> spaceDimensions,
        "coordinates" -> coordinates,
        "projectedCoordinates" -> projection,
        "expectedProjection" -> expected,
        "pass" -> (projection === expected && Length[projection] === 2)
      |>
    ]
  ],
  {spaceDimensions, 1, 4}
];

pointA = {1, -2, 3, 4};
pointB = {1, -2, 3, 9};
projectionCounterexample = <|
  "pointA" -> pointA,
  "pointB" -> pointB,
  "pointsDistinct" -> (pointA =!= pointB),
  "onlyAdditionalAxisDiffers" -> sameExceptLastAxisQ[pointA, pointB],
  "projectionA" -> projectToPlane[pointA],
  "projectionB" -> projectToPlane[pointB],
  "same2DProjection" -> (projectToPlane[pointA] === projectToPlane[pointB]),
  "pass" -> (pointA =!= pointB && sameExceptLastAxisQ[pointA, pointB] &&
    projectToPlane[pointA] === projectToPlane[pointB])
|>;

threeDimensionalPlusTime = spaceTimeSample[3, {-2, 0, 5}, 1250];
threeDimensionalPlusTimeLater = spaceTimeSample[3, {-2, 0, 5}, 2500];
fourDimensionalSpace = spaceTimeSample[4, {-2, 0, 5, 7}, 1250];

timeSeparation = <|
  "threeDimensionalPlusTime" -> threeDimensionalPlusTime,
  "fourDimensionalSpace" -> fourDimensionalSpace,
  "threeDimensionalCoordinateLength" -> Length[threeDimensionalPlusTime["coordinates"]],
  "fourDimensionalCoordinateLength" -> Length[fourDimensionalSpace["coordinates"]],
  "timeChangeLeavesCoordinatesUnchanged" ->
    (threeDimensionalPlusTime["coordinates"] === threeDimensionalPlusTimeLater["coordinates"]),
  "timeMillisecondsIsSeparateField" ->
    (MemberQ[Keys[threeDimensionalPlusTime], "timeMilliseconds"] &&
      MemberQ[Keys[fourDimensionalSpace], "timeMilliseconds"]),
  "threeDimensionalPlusTimeIsNotFourDimensionalSpace" ->
    (Length[threeDimensionalPlusTime["coordinates"]] === 3 &&
      Length[fourDimensionalSpace["coordinates"]] === 4),
  "pass" ->
    (Length[threeDimensionalPlusTime["coordinates"]] === 3 &&
      Length[fourDimensionalSpace["coordinates"]] === 4 &&
      threeDimensionalPlusTime["coordinates"] === threeDimensionalPlusTimeLater["coordinates"] &&
      MemberQ[Keys[threeDimensionalPlusTime], "timeMilliseconds"] &&
      MemberQ[Keys[fourDimensionalSpace], "timeMilliseconds"])
|>;

haloRows = Table[
  With[{angle = haloAngle[index], expected = 30*Mod[index, 12]},
    <|
      "index" -> index,
      "angleDegrees" -> angle,
      "expectedAngleDegrees" -> expected,
      "pass" -> (angle === expected && 0 <= angle && angle < 360)
    |>
  ],
  {index, 0, 11}
];
haloAngles = Lookup[haloRows, "angleDegrees"];
haloCheck = <|
  "table" -> haloRows,
  "closesAfterTwelveSlots" -> (haloAngle[12] === haloAngle[0]),
  "twelveAnglesAreDistinct" -> (Length[DeleteDuplicates[haloAngles]] === 12),
  "pass" -> (And @@ Lookup[haloRows, "pass"] && haloAngle[12] === haloAngle[0] &&
    Length[DeleteDuplicates[haloAngles]] === 12)
|>;

routeRows = Table[
  With[{angle = routeAngle[index], expected = 45*Mod[index, 8]},
    <|
      "index" -> index,
      "angleDegrees" -> angle,
      "expectedAngleDegrees" -> expected,
      "multipleOf45Degrees" -> (Mod[angle, 45] === 0),
      "pass" -> (angle === expected && 0 <= angle && angle < 360 && Mod[angle, 45] === 0)
    |>
  ],
  {index, 0, 7}
];

orthogonalRows = Table[
  With[{angle = orthogonalAngle[index], expected = 90*Mod[index, 4]},
    <|
      "index" -> index,
      "angleDegrees" -> angle,
      "expectedAngleDegrees" -> expected,
      "multipleOf90Degrees" -> (Mod[angle, 90] === 0),
      "pass" -> (angle === expected && 0 <= angle && angle < 360 && Mod[angle, 90] === 0)
    |>
  ],
  {index, 0, 3}
];

channelInputs = Tuples[{{0, 1, 254, 255}, {0, 1, 254, 255}, {0, 1, 50, 99, 100}}];
channelRows = Map[
  Function[input,
    With[
      {firstChannel = input[[1]], secondChannel = input[[2]], weight = input[[3]]},
      With[
        {numerator = channelMixNumerator[firstChannel, secondChannel, weight]},
        <|
          "firstChannel" -> firstChannel,
          "secondChannel" -> secondChannel,
          "weightPercent" -> weight,
          "numerator" -> numerator,
          "upperLimit" -> 25500,
          "pass" -> (IntegerQ[numerator] && 0 <= numerator <= 25500)
        |>
      ]
    ]
  ],
  channelInputs
];

evidenceRows = Flatten[
  Table[
    With[{observed = evidenceDecision[support, contradiction, stale],
      expected = evidenceExpected[support, contradiction, stale]},
      <|
        "supportCount" -> support,
        "contradictionCount" -> contradiction,
        "stale" -> stale,
        "observedDecision" -> observed,
        "expectedDecision" -> expected,
        "pass" -> (observed === expected)
      |>
    ],
    {support, 0, 3}, {contradiction, 0, 3}, {stale, {False, True}}
  ],
  2
];

checks = <|
  "exactCoordinateLengthsOneToFour" -> And @@ Lookup[coordinateRows, "pass"],
  "invalidCoordinateLengthsRejected" -> And @@ Lookup[invalidCoordinateRows, "pass"],
  "appendDropRestoresAllDimensions" -> And @@ Lookup[appendDropRows, "pass"],
  "firstPlaneRotationOneDimensionIsNull" -> rotationRows[[1, "pass"]],
  "firstPlaneRotationMatrixPowerFourIsIdentityForTwoToFourDimensions" ->
    And @@ rotationRows[[{2, 3, 4}, "pass"]],
  "projectionTablesAreExactTwoDimensionalViews" -> And @@ Lookup[projectionRows, "pass"],
  "fourDimensionalProjectionCounterexample" -> projectionCounterexample["pass"],
  "timeIsSeparateFromSpatialCoordinates" -> timeSeparation["pass"],
  "haloAngleTable" -> haloCheck["pass"],
  "routeAngleTable" -> And @@ Lookup[routeRows, "pass"],
  "orthogonalAngleTable" -> And @@ Lookup[orthogonalRows, "pass"],
  "channelMixFiniteTable" -> And @@ Lookup[channelRows, "pass"],
  "evidenceDecisionTable" -> And @@ Lookup[evidenceRows, "pass"]
|>;

overallPass = And @@ Values[checks];

coordinateTable = <|
  "rowFields" -> {"spaceDimensions", "inputLength", "encodedCoordinates", "expectedLength", "pass"},
  "rows" -> (Lookup[#, {"spaceDimensions", "inputLength", "encodedCoordinates", "expectedLength", "pass"}] & /@ coordinateRows)
|>;

invalidCoordinateTable = <|
  "rowFields" -> {"spaceDimensions", "input", "accepted", "pass"},
  "rows" -> (Lookup[#, {"spaceDimensions", "input", "accepted", "pass"}] & /@ invalidCoordinateRows)
|>;

appendDropTable = <|
  "rowFields" -> {"spaceDimensions", "original", "appended", "restored", "pass"},
  "rows" -> (Lookup[#, {"spaceDimensions", "original", "appended", "restored", "pass"}] & /@ appendDropRows)
|>;

rotationTable = <|
  "rowFields" -> {"spaceDimensions", "rotationMatrix", "powerFour", "expectedForOneDimension", "pass"},
  "rows" -> (Lookup[#, {"spaceDimensions", "rotationMatrix", "powerFour", "expectedForOneDimension", "pass"}] & /@ rotationRows)
|>;

projectionTable = <|
  "rowFields" -> {"spaceDimensions", "coordinates", "projectedCoordinates", "expectedProjection", "pass"},
  "rows" -> (Lookup[#, {"spaceDimensions", "coordinates", "projectedCoordinates", "expectedProjection", "pass"}] & /@ projectionRows)
|>;

angleTable[rows_List, extra_Association] :=
  Join[
    <|
      "rowFields" -> {"index", "angleDegrees", "expectedAngleDegrees", "pass"},
      "rows" -> (Lookup[#, {"index", "angleDegrees", "expectedAngleDegrees", "pass"}] & /@ rows)
    |>,
    extra
  ];

channelMixTable = <|
  "rowFields" -> {"firstChannel", "secondChannel", "weightPercent", "numerator", "upperLimit", "pass"},
  "inputFirstChannels" -> {0, 1, 254, 255},
  "inputSecondChannels" -> {0, 1, 254, 255},
  "inputWeightPercents" -> {0, 1, 50, 99, 100},
  "rows" -> (Lookup[#, {"firstChannel", "secondChannel", "weightPercent", "numerator", "upperLimit", "pass"}] & /@ channelRows),
  "pass" -> (And @@ Lookup[channelRows, "pass"])
|>;

evidenceTable = <|
  "rowFields" -> {"supportCount", "contradictionCount", "stale", "observedDecision", "expectedDecision", "pass"},
  "rows" -> (Lookup[#, {"supportCount", "contradictionCount", "stale", "observedDecision", "expectedDecision", "pass"}] & /@ evidenceRows),
  "pass" -> (And @@ Lookup[evidenceRows, "pass"])
 |>;

result = <|
  "artifactIdentifier" -> "e67bec4e-cc81-54b8-8de8-e04f06503867",
  "calculation" -> "independent-Wolfram-exact-integer-and-finite-table-check",
  "status" -> If[overallPass, "blocked", "fail"],
  "statusReason" -> If[overallPass,
    "parent-receipt-must-bind-execution-uuid-and-source-revision",
    "independent-calculation-check-failure"
  ],
  "calculationChecksPass" -> overallPass,
  "checks" -> checks,
  "dimensionContract" -> <|
    "acceptedSpaceDimensions" -> {1, 2, 3, 4},
    "coordinateKind" -> "integer-grid",
    "exactCoordinateLength" -> True,
    "oneDimensionalFirstPlaneRotation" -> Null,
    "rotationMatrixTargetDimensions" -> {2, 3, 4},
    "timeMillisecondsIsNotASpatialAxis" -> True
  |>,
  "coordinateTable" -> coordinateTable,
  "invalidCoordinateTable" -> invalidCoordinateTable,
  "appendDropTable" -> appendDropTable,
  "rotationTable" -> rotationTable,
  "projectionTable" -> projectionTable,
  "projectionCounterexample" -> projectionCounterexample,
  "timeSeparation" -> timeSeparation,
  "halo" -> angleTable[haloRows, <|
    "closesAfterTwelveSlots" -> haloCheck["closesAfterTwelveSlots"],
    "twelveAnglesAreDistinct" -> haloCheck["twelveAnglesAreDistinct"],
    "pass" -> haloCheck["pass"]
  |>],
  "route" -> angleTable[routeRows, <|"pass" -> (And @@ Lookup[routeRows, "pass"])|>],
  "orthogonal" -> angleTable[orthogonalRows, <|"pass" -> (And @@ Lookup[orthogonalRows, "pass"])|>],
  "channelMix" -> channelMixTable,
  "evidence" -> evidenceTable
|>;

ExportString[result, "RawJSON", "Compact" -> True]
