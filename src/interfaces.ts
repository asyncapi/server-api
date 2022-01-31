import { AsyncAPIDocument } from '@asyncapi/parser';
import specs from '@asyncapi/specs';
import { Router } from 'express';
export interface Controller {
  basepath: string;
  boot(): Router;
}

export interface Problem {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  [key: string]: any;
}

export const ALL_SPECS = Object.keys(specs);
export const LAST_SPEC_VERSION = ALL_SPECS[ALL_SPECS.length - 1];

export type SpecsEnum = keyof typeof specs | 'latest';

export type ConvertRequestDto = {
  /**
   * Spec version to upgrade to.
   * Default is 'latest'.
   */
  version?: SpecsEnum;
  /**
   * Language to convert the file to.
   */
  language?: string,
  asyncapi: AsyncAPIDocument
}
