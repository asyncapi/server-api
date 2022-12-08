import bodyParser from 'body-parser';
import compression from 'compression';
import config from 'config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';

import { Controller } from './interfaces';

import { problemMiddleware } from './middlewares/problem.middleware';

import { logger } from './utils/logger';
import { API_VERSION } from './constants';

export class App {
  private app: express.Application;
  private port: string | number;
  private env: string;

  constructor(
    private readonly controllers: Controller[]
  ) {
    this.app = express();
    this.port = process.env.PORT || 80;
    this.env = process.env.NODE_ENV || 'development';
  }

  public async init() {
    // initialize core middlewares
    await this.initializeMiddlewares();
    // initialize controllers
    await this.initializeControllers();
    // initialize error handling
    await this.initializeErrorHandling();
    await this.initializeDatabase();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info('=================================');
      logger.info(`= ENV: ${this.env}`);
      logger.info(`= 🚀 AsyncAPI Server API listening on the port ${this.port}`);
      logger.info('=================================');
    });
  }

  public getServer() {
    return this.app;
  }

  private async initializeMiddlewares() {
    const requestBodyLimit = config.get<string>('request.body.limit');

    this.app.use(cors({ origin: config.get('cors.origin'), credentials: config.get('cors.credentials') }));
    this.app.use(compression());
    this.app.use(bodyParser.text({ type: ['text/*'], limit: requestBodyLimit }));
    this.app.use(bodyParser.urlencoded({ extended: true, limit: requestBodyLimit }));
    this.app.use(bodyParser.json({ type: ['json', '*/json', '+json'], limit: requestBodyLimit }));
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          // for `/docs` path - we need to fetch redoc component from unpkg.com domain
          'script-src': ['\'self\'', 'unpkg.com'],
          'worker-src': ['\'self\' blob:']
        },
      },
      // for `/docs` path
      crossOriginEmbedderPolicy: false,
    }));
  }

  private async initializeControllers() {
    for (const controller of this.controllers) {
      this.app.use(`/${API_VERSION}/`, await controller.boot());
    }
  }

  private async initializeErrorHandling() {
    this.app.use(problemMiddleware);
  }

  private async initializeDatabase() {
    await mongoose
      .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/asyncapi')
      .then(() => {
        logger.info('🚀 Database connection is successful');
      })
      .catch((err) => {
        logger.error(`Database connection failed${err.message}`);
      });
  }
}
