"use strict";
//
// An iterator that takes elements from a child iterator based on a predicate function.
//
Object.defineProperty(exports, "__esModule", { value: true });
var WhereIterator = /** @class */ (function () {
    function WhereIterator(childIterator, predicate) {
        this.childIterator = childIterator;
        this.predicate = predicate;
    }
    WhereIterator.prototype.next = function () {
        while (true) {
            var result = this.childIterator.next();
            if (result.done) {
                return result;
            }
            if (this.predicate(result.value)) {
                // It matches the predicate.
                return result;
            }
        }
    };
    return WhereIterator;
}());
exports.WhereIterator = WhereIterator;
//# sourceMappingURL=where-iterator.js.map