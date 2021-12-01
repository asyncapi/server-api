import { NextFunction, Request, Response, Router } from 'express';

import { Controller } from '../interfaces';

import { generatorTemplateParametersValidationMiddleware } from "../middlewares/generator-template-parameters-validation.middleware";
import { GeneratorService } from '../services/generator.service';

export class GeneratorController implements Controller {
  public path = '/generator';

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

  public boot(): Router {
    const router = Router();
    
    router.post(
      `${this.path}`, 
      generatorTemplateParametersValidationMiddleware, 
      this.generate.bind(this)
    );

    return router;
  }
}
