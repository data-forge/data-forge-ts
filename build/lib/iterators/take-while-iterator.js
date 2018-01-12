"use strict";
//
// An iterator that takes a sequence of elements while a predicate function returns true.
//
Object.defineProperty(exports, "__esModule", { value: true });
var TakeWhileIterator = /** @class */ (function () {
    function TakeWhileIterator(childIterator, predicate) {
        this.done = false;
        this.childIterator = childIterator;
        this.predicate = predicate;
    }
    TakeWhileIterator.prototype.next = function () {
        if (!this.done) {
            var result = this.childIterator.next();
            if (result.done) {
                this.done = true;
            }
            else if (this.predicate(result.value)) {
                return result;
            }
            else {
                this.done = true;
            }
        }
        // https://github.com/Microsoft/TypeScript/issues/8938
        return { done: true }; // <= explicit cast here!;
    };
    return TakeWhileIterator;
}());
exports.TakeWhileIterator = TakeWhileIterator;
//# sourceMappingURL=take-while-iterator.js.map