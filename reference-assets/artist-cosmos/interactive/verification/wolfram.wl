(* Exact values exported from the current exhibition. Manifest: 108306a4418dd2b7740e2f7130cdac366adc5352d305722047dc41c1db96d616 *)
coordinates = {{-70,5,-85},{-70,-45,-95},{25,20,-25},{95,60,65},{95,50,50},{55,-65,-95},{85,50,55},{90,65,85},{85,70,85},{75,80,98},{45,65,98},{-35,-75,-10}}/100;
presentation = {{-146,52,0},{-73,52,0},{0,52,0},{73,52,0},{146,52,0},{-146,0,0},{-73,0,0},{0,0,0},{73,0,0},{146,0,0},{-146,-52,0},{-73,-52,0},{0,-52,0},{73,-52,0},{146,-52,0}}/10;
expectedNumerators = {{0,2600,12850,52750,47475,20625,45650,58100,57150,60139,50314,13250},{2600,0,18150,63850,57275,16025,55550,70100,69650,73899,62574,9350},{12850,18150,0,14600,11425,13025,10900,18350,18200,21229,17554,12850},{52750,63850,14600,0,325,42825,300,450,600,1889,3614,40750},{47475,57275,11425,325,0,35850,125,1475,1725,3604,5029,36125},{20625,16025,13025,42825,35850,0,36625,50525,51525,58674,54249,15425},{45650,55550,10900,300,125,36625,0,1150,1300,2849,3674,34250},{58100,70100,18350,450,1475,50525,1150,0,50,619,2194,44250},{57150,69650,18200,600,1725,51525,1300,50,0,369,1794,44450},{60139,73899,21229,1889,3604,58674,2849,619,369,0,1125,47789},{50314,62574,17554,3614,5029,54249,3674,2194,1794,1125,0,37664},{13250,9350,12850,40750,36125,15425,34250,44250,44450,47789,37664,0}};
squaredMatrix = Table[Total[(coordinates[[i]]-coordinates[[j]])^2],{i,Length[coordinates]},{j,Length[coordinates]}];
checks = <|
"real_score_difference_bounded" -> Resolve[ForAll[{a,b},Implies[0<=a<=1 && 0<=b<=1,-1<=a-b<=1]],Reals],
"normalized_two_component_mixture_bounded" -> Resolve[ForAll[{a,b,w},Implies[0<=a<=1 && 0<=b<=1 && 0<=w<=1,0<=w*a+(1-w)*b<=1]],Reals],
"coordinate_bounds" -> And@@Flatten[Map[-1<=#<=1&,coordinates,{2}]],
"exact_squared_distance_matrix_matches" -> (10000*squaredMatrix===expectedNumerators),
"distance_symmetry" -> (squaredMatrix===Transpose[squaredMatrix]),
"distance_diagonal_zero" -> (Diagonal[squaredMatrix]===ConstantArray[0,Length[coordinates]]),
"squared_distance_range" -> And@@Flatten[Map[0<=#<=12&,squaredMatrix,{2}]],
"initial_panels_do_not_overlap" -> And@@Flatten[Table[If[i==j,True,Abs[presentation[[i,1]]-presentation[[j,1]]]>=6 || Abs[presentation[[i,2]]-presentation[[j,2]]]>=4],{i,15},{j,15}]],
"sixty_steps_equal_one_second" -> (60*(1/60)==1),
"maximum_five_steps_equal_one_twelfth_second" -> (5*(1/60)==1/12)
|>;
ExportString[<|"checks"->checks,"all_passed"->And@@Values[checks],"known_count"->Length[coordinates],"unknown_count"->3,"unique_pairs"->Binomial[Length[coordinates],2],"squared_distance_numerators"->(10000*squaredMatrix),"squared_distance_denominator"->10000,"maximum_observed_distance"->N[Sqrt[Max[squaredMatrix]],12],"step_seconds"->N[1/60,12],"maximum_frame_seconds"->N[1/12,12]|>,"RawJSON"]
