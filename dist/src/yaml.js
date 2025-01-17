"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const yaml = tslib_1.__importStar(require("js-yaml"));
function loadYaml(data, opts) {
    return yaml.safeLoad(data, opts);
}
exports.loadYaml = loadYaml;
function loadAllYaml(data, opts) {
    return yaml.safeLoadAll(data, undefined, opts);
}
exports.loadAllYaml = loadAllYaml;
function dumpYaml(object, opts) {
    return yaml.safeDump(object, opts);
}
exports.dumpYaml = dumpYaml;
//# sourceMappingURL=yaml.js.map