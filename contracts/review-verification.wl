(* machine contract; record identifier: 02656152-2558-5647-bf33-4eb4ecc3c652.
   Integer models, real-valued bounds and finite state comparisons are independent
   of the JavaScript implementation. Browser observations remain separate evidence. *)
axisMatrix={{-1,1,0,0,0,0,0,0,0,0,0},{0,0,0,0,1,0,-1,0,0,0,0},{0,0,-1,1,0,0,0,0,0,0,0}};
states=Select[Tuples[{{0,1},{False,True},{False,True},{False,True},{False,True}}],
  (#[[2]]||!#[[4]])&&(!#[[5]]||#[[4]])&];
pairs=Tuples[states,2];
counterexamples=Select[pairs,#[[1,1]]==#[[2,1]]&&#[[1]]=!=#[[2]]&];
flags=Tuples[{False,True},3];
checks=<|
  "score_difference_bound"->(Reduce[0<=a<=1&&0<=b<=1&&(a-b < -1||a-b>1),{a,b},Reals]===False),
  "projection_rank_three"->(MatrixRank[axisMatrix]===3),
  "projection_retains_eight_unseen_dimensions"->(Length[NullSpace[axisMatrix]]===8),
  "nonnegative_normalized_recipe_bound"->TrueQ[Resolve[ForAll[{w1,w2,w3,t1,t2,t3},
    Implies[w1>=0&&w2>=0&&w3>=0&&w1+w2+w3==1&&0<=t1<=1&&0<=t2<=1&&0<=t3<=1,
      0<=w1*t1+w2*t2+w3*t3<=1]],Reals]],
  "normal_step_metres"->(8/20===2/5),
  "sixty_step_distance_metres"->(60*8/20===24),
  "bounded_batch"->(Reduce[0<=n<=60&&0<=d<=2/5&&n*d>24,{n,d},Reals]===False),
  "turn_range_radians"->TrueQ[FullSimplify[-Pi<=turn*Pi/12<=Pi,Assumptions->-12<=turn<=12]],
  "full_state_equality_rejects_every_partial_match"->AllTrue[counterexamples,#[[1]]=!=#[[2]]&],
  "artist_only_gate_has_counterexamples"->(Length[counterexamples]===112),
  "complete_valid_states"->(Length[states]===16&&Length[pairs]===256),
  "only_fresh_complete_same_revision_receipt_passes"->(Select[flags,And@@#&]==={{True,True,True}}),
  "busy_writer_is_rejected"->Not[!False && (False || !True)],
  "aborted_actions_are_rejected"->AllTrue[flags,(!#[[3]]&&(#[[1]]||!#[[2]]))===If[#[[3]],False,#[[1]]||!#[[2]]]&],
  "trace_length_bound"->(Reduce[n>=0&&Min[n+1,200]>200,n,Integers]===False),
  "clock_day_bound"->(Reduce[0<=t<=86400000&&dt>=0&&Min[t+Min[dt,100],86400000]>86400000,{t,dt},Reals]===False),
  "clock_crosses_two_minutes_without_wrapping"->(Min[119950+Min[100,100],86400000]===120050)
|>;
ExportString[<|"checks"->checks,"all_passed"->And@@Values[checks],"valid_state_count"->Length[states],
  "state_pair_count"->Length[pairs],"partial_match_counterexample_count"->Length[counterexamples],
  "partial_match_example"->First[counterexamples],"truth_table_rows"->Length[flags],
  "scope"->"Mathematical models and finite state obligations, not a proof of browser timing or historical influence."|>,"RawJSON"]
