import { httpObject, ProblemInterface } from "./types";
declare enum COPY_MODE {
    SKIP_PROPS = "skipProps",
    LEAVE_PROPS = "leaveProps"
}
export declare class Problem extends Error implements ProblemInterface {
    type: string;
    title: string;
    instance?: string;
    detail?: string;
    http?: httpObject;
    [key: string]: any;
    constructor(problem: ProblemInterface, customKeys?: string[]);
    copy(problem: ProblemInterface, mode: COPY_MODE, props: string[]): Problem;
    toJSON(problem: Problem, includeStack?: boolean): ProblemInterface;
}
export {};
