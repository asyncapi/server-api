
import { Router } from 'express';

import { GeneratorController } from '../controllers/generator.controller';
import { Routes } from '../interfaces';
import { generatorTemplateParametersValidationMiddleware } from "../middlewares/generator-template-parameters-validation.middleware";

export class GeneratorRoute implements Routes {
  public path = '/generator';
  public router = Router();
  public generatorController = new GeneratorController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`, 
      generatorTemplateParametersValidationMiddleware, 
      this.generatorController.generate.bind(this.generatorController)
    );
  }
}
