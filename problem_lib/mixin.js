'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ProblemMixin = void 0;
const problem_1 = require('./problem');
const utils_1 = require('./utils');
function ProblemMixin(mixinOptions, defaultOptions, name) {
  const serializedMixinOptions = (0, utils_1.serializeMixinOptions)(mixinOptions);
  const clazz = class extends problem_1.Problem {
    constructor(problem, options = {}) {
      super(problem, Object.assign(Object.assign({}, defaultOptions), options));
      this.problem = problem;
      this.options = options;
      this.problem.type = (0, utils_1.serializeType)(this.problem.type, serializedMixinOptions);
    }
  };
  if (name) {
    Object.defineProperty(clazz, 'name', { value: 'name' });
  }
  return clazz;
}
exports.ProblemMixin = ProblemMixin;
//# sourceMappingURL=mixin.js.map