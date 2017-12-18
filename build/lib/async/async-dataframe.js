"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncIterator) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator];
    return m ? m.call(o) : typeof __values === "function" ? __values(o) : o[Symbol.iterator]();
};
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
var array_iterable_1 = require("./iterables/array-iterable");
var array_iterable_2 = require("../iterables/array-iterable");
var empty_iterable_1 = require("./iterables/empty-iterable");
var count_iterable_1 = require("./iterables/count-iterable");
var multi_iterable_1 = require("./iterables/multi-iterable");
var select_iterable_1 = require("./iterables/select-iterable");
var Sugar = require("sugar");
var async_index_1 = require("./async-index");
var extract_element_iterable_1 = require("./iterables/extract-element-iterable");
var skip_iterable_1 = require("./iterables/skip-iterable");
var Table = require('easy-table');
var chai_1 = require("chai");
var async_series_1 = require("./async-series");
var column_names_iterable_1 = require("./iterables/column-names-iterable");
var BabyParse = require("babyparse");
var dataframe_1 = require("../dataframe");
;
/**
 * Class that represents a dataframe of indexed values.
 */
var AsyncDataFrame = /** @class */ (function () {
    /**
     * Create a dataframe.
     *
     * @param config This can be either an array or a config object the sets the values that the dataframe contains.
     * If it is an array it specifies the values that the dataframe contains.
     * If it is a config object that can contain:
     *      values: Optional array or iterable of values that the dataframe contains.
     *      index: Optional array or iterable of values that index the dataframe, defaults to a dataframe of integers from 1 and counting upward.
     *      pairs: Optional iterable of pairs (index and value) that the dataframe contains.
     */
    function AsyncDataFrame(config) {
        if (config) {
            if (Sugar.Object.isArray(config)) {
                this.initFromArray(config);
            }
            else {
                this.initFromConfig(config);
            }
        }
        else {
            this.initEmpty();
        }
    }
    //
    // Initialise this DataFrame from an array.
    //
    AsyncDataFrame.prototype.initFromArray = function (arr) {
        this.index = new count_iterable_1.CountIterable();
        this.values = new array_iterable_1.ArrayIterable(arr);
        this.pairs = new multi_iterable_1.MultiIterable([this.index, this.values]);
        if (arr.length > 0) {
            this.columnNames = new array_iterable_1.ArrayIterable(Object.keys(arr[0]));
        }
        else {
            this.columnNames = new empty_iterable_1.EmptyIterable();
        }
    };
    //
    // Initialise an empty DataFrame.
    //
    AsyncDataFrame.prototype.initEmpty = function () {
        this.index = new empty_iterable_1.EmptyIterable();
        this.values = new empty_iterable_1.EmptyIterable();
        this.pairs = new empty_iterable_1.EmptyIterable();
        this.columnNames = new empty_iterable_1.EmptyIterable();
    };
    AsyncDataFrame.prototype.initIterable = function (input, fieldName) {
        if (Sugar.Object.isArray(input)) {
            return new array_iterable_1.ArrayIterable(input);
        }
        else if (Sugar.Object.isFunction(input[Symbol.asyncIterator])) {
            // Assume it's an iterable.
            return input;
        }
        else {
            throw new Error("Expected '" + fieldName + "' field of DataFrame config object to be an array of values or an iterable of values.");
        }
    };
    ;
    //
    // Initialise the DataFrame from a config object.
    //
    AsyncDataFrame.prototype.initFromConfig = function (config) {
        if (config.columnNames) {
            this.columnNames = this.initIterable(config.columnNames, 'columnNames');
        }
        if (config.index) {
            this.index = this.initIterable(config.index, 'index');
        }
        else if (config.pairs) {
            this.index = new extract_element_iterable_1.ExtractElementIterable(config.pairs, 0);
        }
        else {
            this.index = new count_iterable_1.CountIterable();
        }
        if (config.values) {
            this.values = this.initIterable(config.values, 'values');
            if (!this.columnNames) {
                this.columnNames = new column_names_iterable_1.ColumnNamesIterable(this.values);
            }
        }
        else if (config.pairs) {
            this.values = new extract_element_iterable_1.ExtractElementIterable(config.pairs, 1);
            if (!this.columnNames) {
                this.columnNames = new column_names_iterable_1.ColumnNamesIterable(this.values);
            }
        }
        else {
            this.values = new empty_iterable_1.EmptyIterable();
            if (!this.columnNames) {
                this.columnNames = new empty_iterable_1.EmptyIterable();
            }
        }
        if (config.pairs) {
            this.pairs = config.pairs;
        }
        else {
            this.pairs = new multi_iterable_1.MultiIterable([this.index, this.values]);
        }
    };
    /**
     * Get an iterator to enumerate the values of the dataframe.
     * Enumerating the iterator forces lazy evaluation to complete.
     */
    AsyncDataFrame.prototype[Symbol.asyncIterator] = function () {
        return this.values[Symbol.asyncIterator]();
    };
    /**
     * Get the names of the columns in the dataframe.
     *
     * @returns Returns an array of the column names in the dataframe.
     */
    AsyncDataFrame.prototype.getColumnNames = function () {
        return __awaiter(this, void 0, void 0, function () {
            var columnNames, _a, _b, columnName, e_1_1, e_1, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        columnNames = [];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 7, 8, 13]);
                        _a = __asyncValues(this.columnNames);
                        _d.label = 2;
                    case 2: return [4 /*yield*/, _a.next()];
                    case 3:
                        if (!(_b = _d.sent(), !_b.done)) return [3 /*break*/, 6];
                        return [4 /*yield*/, _b.value];
                    case 4:
                        columnName = _d.sent();
                        columnNames.push(columnName);
                        _d.label = 5;
                    case 5: return [3 /*break*/, 2];
                    case 6: return [3 /*break*/, 13];
                    case 7:
                        e_1_1 = _d.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 13];
                    case 8:
                        _d.trys.push([8, , 11, 12]);
                        if (!(_b && !_b.done && (_c = _a.return))) return [3 /*break*/, 10];
                        return [4 /*yield*/, _c.call(_a)];
                    case 9:
                        _d.sent();
                        _d.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 12: return [7 /*endfinally*/];
                    case 13: return [2 /*return*/, columnNames];
                }
            });
        });
    };
    /**
     * Get the index for the dataframe.
     */
    AsyncDataFrame.prototype.getIndex = function () {
        return new async_index_1.AsyncIndex({ values: this.index });
    };
    /**
     * Apply a new index to the DataFrame.
     *
     * @param newIndex The new index to apply to the DataFrame.
     *
     * @returns Returns a new dataframe or dataframe with the specified index attached.
     */
    AsyncDataFrame.prototype.withIndex = function (newIndex) {
        if (!Sugar.Object.isArray(newIndex)) {
            chai_1.assert.isObject(newIndex, "'Expected 'newIndex' parameter to 'DataFrame.withIndex' to be an array, DataFrame or Index.");
        }
        return new AsyncDataFrame({
            values: this.values,
            index: newIndex,
        });
    };
    /**
     * Resets the index of the dataframe back to the default zero-based sequential integer index.
     *
     * @returns Returns a new dataframe with the index reset to the default zero-based index.
     */
    AsyncDataFrame.prototype.resetIndex = function () {
        return new AsyncDataFrame({
            values: this.values // Just strip the index.
        });
    };
    /**
     * Retreive a series from a column of the dataframe.
     *
     * @param columnName Specifies the name of the column that contains the series to retreive.
     */
    AsyncDataFrame.prototype.getSeries = function (columnName) {
        chai_1.assert.isString(columnName, "Expected 'columnName' parameter to 'DataFrame.getSeries' function to be a string that specifies the name of the column to retreive.");
        return new async_series_1.AsyncSeries({
            values: new select_iterable_1.SelectIterable(this.values, function (row) { return row[columnName]; }),
            index: this.index,
        });
    };
    /**
    * Extract values from the dataframe as an array.
    * This forces lazy evaluation to complete.
    *
    * @returns Returns an array of values contained within the dataframe.
    */
    AsyncDataFrame.prototype.toArray = function () {
        return __awaiter(this, void 0, void 0, function () {
            var values, _a, _b, value, e_2_1, e_2, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        values = [];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 7, 8, 13]);
                        _a = __asyncValues(this.values);
                        _d.label = 2;
                    case 2: return [4 /*yield*/, _a.next()];
                    case 3:
                        if (!(_b = _d.sent(), !_b.done)) return [3 /*break*/, 6];
                        return [4 /*yield*/, _b.value];
                    case 4:
                        value = _d.sent();
                        values.push(value);
                        _d.label = 5;
                    case 5: return [3 /*break*/, 2];
                    case 6: return [3 /*break*/, 13];
                    case 7:
                        e_2_1 = _d.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 13];
                    case 8:
                        _d.trys.push([8, , 11, 12]);
                        if (!(_b && !_b.done && (_c = _a.return))) return [3 /*break*/, 10];
                        return [4 /*yield*/, _c.call(_a)];
                    case 9:
                        _d.sent();
                        _d.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        if (e_2) throw e_2.error;
                        return [7 /*endfinally*/];
                    case 12: return [7 /*endfinally*/];
                    case 13: return [2 /*return*/, values];
                }
            });
        });
    };
    /**
     * Retreive the index and values from the DataFrame as an array of pairs.
     * Each pair is [index, value].
     * This forces lazy evaluation to complete.
     *
     * @returns Returns an array of pairs that contains the dataframe content. Each pair is a two element array that contains an index and a value.
     */
    AsyncDataFrame.prototype.toPairs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pairs, _a, _b, pair, e_3_1, e_3, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        pairs = [];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 7, 8, 13]);
                        _a = __asyncValues(this.pairs);
                        _d.label = 2;
                    case 2: return [4 /*yield*/, _a.next()];
                    case 3:
                        if (!(_b = _d.sent(), !_b.done)) return [3 /*break*/, 6];
                        return [4 /*yield*/, _b.value];
                    case 4:
                        pair = _d.sent();
                        pairs.push(pair);
                        _d.label = 5;
                    case 5: return [3 /*break*/, 2];
                    case 6: return [3 /*break*/, 13];
                    case 7:
                        e_3_1 = _d.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 13];
                    case 8:
                        _d.trys.push([8, , 11, 12]);
                        if (!(_b && !_b.done && (_c = _a.return))) return [3 /*break*/, 10];
                        return [4 /*yield*/, _c.call(_a)];
                    case 9:
                        _d.sent();
                        _d.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        if (e_3) throw e_3.error;
                        return [7 /*endfinally*/];
                    case 12: return [7 /*endfinally*/];
                    case 13: return [2 /*return*/, pairs];
                }
            });
        });
    };
    /**
     * Bake the data frame to an array of rows.
     *
     *  @returns Returns an array of rows. Each row is an array of values in column order.
     */
    AsyncDataFrame.prototype.toRows = function () {
        return __awaiter(this, void 0, void 0, function () {
            var values, columnNames, rows, values_1, values_1_1, value, row, columnIndex, e_4, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.toArray()];
                    case 1:
                        values = _b.sent();
                        return [4 /*yield*/, this.getColumnNames()];
                    case 2:
                        columnNames = _b.sent();
                        rows = [];
                        try {
                            for (values_1 = __values(values), values_1_1 = values_1.next(); !values_1_1.done; values_1_1 = values_1.next()) {
                                value = values_1_1.value;
                                row = [];
                                for (columnIndex = 0; columnIndex < columnNames.length; ++columnIndex) {
                                    row.push(value[columnNames[columnIndex]]);
                                }
                                rows.push(row);
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (values_1_1 && !values_1_1.done && (_a = values_1.return)) _a.call(values_1);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                        return [2 /*return*/, rows];
                }
            });
        });
    };
    /**
     * Generate a new dataframe based by calling the selector function on each value.
     *
     * @param selector Selector function that transforms each value to create a new dataframe.
     *
     * @returns Returns a new dataframe that has been transformed by the selector function.
     */
    AsyncDataFrame.prototype.select = function (selector) {
        chai_1.assert.isFunction(selector, "Expected 'selector' parameter to 'DataFrame.select' function to be a function.");
        return new AsyncDataFrame({
            values: new select_iterable_1.SelectIterable(this.values, selector),
            index: this.index,
        });
    };
    /**
     * Skip a number of values in the dataframe.
     *
     * @param numValues - Number of values to skip.     *
     * @returns Returns a new dataframe or dataframe with the specified number of values skipped.
     */
    AsyncDataFrame.prototype.skip = function (numValues) {
        return new AsyncDataFrame({
            values: new skip_iterable_1.SkipIterable(this.values, numValues),
            index: new skip_iterable_1.SkipIterable(this.index, numValues),
            pairs: new skip_iterable_1.SkipIterable(this.pairs, numValues),
        });
    };
    /**
     * Format the dataframe for display as a string.
     * This forces lazy evaluation to complete.
     *
     * @returns Generates and returns a string representation of the dataframe or dataframe.
     */
    AsyncDataFrame.prototype.toString = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pairs, columnNames, header, table, pairs_1, pairs_1_1, pair, index, value, columnIndex, columnName, e_5, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.toPairs()];
                    case 1:
                        pairs = _b.sent();
                        return [4 /*yield*/, this.getColumnNames()];
                    case 2:
                        columnNames = _b.sent();
                        header = ["__index__"].concat(columnNames);
                        table = new Table();
                        try {
                            for (pairs_1 = __values(pairs), pairs_1_1 = pairs_1.next(); !pairs_1_1.done; pairs_1_1 = pairs_1.next()) {
                                pair = pairs_1_1.value;
                                index = pair[0];
                                value = pair[1];
                                table.cell(header[0], index);
                                for (columnIndex = 0; columnIndex < columnNames.length; ++columnIndex) {
                                    columnName = header[columnIndex + 1];
                                    table.cell(columnName, value[columnName]);
                                }
                                table.newRow();
                            }
                        }
                        catch (e_5_1) { e_5 = { error: e_5_1 }; }
                        finally {
                            try {
                                if (pairs_1_1 && !pairs_1_1.done && (_a = pairs_1.return)) _a.call(pairs_1);
                            }
                            finally { if (e_5) throw e_5.error; }
                        }
                        return [2 /*return*/, table.toString()];
                }
            });
        });
    };
    /**
     * Forces lazy evaluation to complete and 'bakes' the dataframe into memory.
     *
     * @returns Returns a dataframe that has been 'baked', all lazy evaluation has completed.
     */
    AsyncDataFrame.prototype.bake = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pairs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.toPairs()];
                    case 1:
                        pairs = _a.sent();
                        return [2 /*return*/, new dataframe_1.DataFrame({
                                pairs: new array_iterable_2.ArrayIterable(pairs),
                            })];
                }
            });
        });
    };
    /**
     * Serialize the dataframe to JSON.
     *
     *  @returns Returns a JSON format string representing the dataframe.
     */
    AsyncDataFrame.prototype.toJSON = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = JSON).stringify;
                        return [4 /*yield*/, this.toArray()];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent(), null, 4])];
                }
            });
        });
    };
    /**
     * Serialize the dataframe to CSV.
     *
     *  @returns Returns a CSV format string representing the dataframe.
     */
    AsyncDataFrame.prototype.toCSV = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rows, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.toRows()];
                    case 1:
                        rows = _a.sent();
                        return [4 /*yield*/, this.getColumnNames()];
                    case 2:
                        data = [_a.sent()].concat(rows);
                        return [2 /*return*/, BabyParse.unparse(data)];
                }
            });
        });
    };
    return AsyncDataFrame;
}());
exports.AsyncDataFrame = AsyncDataFrame;
//# sourceMappingURL=async-dataframe.js.map