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
import { ISeries, Series, SelectorFn } from './series';
import { ColumnNamesIterable } from './iterables/column-names-iterable';

/**
 * Interface that represents a dataframe.
 */
export interface IDataFrame extends Iterable<any> {

    /**
     * Get an iterator to enumerate the values of the dataframe.
     */
    [Symbol.iterator](): Iterator<any>;

    /**
     * Get the names of the columns in the dataframe.
     * 
     * @returns Returns an array of the column names in the dataframe.  
     */
    getColumnNames (): string[];

    /**
     * Get the index for the dataframe.
     */
    getIndex (): IIndex;

    /**
     * Apply a new index to the DataFrame.
     * 
     * @param newIndex The new index to apply to the DataFrame.
     * 
     * @returns Returns a new dataframe with the specified index attached.
     */
    withIndex (newIndex: any): IDataFrame;

    /**
     * Resets the index of the dataframe back to the default zero-based sequential integer index.
     * 
     * @returns Returns a new dataframe with the index reset to the default zero-based index. 
     */
    resetIndex (): IDataFrame;

    /**
    * Extract values from the dataframe as an array.
    * This forces lazy evaluation to complete.
    * 
    * @returns Returns an array of values contained within the dataframe. 
    */
    toArray (): any[];

    /**
     * Retreive the index and values from the DataFrame as an array of pairs.
     * Each pairs is [index, value].
     * 
     * @returns Returns an array of pairs that contains the dataframe content. Each pair is a two element array that contains an index and a value.  
     */
    toPairs (): (any[])[];

    /**
     * Generate a new dataframe based by calling the selector function on each value.
     *
     * @param selector Selector function that transforms each value to create a new dataframe.
     * 
     * @returns Returns a new dataframe that has been transformed by the selector function.
     */
    select (selector: SelectorFn): IDataFrame;
    
    /**
     * Skip a number of values in the dataframe.
     *
     * @param numValues - Number of values to skip.     * 
     * @returns Returns a new dataframe or dataframe with the specified number of values skipped. 
     */
    skip (numValues: number): IDataFrame;

    /** 
     * Format the dataframe for display as a string.
     * This forces lazy evaluation to complete.
     * 
     * @returns Generates and returns a string representation of the dataframe or dataframe.
     */
    toString (): string;

    /**
     * Forces lazy evaluation to complete and 'bakes' the dataframe into memory.
     * 
     * @returns Returns a dataframe that has been 'baked', all lazy evaluation has completed.  
     */
    bake (): IDataFrame;
}

/**
 * Class that represents a dataframe of indexed values.
 */
export class DataFrame implements IDataFrame {

    private index: Iterable<any>
    private values: Iterable<any>;
    private pairs: Iterable<any>;
    private columnNames: Iterable<string>;

    //
    // Records if a dataframe is baked into memory.
    //
    private isBaked: boolean = false;

    //
    // Initialise this DataFrame from an array.
    //
    private initFromArray(arr: any[]): void {
        this.index = new CountIterable();
        this.values = new ArrayIterable(arr);
        this.pairs = new MultiIterable([this.index, this.values]);
        if (arr.length > 0) {
            this.columnNames = new ArrayIterable(Object.keys(arr[0]));
        }
        else {
            this.columnNames = new EmptyIterable();
        }
    }

