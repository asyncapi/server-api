import { NextFunction, Request, Response } from 'express';

import { GeneratorService } from '../services/generator.service';

export class GeneratorController {
  private generatorService = new GeneratorService();

  public async generate(req: Request, res: Response, next: NextFunction) {
    res.type("application/zip");
    res.attachment("asyncapi.zip");

    try {
      await this.generatorService.generateTemplate(req, res);
      res.status(200);
    } catch (error) {
      next(error);
    }
  };
}
