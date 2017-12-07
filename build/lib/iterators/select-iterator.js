"use strict";
//
// An iterator that applies a selector function to each item.
//
Object.defineProperty(exports, "__esModule", { value: true });
var SelectIterator = /** @class */ (function () {
    function SelectIterator(iterator, selector) {
        this.index = 0;
        this.iterator = iterator;
        this.selector = selector;
    }
    SelectIterator.prototype.next = function () {
        var result = this.iterator.next();
        if (result.done) {
            return result;
        }
        return {
            done: false,
            value: this.selector(result.value, this.index++)
        };
    };
    return SelectIterator;
}());
exports.SelectIterator = SelectIterator;
//# sourceMappingURL=select-iterator.js.map