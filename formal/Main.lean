import Lumenia.Boundary

def main : IO Unit := do
  let input ← IO.getStdin
  let output ← IO.getStdout
  repeat
    let line ← input.getLine
    if line.isEmpty then break
    let response := match Lumenia.checkAssetJson line with
      | .ok accepted => Lean.Json.mkObj [("accepted", Lean.toJson accepted)]
      | .error reason => Lean.Json.mkObj
          [("accepted", Lean.toJson false), ("failureReason", Lean.toJson reason)]
    output.putStrLn response.compress
