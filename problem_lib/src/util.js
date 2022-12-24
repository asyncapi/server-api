export const objectToProblemMap = (obj) => {
    const type = obj.type;
    const title = obj.title;
    const problemObject = Object.assign({ type, title }, obj);
    return problemObject;
};
