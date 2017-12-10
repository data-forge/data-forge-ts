"use strict";
//
// An iterable that iterates the rows of a CSV file.
//
Object.defineProperty(exports, "__esModule", { value: true });
var csv_rows_iterator_1 = require("../iterators/csv-rows-iterator");
var CsvRowsIterable = /** @class */ (function () {
    function CsvRowsIterable(columnNames, rows) {
        this.columnNames = columnNames;
        this.rows = rows;
    }
    CsvRowsIterable.prototype[Symbol.iterator] = function () {
        return new csv_rows_iterator_1.CsvRowsIterator(this.columnNames, this.rows);
    };
    return CsvRowsIterable;
}());
exports.CsvRowsIterable = CsvRowsIterable;
//# sourceMappingURL=csv-rows-iterable.js.map