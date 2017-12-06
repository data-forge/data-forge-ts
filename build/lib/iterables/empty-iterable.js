"use strict";
//
// An iterable that returns no values.
//
Object.defineProperty(exports, "__esModule", { value: true });
var empty_iterator_1 = require("../iterators/empty-iterator");
var EmptyIterable = /** @class */ (function () {
    function EmptyIterable() {
    }
    EmptyIterable.prototype[Symbol.iterator] = function () {
        return new empty_iterator_1.EmptyIterator();
    };
    return EmptyIterable;
}());
exports.EmptyIterable = EmptyIterable;
//# sourceMappingURL=empty-iterable.js.map