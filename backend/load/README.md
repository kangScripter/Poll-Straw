# Load tests (k6)

Vote and auth load test script and automated report.

## Prerequisites

1. **Install k6**  
   https://k6.io/docs/getting-started/installation/  
   (e.g. Windows: `winget install k6 --source winget` or Chocolatey: `choco install k6`)

2. **Start the API server**  
   From the backend root: `npm run dev` (or use a deployed API URL).

## Run and generate report

From the **backend** directory:

```bash
npm run load-test
```

This:

- Runs `k6 run load/votes.k6.js` with default env (`API_URL=http://localhost:3000/api`, `VUS=50`).
- Writes **`load/LOAD_REPORT.md`** with:
  - Generated timestamp, API URL, VUs, status (PASSED/FAILED)
  - Summary block (from k6)
  - Full k6 stdout/stderr

Override env if needed:

```bash
API_URL=https://your-api.com/api VUS=20 npm run load-test
```

Optional: `POLL_ID`, `OPTION_IDS` (comma-separated) to target an existing poll instead of creating one per VU.

## Script details

- **Script:** `load/votes.k6.js`  
  - 30s duration, 50 VUs by default  
  - Thresholds: `http_req_failed` &lt; 1%, `http_req_duration` p(95) &lt; 3000 ms  
  - Flow: register → create poll → vote (or use existing poll if `POLL_ID`/`OPTION_IDS` set)
- **Runner:** `scripts/run-load-test.cjs`  
  - Spawns k6, captures output, writes `load/LOAD_REPORT.md`  
  - Exit code = k6 exit code (0 = pass, non-zero = fail)

If k6 is not installed, the report will show the error and remind you to install k6.
