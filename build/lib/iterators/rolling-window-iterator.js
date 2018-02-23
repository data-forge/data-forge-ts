"use strict";
//
// Iterates an underlying iterable in the 'windows'.
//
Object.defineProperty(exports, "__esModule", { value: true });
var take_iterable_1 = require("../iterables/take-iterable");
var skip_iterable_1 = require("../iterables/skip-iterable");
var series_1 = require("../series");
var RollingWindowIterator = /** @class */ (function () {
    function RollingWindowIterator(iterable, period) {
        this.windowIndex = 0;
        this.iterable = iterable;
        this.period = period;
    }
    RollingWindowIterator.prototype.next = function () {
        var window = new series_1.Series({
            pairs: new take_iterable_1.TakeIterable(new skip_iterable_1.SkipIterable(this.iterable, this.windowIndex++), this.period)
        });
        if (window.count() < this.period) {
            // Nothing more to read from the underlying iterable.
            // https://github.com/Microsoft/TypeScript/issues/8938
            return { done: true }; // <= explicit cast here!;
        }
        return {
            value: window,
            done: false,
        };
    };
    return RollingWindowIterator;
}());
exports.RollingWindowIterator = RollingWindowIterator;
//# sourceMappingURL=rolling-window-iterator.js.map