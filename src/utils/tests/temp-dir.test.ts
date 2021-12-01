import fs from "fs";
import { createTempDirectory, removeTempDirectory } from "../temp-dir";

describe('createTempDirectory() & removeTempDirectory()', () => {
  test('should create and then remove temp folder', () => {
    // create dir
    const tempDir = createTempDirectory();
    expect(fs.existsSync(tempDir)).toEqual(true);

    // remove dir
    removeTempDirectory(tempDir);
    expect(fs.existsSync(tempDir)).toEqual(false);
  });
});
