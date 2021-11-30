// @ts-ignore
import fs from "fs";
// @ts-ignore
import path from "path";

import OpenAPIParser from "@apidevtools/swagger-parser";

import { Request, Response, NextFunction } from 'express';
import { ProblemException } from '../exceptions/problem.exception';

import { parse } from '../utils/parser';

export async function requestBodyValidationMiddleware(req: Request, _: Response, next: NextFunction) {
  try {
    const appOpenAPI = await getAppOpenAPI();

    console.log(req.path);

    next();
  } catch (err: unknown) {
    // console.log(err);
    next(err);
  }
};

let parsedOpenAPI = undefined;
async function getAppOpenAPI(): Promise<object> {
  if (parsedOpenAPI) {
    return parsedOpenAPI;
  }

  const openaAPI = fs.readFileSync(path.join(__dirname, '../../openapi.yaml'), 'utf-8');
  // console.log(openaAPI);
  return parsedOpenAPI = await OpenAPIParser.validate(openaAPI);
}
