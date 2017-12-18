import { ArrayIterable }  from './iterables/array-iterable';
import { EmptyIterable }  from './iterables/empty-iterable';
import { CountIterable }  from './iterables/count-iterable';
import { MultiIterable }  from './iterables/multi-iterable';
import { SelectIterable }  from './iterables/select-iterable';
import * as Sugar from 'sugar';
import { IIndex, Index } from './index';
import { ExtractElementIterable } from './iterables/extract-element-iterable';
import { SkipIterable } from './iterables/skip-iterable';
var Table = require('easy-table');
import { assert } from 'chai';
import { IDataFrame, DataFrame } from './dataframe';

/**
 * Series configuration.
 */
export interface ISeriesConfig<IndexT, ValueT> {
    values?: ValueT[] | Iterable<ValueT>,
    index?: IndexT[] | Iterable<IndexT>,
    pairs?: Iterable<[IndexT, ValueT]>
    baked?: boolean,
};

/**
 * A selector function. Transforms a value into another kind of value.
 */
export type SelectorFn<FromT, ToT> = (value: FromT, index: number) => ToT;

/**
 * Interface that represents a series of indexed values.
 */
export interface ISeries<IndexT = number, ValueT = any> extends Iterable<ValueT> {

    /**
     * Get an iterator to enumerate the values of the series.
     */
    [Symbol.iterator](): Iterator<ValueT>;

    /**
     * Get the index for the series.
     */
    getIndex (): IIndex<IndexT>;

    /**
     * Apply a new index to the Series.
     * 
     * @param newIndex The new index to apply to the Series.
     * 
     * @returns Returns a new series with the specified index attached.
     */
    withIndex<NewIndexT> (newIndex: NewIndexT[] | Iterable<NewIndexT>): ISeries<NewIndexT, ValueT>;

    /**
     * Resets the index of the series back to the default zero-based sequential integer index.
     * 
     * @returns Returns a new series with the index reset to the default zero-based index. 
     */
    resetIndex (): ISeries<number, ValueT>;

    /**
    * Extract values from the series as an array.
    * This forces lazy evaluation to complete.
    * 
    * @returns Returns an array of values contained within the series. 
    */
    toArray (): ValueT[];

    /**
     * Retreive the index and values from the Series as an array of pairs.
     * Each pairs is [index, value].
     * 
     * @returns Returns an array of pairs that contains the series content. Each pair is a two element array that contains an index and a value.  
     */
    toPairs (): ([IndexT,ValueT])[];

    /**
     * Generate a new series based by calling the selector function on each value.
     *
     * @param selector - Selector function that transforms each value to create a new series or dataframe.
     * 
     * @returns Returns a new series that has been transformed by the selector function.
     */
    select<ToT> (selector: SelectorFn<ValueT, ToT>): ISeries<IndexT, ToT>;
    
    /**
     * Skip a number of values in the series.
     *
     * @param numValues Number of values to skip.
     * @returns Returns a new series with the specified number of values skipped. 
     */
    skip (numValues: number): ISeries<IndexT, ValueT>;

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
    bake (): ISeries<IndexT, ValueT>;

    /** 
     * Inflate the series to a dataframe.
     *
     * @param [selector] Optional selector function that transforms each value in the series to a row in the new dataframe.
     *
     * @returns Returns a new dataframe that has been created from the input series via the 'selector' function.
     */
    inflate (): IDataFrame<IndexT, ValueT>;
}

/**
 * Class that represents a series of indexed values.
 */
export class Series<IndexT = number, ValueT = any> implements ISeries<IndexT, ValueT> {

    private index: Iterable<IndexT>
    private values: Iterable<ValueT>;
    private pairs: Iterable<[IndexT, ValueT]>;

    //
    // Records if a series is baked into memory.
    //
    private isBaked: boolean = false;

    //
    // Initialise this Series from an array.
    //
    private initFromArray(arr: ValueT[]): void {
        this.index = new CountIterable();
        this.values = new ArrayIterable(arr);
        this.pairs = new MultiIterable([this.index, this.values]);
    }

    //
    // Initialise an empty DataFrame.
    //
    private initEmpty(): void {
        this.index = new EmptyIterable();
        this.values = new EmptyIterable();
        this.pairs = new EmptyIterable();
    }

