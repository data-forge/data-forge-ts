import { ArrayIterable }  from './iterables/array-iterable';
import { CountIterable }  from './iterables/count-iterable';
import { MultiIterable }  from './iterables/multi-iterable';
import * as Sugar from 'sugar';
import { IIndex, Index } from './index';
import { ExtractElementIterable } from './iterables/extract-element-iterable';
import { SkipIterable } from './iterables/skip-iterable';
var Table = require('easy-table');

/**
 * Interface that represents a series of indexed values.
 */
export interface ISeries extends Iterable<any> {

    /**
     * Get an iterator to enumerate the values of the series.
     */
    [Symbol.iterator](): Iterator<any>;

    /**
     * Get the index for the series.
     */
    getIndex (): IIndex;

    /**
    * Extract values from the series as an array.
    * This forces lazy evaluation to complete.
    * 
    * @returns Returns an array of values contained within the series. 
    */
    toArray (): any[];

    /**
     * Retreive the index and values from the Series as an array of pairs.
     * Each pairs is [index, value].
     * 
     * @returns Returns an array of pairs that contains the series content. Each pair is a two element array that contains an index and a value.  
     */
    toPairs (): (any[])[];

    /**
     * Skip a number of values in the series.
     *
     * @param numValues - Number of values to skip.     * 
     * @returns Returns a new series or dataframe with the specified number of values skipped. 
     */
    skip (numValues: number): ISeries;

    /** 
     * Format the series for display as a string.
     * This forces lazy evaluation to complete.
     * 
     * @returns Generates and returns a string representation of the series or dataframe.
     */
    toString (): string;

    /**
     * Forces lazy evaluation to complete and 'bakes' the series into memory.
     * 
     * @returns Returns a series that has been 'baked', all lazy evaluation has completed.  
     */
    bake (): ISeries;
}

/**
 * Class that represents a series of indexed values.
 */
export class Series implements ISeries {

    private index: Iterable<any>
    private values: Iterable<any>;
    private pairs: Iterable<any>;

    //
    // Records if a series is baked into memory.
    //
    private isBaked: boolean = false;

    //
    // Initialise this Series from an array.
    //
    private initFromArray(arr: any[]): void {
        this.index = new CountIterable();
        this.values = new ArrayIterable(arr);
        this.pairs = new MultiIterable([this.index, this.values]);
    }

    private initIterable(input: any, fieldName: string): Iterable<any> {
        if (Sugar.Object.isArray(input)) {
            return new ArrayIterable(input);
        }
        else if (Sugar.Object.isFunction(input[Symbol.iterator])) {
            // Assume it's an iterable.
            return input;
        }
        else {
            throw new Error("Expected '" + fieldName + "' field of Series config object to be an array of values or an iterable of values.");
        }
    };

    //
    // Initialise the Series from a config object.
    //
    private initFromConfig(config: any): void {

        if (config.index) {
            this.index = this.initIterable(config.index, 'index');
        }
        else if (config.pairs) {
            this.index = new ExtractElementIterable(config.pairs, 0);
        }
        else {
            this.index = new CountIterable();
        }

        if (config.values) {
            this.values = this.initIterable(config.values, 'values');
        }
        else if (config.pairs) {
            this.values = new ExtractElementIterable(config.pairs, 1);
        }
        else {
            this.values = new ArrayIterable([]);
        }

        if (config.pairs) {
            this.pairs = config.pairs;
        }
        else {
            this.pairs = new MultiIterable([this.index, this.values]);
        }

        this.isBaked = config.baked;
    }

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
    constructor(config?: any) {
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

    /**
     * Get an iterator to enumerate the values of the series.
     * Enumerating the iterator forces lazy evaluation to complete.
     */
    [Symbol.iterator](): Iterator<any> {
        return this.values[Symbol.iterator]();
    }

    /**
     * Get the index for the series.
     */
    getIndex (): IIndex {
        return new Index({ values: this.index });
    }

    /**
    * Extract values from the series as an array.
    * This forces lazy evaluation to complete.
    * 
    * @returns Returns an array of values contained within the series. 
    */
    toArray (): any[] {
        var values = [];
        for (const value of this.values) {
            values.push(value);
        }
        return values;
    }

    /**
     * Retreive the index and values from the Series as an array of pairs.
     * Each pair is [index, value].
     * This forces lazy evaluation to complete.
     * 
     * @returns Returns an array of pairs that contains the series content. Each pair is a two element array that contains an index and a value.  
     */
    toPairs (): (any[])[] {
        var pairs = [];
        for (const pair of this.pairs) {
            pairs.push(pair);
        }
        return pairs;
    }

    /**
     * Skip a number of values in the series.
     *
     * @param numValues - Number of values to skip.     * 
     * @returns Returns a new series or dataframe with the specified number of values skipped. 
     */
    skip (numValues: number): ISeries {
        return new Series({
            values: new SkipIterable(this.values, numValues),
            index: new SkipIterable(this.index, numValues),
            pairs: new SkipIterable(this.pairs, numValues),
        });
    }

    /** 
     * Format the series for display as a string.
     * This forces lazy evaluation to complete.
     * 
     * @returns Generates and returns a string representation of the series or dataframe.
     */
    toString (): string {

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

    /**
     * Forces lazy evaluation to complete and 'bakes' the series into memory.
     * 
     * @returns Returns a series that has been 'baked', all lazy evaluation has completed.  
     */
    bake (): ISeries {

        if (this.isBaked) {
            // Already baked.
            return this;
        }

        return new Series({
            pairs: new ArrayIterable(this.toPairs()),
            baked: true,
        });
    };
}

