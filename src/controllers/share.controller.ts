import { Request, Response, Router, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { Controller } from '../interfaces';
import { validationMiddleware } from '../middlewares/validation.middleware';
import Data from '../models/data';
import { ProblemException } from '../exceptions/problem.exception';
import { logger } from '../utils/logger';
export class ShareController implements Controller {
  public basepath = '/share';

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

  private async share(req: Request, res: Response, next: NextFunction) {
    const stringifiedSpec = JSON.stringify(
      req.asyncapi
    );
    const id = uuidv4();
    try {
      const data = new Data({
        doc: stringifiedSpec,
        id,
        date: Date.now(),
      });
      await data.save();
      res.status(201).json({
        sharedID: id,
      });
    } catch (error: unknown) {
      return next(
        new ProblemException({
          type: 'internal-server-error',
          title: 'Internal Server Error',
          status: 500,
          detail: (error as Error).message,
        })
      );
    }
  }

  private async retrieve(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const result = await Data.findOne({ id });
      if (result) {
        res.status(200).json({
          document: result.doc,
        });
      } else {
        res.status(404).json('No document with id was found');
      }
    } catch (error) {
      return next(
        new ProblemException({
          type: 'internal-server-error',
          title: 'Internal Server Error',
          status: 500,
          detail: (error as Error).message,
        })
      );
    }
  }

  public async boot(): Promise<Router> {
    const router = Router();
    await this.initializeDatabase();
    router.post(
      `${this.basepath}`,
      await validationMiddleware({
        path: this.basepath,
        method: 'post',
        documents: ['asyncapi'],
      }),
      this.share.bind(this)
    );

    router.get(
      `${this.basepath}/:id`,
      await validationMiddleware({
        path: `${this.basepath}/{id}`,
        method: 'get',
      }),
      this.retrieve.bind(this)
    );
    return router;
  }
}

// import { Request, Response, NextFunction } from "express";
// import { AsyncAPIDocument } from "@asyncapi/parser";
// import { ProblemException } from "../exceptions/problem.exception";
// import { createAjvInstance } from "../utils/ajv";
// import { getAppOpenAPI } from "../utils/app-openapi";
// import {
//   parse,
//   prepareParserConfig,
//   tryConvertToProblemException,
// } from "../utils/parser";

// import type { ValidateFunction } from "ajv";

// export interface ValidationMiddlewareOptions {
//   path: string;
//   method:
//     | "all"
//     | "get"
//     | "post"
//     | "put"
//     | "delete"
//     | "patch"
//     | "options"
//     | "head";
//   documents?: Array<string>;
//   version?: "v1";
// }

// const ajvInstance = createAjvInstance();

// /**
//  * Create AJV's validator function for given path in the OpenAPI document.
//  */
// async function compileAjv(options: ValidationMiddlewareOptions) {
//   const appOpenAPI = await getAppOpenAPI();
//   const paths = appOpenAPI.paths || {};

//   const pathName = options.path;
//   const path = paths[String(pathName)];
//   if (!path) {
//     throw new Error(
//       `Path "${pathName}" doesn't exist in the OpenAPI document.`
//     );
//   }

//   const methodName = options.method;
//   const method = path[String(methodName)];
//   if (!method) {
//     throw new Error(
//       `Method "${methodName}" for "${pathName}" path doesn't exist in the OpenAPI document.`
//     );
//   }

//   const requestBody = method.requestBody;
//   const requestParams = method.parameters;
//   let schema;
//   if (requestBody) {
//     schema = requestBody.content["application/json"].schema;
//   }
//   if (requestParams) {
//     const newObj = {};
//     requestParams.map((param) => {
//       newObj[param.name] = param.schema;
//     });
//     schema = {
//       properties: newObj,
//     };
//   }
//   if (!requestBody && !requestParams) return;
//   if (!schema) return;

//   schema = { ...schema };
//   schema["$schema"] = "http://json-schema.org/draft-07/schema";

//   if (options.documents && schema.properties) {
//     schema.properties = { ...schema.properties };
//     options.documents.forEach((field) => {
//       if (schema.properties[String(field)].items) {
//         schema.properties[String(field)] = {
//           ...schema.properties[String(field)],
//         };
//         schema.properties[String(field)].items = true;
//       } else {
//         schema.properties[String(field)] = true;
//       }
//     });
//   }

//   return ajvInstance.compile(schema);
// }

// // async function validateRequestParameters(params: any) {
// //   if (!params) return;
// //   const valid = await isValidUUID(params.id);

// //   if (valid === false) {
// //     throw new ProblemException({
// //       type: 'invalid-request-params',
// //       title: 'Invalid Request Parameters',
// //       status: 422,
// //       validationErrors: 'Invalid Request Paramaters' as any,
// //     });
// //   }
// // }

// async function validateRequestBodyAndParameters(
//   validate: ValidateFunction,
//   body: any,
//   params: any
// ) {
//   const valid = validate(body);
//   console.log(valid);
//   const errors = validate.errors && [...validate.errors];

//   if (valid === false) {
//     throw new ProblemException({
//       type: "invalid-request-body",
//       title: "Invalid Request Body",
//       status: 422,
//       validationErrors: errors as any,
//     });
//   }
// }

// async function validateSingleDocument(
//   asyncapi: string | AsyncAPIDocument,
//   parserConfig: ReturnType<typeof prepareParserConfig>
// ) {
//   if (typeof asyncapi === "object") {
//     asyncapi = JSON.parse(JSON.stringify(asyncapi));
//   }
//   return parse(asyncapi, parserConfig);
// }

// async function validateListDocuments(
//   asyncapis: Array<string | AsyncAPIDocument>,
//   parserConfig: ReturnType<typeof prepareParserConfig>
// ) {
//   const parsedDocuments: Array<AsyncAPIDocument> = [];
//   for (const asyncapi of asyncapis) {
//     const parsed = await validateSingleDocument(asyncapi, parserConfig);
//     parsedDocuments.push(parsed);
//   }
//   return parsedDocuments;
// }

// /**
//  * Validate RequestBody and sent AsyncAPI document(s) for given path and method based on the OpenAPI Document.
//  */
// export async function validationMiddleware(
//   options: ValidationMiddlewareOptions
// ) {
//   options.version = options.version || "v1";
//   const validate = await compileAjv(options);
//   const documents = options.documents;

//   return async function (req: Request, _: Response, next: NextFunction) {
//     // validate request body
//     try {
//       await validateRequestBodyAndParameters(validate, req.body, req.params);
//       next();
//     } catch (err: unknown) {
//       return next(err);
//     }

//     // validate AsyncAPI document(s)
//     if (documents) {
//       const parserConfig = prepareParserConfig(req);
//       try {
//         req.asyncapi = req.asyncapi || {};
//         for (const field of documents) {
//           const body = req.body[String(field)];
//           if (Array.isArray(body)) {
//             const parsed = await validateListDocuments(body, parserConfig);
//             req.asyncapi.parsedDocuments = parsed;
//           } else {
//             const parsed = await validateSingleDocument(body, parserConfig);
//             req.asyncapi.parsedDocument = parsed;
//           }
//         }

//         next();
//       } catch (err: unknown) {
//         return next(tryConvertToProblemException(err));
//       }
//     }
//   };
// }
