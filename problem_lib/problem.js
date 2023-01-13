'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Problem = void 0;
const utils_1 = require('./utils');
const defaultToObjectOptions = {
  includeStack: false,
  includeCause: false,
};
const defaultStringifyOptions = {
  includeStack: false,
  includeCause: false,
};
class Problem extends Error {
  constructor(problem, options = {}) {
    super(problem.detail || problem.title);
    this.problem = problem;
    this.options = options;
    this.cause = problem.cause || this.cause;
    this.stack = problem.stack || this.stack;
  }
  get(path) {
    if (typeof path !== 'string') {
      return this.problem;
    }
    return (0, utils_1.getDeepProperty)(path, this.problem);
  }
  set(keyOrObject, value) {
    if (typeof keyOrObject !== 'string') {
      return Object.assign(this.problem, keyOrObject);
    }
    return this.problem[keyOrObject] = value;
  }
  copy(options) {
    const clazz = this.constructor;
    if (!options) {
      return new clazz(Object.assign({}, this.problem), Object.assign({}, this.options));
    }
    const newProblem = {
      type: this.problem.type,
      title: this.problem.title,
    };
    const { mode, properties } = options;
    switch (mode) {
    case 'leaveProps': {
      properties === null || properties === void 0 ? void 0 : properties.forEach(property => {
        newProblem[property] = this.problem[property];
      });
      break;
    }
    case 'skipProps': {
      Object.keys(this.problem).forEach(property => {
        if (!(properties === null || properties === void 0 ? void 0 : properties.includes(property))) {
          newProblem[property] = this.problem[property];
        }
      });
    }
    }
    return new clazz(newProblem, Object.assign({}, this.options));
  }
  toObject({ includeStack, includeCause } = defaultToObjectOptions) {
    const problem = Object.assign({}, this.problem);
    if (!includeStack) {
      delete problem.stack;
    }
    if (!includeCause) {
      delete problem.cause;
    }
    return problem;
  }
  stringify(options = defaultStringifyOptions, replacer, space) {
    return JSON.stringify(this.toObject(options), replacer, space);
  }
  isOfType(type) {
    return this.problem.type === type;
  }
}
exports.Problem = Problem;
//# sourceMappingURL=problem.js.map