import { NextFunction, Request, Response } from 'express';

import { GeneratorService } from '../services/generator.service';

export class GeneratorController {
  private generatorService = new GeneratorService();

  public async generate(req: Request, res: Response, next: NextFunction) {
    try {
      await this.generatorService.generateTemplate(req.body, res);
    } catch (error) {
      next(error);
    }
  };
}
