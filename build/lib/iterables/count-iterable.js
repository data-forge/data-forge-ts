"use strict";
//
// An iterable that simply counts up from zero.
// This creates the default index in Data-Forge.
//
Object.defineProperty(exports, "__esModule", { value: true });
var count_iterator_1 = require("../iterators/count-iterator");
var CountIterable = /** @class */ (function () {
    function CountIterable() {
    }
    CountIterable.prototype[Symbol.iterator] = function () {
        return new count_iterator_1.CountIterator();
    };
    return CountIterable;
}());
exports.CountIterable = CountIterable;
//# sourceMappingURL=count-iterable.js.map