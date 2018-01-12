"use strict";
//
// An iterable that takes elements from a child iterable based on a predicate function.
//
Object.defineProperty(exports, "__esModule", { value: true });
var where_iterator_1 = require("../iterators/where-iterator");
var WhereIterable = /** @class */ (function () {
    function WhereIterable(childIterable, predicate) {
        this.childIterable = childIterable;
        this.predicate = predicate;
    }
    WhereIterable.prototype[Symbol.iterator] = function () {
        var childIterator = this.childIterable[Symbol.iterator]();
        return new where_iterator_1.WhereIterator(childIterator, this.predicate);
    };
    return WhereIterable;
}());
exports.WhereIterable = WhereIterable;
//# sourceMappingURL=where-iterable.js.map