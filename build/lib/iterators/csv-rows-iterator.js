"use strict";
//
// An iterator that iterates the rows of a CSV file.
//
Object.defineProperty(exports, "__esModule", { value: true });
var CsvRowsIterator = /** @class */ (function () {
    function CsvRowsIterator(columnNames, rowsIterable) {
        this.index = 0;
        this.columnNames = Array.from(columnNames);
        this.rowsIterator = rowsIterable[Symbol.iterator]();
    }
    CsvRowsIterator.prototype.next = function () {
        var result = this.rowsIterator.next();
        if (result.done) {
            // https://github.com/Microsoft/TypeScript/issues/8938
            return { done: true }; // <= explicit cast here!;
        }
        var row = result.value;
        var value = {};
        for (var cellIndex = 0; cellIndex < this.columnNames.length; ++cellIndex) {
            var columnName = this.columnNames[cellIndex];
            value[columnName] = row[cellIndex];
        }
        return {
            done: false,
            value: value,
        };
    };
    return CsvRowsIterator;
}());
exports.CsvRowsIterator = CsvRowsIterator;
//# sourceMappingURL=csv-rows-iterator.js.map