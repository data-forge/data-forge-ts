"use strict";
//
// An iterator that iterates the rows of a CSV file.
//
Object.defineProperty(exports, "__esModule", { value: true });
var CsvRowsIterator = /** @class */ (function () {
    function CsvRowsIterator(columnNames, rows) {
        this.index = 0;
        this.columnNames = columnNames;
        this.rows = rows;
    }
    CsvRowsIterator.prototype.next = function () {
        if (this.index < this.rows.length) {
            var row = this.rows[this.index++];
            var value = {};
            for (var cellIndex = 0; cellIndex < row.length; ++cellIndex) {
                var columnName = this.columnNames[cellIndex];
                value[columnName] = row[cellIndex];
            }
            return {
                done: false,
                value: value,
            };
        }
        else {
            // https://github.com/Microsoft/TypeScript/issues/8938
            return { done: true }; // <= explicit cast here!;
        }
    };
    return CsvRowsIterator;
}());
exports.CsvRowsIterator = CsvRowsIterator;
//# sourceMappingURL=csv-rows-iterator.js.map