    //
    // Initialise an empty DataFrame.
    //
    private initEmpty(): void {
        this.index = new EmptyIterable();
        this.values = new EmptyIterable();
        this.pairs = new EmptyIterable();
        this.columnNames = new EmptyIterable();
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
            throw new Error("Expected '" + fieldName + "' field of DataFrame config object to be an array of values or an iterable of values.");
        }
    };

    //
    // Initialise the DataFrame from a config object.
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
            this.columnNames = new ColumnNamesIterable(this.values);
        }
        else if (config.pairs) {
            this.values = new ExtractElementIterable(config.pairs, 1);
            this.columnNames = new ColumnNamesIterable(this.values);
        }
        else {
            this.values = new EmptyIterable();
            this.columnNames = new EmptyIterable();
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
     * Create a dataframe.
     * 
     * @param config This can be either an array or a config object the sets the values that the dataframe contains.
     * If it is an array it specifies the values that the dataframe contains.
     * If it is a config object that can contain:
     *      values: Optional array or iterable of values that the dataframe contains.
     *      index: Optional array or iterable of values that index the dataframe, defaults to a dataframe of integers from 1 and counting upward.
     *      pairs: Optional iterable of pairs (index and value) that the dataframe contains.
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
            this.initEmpty();
        }
    }

    /**
     * Get an iterator to enumerate the values of the dataframe.
     * Enumerating the iterator forces lazy evaluation to complete.
     */
    [Symbol.iterator](): Iterator<any> {
        return this.values[Symbol.iterator]();
    }

    /**
     * Get the names of the columns in the dataframe.
     * 
     * @returns Returns an array of the column names in the dataframe.  
     */
    getColumnNames (): string[] {
        return Array.from(this.columnNames);
    }
    
    /**
     * Get the index for the dataframe.
     */
    getIndex (): IIndex {
        return new Index({ values: this.index });
    }

    /**
     * Apply a new index to the DataFrame.
     * 
     * @param newIndex The new index to apply to the DataFrame.
     * 
     * @returns Returns a new dataframe or dataframe with the specified index attached.
     */
    withIndex (newIndex: any): IDataFrame {

        if (!Sugar.Object.isArray(newIndex)) {
            assert.isObject(newIndex, "'Expected 'newIndex' parameter to 'DataFrame.withIndex' to be an array, DataFrame or Index.");
        }

        return new DataFrame({
            values: this.values,
            index: newIndex,
        });
    };

    /**
     * Resets the index of the dataframe back to the default zero-based sequential integer index.
     * 
     * @returns Returns a new dataframe with the index reset to the default zero-based index. 
     */
    resetIndex (): IDataFrame {
        return new DataFrame({
            values: this.values // Just strip the index.
        });
    }
    
    /**
    * Extract values from the dataframe as an array.
    * This forces lazy evaluation to complete.
    * 
    * @returns Returns an array of values contained within the dataframe. 
    */
    toArray (): any[] {
        var values = [];
        for (const value of this.values) {
            values.push(value);
        }
        return values;
    }

    /**
     * Retreive the index and values from the DataFrame as an array of pairs.
     * Each pair is [index, value].
     * This forces lazy evaluation to complete.
     * 
     * @returns Returns an array of pairs that contains the dataframe content. Each pair is a two element array that contains an index and a value.  
     */
    toPairs (): (any[])[] {
        var pairs = [];
        for (const pair of this.pairs) {
            pairs.push(pair);
        }
        return pairs;
    }

    /**
     * Generate a new dataframe based by calling the selector function on each value.
     *
     * @param selector Selector function that transforms each value to create a new dataframe.
     * 
     * @returns Returns a new dataframe that has been transformed by the selector function.
     */
    select (selector: SelectorFn): IDataFrame {
        assert.isFunction(selector, "Expected 'selector' parameter to 'DataFrame.select' function to be a function.");

        return new DataFrame({
            values: new SelectIterable(this.values, selector),
            index: this.index,
        });
    };

    /**
     * Skip a number of values in the dataframe.
     *
     * @param numValues - Number of values to skip.     * 
     * @returns Returns a new dataframe or dataframe with the specified number of values skipped. 
     */
    skip (numValues: number): IDataFrame {
        return new DataFrame({
            values: new SkipIterable(this.values, numValues),
            index: new SkipIterable(this.index, numValues),
            pairs: new SkipIterable(this.pairs, numValues),
        });
    }

    /** 
     * Format the dataframe for display as a string.
     * This forces lazy evaluation to complete.
     * 
     * @returns Generates and returns a string representation of the dataframe or dataframe.
     */
    toString (): string {

        var columnNames = this.getColumnNames();
        var header = ["__index__"].concat(columnNames);
        var rows = this.toPairs();

        var table = new Table();
        rows.forEach(function (row, rowIndex) {
            var index = row[0];
            var value = row[1];
            table.cell(header[0], index);
            columnNames.forEach((columnName, columnIndex) => {
                table.cell(header[columnIndex+1], value[columnName]);
            });
            table.newRow();
        });

        return table.toString();
    };

    /**
     * Forces lazy evaluation to complete and 'bakes' the dataframe into memory.
     * 
     * @returns Returns a dataframe that has been 'baked', all lazy evaluation has completed.  
     */
    bake (): IDataFrame {

        if (this.isBaked) {
            // Already baked.
            return this;
        }

        return new DataFrame({
            pairs: new ArrayIterable(this.toPairs()),
            baked: true,
        });
    };
}

