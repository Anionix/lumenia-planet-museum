import Lumenia.Model
open Lumenia

#eval do
  let stages : List ArtifactStage := [.source, .optimized, .validated, .shipped, .rejected]
  let events : List ArtifactEvent := [.optimize, .validate, .ship, .reject]
  let modes : List DeploymentMode := [.staticExport, .serverRuntime]
  let placements : List ComponentPlacement := [.server, .client]
  let capabilities : List RuntimeCapability :=
    [.pureRendering, .serverOnly, .browserApi, .state, .eventHandler, .threeDimensionalRendering]
  IO.println (repr (stages.map fun stage => events.map (transition stage)))
  IO.println (repr (modes.map fun mode => capabilities.map (deploymentCapabilityAllowed mode)))
  IO.println (repr (placements.map fun placement => capabilities.map (componentPlacementAllowed placement)))
