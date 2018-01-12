"use strict";
//
// An iterator that skips a sequence of elements while a predicate function returns true.
//
Object.defineProperty(exports, "__esModule", { value: true });
var SkipWhileIterator = /** @class */ (function () {
    function SkipWhileIterator(childIterator, predicate) {
        this.doneSkipping = false;
        this.childIterator = childIterator;
        this.predicate = predicate;
    }
    SkipWhileIterator.prototype.next = function () {
        while (true) {
            var result = this.childIterator.next();
            if (result.done) {
                return result; // Done.
            }
            if (!this.doneSkipping && this.predicate(result.value)) {
                continue; // Skip it.
            }
            // It matches, stop skipping.
            this.doneSkipping = true;
            return result;
        }
    };
    return SkipWhileIterator;
}());
exports.SkipWhileIterator = SkipWhileIterator;
//# sourceMappingURL=skip-while-iterator.js.map