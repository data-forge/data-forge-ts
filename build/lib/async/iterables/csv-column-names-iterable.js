"use strict";
//
// An iterable that iterates the column names of lazy dataframe.
//
Object.defineProperty(exports, "__esModule", { value: true });
var csv_column_names_iterator_1 = require("../iterators/csv-column-names-iterator");
var CsvColumnNamesIterable = /** @class */ (function () {
    function CsvColumnNamesIterable(csvIterable) {
        this.csvIterable = csvIterable;
    }
    CsvColumnNamesIterable.prototype[Symbol.asyncIterator] = function () {
        return new csv_column_names_iterator_1.CsvColumnNamesIterator(this.csvIterable);
    };
    return CsvColumnNamesIterable;
}());
exports.CsvColumnNamesIterable = CsvColumnNamesIterable;
//# sourceMappingURL=csv-column-names-iterable.js.map