export declare type ProblemInterface = {
    http?: httpObject;
    type: string;
    title: string;
    detail?: string;
    instance?: string;
    stack?: string;
    [key: string]: any;
};
export declare type httpObject = {
    status: number;
    [key: string]: any;
};
