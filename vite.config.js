import { readFileSync } from 'node:fs';
import { defineConfig, loadEnv } from 'vite';

function glslRawPlugin() {
  return {
    name: 'glsl-raw',
    enforce: 'pre',
    load(id) {
      const cleanId = id.split('?')[0];
      if (cleanId.endsWith('.glsl')) {
        this.addWatchFile(cleanId);
        const code = readFileSync(cleanId, 'utf-8');
        return `export default ${JSON.stringify(code)};`;
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const rootDir = import.meta.dirname;
  const env = loadEnv(mode, rootDir, '');
  const apiKey = (
    env.VITE_GOOGLE_PLACES_API_KEY ||
    env.GOOGLE_PLACES_API_KEY ||
    process.env.VITE_GOOGLE_PLACES_API_KEY ||
    process.env.GOOGLE_PLACES_API_KEY ||
    ''
  ).trim();

  return {
    base: './',
    define: {
      __GOOGLE_PLACES_API_KEY__: JSON.stringify(apiKey),
    },
    plugins: [glslRawPlugin()],
  };
});
