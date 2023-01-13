/// <reference types="node" />
import { Problem } from './problem';
import type { MixinProblemOptions, ProblemOptions } from './types';
export declare function ProblemMixin<T extends Record<string, unknown> = {}>(mixinOptions?: MixinProblemOptions, defaultOptions?: ProblemOptions, name?: string): {
    new (problem: import('./types').ProblemBase & T, options?: ProblemOptions): Problem<T>;
    captureStackTrace(targetObject: object, constructorOpt?: Function): void;
    prepareStackTrace?: (err: Error, stackTraces: NodeJS.CallSite[]) => any;
    stackTraceLimit: number;
};
