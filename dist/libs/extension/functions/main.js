"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const app_1 = require("firebase-admin/app");
(0, app_1.getApps)()
    .length === 0 && (0, app_1.initializeApp)();
tslib_1.__exportStar(require("./lib/api"), exports);
//# sourceMappingURL=main.js.map