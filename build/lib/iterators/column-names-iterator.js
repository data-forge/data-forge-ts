"use strict";
//
// An iterator for the column names of lazy dataframe.
//
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var array_iterator_1 = require("./array-iterator");
var ColumnNamesIterator = /** @class */ (function () {
    function ColumnNamesIterator(values, considerAllRows) {
        this.columnNamesIterator = null;
        this.values = values;
        this.considerAllRows = considerAllRows;
    }
    ColumnNamesIterator.prototype.next = function () {
        if (this.columnNamesIterator === null) {
            if (this.considerAllRows) {
                var combinedFields = {};
                try {
                    // Check all items.
                    for (var _a = __values(this.values), _b = _a.next(); !_b.done; _b = _a.next()) {
                        var value = _b.value;
                        try {
                            for (var _c = __values(Object.keys(value)), _d = _c.next(); !_d.done; _d = _c.next()) {
                                var fieldName = _d.value;
                                combinedFields[fieldName] = true;
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_d && !_d.done && (_e = _c.return)) _e.call(_c);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_f = _a.return)) _f.call(_a);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                this.columnNamesIterator = new array_iterator_1.ArrayIterator(Object.keys(combinedFields));
            }
            else {
                // Just check the first item.
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
        }
        return this.columnNamesIterator.next();
        var e_2, _f, e_1, _e;
    };
    return ColumnNamesIterator;
}());
exports.ColumnNamesIterator = ColumnNamesIterator;
//# sourceMappingURL=column-names-iterator.js.map