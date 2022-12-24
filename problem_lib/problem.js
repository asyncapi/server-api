var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var COPY_MODE;
(function (COPY_MODE) {
    COPY_MODE["SKIP_PROPS"] = "skipProps";
    COPY_MODE["LEAVE_PROPS"] = "leaveProps";
})(COPY_MODE || (COPY_MODE = {}));
export class Problem extends Error {
    constructor(problem, customKeys) {
        super(problem.detail || problem.title);
        this.http = problem.http;
        this.type = problem.type;
        this.title = problem.title;
        this.detail = problem.detail;
        this.instance = problem.instance;
        this.stack = problem.stack;
        customKeys === null || customKeys === void 0 ? void 0 : customKeys.map((customKey) => {
            this[customKey] = problem[customKey];
        });
    }
    copy(problem, mode, props) {
        switch (mode) {
            case COPY_MODE.LEAVE_PROPS:
                return new Problem(problem, props);
            case COPY_MODE.SKIP_PROPS:
            default:
                let keysToBeCopied = [];
                for (let key in problem) {
                    if (props.includes(key))
                        continue;
                    keysToBeCopied.push(key);
                }
                return new Problem(problem, keysToBeCopied);
        }
    }
    ;
    toJSON(problem, includeStack = false) {
        const { name, message, stack } = problem, rest = __rest(problem, ["name", "message", "stack"]);
        const jsonObject = Object.assign({}, rest);
        if (includeStack)
            jsonObject.stack = stack;
        return jsonObject;
    }
}
;
