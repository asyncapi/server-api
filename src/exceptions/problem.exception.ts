import { Problem } from '../../problem_lib';

import type { ProblemInterface, ToJsonParamType } from '../../problem_lib/@types';

const SKIPPED_FIELDS = [
  'name',
  'type',
  'message',
  'stack',
];

export class ProblemException extends Problem {
  static URL_PREFIX = 'https://api.asyncapi.com/problem/';

  public type: string;
  public title: string;
  public status: number;
  public detail?: string;
  public instance?: string;
  [key: string]: any; // eslint-disable-line no-undef

  constructor(problem: ProblemInterface) {
    super(problem);
    this.name = 'ProblemException';
    this.type = problem.type && ProblemException.createType(problem.type);
    // for (const field in problem) {
    //   if (SKIPPED_FIELDS.includes(field)) continue;
    //   (this as any)[String(field)] = problem[String(field)];
    // }
  }

  override toJSON(options: ToJsonParamType = { includeStack: false }) {
    const { includeStack } = options;
    const { stack, ...rest } = this;

    let object = rest;
    if (includeStack) {
      object = {
        ...rest,
        stack: this.stack,
      };
    }

    delete object.name;
    delete object.problem;

    return object;
  }

  static createType(type: string): string {
    return type.startsWith(this.URL_PREFIX) ? type : `${this.URL_PREFIX}${type}`;
  }
}
