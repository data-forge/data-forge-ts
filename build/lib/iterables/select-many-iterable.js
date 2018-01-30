"use strict";
//
// An iterable that applies a selector function to each item.
//
Object.defineProperty(exports, "__esModule", { value: true });
var select_many_iterator_1 = require("../iterators/select-many-iterator");
var SelectManyIterable = /** @class */ (function () {
    function SelectManyIterable(iterable, selector) {
        this.iterable = iterable;
        this.selector = selector;
    }
    SelectManyIterable.prototype[Symbol.iterator] = function () {
        var iterator = this.iterable[Symbol.iterator]();
        return new select_many_iterator_1.SelectManyIterator(iterator, this.selector);
    };
    return SelectManyIterable;
}());
exports.SelectManyIterable = SelectManyIterable;
//# sourceMappingURL=select-many-iterable.js.map