"use strict";
//
// An iterator to extact an element from an array.
//
Object.defineProperty(exports, "__esModule", { value: true });
var ExtractElementIterator = /** @class */ (function () {
    function ExtractElementIterator(iterator, extractIndex) {
        this.iterator = iterator;
        this.extractIndex = extractIndex;
    }
    ExtractElementIterator.prototype.next = function () {
        var result = this.iterator.next();
        if (result.done) {
            return result;
        }
        else {
            return {
                done: false,
                value: result.value[this.extractIndex]
            };
        }
        ;
    };
    return ExtractElementIterator;
}());
exports.ExtractElementIterator = ExtractElementIterator;
//# sourceMappingURL=extract-element-iterator.js.map