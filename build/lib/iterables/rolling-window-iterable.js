"use strict";
//
// Iterates an underlying iterable in the 'windows'.
//
Object.defineProperty(exports, "__esModule", { value: true });
var rolling_window_iterator_1 = require("../iterators/rolling-window-iterator");
var RollingWindowIterable = /** @class */ (function () {
    function RollingWindowIterable(iterable, period) {
        this.iterable = iterable;
        this.period = period;
    }
    RollingWindowIterable.prototype[Symbol.iterator] = function () {
        return new rolling_window_iterator_1.RollingWindowIterator(this.iterable, this.period);
    };
    return RollingWindowIterable;
}());
exports.RollingWindowIterable = RollingWindowIterable;
//# sourceMappingURL=rolling-window-iterable.js.map