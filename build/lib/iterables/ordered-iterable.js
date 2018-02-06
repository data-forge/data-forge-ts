"use strict";
//
// An iterable that sorts it's input before iterating it.
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
var array_iterator_1 = require("../iterators/array-iterator");
var Direction;
(function (Direction) {
    Direction[Direction["Ascending"] = 0] = "Ascending";
    Direction[Direction["Descending"] = 1] = "Descending";
})(Direction = exports.Direction || (exports.Direction = {}));
var SortOperation = /** @class */ (function () {
    function SortOperation(values, sortSpec) {
        this.values = values;
        this.sortSpec = sortSpec;
        this.keys = [];
    }
    SortOperation.prototype.genKeys = function () {
        if (this.keys.length > 0) {
            // Already cached.
            return;
        }
        var index = 0;
        try {
            for (var _a = __values(this.values), _b = _a.next(); !_b.done; _b = _a.next()) {
                var value = _b.value;
                this.keys.push(this.sortSpec.selector(value, index));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var e_1, _c;
    };
    SortOperation.prototype.compare = function (indexA, indexB) {
        this.genKeys();
        var keyA = this.keys[indexA];
        var keyB = this.keys[indexB];
        var comparison = -1;
        if (keyA === keyB) {
            comparison = 0;
        }
        else if (keyA > keyB) {
            comparison = 1;
        }
        return (this.sortSpec.direction === Direction.Descending) ? -comparison : comparison;
    };
    return SortOperation;
}());
;
var OrderedIterable = /** @class */ (function () {
    function OrderedIterable(iterable, sortSpec) {
        this.iterable = iterable;
        this.sortSpec = sortSpec;
    }
    OrderedIterable.prototype[Symbol.iterator] = function () {
        var indexes = [];
        var values = [];
        var index = 0;
        try {
            for (var _a = __values(this.iterable), _b = _a.next(); !_b.done; _b = _a.next()) {
                var value = _b.value;
                indexes.push(index);
                values.push(value);
                ++index;
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_2) throw e_2.error; }
        }
        var sortOperations = [];
        try {
            for (var _d = __values(this.sortSpec), _e = _d.next(); !_e.done; _e = _d.next()) {
                var sortSpec = _e.value;
                sortOperations.push(new SortOperation(values, sortSpec));
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_f = _d.return)) _f.call(_d);
            }
            finally { if (e_3) throw e_3.error; }
        }
        sortOperations[0].genKeys();
        indexes.sort(function (indexA, indexB) {
            try {
                for (var sortOperations_1 = __values(sortOperations), sortOperations_1_1 = sortOperations_1.next(); !sortOperations_1_1.done; sortOperations_1_1 = sortOperations_1.next()) {
                    var sortOperation = sortOperations_1_1.value;
                    var comparison = sortOperation.compare(indexA, indexB);
                    if (comparison !== 0) {
                        return comparison;
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (sortOperations_1_1 && !sortOperations_1_1.done && (_a = sortOperations_1.return)) _a.call(sortOperations_1);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return 0;
            var e_4, _a;
        });
        var sortedValues = [];
        try {
            for (var indexes_1 = __values(indexes), indexes_1_1 = indexes_1.next(); !indexes_1_1.done; indexes_1_1 = indexes_1.next()) {
                var index_1 = indexes_1_1.value;
                sortedValues.push(values[index_1]);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (indexes_1_1 && !indexes_1_1.done && (_g = indexes_1.return)) _g.call(indexes_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return new array_iterator_1.ArrayIterator(sortedValues);
        var e_2, _c, e_3, _f, e_5, _g;
    };
    return OrderedIterable;
}());
exports.OrderedIterable = OrderedIterable;
//# sourceMappingURL=ordered-iterable.js.map