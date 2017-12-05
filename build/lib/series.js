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
/**
 * Class that represents a series of indexed values.
 */
var Series = /** @class */ (function () {
    /**
     * Create a series.
     *
     * @param config Defines the values and index for the new series.
     */
    function Series(config) {
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
    // Initialise this Series from an array.
    //
    Series.prototype.initFromArray = function (arr) {
        this.index = new count_iterable_1.CountIterable();
        this.values = new array_iterable_1.ArrayIterable(arr);
        this.pairs = new multi_iterable_1.MultiIterable([this.index, this.values]);
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
            this.values = new array_iterable_1.ArrayIterable([]);
        }
        if (config.pairs) {
            this.pairs = config.pairs;
        }
        else {
            this.pairs = new multi_iterable_1.MultiIterable([this.index, this.values]);
        }
    };
    /**
     * Get an iterator to enumerate the values of the series.
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
     * Each pairs is [index, value].
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
     * Skip a number of values in the series.
     *
     * @param numRows - Number of values to skip.     *
     * @returns Returns a new series or dataframe with the specified number of values skipped.
     */
    Series.prototype.skip = function (numRows) {
        return new Series({});
    };
    return Series;
}());
exports.Series = Series;
//# sourceMappingURL=series.js.map