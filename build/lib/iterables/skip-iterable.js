"use strict";
//
// An iterable that skips a number of values.
//
Object.defineProperty(exports, "__esModule", { value: true });
var skip_iterator_1 = require("../iterators/skip-iterator");
var SkipIterable = /** @class */ (function () {
    function SkipIterable(iterable, numValues) {
        this.iterable = iterable;
        this.numValues = numValues;
    }
    SkipIterable.prototype[Symbol.iterator] = function () {
        var iterator = this.iterable[Symbol.iterator]();
        return new skip_iterator_1.SkipIterator(iterator, this.numValues);
    };
    return SkipIterable;
}());
exports.SkipIterable = SkipIterable;
//# sourceMappingURL=skip-iterable.js.map