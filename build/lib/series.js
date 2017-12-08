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
var empty_iterable_1 = require("./iterables/empty-iterable");
var count_iterable_1 = require("./iterables/count-iterable");
var multi_iterable_1 = require("./iterables/multi-iterable");
var select_iterable_1 = require("./iterables/select-iterable");
var Sugar = require("sugar");
var index_1 = require("./index");
var extract_element_iterable_1 = require("./iterables/extract-element-iterable");
var skip_iterable_1 = require("./iterables/skip-iterable");
var Table = require('easy-table');
var chai_1 = require("chai");
var dataframe_1 = require("./dataframe");
;
/**
 * Class that represents a series of indexed values.
 */
var Series = /** @class */ (function () {
    /**
     * Create a series.
     *
     * @param config This can be either an array or a config object the sets the values that the series contains.
     * If it is an array it specifies the values that the series contains.
     * If it is a config object that can contain:
     *      values: Optional array or iterable of values that the series contains.
     *      index: Optional array or iterable of values that index the series, defaults to a series of integers from 1 and counting upward.
     *      pairs: Optional iterable of pairs (index and value) that the series contains.
     */
    function Series(config) {
        //
        // Records if a series is baked into memory.
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
            this.initEmpty();
        }
    }
    //
    // Initialise this Series from an array.
    //
    Series.prototype.initFromArray = function (arr) {
        this.index = new count_iterable_1.CountIterable();
        this.values = new array_iterable_1.ArrayIterable(arr);
        this.pairs = new multi_iterable_1.MultiIterable([this.index, this.values]);
    };
    //
    // Initialise an empty DataFrame.
    //
    Series.prototype.initEmpty = function () {
        this.index = new empty_iterable_1.EmptyIterable();
        this.values = new empty_iterable_1.EmptyIterable();
        this.pairs = new empty_iterable_1.EmptyIterable();
    };
    Series.prototype.initIterable = function (input, fieldName) {
        if (Sugar.Object.isArray(input)) {
            return new array_iterable_1.ArrayIterable(input);
        }
        else if (Sugar.Object.isFunction(input[Symbol.iterator])) {
            // Assume it's an iterable.
            return input;
        }
        else {
            throw new Error("Expected '" + fieldName + "' field of Series config object to be an array of values or an iterable of values.");
        }
    };
    ;
    //
    // Initialise the Series from a config object.
    //
    Series.prototype.initFromConfig = function (config) {
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
        }
        else if (config.pairs) {
            this.values = new extract_element_iterable_1.ExtractElementIterable(config.pairs, 1);
        }
        else {
            this.values = new empty_iterable_1.EmptyIterable();
        }
        if (config.pairs) {
            this.pairs = config.pairs;
        }
        else {
            this.pairs = new multi_iterable_1.MultiIterable([this.index, this.values]);
        }
        if (config.baked !== undefined) {
            this.isBaked = config.baked;
        }
    };
    /**
     * Get an iterator to enumerate the values of the series.
     * Enumerating the iterator forces lazy evaluation to complete.
     */
    Series.prototype[Symbol.iterator] = function () {
        return this.values[Symbol.iterator]();
    };
    /**
     * Get the index for the series.
     */
    Series.prototype.getIndex = function () {
        return new index_1.Index({ values: this.index });
    };
    /**
     * Apply a new index to the Series.
     *
     * @param newIndex The new index to apply to the Series.
     *
     * @returns Returns a new series with the specified index attached.
     */
    Series.prototype.withIndex = function (newIndex) {
        if (!Sugar.Object.isArray(newIndex)) {
            chai_1.assert.isObject(newIndex, "'Expected 'newIndex' parameter to 'Series.withIndex' to be an array, Series or Index.");
        }
        return new Series({
            values: this.values,
            index: newIndex,
        });
    };
    ;
    /**
     * Resets the index of the series back to the default zero-based sequential integer index.
     *
     * @returns Returns a new series with the index reset to the default zero-based index.
     */
    Series.prototype.resetIndex = function () {
        return new Series({
            values: this.values // Just strip the index.
        });
    };
    /**
    * Extract values from the series as an array.
    * This forces lazy evaluation to complete.
    *
    * @returns Returns an array of values contained within the series.
    */
    Series.prototype.toArray = function () {
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
     * Retreive the index and values from the Series as an array of pairs.
     * Each pair is [index, value].
     * This forces lazy evaluation to complete.
     *
     * @returns Returns an array of pairs that contains the series content. Each pair is a two element array that contains an index and a value.
     */
    Series.prototype.toPairs = function () {
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
     * Generate a new series based by calling the selector function on each value.
     *
     * @param selector - Selector function that transforms each value to create a new series.
     *
     * @returns Returns a new series that has been transformed by the selector function.
     */
    Series.prototype.select = function (selector) {
        chai_1.assert.isFunction(selector, "Expected 'selector' parameter to 'Series.select' function to be a function.");
        return new Series({
            values: new select_iterable_1.SelectIterable(this.values, selector),
            index: this.index,
        });
    };
    ;
    /**
     * Skip a number of values in the series.
     *
     * @param numValues - Number of values to skip.     *
     * @returns Returns a new series or dataframe with the specified number of values skipped.
     */
    Series.prototype.skip = function (numValues) {
        return new Series({
            values: new skip_iterable_1.SkipIterable(this.values, numValues),
            index: new skip_iterable_1.SkipIterable(this.index, numValues),
            pairs: new skip_iterable_1.SkipIterable(this.pairs, numValues),
        });
    };
    /**
     * Format the series for display as a string.
     * This forces lazy evaluation to complete.
     *
     * @returns Generates and returns a string representation of the series or dataframe.
     */
    Series.prototype.toString = function () {
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
     * Forces lazy evaluation to complete and 'bakes' the series into memory.
     *
     * @returns Returns a series that has been 'baked', all lazy evaluation has completed.
     */
    Series.prototype.bake = function () {
        if (this.isBaked) {
            // Already baked.
            return this;
        }
        return new Series({
            pairs: new array_iterable_1.ArrayIterable(this.toPairs()),
            baked: true,
        });
    };
    ;
    /**
     * Inflate the series to a dataframe.
     *
     * @param [selector] Optional selector function that transforms each value in the series to a row in the new dataframe.
     *
     * @returns Returns a new dataframe that has been created from the input series via the 'selector' function.
     */
    Series.prototype.inflate = function () {
        return new dataframe_1.DataFrame({
            values: this.values,
            index: this.index,
            pairs: this.pairs,
        });
    };
    return Series;
}());
exports.Series = Series;
//# sourceMappingURL=series.js.map