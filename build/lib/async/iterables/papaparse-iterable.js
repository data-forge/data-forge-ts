"use strict";
//
// An iterable that iterates a CSV file thanks to Papa Parse.
//
Object.defineProperty(exports, "__esModule", { value: true });
var papaparse_iterator_1 = require("../iterators/papaparse-iterator");
var PapaParseIterable = /** @class */ (function () {
    function PapaParseIterable(inputFilePath, config) {
        this.inputFilePath = inputFilePath;
        this.config = config;
    }
    PapaParseIterable.prototype[Symbol.asyncIterator] = function () {
        return new papaparse_iterator_1.PapaParseIterator(this.inputFilePath, this.config);
    };
    return PapaParseIterable;
}());
exports.PapaParseIterable = PapaParseIterable;
//# sourceMappingURL=papaparse-iterable.js.map