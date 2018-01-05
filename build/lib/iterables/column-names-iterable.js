"use strict";
//
// An iterable that iterates the column names of lazy dataframe.
//
Object.defineProperty(exports, "__esModule", { value: true });
var column_names_iterator_1 = require("../iterators/column-names-iterator");
var ColumnNamesIterable = /** @class */ (function () {
    function ColumnNamesIterable(values, considerAllRows) {
        this.values = values;
        this.considerAllRows = considerAllRows;
    }
    ColumnNamesIterable.prototype[Symbol.iterator] = function () {
        return new column_names_iterator_1.ColumnNamesIterator(this.values, this.considerAllRows);
    };
    return ColumnNamesIterable;
}());
exports.ColumnNamesIterable = ColumnNamesIterable;
//# sourceMappingURL=column-names-iterable.js.map