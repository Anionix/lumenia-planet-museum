import { withPlumeria } from '@plumeria/next-plugin';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

// llm machine contract; claim UUIDv5: 07b6fb92-8639-50e0-873d-b43d3d5c28df
// execution UUIDv7: 01a099d4-9840-7179-b6e0-2b7759333103
// state: static deployment; transition: source -> compiled CSS and static routes
export default withPlumeria({
  output: 'export',
  trailingSlash: true,
  poweredByHeader: false,
  reactCompiler: false,
  productionBrowserSourceMaps: true,
  turbopack: { root: fileURLToPath(new URL('..', import.meta.url)) },
  webpack(configuration, { isServer }) {
    if (!isServer) configuration.plugins.push({
      apply(compiler) {
        compiler.hooks.done.tap('LumeniaClientModuleEvidence', statistics => {
          const collected = new Set();
          function collect(module) {
            if (collected.has(module)) return;
            collected.add(module);
            if (module.modules) for (const child of module.modules) collect(child);
          }
          for (const module of statistics.compilation.modules) collect(module);
          const modules = [...collected].map(module => ({
            identifier: module.identifier(), resource: module.resource ?? null,
            transformedSource: module.resource?.startsWith(path.join(projectRoot, 'web'))
              ? String(module.originalSource()?.source() ?? '') : null,
          }));
          mkdirSync(path.join(projectRoot, 'reports'), { recursive: true });
          writeFileSync(path.join(projectRoot, 'reports/webpack-client-modules.json'), JSON.stringify({ modules }, null, 2));
        });
      },
    });
    return configuration;
  },
});
