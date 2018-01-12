"use strict";
//
// An iterable that takes a sequence of elements while a predicate function returns true.
//
Object.defineProperty(exports, "__esModule", { value: true });
var take_while_iterator_1 = require("../iterators/take-while-iterator");
var TakeWhileIterable = /** @class */ (function () {
    function TakeWhileIterable(childIterable, predicate) {
        this.childIterable = childIterable;
        this.predicate = predicate;
    }
    TakeWhileIterable.prototype[Symbol.iterator] = function () {
        var childIterator = this.childIterable[Symbol.iterator]();
        return new take_while_iterator_1.TakeWhileIterator(childIterator, this.predicate);
    };
    return TakeWhileIterable;
}());
exports.TakeWhileIterable = TakeWhileIterable;
//# sourceMappingURL=take-while-iterable.js.map