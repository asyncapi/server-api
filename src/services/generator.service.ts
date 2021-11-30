import archiver, { Archiver } from 'archiver';
import { Request, Response } from 'express';

import AsyncAPIGenerator from '@asyncapi/generator';

import { prepareParserConfig } from "../utils/parser";
import { retrieveLangauge } from "../utils/retrieve-language";
import { createTempDirectory, removeTempDirectory } from "../utils/temp-dir";
import { ProblemException } from '../exceptions/problem.exception';

export class GeneratorService {
  public async generateTemplate(req: Request, res: Response) {
    const zip = archiver('zip', { zlib: { level: 9 } });
    zip.pipe(res);

    let tmpDir: string;
    try {
      tmpDir = createTempDirectory();
      const { asyncapi, template, parameters } = req.body;

      const generator = new AsyncAPIGenerator(template, tmpDir, {
        forceWrite: true,
        templateParams: parameters,
      });

      await generator.generate(req.parsedDocument, prepareParserConfig(req));
      zip.directory(tmpDir, 'template');
      this.appendAsyncAPIDocument(zip, asyncapi);

      await new Promise<void>((resolve) => {
        zip.on('end', resolve);
        zip.finalize();
      });  
    }
    catch (err: unknown) {
      throw new ProblemException({
        type: 'internal-server-error',
        title: 'Something went wrong',
        status: 500,
        detail: (err as Error).message,
      });
    }
    finally {
      removeTempDirectory(tmpDir);
    }
  }

  private appendAsyncAPIDocument(archive: Archiver, asyncapi: string) {
    asyncapi = JSON.stringify(asyncapi);
    const language = retrieveLangauge(asyncapi);
    if (language === 'yaml') {
      archive.append(asyncapi, { name: 'asyncapi.yml' });
    }
    else {
      archive.append(asyncapi, { name: 'asyncapi.json' });
    }
  }
}
