import { MixinProblemOptions } from './types';
export declare function serializeMixinOptions(options?: MixinProblemOptions): MixinProblemOptions | undefined;
export declare function serializeType(type: string, options?: MixinProblemOptions): string;
export declare function getDeepProperty(path: string | string[], value: object): object;
