// Unified offline report verification; Python Playwright uses installed Chrome.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const runner = fileURLToPath(new URL('./check-review.py', import.meta.url));
const result = spawnSync('python', [runner, ...process.argv.slice(2)], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
