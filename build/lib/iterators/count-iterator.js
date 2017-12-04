"use strict";
//
// An iterator that simply counts up from zero.
// This creates the default index in Data-Forge.
//
Object.defineProperty(exports, "__esModule", { value: true });
var CountIterator = /** @class */ (function () {
    function CountIterator() {
        this.index = 0;
    }
    CountIterator.prototype.next = function () {
        return {
            done: false,
            value: this.index++
        };
    };
    return CountIterator;
}());
exports.CountIterator = CountIterator;
//# sourceMappingURL=count-iterator.js.map