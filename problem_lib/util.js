"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectToProblemMap = void 0;
const objectToProblemMap = (obj) => {
    const type = obj.type;
    const title = obj.title;
    const problemObject = Object.assign({ type,
        title }, obj);
    return problemObject;
};
exports.objectToProblemMap = objectToProblemMap;
