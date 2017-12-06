"use strict";
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
var count_iterable_1 = require("./iterables/count-iterable");
var multi_iterable_1 = require("./iterables/multi-iterable");
var Sugar = require("sugar");
var index_1 = require("./index");
var extract_element_iterable_1 = require("./iterables/extract-element-iterable");
var skip_iterable_1 = require("./iterables/skip-iterable");
var Table = require('easy-table');
var chai_1 = require("chai");
var column_names_iterable_1 = require("./iterables/column-names-iterable");
/**
 * Class that represents a dataframe of indexed values.
 */
var DataFrame = /** @class */ (function () {
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
    function DataFrame(config) {
        //
        // Records if a dataframe is baked into memory.
        //
        this.isBaked = false;
        if (config) {
            if (Sugar.Object.isArray(config)) {
                this.initFromArray(config);
            }
            else {
                this.initFromConfig(config);
            }
        }
        else {
            this.initFromArray([]);
        }
    }
    //
    // Initialise this DataFrame from an array.
    //
    DataFrame.prototype.initFromArray = function (arr) {
        this.index = new count_iterable_1.CountIterable();
        this.values = new array_iterable_1.ArrayIterable(arr);
        this.pairs = new multi_iterable_1.MultiIterable([this.index, this.values]);
        if (arr.length > 0) {
            this.columnNames = new array_iterable_1.ArrayIterable(Object.keys(arr[0]));
        }
        else {
            this.columnNames = new array_iterable_1.ArrayIterable([]);
        }
    };
    DataFrame.prototype.initIterable = function (input, fieldName) {
        if (Sugar.Object.isArray(input)) {
            return new array_iterable_1.ArrayIterable(input);
        }
        else if (Sugar.Object.isFunction(input[Symbol.iterator])) {
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
    DataFrame.prototype.initFromConfig = function (config) {
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
            this.columnNames = new column_names_iterable_1.ColumnNamesIterable(this.values);
        }
        else if (config.pairs) {
            this.values = new extract_element_iterable_1.ExtractElementIterable(config.pairs, 1);
            this.columnNames = new column_names_iterable_1.ColumnNamesIterable(this.values);
        }
        else {
            this.values = new array_iterable_1.ArrayIterable([]);
            this.columnNames = new array_iterable_1.ArrayIterable([]);
        }
        if (config.pairs) {
            this.pairs = config.pairs;
        }
        else {
            this.pairs = new multi_iterable_1.MultiIterable([this.index, this.values]);
        }
        this.isBaked = config.baked;
    };
    /**
     * Get an iterator to enumerate the values of the dataframe.
     * Enumerating the iterator forces lazy evaluation to complete.
     */
    DataFrame.prototype[Symbol.iterator] = function () {
        return this.values[Symbol.iterator]();
    };
    /**
     * Get the names of the columns in the dataframe.
     *
     * @returns Returns an array of the column names in the dataframe.
     */
    DataFrame.prototype.getColumnNames = function () {
        return Array.from(this.columnNames);
    };
    /**
     * Get the index for the dataframe.
     */
    DataFrame.prototype.getIndex = function () {
        return new index_1.Index({ values: this.index });
    };
    /**
     * Apply a new index to the DataFrame.
     *
     * @param newIndex The new index to apply to the DataFrame.
     *
     * @returns Returns a new dataframe or dataframe with the specified index attached.
     */
    DataFrame.prototype.withIndex = function (newIndex) {
        if (!Sugar.Object.isArray(newIndex)) {
            chai_1.assert.isObject(newIndex, "'Expected 'newIndex' parameter to 'DataFrame.withIndex' to be an array, DataFrame or Index.");
        }
        return new DataFrame({
            values: this.values,
            index: newIndex,
        });
    };
    ;
    /**
     * Resets the index of the dataframe back to the default zero-based sequential integer index.
     *
     * @returns Returns a new dataframe with the index reset to the default zero-based index.
     */
    DataFrame.prototype.resetIndex = function () {
        return new DataFrame({
            values: this.values // Just strip the index.
        });
    };
    /**
    * Extract values from the dataframe as an array.
    * This forces lazy evaluation to complete.
    *
    * @returns Returns an array of values contained within the dataframe.
    */
    DataFrame.prototype.toArray = function () {
        var values = [];
        try {
            for (var _a = __values(this.values), _b = _a.next(); !_b.done; _b = _a.next()) {
                var value = _b.value;
                values.push(value);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return values;
        var e_1, _c;
    };
    /**
     * Retreive the index and values from the DataFrame as an array of pairs.
     * Each pair is [index, value].
     * This forces lazy evaluation to complete.
     *
     * @returns Returns an array of pairs that contains the dataframe content. Each pair is a two element array that contains an index and a value.
     */
    DataFrame.prototype.toPairs = function () {
        var pairs = [];
        try {
            for (var _a = __values(this.pairs), _b = _a.next(); !_b.done; _b = _a.next()) {
                var pair = _b.value;
                pairs.push(pair);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return pairs;
        var e_2, _c;
    };
    /**
     * Skip a number of values in the dataframe.
     *
     * @param numValues - Number of values to skip.     *
     * @returns Returns a new dataframe or dataframe with the specified number of values skipped.
     */
    DataFrame.prototype.skip = function (numValues) {
        return new DataFrame({
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
    DataFrame.prototype.toString = function () {
        var header = ["__index__", "__value__"];
        var rows = this.toPairs();
        var table = new Table();
        rows.forEach(function (row, rowIndex) {
            row.forEach(function (cell, cellIndex) {
                table.cell(header[cellIndex], cell);
            });
            table.newRow();
        });
        return table.toString();
    };
    ;
    /**
     * Forces lazy evaluation to complete and 'bakes' the dataframe into memory.
     *
     * @returns Returns a dataframe that has been 'baked', all lazy evaluation has completed.
     */
    DataFrame.prototype.bake = function () {
        if (this.isBaked) {
            // Already baked.
            return this;
        }
        return new DataFrame({
            pairs: new array_iterable_1.ArrayIterable(this.toPairs()),
            baked: true,
        });
    };
    ;
    return DataFrame;
}());
exports.DataFrame = DataFrame;
//# sourceMappingURL=dataframe.js.map