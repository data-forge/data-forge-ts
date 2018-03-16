import { ArrayIterable }  from './iterables/array-iterable';
import { ArrayIterable as SyncArrayIterable }  from '../iterables/array-iterable';
import { EmptyIterable }  from './iterables/empty-iterable';
import { CountIterable }  from './iterables/count-iterable';
import { MultiIterable }  from './iterables/multi-iterable';
import { SelectIterable }  from './iterables/select-iterable';
import * as Sugar from 'sugar';
import { IAsyncIndex, AsyncIndex } from './async-index';
import { ExtractElementIterable } from './iterables/extract-element-iterable';
import { SkipIterable } from './iterables/skip-iterable';
const Table = require('easy-table');
import { assert } from 'chai';
import { SelectorFn } from '../series';
import { IAsyncSeries, AsyncSeries } from './async-series';
import { ColumnNamesIterable } from './iterables/column-names-iterable';
import * as BabyParse from 'babyparse';
import { IDataFrame, DataFrame } from '../dataframe'

/**
 * DataFrame configuration.
 */
export interface IAsyncDataFrameConfig<IndexT, ValueT> {
    values?: ValueT[] | AsyncIterable<ValueT>,
    index?: IndexT[] | AsyncIterable<IndexT>,
    pairs?: AsyncIterable<[IndexT, ValueT]>,
    columnNames?: string[] | AsyncIterable<string>,
};

/**
 * Interface that represents a dataframe.
 */
export interface IAsyncDataFrame<IndexT, ValueT> extends AsyncIterable<ValueT> {

    /**
     * Get an iterator to enumerate the values of the dataframe.
     */
    [Symbol.asyncIterator](): AsyncIterator<ValueT>;

    /**
     * Get the names of the columns in the dataframe.
     * 
     * @returns Returns an array of the column names in the dataframe.  
     */
    getColumnNames (): Promise<string[]>;

    /**
     * Get the index for the dataframe.
     */
    getIndex (): IAsyncIndex<IndexT>;

    /**
     * Apply a new index to the DataFrame.
     * 
     * @param newIndex The new index to apply to the DataFrame.
     * 
     * @returns Returns a new dataframe with the specified index attached.
     */
    withIndex<NewIndexT> (newIndex: NewIndexT[] | AsyncIterable<NewIndexT>): IAsyncDataFrame<NewIndexT, ValueT>;

    /**
     * Resets the index of the dataframe back to the default zero-based sequential integer index.
     * 
     * @returns Returns a new dataframe with the index reset to the default zero-based index. 
     */
    resetIndex (): IAsyncDataFrame<number, ValueT>;

    /**
     * Retreive a series from a column of the dataframe.
     *
     * @param columnName Specifies the name of the column that contains the series to retreive.
     */
    getSeries<SeriesValueT> (columnName: string): IAsyncSeries<IndexT, SeriesValueT>;

    /**
    * Extract values from the dataframe as an array.
    * This forces lazy evaluation to complete.
    * 
    * @returns Returns an array of values contained within the dataframe. 
    */
    toArray (): Promise<ValueT[]>;

    /**
     * Retreive the index and values from the DataFrame as an array of pairs.
     * Each pairs is [index, value].
     * 
     * @returns Returns an array of pairs that contains the dataframe content. Each pair is a two element array that contains an index and a value.  
     */
    toPairs (): Promise<([IndexT, ValueT])[]>;

    /**
     * Bake the data frame to an array of rows.
     * 
     *  @returns Returns an array of rows. Each row is an array of values in column order.   
     */
    toRows (): Promise<any[][]>;
    
    /**
     * Generate a new dataframe based by calling the selector function on each value.
     *
     * @param selector Selector function that transforms each value to create a new dataframe.
     * 
     * @returns Returns a new dataframe that has been transformed by the selector function.
     */
    select<ToT> (selector: SelectorFn<ValueT, ToT>): IAsyncDataFrame<IndexT, ToT>;
    
    /**
     * Skip a number of values in the dataframe.
     *
     * @param numValues Number of values to skip.
     * @returns Returns a new dataframe or dataframe with the specified number of values skipped.
     */
    skip (numValues: number): IAsyncDataFrame<IndexT, ValueT>;

