import { Problem } from "../interfaces";

export class ProblemException extends Error implements Problem {
  static URL_PREFIX = 'https://api.asyncapi.com/problem/';

  public type?: string;
  public title?: string;
  public status?: number;
  public detail?: string;
  public instance?: string;

  constructor(problem: Problem) {
    super(problem.detail || problem.title);
    this.type = problem.type ?? ProblemException.createType(problem.type);
    this.title = problem.title;
    this.status = problem.status;
    this.detail = problem.detail;
    this.instance = problem.instance;
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
