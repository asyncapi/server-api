import { ProblemMixin } from '../../problem_lib';

const typePrefix = 'https://api.asyncapi.com/problem';

export class ProblemException extends ProblemMixin<{
  status: number;
  [key: string]: any;
}>({ typePrefix }) {
  static createType(type: string): string {
    return type.startsWith(typePrefix) ? type : `${typePrefix}/${type}`;
  }
}
