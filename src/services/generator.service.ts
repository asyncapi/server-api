import archiver, { Archiver } from 'archiver';
import { Response } from 'express';

import AsyncAPIGenerator from '@asyncapi/generator';

import { retrieveLangauge } from "../utils/retrieveLanguage";
import { createTempDirectory, removeTempDirectory } from "../utils/temp-dir";

export class GeneratorService {
  public async generateTemplate(body: any, res: Response) {
    res.type("application/zip");
    res.attachment("asyncapi.zip");

    const zip = archiver('zip', { zlib: { level: 9 } });
    zip.pipe(res);

    let tmpDir: string;
    try {
      tmpDir = createTempDirectory();

      const { template, parameters } = body;
      const asyncapi = this.ensureDocument(body.asyncapi);

      const generator = new AsyncAPIGenerator(template, tmpDir, {
        forceWrite: true,
        templateParams: parameters,
      });

      await generator.generateFromString(asyncapi);
      zip.directory(tmpDir, 'template');
      this.appendAsyncAPIDocument(zip, asyncapi);

      await new Promise<void>((resolve) => {
        zip.on('end', resolve);
        zip.finalize();
      });  
    }
    catch (err) {
      console.log(err)
      return res.status(422).send({
        code: 'incorrect-format',
        message: err.message,
        // errors: Array.isArray(err) ? err : null
      });
    }
    finally {
      removeTempDirectory(tmpDir);
    }
  }

  private appendAsyncAPIDocument(archive: Archiver, asyncapi: string) {
    const language = retrieveLangauge(asyncapi);
    if (language === 'yaml') {
      archive.append(asyncapi, { name: 'asyncapi.yml' });
    }
    else {
      archive.append(asyncapi, { name: 'asyncapi.json' });
    }
  }

  private ensureDocument(asyncapi: object | string): string {
    return JSON.stringify(asyncapi);
  }
}
