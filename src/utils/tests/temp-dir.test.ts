import fs from 'fs';
import { createTempDirectory, removeTempDirectory } from '../temp-dir';

describe('createTempDirectory() & removeTempDirectory()', () => {
  test('should create and then remove temp folder', async () => {
    // create dir
    const tempDir = await createTempDirectory();
    expect(fs.existsSync(tempDir)).toEqual(true);

    // remove dir
    await removeTempDirectory(tempDir);
    expect(fs.existsSync(tempDir)).toEqual(false);
  });
});
