import { HttpObject, ProblemInterface, ToJsonParamType, UpdateProblemParamType } from "./@types";
import { COPY_MODE } from "./constants";
export declare class Problem extends Error implements ProblemInterface {
    protected readonly problem: ProblemInterface;
    type: string;
    title: string;
    instance?: string;
    detail?: string;
    http?: HttpObject;
    [key: string]: any;
    constructor(problem: ProblemInterface);
    copy(mode?: COPY_MODE, props?: string[]): Problem;
    toJSON({ includeStack }: ToJsonParamType): Omit<this, "stack" | "copy" | "toJSON" | "isOfType" | "update">;
    isOfType(type: string): boolean;
    update({ updates }: UpdateProblemParamType): void;
}
