import { AsyncAPIDocument } from '@asyncapi/parser';
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

// Note: Spec versions are defined in @asyncapi/specs
export const ALL_SPECS = [
  '1.0.0',
  '1.1.0',
  '1.2.0',
  '2.0.0-rc1',
  '2.0.0-rc2',
  '2.0.0',
  '2.1.0',
  '2.2.0',
  'latest'
] as const;
export type SpecsEnum = typeof ALL_SPECS[number];

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
