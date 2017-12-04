"use strict";
//
// An iterable that iterates the elements of an array.
//
Object.defineProperty(exports, "__esModule", { value: true });
var array_iterator_1 = require("../iterators/array-iterator");
var ArrayIterable = /** @class */ (function () {
    function ArrayIterable(arr) {
        this.arr = arr;
    }
    ArrayIterable.prototype[Symbol.iterator] = function () {
        return new array_iterator_1.ArrayIterator(this.arr);
    };
    return ArrayIterable;
}());
exports.ArrayIterable = ArrayIterable;
//# sourceMappingURL=array-iterable.js.map