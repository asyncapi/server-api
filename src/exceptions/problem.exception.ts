import { Problem } from '../interfaces';

const SKIPPED_FIELDS = [
  'name',
  'type',
  'message',
  'stack',
];

export class ProblemException extends Error implements Problem {
  static URL_PREFIX = 'https://api.asyncapi.com/problem/';

  public type: string;
  public title: string;
  public status: number;
  public detail?: string;
  public instance?: string;
  [key: string]: any; // eslint-disable-line no-undef

  constructor(problem: Problem) {
    super(problem.detail || problem.title);
    this.name = 'ProblemException';
    this.type = problem.type && ProblemException.createType(problem.type);

    for (const field in problem) {
      if (SKIPPED_FIELDS.includes(field)) continue;
      (this as any)[String(field)] = problem[String(field)];
    }
  }

  static toJSON(problem: ProblemException, includeStack = false): Problem {
    // disable eslint is easier that changing it to more complex logic, we need to "skip" name and message fields
    const { name, message, stack, ...rest } = problem; // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
    const json = {
      ...rest,
    };
    if (includeStack) {
      json.stack = stack;
    }
    return json;
  }

  static createType(type: string): string {
    return type.startsWith(this.URL_PREFIX) ? type : `${this.URL_PREFIX}${type}`;
  }
}
