import { makeRequest, sampleRequest, validateMaterialParameters } from './kernel.mjs';

// llm machine contract
// artifact UUIDv5: e67bec4e-cc81-54b8-8de8-e04f06503867
// execution UUIDv7: 01a09a86-bce5-77fe-8aff-ce403b00e379
// state: build-time design recipes, not measured likeness
// transition: source-backed profile -> checked integer samples -> literal Plumeria style schemas.

export const materialFamilies = Object.freeze([
  'botanicalRepeat', 'zodiacHalo', 'geometricBotanical', 'orthogonalColourPlanes',
  'perpendicularConstruction', 'laminateAndAccent', 'geometricLettering', 'typographicGrid',
  'transitDiagram', 'modularProduct', 'familiarPullControl', 'asymmetricVolume',
  'layeredMaterials', 'colourCollage', 'transparentStructure',
]);

export function compileMaterialSphere(profile) {
  const { parameters, palette, family } = profile;
  if (!validateMaterialParameters(parameters) || !materialFamilies.includes(family) ||
      !Array.isArray(palette) || palette.length !== parameters.paletteSize ||
      !palette.every(colour => /^#[0-9a-f]{6}$/.test(colour)) ||
      (family === 'zodiacHalo' && parameters.repeatCount !== 12) ||
      (family === 'asymmetricVolume' && parameters.layerCount < 2)) {
    throw new Error('Invalid Material Sphere profile');
  }
  const requests = Array.from({ length: parameters.repeatCount }, (_, index) =>
    makeRequest(parameters, { index, seed: index }));
  const samples = requests.map(sampleRequest);
  const layers = samples.map((sample, index) => {
    const colour = palette[sample.paletteIndex];
    const base = { position: 'absolute', display: 'block', backgroundColor: colour,
      left: `${12 + sample.tileCoordinate * 2}%`, top: `${12 + (index % 5) * 16}%`,
      width: '18%', height: '18%' };
    switch (family) {
      case 'botanicalRepeat':
      case 'geometricBotanical':
        return { ...base, borderRadius: '90% 10% 85% 15%',
          transform: `rotate(${sample.orthogonalAngle}deg)`,
          boxShadow: `${sample.mirrorCoordinate}px 0 0 ${palette[(sample.paletteIndex + 1) % palette.length]}` };
      case 'zodiacHalo':
        return { ...base, left: '48%', top: '48%', width: '4%', height: '4%', borderRadius: '50%',
          transform: `rotate(${sample.haloAngle}deg) translateY(-90px)` };
      case 'orthogonalColourPlanes':
        return { ...base, width: '35%', height: '25%', border: `3px solid ${palette[1]}`,
          transform: `rotate(${sample.orthogonalAngle}deg)` };
      case 'perpendicularConstruction':
      case 'transparentStructure':
        return { ...base, width: '48%', height: '44%',
          opacity: String(parameters.opacityPercent / 100),
          transform: `perspective(600px) ${{ horizontal: 'rotateY(90deg)', vertical: 'rotateX(-90deg)', depth: 'rotateY(0deg)' }[sample.planeNormal]}`,
          border: `1px solid ${palette[1]}` };
      case 'laminateAndAccent':
      case 'colourCollage':
        return { ...base, transform: `rotate(${sample.routeAngle}deg)`,
          backgroundImage: `repeating-linear-gradient(45deg,transparent 0px,transparent 5px,${palette[1]} 5px,${palette[1]} 7px)` };
      case 'geometricLettering':
        return { ...base, borderRadius: index % 2 ? '0%' : '50%', backgroundColor: 'transparent',
          border: `7px solid ${colour}`, transform: `rotate(${sample.orthogonalAngle}deg)` };
      case 'typographicGrid':
      case 'modularProduct':
        return { ...base, left: '18%', top: `${sample.gridCoordinate}px`, width: '64%', height: '3%',
          borderRadius: family === 'modularProduct' ? '2px' : '0px' };
      case 'transitDiagram':
        return { ...base, width: '64%', height: '3%', transformOrigin: '0% 50%',
          transform: `rotate(${sample.routeAngle}deg)`, borderRadius: '3px' };
      case 'familiarPullControl':
        return { ...base, left: '25%', top: '25%', width: '50%', height: '50%', borderRadius: '50%',
          border: `10px solid ${palette[1]}`, boxShadow: `0 60px 0 -20px ${palette[1]}` };
      case 'asymmetricVolume':
        return { ...base, width: `${index % 2 ? sample.foldRightWidth : sample.foldLeftWidth}%`, height: '65%',
          transform: `rotate(${sample.routeAngle + sample.tileCoordinate}deg)`,
          clipPath: 'polygon(0% 0%,100% 20%,65% 100%,15% 75%)',
          boxShadow: `inset 2px 2px 8px ${palette[2]}` };
      case 'layeredMaterials':
        return { ...base, left: `${12 + index * 8}%`, top: `${14 + index * 14}%`,
          width: '68%', height: '42%', borderRadius: '48%', border: `6px solid ${palette[1]}` };
      default: throw new Error('Unreachable material family');
    }
  });
  return {
    profileIdentifier: profile.profileIdentifier, family,
    shell: { position: 'relative', width: '240px', height: '240px', borderRadius: '50%',
      overflow: 'hidden', isolation: 'isolate', backgroundColor: palette[0] },
    shading: { position: 'absolute', inset: '0px', borderRadius: '50%', pointerEvents: 'none',
      backgroundImage: 'radial-gradient(circle at 28% 24%,#ffffff66 0%,transparent 42%,#00000099 100%)',
      boxShadow: 'inset -12px -16px 24px #00000055' },
    layers, requests,
    controlContract: { stopOnReducedMotion: true, playbackEvent: 'togglePlaying',
      initialPlaying: false, requiresClientComponentForInteractiveControl: true },
  };
}

export function plumeriaSource(profiles, { executionIdentifier, sourceRevision }) {
  const recipes = profiles.map(compileMaterialSphere);
  const styles = {};
  for (const [index, recipe] of recipes.entries()) {
    const key = profiles[index].componentName;
    styles[`${key}Sphere`] = recipe.shell;
    styles[`${key}Shading`] = recipe.shading;
    recipe.layers.forEach((style, layer) => { styles[`${key}Surface${layer}`] = style; });
  }
  const header = '// llm machine contract\n// artifact UUIDv5: e67bec4e-cc81-54b8-8de8-e04f06503867\n' +
    '// execution UUIDv7: ' + executionIdentifier + '\n// source revision: ' + sourceRevision + '\n' +
    '// state: generated static schemas; transition: checked profiles -> Plumeria build -> browser gate required\n';
  return header + "import * as css from '@plumeria/core';\n\n" +
    'export const materialSphereStyles = css.create(' + JSON.stringify(styles, null, 2) + ');\n';
}
