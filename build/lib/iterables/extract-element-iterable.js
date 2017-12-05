"use strict";
//
// An iterable to extact an element from an array.
//
Object.defineProperty(exports, "__esModule", { value: true });
var extract_element_iterator_1 = require("../iterators/extract-element-iterator");
var ExtractElementIterable = /** @class */ (function () {
    function ExtractElementIterable(arrayIterable, extractIndex) {
        this.arrayIterable = arrayIterable;
        this.extractIndex = extractIndex;
    }
    ExtractElementIterable.prototype[Symbol.iterator] = function () {
        var arrayIterator = this.arrayIterable[Symbol.iterator]();
        return new extract_element_iterator_1.ExtractElementIterator(arrayIterator, this.extractIndex);
    };
    return ExtractElementIterable;
}());
exports.ExtractElementIterable = ExtractElementIterable;
//# sourceMappingURL=extract-element-iterable.js.map