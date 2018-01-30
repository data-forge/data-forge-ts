"use strict";
//
// An iterator that applies a selector function to each item.
//
Object.defineProperty(exports, "__esModule", { value: true });
var SelectManyIterator = /** @class */ (function () {
    function SelectManyIterator(iterator, selector) {
        this.index = 0;
        this.iterator = iterator;
        this.selector = selector;
        this.outputIterator = null;
    }
    SelectManyIterator.prototype.next = function () {
        while (true) {
            if (this.outputIterator === null) {
                var result = this.iterator.next();
                if (result.done) {
                    // https://github.com/Microsoft/TypeScript/issues/8938
                    return { done: true }; // <= explicit cast here!;
                }
                var outputIterable = this.selector(result.value, this.index++);
                this.outputIterator = outputIterable[Symbol.iterator]();
            }
            var outputResult = this.outputIterator.next();
            if (outputResult.done) {
                this.outputIterator = null;
                continue;
            }
            else {
                return outputResult;
            }
        }
    };
    return SelectManyIterator;
}());
exports.SelectManyIterator = SelectManyIterator;
//# sourceMappingURL=select-many-iterator.js.map