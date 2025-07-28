import { defineConfig } from 'tsup';

// --format esm,cjs --dts --out-dir dist/svg --tsconfig tsconfig.svg.json

export default defineConfig({
    entry: ['src/index.svg.ts'],
    splitting: false,
    sourcemap: true,
    clean: true,
    platform: 'browser',
    format: 'iife',
    dts: true,
    tsconfig: 'tsconfig.svg.json',
    outDir: 'dist/svg',
    minify: false,
    legacyOutput: false,
    globalName: 'Svidget',
    target: 'es2020',
    // esbuildOptions(options) {
    //     options.outfile = 'dist/svg/svidget.svg.js';
    // },
});
