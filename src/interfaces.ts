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

export const ALL_SPECS = [...Object.keys(specs), 'latest'];
export const LAST_SPEC_VERSION = ALL_SPECS[ALL_SPECS.length - 1];

export type SpecsEnum = keyof typeof specs;