    private initIterable<T>(input: T[] | Iterable<T>, fieldName: string): Iterable<T> {
        if (Sugar.Object.isArray(input)) {
            return new ArrayIterable<T>(input);
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
    private initFromConfig(config: ISeriesConfig<IndexT, ValueT>): void {

        if (config.index) {
            this.index = this.initIterable<IndexT>(config.index, 'index');
        }
        else if (config.pairs) {
            this.index = new ExtractElementIterable(config.pairs, 0);
        }
        else {
            this.index = new CountIterable();
        }

        if (config.values) {
            this.values = this.initIterable<ValueT>(config.values, 'values');
        }
        else if (config.pairs) {
            this.values = new ExtractElementIterable(config.pairs, 1);
        }
        else {
            this.values = new EmptyIterable();
        }

        if (config.pairs) {
            this.pairs = config.pairs;
        }
        else {
            this.pairs = new MultiIterable([this.index, this.values]);
        }

        if (config.baked !== undefined) {
            this.isBaked = config.baked;
        }
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
    constructor(config?: ValueT[] | ISeriesConfig<IndexT, ValueT>) {
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

    /**
     * Get an iterator to enumerate the values of the series.
     * Enumerating the iterator forces lazy evaluation to complete.
     */
    [Symbol.iterator](): Iterator<ValueT> {
        return this.values[Symbol.iterator]();
    }

    /**
     * Get the index for the series.
     */
    getIndex (): IIndex<IndexT> {
        return new Index<IndexT>({ values: this.index });
    }

    /**
     * Apply a new index to the Series.
     * 
     * @param newIndex The new index to apply to the Series.
     * 
     * @returns Returns a new series with the specified index attached.
     */
    withIndex<NewIndexT> (newIndex: IIndex<NewIndexT> | ISeries<any, NewIndexT> | NewIndexT[]): ISeries<NewIndexT, ValueT> {

        if (!Sugar.Object.isArray(newIndex)) {
            assert.isObject(newIndex, "'Expected 'newIndex' parameter to 'Series.withIndex' to be an array, Series or Index.");
        }

        return new Series<NewIndexT, ValueT>({
            values: this.values,
            index: newIndex,
        });
    };

    /**
     * Resets the index of the series back to the default zero-based sequential integer index.
     * 
     * @returns Returns a new series with the index reset to the default zero-based index. 
     */
    resetIndex (): ISeries<number, ValueT> {
        return new Series<number, ValueT>({
            values: this.values // Just strip the index.
        });
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
            if (value !== undefined) {
                values.push(value);
            }
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
    toPairs (): ([IndexT, ValueT])[] {
        var pairs: [IndexT, ValueT][] = [];
        for (const pair of this.pairs) {
            if (pair[1] != undefined) {
                pairs.push(pair);
            }
        }
        return pairs;
    }

    /**
     * Generate a new series based by calling the selector function on each value.
     *
     * @param selector - Selector function that transforms each value to create a new series.
     * 
     * @returns Returns a new series that has been transformed by the selector function.
     */
    select<ToT> (selector: SelectorFn<ValueT, ToT>): ISeries<IndexT, ToT> {
        assert.isFunction(selector, "Expected 'selector' parameter to 'Series.select' function to be a function.");

        return new Series({
            values: new SelectIterable(this.values, selector),
            index: this.index,
        });
    };

    /**
     * Skip a number of values in the series.
     *
     * @param numValues - Number of values to skip.     * 
     * @returns Returns a new series or dataframe with the specified number of values skipped. 
     */
    skip (numValues: number): ISeries<IndexT, ValueT> {
        return new Series<IndexT, ValueT>({
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
    bake (): ISeries<IndexT, ValueT> {

        if (this.isBaked) {
            // Already baked.
            return this;
        }

        return new Series<IndexT, ValueT>({
            pairs: new ArrayIterable(this.toPairs()),
            baked: true,
        });
    };

    /** 
     * Inflate the series to a dataframe.
     *
     * @param [selector] Optional selector function that transforms each value in the series to a row in the new dataframe.
     *
     * @returns Returns a new dataframe that has been created from the input series via the 'selector' function.
     */
    inflate (): IDataFrame<IndexT, ValueT> {

        return new DataFrame<IndexT, ValueT>({
            values: this.values,
            index: this.index,
            pairs: this.pairs,
        });
    }

}