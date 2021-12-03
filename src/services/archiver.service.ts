import archiver, { Archiver } from 'archiver';
import { Response } from 'express';

import { retrieveLangauge } from "../utils/retrieve-language";
import { createTempDirectory, removeTempDirectory } from "../utils/temp-dir";

export class ArchiverService {
  public create(res?: Response) {
    const zip = archiver('zip', { zlib: { level: 9 } });
    res && zip.pipe(res);
    return zip;
  }

  public appendDirectory(archive: Archiver, from: string, to: string) {
    archive.directory(from, to);
  }

  public appendAsyncAPIDocument(archive: Archiver, asyncapi: string, fileName: string = 'asyncapi') {
    asyncapi = JSON.stringify(asyncapi);
    const language = retrieveLangauge(asyncapi);
    if (language === 'yaml') {
      archive.append(asyncapi, { name: `${fileName}.yml` });
    }
    else {
      archive.append(asyncapi, { name: `${fileName}.json`});
    }
  }

  public async finalize(archive: Archiver) {
    await new Promise<void>((resolve) => {
      // wait for end stream
      archive.on('end', resolve);
      archive.finalize();
    });
  }

  public createTempDirectory() {
    return createTempDirectory();
  }

  public removeTempDirectory(tmpDir: string) {
    return removeTempDirectory(tmpDir);
  }

  public appendHeaders(res: Response) {
    res.type("application/zip");
    res.attachment("asyncapi.zip");
  }
}
