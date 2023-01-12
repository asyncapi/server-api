"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Problem = void 0;
const constants_1 = require("./constants");
const constants_2 = require("./constants");
const util_1 = require("./util");
class Problem extends Error {
    constructor(problem) {
        super(problem.detail || problem.title);
        this.problem = problem;
        this.http = problem.http;
        this.type = problem.type;
        this.title = problem.title;
        this.detail = problem.detail;
        this.instance = problem.instance;
        this.stack = problem.stack;
        // add extra keys
        Object.keys(problem)
            .filter((el) => !constants_1.DEFAULT_KEYS.includes(el))
            .forEach((k) => (this[k] = problem[k]));
    }
    copy(mode = constants_2.COPY_MODE.LEAVE_PROPS, props = []) {
        switch (mode) {
            // returns a new problem object with preserved keys passed as props
            case constants_2.COPY_MODE.LEAVE_PROPS: {
                let newProblemKeyValuePairs = {
                    type: this.problem.type,
                    title: this.problem.title,
                };
                props.forEach((key) => {
                    newProblemKeyValuePairs = Object.assign(Object.assign({}, newProblemKeyValuePairs), { [key]: this.problem[key] });
                });
                const newProblem = new Problem((0, util_1.objectToProblemMap)(newProblemKeyValuePairs));
                return newProblem;
            }
            // skip the copy of keys
            case constants_2.COPY_MODE.SKIP_PROPS:
            default: {
                let newProblemKeyValuePairs = {};
                // loop to copy only the required keys
                for (let key in this.problem) {
                    // Skip only those keys, which are given in props and NOT a default key.
                    if (props.includes(key) && !constants_1.DEFAULT_KEYS.includes(key))
                        continue;
                    newProblemKeyValuePairs[key] = this.problem[key];
                }
                const newProblem = new Problem((0, util_1.objectToProblemMap)(newProblemKeyValuePairs));
                return newProblem;
            }
        }
    }
    toJSON({ includeStack = false }) {
        const _a = this, { stack } = _a, rest = __rest(_a, ["stack"]);
        if (includeStack) {
            return Object.assign(Object.assign({}, this), { stack: this.stack });
        }
        return Object.assign({}, rest);
    }
    isOfType(type) {
        return this.type === type;
    }
    update({ updates }) {
        Object.keys(updates).forEach((i) => {
            this[i] = updates[i];
        });
    }
}
exports.Problem = Problem;
