export declare type ProblemInterface = {
    type: string;
    title: string;
    http?: HttpObject;
    detail?: string;
    instance?: string;
    stack?: string;
    [key: string]: any;
};
export declare type HttpObject = {
    status: number;
    [key: string]: any;
};
export declare type UpdateProblemParamType = {
    updates: {
        [key: string]: any;
    };
};
export declare type ToJsonParamType = {
    includeStack?: boolean;
};
