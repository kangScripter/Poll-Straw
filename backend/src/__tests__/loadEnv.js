/**
 * Load test env before any other module. Runs first in setupFilesAfterEnv.
 * CJS so Jest runs it without transformation (avoids ESM/ts-jest ordering).
 */
const path = require('path');
const fs = require('fs');
const envTest = path.join(process.cwd(), '.env.test');
const envDefault = path.join(process.cwd(), '.env');
if (fs.existsSync(envTest)) {
  require('dotenv').config({ path: envTest });
} else {
  require('dotenv').config({ path: envDefault });
}
process.env.NODE_ENV = 'test';
