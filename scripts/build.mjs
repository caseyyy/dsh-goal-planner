/**
 * Build the host and client halves of dsh-goal-planner with esbuild.
 *   lib/index.js    — host bundle (node), externals: @deepseek-ai/* (host resolves them)
 *   lib/client.js   — client bundle (browser), registered via window.__ModuleLoader__.load
 * Also emits minimal .d.ts stubs referenced by package.json exports.
 */
import { build } from 'esbuild'
import { mkdirSync, writeFileSync } from 'node:fs'

await build({
  entryPoints: ['src/index.js'],
  outfile: 'lib/index.js',
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  external: ['@deepseek-ai/*', 'schemastery', 'cosmokit'],
  sourcemap: false,
  logLevel: 'info',
})

const clientResult = await build({
  entryPoints: ['src/client/index.jsx'],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: ['chrome100'],
  external: ['react', 'react-dom', 'react/*', '@deepseek-ai/*'],
  write: false,
  sourcemap: false,
  legalComments: 'none',
  logLevel: 'info',
})

const clientBundled = clientResult.outputFiles?.[0]?.text
if (!clientBundled) throw new Error('esbuild did not produce a client bundle')

const clientWrapped = `window.__ModuleLoader__.load({
  id: ${JSON.stringify('dsh-goal-planner')},
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
${clientBundled}
    return module.exports;
  }
});
`

writeFileSync('lib/client.js', clientWrapped, 'utf8')

mkdirSync('lib/types', { recursive: true })
mkdirSync('lib/types/client', { recursive: true })
writeFileSync('lib/types/index.d.ts', 'export declare const name: string\nexport declare function apply(ctx: unknown, config?: { tasksPath?: string }): void\n', 'utf8')
writeFileSync('lib/types/client/index.d.ts', 'export declare const name: string\nexport declare const inject: string[]\nexport declare function apply(ctx: unknown): void\n', 'utf8')

console.log('dsh-goal-planner build complete')
