import os from "os";
// @ts-ignore
import fs from "fs";
// @ts-ignore
import path from "path";
import { v4 as uuidv4 } from 'uuid';

import { logger } from './logger';

export function createTempDirectory() {
  // @ts-ignore
  return fs.mkdtempSync(path.join(os.tmpdir(), uuidv4()));
}

export function removeTempDirectory(tmpDir: string) {
  try {
    tmpDir && fs.existsSync(tmpDir) && fs.rmSync(tmpDir, { recursive: true });
  }
  catch (e) {
    logger.error(`An error has occurred while removing the temp folder at ${tmpDir}. Please remove it manually. Error: ${e}`);
  }
}