    /** 
     * Format the dataframe for display as a string.
     * This forces lazy evaluation to complete.
     * 
     * @returns Generates and returns a string representation of the dataframe or dataframe.
     */
    toString (): Promise<string>;

    /**
     * Forces lazy evaluation to complete and 'bakes' the dataframe into memory.
     * 
     * @returns Returns a dataframe that has been 'baked', all lazy evaluation has completed.  
     */
    bake (): Promise<IDataFrame<IndexT, ValueT>>;

    /**
     * Serialize the dataframe to JSON.
     * 
     *  @returns Returns a JSON format string representing the dataframe.   
     */
    toJSON (): Promise<string>;

    /**
     * Serialize the dataframe to CSV.
     * 
     *  @returns Returns a CSV format string representing the dataframe.   
     */
    toCSV (): Promise<string>;
}

/**
 * Class that represents a dataframe of indexed values.
 */
export class AsyncDataFrame<IndexT, ValueT> implements IAsyncDataFrame<IndexT, ValueT> {

    private index: AsyncIterable<IndexT>
    private values: AsyncIterable<ValueT>;
    private pairs: AsyncIterable<[IndexT, ValueT]>;
    private columnNames: AsyncIterable<string>;

    //
    // Initialise this DataFrame from an array.
    //
    private initFromArray(arr: ValueT[]): void {
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

    private initIterable<T>(input: T[] | AsyncIterable<T>, fieldName: string): AsyncIterable<T> {
        if (Sugar.Object.isArray(input)) {
            return new ArrayIterable<T>(input);
        }
        else if (Sugar.Object.isFunction(input[Symbol.asyncIterator])) {
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
    private initFromConfig(config: IAsyncDataFrameConfig<IndexT, ValueT>): void {

        if (config.columnNames) {
            this.columnNames = this.initIterable<string>(config.columnNames, 'columnNames');
        }

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
            if (!this.columnNames) {
                this.columnNames = new ColumnNamesIterable(this.values);
            }
        }
        else if (config.pairs) {
            this.values = new ExtractElementIterable(config.pairs, 1);
            if (!this.columnNames) {
                this.columnNames = new ColumnNamesIterable(this.values);
            }
        }
        else {
            this.values = new EmptyIterable();
            if (!this.columnNames) {
                this.columnNames = new EmptyIterable();
            }
        }

        if (config.pairs) {
            this.pairs = config.pairs;
        }
        else {
            this.pairs = new MultiIterable([this.index, this.values]);
        }
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
    constructor(config?: ValueT[] | IAsyncDataFrameConfig<IndexT, ValueT>) {
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
    [Symbol.asyncIterator](): AsyncIterator<any> {
        return this.values[Symbol.asyncIterator]();
    }

    /**
     * Get the names of the columns in the dataframe.
     * 
     * @returns Returns an array of the column names in the dataframe.  
     */
    async getColumnNames (): Promise<string[]> {
        
        var columnNames = [];
        for await (var columnName of this.columnNames) {
            columnNames.push(columnName);
        }
        
        return columnNames;
    }
    
    /**
     * Get the index for the dataframe.
     */
    getIndex (): IAsyncIndex<IndexT> {
        return new AsyncIndex<IndexT>({ values: this.index });
    }

    /**
     * Apply a new index to the DataFrame.
     * 
     * @param newIndex The new index to apply to the DataFrame.
     * 
     * @returns Returns a new dataframe or dataframe with the specified index attached.
     */
    withIndex<NewIndexT> (newIndex: NewIndexT[] | AsyncIterable<NewIndexT>): IAsyncDataFrame<NewIndexT, ValueT> {

        if (!Sugar.Object.isArray(newIndex)) {
            assert.isObject(newIndex, "'Expected 'newIndex' parameter to 'DataFrame.withIndex' to be an array, DataFrame or Index.");
        }

        return new AsyncDataFrame<NewIndexT, ValueT>({
            values: this.values,
            index: newIndex,
        });
    }

    /**
     * Resets the index of the dataframe back to the default zero-based sequential integer index.
     * 
     * @returns Returns a new dataframe with the index reset to the default zero-based index. 
     */
    resetIndex (): IAsyncDataFrame<number, ValueT> {
        return new AsyncDataFrame<number, ValueT>({
            values: this.values // Just strip the index.
        });
    }
    
    /**
     * Retreive a series from a column of the dataframe.
     *
     * @param columnName Specifies the name of the column that contains the series to retreive.
     */
    getSeries<SeriesValueT> (columnName: string): IAsyncSeries<IndexT, SeriesValueT> {

        assert.isString(columnName, "Expected 'columnName' parameter to 'DataFrame.getSeries' function to be a string that specifies the name of the column to retreive.");

        return new AsyncSeries<IndexT, SeriesValueT>({
            values: new SelectIterable<ValueT, SeriesValueT>(
                this.values, 
                (row: any) => row[columnName],
            ),
            index: this.index,
        });   
    }
    
    /**
    * Extract values from the dataframe as an array.
    * This forces lazy evaluation to complete.
    * 
    * @returns Returns an array of values contained within the dataframe. 
    */
    async toArray (): Promise<any[]> {
        let values = [];
        for await (const value of this.values) {
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
    async toPairs (): Promise<([IndexT, ValueT])[]> {
        let pairs = [];
        for await (const pair of this.pairs) {
            pairs.push(pair);
        }
        return pairs;
    }

    /**
     * Bake the data frame to an array of rows.
     * 
     *  @returns Returns an array of rows. Each row is an array of values in column order.   
     */
    async toRows (): Promise<any[][]> {

        const values = await this.toArray();
        const columnNames = await this.getColumnNames();
        let rows = [];
        for (const value of values) {
            let row = [];
            for (let columnIndex = 0; columnIndex < columnNames.length; ++columnIndex) {
                row.push((<any>value)[columnNames[columnIndex]]);
            }

            rows.push(row);
        }
        
        return rows;
    }

    /**
     * Generate a new dataframe based by calling the selector function on each value.
     *
     * @param selector Selector function that transforms each value to create a new dataframe.
     * 
     * @returns Returns a new dataframe that has been transformed by the selector function.
     */
    select<ToT> (selector: SelectorFn<ValueT, ToT>): IAsyncDataFrame<IndexT, ToT> {
        assert.isFunction(selector, "Expected 'selector' parameter to 'DataFrame.select' function to be a function.");

        return new AsyncDataFrame({
            values: new SelectIterable(this.values, selector),
            index: this.index,
        });
    }

    /**
     * Skip a number of values in the dataframe.
     *
     * @param numValues - Number of values to skip.     * 
     * @returns Returns a new dataframe or dataframe with the specified number of values skipped. 
     */
    skip (numValues: number): IAsyncDataFrame<IndexT, ValueT> {
        return new AsyncDataFrame<IndexT, ValueT>({
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
    async toString (): Promise<string> {

        const pairs = await this.toPairs();
        const columnNames = await this.getColumnNames();
        const header = ["__index__"].concat(columnNames);

        let table = new Table();
        for (const pair of pairs) {
            const index = pair[0];
            const value = pair[1] as any;
            table.cell(header[0], index);
            for (let columnIndex = 0; columnIndex < columnNames.length; ++columnIndex) {
                const columnName = header[columnIndex+1];
                table.cell(columnName, value[columnName]);
            }
            table.newRow();
        }

        return table.toString();
    }

    /**
     * Forces lazy evaluation to complete and 'bakes' the dataframe into memory.
     * 
     * @returns Returns a dataframe that has been 'baked', all lazy evaluation has completed.  
     */
    async bake (): Promise<IDataFrame<IndexT, ValueT>> {

        var pairs = await this.toPairs();

        return new DataFrame({
            pairs: new SyncArrayIterable(pairs),
        });
    }

    /**
     * Serialize the dataframe to JSON.
     * 
     *  @returns Returns a JSON format string representing the dataframe.   
     */
    async toJSON (): Promise<string> {
        return JSON.stringify(await this.toArray(), null, 4);
    }

    /**
     * Serialize the dataframe to CSV.
     * 
     *  @returns Returns a CSV format string representing the dataframe.   
     */
    async toCSV (): Promise<string> {

        const rows = await this.toRows();
        const data = [await this.getColumnNames()].concat(rows);
        return BabyParse.unparse(data);
    }
}

