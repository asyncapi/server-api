export type ProblemBase = {
    type: string;
    title: string;
    detail?: string;
    instance?: string;
    stack?: string;
    cause?: any;
};
export type ProblemInterface = ProblemBase;
export interface ProblemOptions {
}
export interface MixinProblemOptions {
    typePrefix?: string;
}
export type CopyProblemOptions<T extends Array<any>> = {
    mode?: 'leaveProps' | 'skipProps';
    properties?: T;
};
export type ToObjectProblemOptions = {
    includeStack?: boolean;
    includeCause?: boolean;
};
export type StringifyProblemOptions = {
    includeStack?: boolean;
    includeCause?: boolean;
};
export interface Constructable<T = any> {
    new (...args: any[]): T;
}
type IsAny<T> = unknown extends T ? [keyof T] extends [never] ? false : true : false;
type PathImpl<T, Key extends keyof T> = Key extends string ? IsAny<T[Key]> extends true ? never : T[Key] extends Record<string, any> ? `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>> & string}` | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}` : never : never;
export type Path<T> = keyof T extends string ? (PathImpl<T, keyof T> | keyof T) extends infer P ? P extends string | keyof T ? P : keyof T : keyof T : never;
export type PathValue<T, P extends Path<T>> = P extends `${infer Key}.${infer Rest}` ? Key extends keyof T ? Rest extends Path<T[Key]> ? PathValue<T[Key], Rest> : never : never : P extends keyof T ? T[P] : never;
export {};
