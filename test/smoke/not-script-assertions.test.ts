import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const CLI_PATH = path.resolve(__dirname, '../../dist/src/main.js');
const ROOT_DIR = path.resolve(__dirname, '../..');
const CONFIG_PATH = path.resolve(__dirname, 'fixtures/configs/not-script-assertions.yaml');
const OUTPUT_DIR = path.resolve(__dirname, '.temp-output-not-script-assertions');

function runCli(args: string[]): { stdout: string; stderr: string; exitCode: number } {
  const result = spawnSync('node', [CLI_PATH, ...args], {
    cwd: ROOT_DIR,
    encoding: 'utf-8',
    env: { ...process.env, NO_COLOR: '1' },
    timeout: 60000,
  });

  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    exitCode: result.status ?? 1,
  };
}

function expectComponentResult(
  result: {
    success: boolean;
    score: number;
    gradingResult: {
      componentResults: Array<{
        pass: boolean;
        score: number;
        reason: string;
      }>;
    };
  },
  expectedScore: number,
) {
  expect(result.success).toBe(true);
  expect(result.score).toBeCloseTo(expectedScore, 4);
  expect(result.gradingResult.componentResults).toHaveLength(1);
  expect(result.gradingResult.componentResults[0]).toMatchObject({
    pass: true,
    score: expectedScore,
    reason: 'Assertion passed',
  });
}

function isRubyAvailable(): boolean {
  try {
    const result = spawnSync('ruby', ['--version'], { encoding: 'utf-8', timeout: 5000 });
    return result.status === 0;
  } catch {
    return false;
  }
}

describe('Negated script assertion smoke tests', () => {
  beforeAll(() => {
    if (!fs.existsSync(CLI_PATH)) {
      throw new Error(`Built CLI not found at ${CLI_PATH}. Run 'npm run build' first.`);
    }

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  });

  afterAll(() => {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  });

  it('inverts not-javascript, not-python, and not-ruby assertions through the built CLI', () => {
    const outputPath = path.join(OUTPUT_DIR, 'not-script-assertions-output.json');
    let effectiveConfig = CONFIG_PATH;
    const rubyAvailable = isRubyAvailable();

    if (!rubyAvailable) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      const lines = raw.split('\n');
      const rubyTestStart = lines.findIndex((l) => l.includes('not-ruby inverts an object return'));
      if (rubyTestStart !== -1) {
        const noRubyYaml = lines.slice(0, rubyTestStart - 1).join('\n');
        effectiveConfig = path.join(OUTPUT_DIR, 'no-ruby-config.yaml');
        fs.writeFileSync(effectiveConfig, noRubyYaml, 'utf-8');
      }
    }

    const { exitCode, stderr } = runCli([
      'eval',
      '-c',
      effectiveConfig,
      '-o',
      outputPath,
      '--no-cache',
    ]);

    expect(exitCode).toBe(0);
    expect(stderr.toLowerCase()).not.toMatch(/\b(error|failed)\b/);

    const parsed = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    const results = parsed.results.results;

    const expectedScores = rubyAvailable ? [1, 0.25, 0.25, 0.4, 0.4] : [1, 0.25, 0.25];
    expect(results).toHaveLength(expectedScores.length);
    expectedScores.forEach((expectedScore, index) => {
      expectComponentResult(results[index], expectedScore);
    });
  });
});
