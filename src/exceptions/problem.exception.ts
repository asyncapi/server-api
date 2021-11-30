import { Problem } from "../interfaces";

const SKIPPED_FIELDS = [
  'name',
  'type',
  'message',
  'stack',
];

export class ProblemException extends Error implements Problem {
  static URL_PREFIX = 'https://api.asyncapi.com/problem/';

  public type?: string;
  public title?: string;
  public status?: number;
  public detail?: string;
  public instance?: string;
  [key: string]: any;

  constructor(problem: Problem) {
    super(problem.detail || problem.title);
    this.type = problem.type ?? ProblemException.createType(problem.type);

    for (let field in problem) {
      if (SKIPPED_FIELDS.includes(field)) continue;
      (this as any)[field] = problem[field];
    }
  }

  static toJSON(problem: ProblemException): Problem {
    const { name, message, stack, ...rest } = problem;
    return {
      ...rest,
    }
  }

  static createType(type: string): string {
    return type.startsWith(this.URL_PREFIX) ? type : `${this.URL_PREFIX}${type}`;
  }
}
