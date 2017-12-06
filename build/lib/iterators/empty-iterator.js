"use strict";
//
// An iterator that returns no values.
//
Object.defineProperty(exports, "__esModule", { value: true });
var EmptyIterator = /** @class */ (function () {
    function EmptyIterator() {
    }
    EmptyIterator.prototype.next = function () {
        return {
            done: true,
            value: null
        };
    };
    return EmptyIterator;
}());
exports.EmptyIterator = EmptyIterator;
//# sourceMappingURL=empty-iterator.js.map