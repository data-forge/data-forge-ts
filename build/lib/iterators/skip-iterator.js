"use strict";
//
// An iterator that skips a number of values.
//
Object.defineProperty(exports, "__esModule", { value: true });
var SkipIterator = /** @class */ (function () {
    function SkipIterator(iterator, numValues) {
        this.iterator = iterator;
        this.numValues = numValues;
    }
    SkipIterator.prototype.next = function () {
        while (--this.numValues >= 0) {
            var result = this.iterator.next();
            if (result.done) {
                return result;
            }
        }
        return this.iterator.next();
    };
    return SkipIterator;
}());
exports.SkipIterator = SkipIterator;
//# sourceMappingURL=skip-iterator.js.map