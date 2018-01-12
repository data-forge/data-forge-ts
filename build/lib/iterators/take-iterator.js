"use strict";
//
// An iterator that a sequence of elements while a predicate function returns true.
//
Object.defineProperty(exports, "__esModule", { value: true });
var TakeIterator = /** @class */ (function () {
    function TakeIterator(childIterator, numElements) {
        this.childIterator = childIterator;
        this.numElements = numElements;
    }
    TakeIterator.prototype.next = function () {
        if (this.numElements <= 0) {
            // https://github.com/Microsoft/TypeScript/issues/8938
            return { done: true }; // <= explicit cast here!;
        }
        --this.numElements;
        return this.childIterator.next();
    };
    return TakeIterator;
}());
exports.TakeIterator = TakeIterator;
//# sourceMappingURL=take-iterator.js.map