"use strict";
//
// An iterator that iterates the elements of an array.
//
Object.defineProperty(exports, "__esModule", { value: true });
var ArrayIterator = /** @class */ (function () {
    function ArrayIterator(arr) {
        this.index = 0;
        this.arr = arr;
    }
    ArrayIterator.prototype.next = function () {
        if (this.index < this.arr.length) {
            return {
                done: false,
                value: this.arr[this.index++],
            };
        }
        else {
            // https://github.com/Microsoft/TypeScript/issues/8938
            return { done: true }; // <= explicit cast here!;
        }
    };
    return ArrayIterator;
}());
exports.ArrayIterator = ArrayIterator;
//# sourceMappingURL=array-iterator.js.map