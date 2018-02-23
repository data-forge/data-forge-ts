"use strict";
//
// Iterates an underlying iterable in the 'windows'.
//
Object.defineProperty(exports, "__esModule", { value: true });
var window_iterator_1 = require("../iterators/window-iterator");
var WindowIterable = /** @class */ (function () {
    function WindowIterable(iterable, period) {
        this.iterable = iterable;
        this.period = period;
    }
    WindowIterable.prototype[Symbol.iterator] = function () {
        return new window_iterator_1.WindowIterator(this.iterable, this.period);
    };
    return WindowIterable;
}());
exports.WindowIterable = WindowIterable;
//# sourceMappingURL=window-iterable.js.map