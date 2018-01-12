"use strict";
//
// An iterable that skips a sequence of elements while a predicate function returns true.
//
Object.defineProperty(exports, "__esModule", { value: true });
var skip_while_iterator_1 = require("../iterators/skip-while-iterator");
var SkipWhileIterable = /** @class */ (function () {
    function SkipWhileIterable(childIterable, predicate) {
        this.childIterable = childIterable;
        this.predicate = predicate;
    }
    SkipWhileIterable.prototype[Symbol.iterator] = function () {
        var childIterator = this.childIterable[Symbol.iterator]();
        return new skip_while_iterator_1.SkipWhileIterator(childIterator, this.predicate);
    };
    return SkipWhileIterable;
}());
exports.SkipWhileIterable = SkipWhileIterable;
//# sourceMappingURL=skip-while-iterable.js.map