"use strict";
//
// An iterator for the column names of lazy dataframe.
//
Object.defineProperty(exports, "__esModule", { value: true });
var array_iterator_1 = require("./array-iterator");
var ColumnNamesIterator = /** @class */ (function () {
    function ColumnNamesIterator(values) {
        this.columnNamesIterator = null;
        this.values = values;
    }
    ColumnNamesIterator.prototype.next = function () {
        if (this.columnNamesIterator === null) {
            // Get first item.
            var valuesIterator = this.values[Symbol.iterator]();
            var firstResult = valuesIterator.next();
            if (firstResult.done) {
                return {
                    done: true,
                    value: "",
                };
            }
            this.columnNamesIterator = new array_iterator_1.ArrayIterator(Object.keys(firstResult.value));
        }
        return this.columnNamesIterator.next();
    };
    return ColumnNamesIterator;
}());
exports.ColumnNamesIterator = ColumnNamesIterator;
//# sourceMappingURL=column-names-iterator.js.map