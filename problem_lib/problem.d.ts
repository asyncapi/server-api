import type { ProblemInterface, ProblemOptions, CopyProblemOptions, ToObjectProblemOptions, StringifyProblemOptions, Path, PathValue } from './types';
export declare class Problem<T extends Record<string, unknown> = {}> extends Error {
  protected readonly problem: ProblemInterface & T;
  protected readonly options: ProblemOptions;
  constructor(problem: ProblemInterface & T, options?: ProblemOptions);
  get(): ProblemInterface & T;
  get<P extends Path<ProblemInterface & T>, PV = PathValue<ProblemInterface & T, P>>(path: P): PV;
  set(problem: Partial<ProblemInterface & T>): ProblemInterface & T;
  set<K extends keyof (ProblemInterface & T)>(key: K, value: (ProblemInterface & T)[K]): (ProblemInterface & T)[K];
  copy(options?: CopyProblemOptions<Array<keyof Omit<ProblemInterface & T, 'type' | 'title'>>>): Problem;
  toObject({ includeStack, includeCause }?: ToObjectProblemOptions): ProblemInterface & T;
  stringify(options?: StringifyProblemOptions, replacer?: (this: any, key: string, value: any) => any, space?: string | number): string;
  stringify(options?: StringifyProblemOptions, replacer?: (number | string)[] | null, space?: string | number): string;
  isOfType(type: string): boolean;
}
