/**
 * Run k6 load test and generate LOAD_REPORT.md.
 * Requires k6 to be installed: https://k6.io/docs/getting-started/installation/
 * Ensure the API server is running (e.g. npm run dev) before running.
 *
 * Usage: node scripts/run-load-test.cjs
 *   API_URL=http://localhost:3000/api  (default)
 *   VUS=50                              (default)
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const LOAD_DIR = path.join(ROOT, 'load');
const K6_SCRIPT = path.join(LOAD_DIR, 'votes.k6.js');
const SUMMARY_FILE = path.join(LOAD_DIR, 'summary.txt');
const REPORT_FILE = path.join(LOAD_DIR, 'LOAD_REPORT.md');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const VUS = process.env.VUS || '50';

function runK6() {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, API_URL, VUS };
    const child = spawn('k6', ['run', K6_SCRIPT], {
      cwd: ROOT,
      env,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', (err) => reject(err));
    child.on('close', (code, signal) => {
      resolve({
        code: code ?? (signal ? 1 : 0),
        stdout,
        stderr,
      });
    });
  });
}

function loadSummary() {
  try {
    if (fs.existsSync(SUMMARY_FILE)) {
      return fs.readFileSync(SUMMARY_FILE, 'utf8').trim();
    }
  } catch (_) {}
  return null;
}

function buildReport(result) {
  const summaryFromFile = loadSummary();
  const fullOutput = result.stdout + (result.stderr ? '\n' + result.stderr : '');
  const summaryBlock = summaryFromFile || fullOutput;
  const passed = result.code === 0;
  const date = new Date().toISOString();

  return `# Load Test Report

**Generated:** ${date}  
**API URL:** ${API_URL}  
**VUs:** ${VUS}  
**Duration:** 30s (from script)  
**Status:** ${passed ? 'PASSED' : 'FAILED'}

---

## Summary

\`\`\`
${summaryBlock}
\`\`\`

---

## Full k6 output

\`\`\`
${fullOutput.replace(/```/g, '`​`​`')}
\`\`\`

---

*Run with: \`npm run load-test\` (ensure API server is running, e.g. \`npm run dev\`).*
`;
}

async function main() {
  console.log('Running k6 load test...');
  console.log('  API_URL:', API_URL);
  console.log('  VUS:', VUS);
  console.log('  Script:', K6_SCRIPT);

  let result;
  try {
    result = await runK6();
  } catch (err) {
    const report = `# Load Test Report

**Generated:** ${new Date().toISOString()}  
**Status:** ERROR – k6 could not be run

## Error

\`\`\`
${err.message}
\`\`\`

**Ensure k6 is installed:** https://k6.io/docs/getting-started/installation/
`;
    fs.writeFileSync(REPORT_FILE, report, 'utf8');
    console.error('Failed to run k6:', err.message);
    process.exit(1);
  }

  const report = buildReport(result);
  fs.writeFileSync(REPORT_FILE, report, 'utf8');
  console.log('Report written to:', REPORT_FILE);
  console.log('Status:', result.code === 0 ? 'PASSED' : 'FAILED');
  process.exit(result.code);
}

main();
