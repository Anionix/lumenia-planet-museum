# Update Log

## 2026-09-13

* **Creation**: Added the Lean model, proof suite, machine contracts, and source register.
* **Initial verification (superseded)**: The original construction result did not establish sufficient correspondence between the validator, input records and policy. The old reports are preserved as staleEvidence under verification/.
* **Model repair**: 2026-09-13T07:36:50.050Z; execution identifier (UUIDv7): 01a0999c-a8aa-7f30-80ef-2e5f84ecdd54. Replaced premise-repeating assertions with checker/specification equivalence, input preservation, exact shipment traces and witnessed histories. Added neutral rendering, explicit Draco activation and revision-sensitive numeric gates.
* **Registry repair**: UUIDv5 values now derive from namespace cb1751dc-c614-5c5c-b675-9f6e92b45067 and full declaration names. The registry records 27 public theorems and their model/adapter declarations.
* **Regression verification**: The compiled Lean validator and JSON checker agree across all 4096 Boolean assignments. The final build, per-theorem axiom dependencies and LSP responses are written to reports/ with their actual execution identifiers and source digests.
* **Independent verification reset**: Retired the previous Wolfram agent at the user's request. A fresh agent, Lagrange, reads the current source digests without inheriting the old conversation. Only its new revision-bound result may be attached to this repair.
* **Independent verification completed**: Wolfram execution 01a099af-57a8-7d6b-8bf6-61b564ac06bd at 2026-09-13T07:34:03Z–2026-09-13T07:35:16Z. All 4096 Boolean assignments agree (648 accepted), and 87381 event sequences through length 8 agree. Results are finite checks over the recorded three-file snapshot; arbitrary-length correctness remains the Lean theorem. Raw inputs and outputs are preserved in reports/wolfram-report-evidence.json.
