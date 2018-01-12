"use strict";
//
// An iterable that takes a certain number of elements from a child iterable.
//
Object.defineProperty(exports, "__esModule", { value: true });
var take_iterator_1 = require("../iterators/take-iterator");
var TakeIterable = /** @class */ (function () {
    function TakeIterable(childIterable, numElements) {
        this.childIterable = childIterable;
        this.numElements = numElements;
    }
    TakeIterable.prototype[Symbol.iterator] = function () {
        var childIterator = this.childIterable[Symbol.iterator]();
        return new take_iterator_1.TakeIterator(childIterator, this.numElements);
    };
    return TakeIterable;
}());
exports.TakeIterable = TakeIterable;
//# sourceMappingURL=take-iterable.js.map