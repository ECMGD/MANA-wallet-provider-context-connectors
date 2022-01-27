"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorage = void 0;
const Storage_1 = require("./Storage");
class LocalStorage extends Storage_1.Storage {
    get(key) {
        const result = window.localStorage.getItem(key);
        return result === null ? undefined : result;
    }
    set(key, value) {
        window.localStorage.setItem(key, value);
    }
    remove(key) {
        window.localStorage.removeItem(key);
    }
}
exports.LocalStorage = LocalStorage;
//# sourceMappingURL=LocalStorage.js.map