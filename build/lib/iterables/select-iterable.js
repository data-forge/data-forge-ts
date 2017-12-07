"use strict";
//
// An iterable that applies a selector function to each item.
//
Object.defineProperty(exports, "__esModule", { value: true });
var select_iterator_1 = require("../iterators/select-iterator");
var SelectIterable = /** @class */ (function () {
    function SelectIterable(iterable, selector) {
        this.iterable = iterable;
        this.selector = selector;
    }
    SelectIterable.prototype[Symbol.iterator] = function () {
        var iterator = this.iterable[Symbol.iterator]();
        return new select_iterator_1.SelectIterator(iterator, this.selector);
    };
    return SelectIterable;
}());
exports.SelectIterable = SelectIterable;
//# sourceMappingURL=select-iterable.js.map