'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getDeepProperty = exports.serializeType = exports.serializeMixinOptions = void 0;
function serializeMixinOptions(options) {
  if (!options) {
    return;
  }
  options = Object.assign({}, options);
  const typePrefix = options.typePrefix;
  if (typePrefix && typePrefix.endsWith('/')) {
    options.typePrefix = typePrefix.slice(0, -1);
  }
  return options;
}
exports.serializeMixinOptions = serializeMixinOptions;
function serializeType(type, options) {
  const typePrefix = options === null || options === void 0 ? void 0 : options.typePrefix;
  if (!typePrefix || type.startsWith(typePrefix)) {
    return type;
  }
  type = type.startsWith('/') ? type.slice(1) : type;
  return `${typePrefix}/${type}`;
}
exports.serializeType = serializeType;
const INFINITY = 1 / 0;
function toKey(value) {
  const typeOf = typeof value;
  if (typeOf === 'string' || typeOf === 'symbol') {
    return value;
  }
  const result = `${value}`;
  return (result === '0' && (1 / value) === -INFINITY) ? '-0' : result;
}
function getDeepProperty(path, value) {
  if (!Array.isArray(path)) {
    path = path.split('.').filter(Boolean);
  }
  let index = 0;
  const length = path.length;
  while (value !== null && index < length) {
    value = value[toKey(path[index++])];
  }
  return index === length ? value : undefined;
}
exports.getDeepProperty = getDeepProperty;
//# sourceMappingURL=utils.js.map