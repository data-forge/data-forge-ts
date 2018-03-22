import { ArrayIterable }  from './iterables/array-iterable';
import { EmptyIterable }  from './iterables/empty-iterable';
import { CountIterable }  from './iterables/count-iterable';
import { MultiIterable }  from './iterables/multi-iterable';
import { SelectIterable }  from './iterables/select-iterable';
import { CsvRowsIterable }  from './iterables/csv-rows-iterable';
import * as Sugar from 'sugar';
import { IIndex, Index } from './index';
import { ExtractElementIterable } from './iterables/extract-element-iterable';
import { SkipIterable } from './iterables/skip-iterable';
const Table = require('easy-table');
import { assert } from 'chai';
import { ISeries, Series, SelectorFn, toMap } from './series';
import { ColumnNamesIterable } from './iterables/column-names-iterable';
import * as BabyParse from 'babyparse';

/**
 * DataFrame configuration.
 */
export interface IDataFrameConfig<IndexT, ValueT> {
    values?: ValueT[] | Iterable<ValueT>,
    index?: IndexT[] | Iterable<IndexT>,
    pairs?: Iterable<[IndexT, ValueT]>,
    columnNames?: string[] | Iterable<string>,
    baked?: boolean,
    considerAllRows?: boolean,
    columns?: any,
};

/**
 * A selector function that can select a series from a dataframe.
 */
export type SeriesSelectorFn<IndexT, DataFrameValueT, SeriesValueT> = (dataFrame: IDataFrame<IndexT, DataFrameValueT>) => ISeries<IndexT, SeriesValueT>;

/*
 * A function that generates a dataframe content object.
 * Used to make it easy to create lazy evaluated dataframe.
 */
export type DataFrameConfigFn<IndexT, ValueT> = () => IDataFrameConfig<IndexT, ValueT>;

//
// Helper function to only return distinct items.
//
function makeDistinct<ItemT, KeyT>(items: Iterable<ItemT>, selector?: (item: ItemT) => KeyT): ItemT[] {
    let set: any = {};
    let output: any[] = [];
    for (const item of items) {
        var key = selector && selector(item) || item;
        if (!set[key]) {
            // Haven't yet seen this key.
            set[key] = true;
            output.push(item);
        }
    }

    return output;
}

/**
 * Interface that represents a dataframe containing a sequence of indexed rows of data.
 */
export interface IDataFrame<IndexT = number, ValueT = any> extends Iterable<ValueT> {

    /**
     * Get an iterator to enumerate the values of the dataframe.
     */
    [Symbol.iterator](): Iterator<ValueT>;

    /**
     * Get the names of the columns in the dataframe.
     * 
     * @returns Returns an array of the column names in the dataframe.  
     */
    getColumnNames (): string[];

    /**
     * Get the index for the dataframe.
     */
    getIndex (): IIndex<IndexT>;

    /**
     * Apply a new index to the DataFrame.
     * 
     * @param newIndex The new index to apply to the DataFrame.
     * 
     * @returns Returns a new dataframe with the specified index attached.
     */
    withIndex<NewIndexT> (newIndex: NewIndexT[] | Iterable<NewIndexT>): IDataFrame<NewIndexT, ValueT>;

    /**
     * Resets the index of the dataframe back to the default zero-based sequential integer index.
     * 
     * @returns Returns a new dataframe with the index reset to the default zero-based index. 
     */
    resetIndex (): IDataFrame<number, ValueT>;
    
    /**
     * Retreive a series from a column of the dataframe.
     *
     * @param columnName Specifies the name of the column that contains the series to retreive.
     */
    getSeries<SeriesValueT> (columnName: string): ISeries<IndexT, SeriesValueT>;

    /**
     * Returns true if the column with the requested name exists in the dataframe.
     *
     * @param columnName - Name of the column to check.
     */
    hasSeries (columnName: string): boolean;

    /**
     * 
     * Verify the existance of a column and return it.
     * Throws an exception if the column doesn't exist.
     *
     * @param columnName - Name or index of the column to retreive.
     */
    expectSeries<SeriesValueT> (columnName: string): ISeries<IndexT, SeriesValueT>;

    /**
     * Create a new dataframe with an additional column specified by the passed-in series.
     *
     * @param columnNameOrSpec - The name of the column to add or replace.
     * @param [series] - When columnNameOrSpec is a string that identifies the column to add, this specifies the Series to add to the data-frame or a function that produces a series (given a dataframe).
     *
     * @returns Returns a new dataframe replacing or adding a particular named column.
     */
    withSeries<SeriesValueT> (columnNameOrSpec: string | any, series?: ISeries<IndexT, SeriesValueT> | SeriesSelectorFn<IndexT, ValueT, SeriesValueT>): IDataFrame<IndexT, ValueT>;
    
    /**
     * Add a series if it doesn't already exist.
     * 
     * @param columnNameOrSpec - The name of the series to add or a column spec that defines the new column.
     * @param series - The series to add to the dataframe. Can also be a function that returns the series.
     * 
     * @returns Returns a new dataframe with the specified series added, if the series didn't already exist. Otherwise if the requested series already exists the same dataframe is returned.  
     */
    ensureSeries<SeriesValueT> (columnNameOrSpec: string | any, series?: ISeries<IndexT, SeriesValueT> | SeriesSelectorFn<IndexT, ValueT, SeriesValueT>): IDataFrame<IndexT, ValueT>;

    /**
    * Extract values from the dataframe as an array.
    * This forces lazy evaluation to complete.
    * 
    * @returns Returns an array of values contained within the dataframe. 
    */
    toArray (): ValueT[];

    /**
     * Retreive the index and values from the DataFrame as an array of pairs.
     * Each pairs is [index, value].
     * 
     * @returns Returns an array of pairs that contains the dataframe content. Each pair is a two element array that contains an index and a value.  
     */
    toPairs (): ([IndexT, ValueT])[];

    /**
     * Bake the data frame to an array of rows.
     * 
     *  @returns Returns an array of rows. Each row is an array of values in column order.   
     */
    toRows (): any[][];
    
    /**
     * Generate a new dataframe based by calling the selector function on each value.
     *
     * @param selector Selector function that transforms each value to create a new dataframe.
     * 
     * @returns Returns a new dataframe that has been transformed by the selector function.
     */
    select<ToT> (selector: SelectorFn<ValueT, ToT>): IDataFrame<IndexT, ToT>;
    
    /**
     * Skip a number of values in the dataframe.
     *
     * @param numValues - Number of values to skip.     * 
     * @returns Returns a new dataframe or dataframe with the specified number of values skipped. 
     */
    skip (numValues: number): IDataFrame<IndexT, ValueT>;

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
    bake (): IDataFrame<IndexT, ValueT>;

    /**
     * Serialize the dataframe to JSON.
     * 
     *  @returns Returns a JSON format string representing the dataframe.   
     */
    toJSON (): string;

    /**
     * Serialize the dataframe to CSV.
     * 
     *  @returns Returns a CSV format string representing the dataframe.   
     */
    toCSV (): string;
}

//
// Represents the contents of a dataframe.
//
interface IDataFrameContent<IndexT, ValueT> {
    index: Iterable<IndexT>;
    values: Iterable<ValueT>;
    pairs: Iterable<[IndexT, ValueT]>;

    columnNames: string[] | Iterable<string>,
    isBaked: boolean,
}

/**
 * Class that represents a dataframe containing a sequence of indexed rows of data.
 */
export class DataFrame<IndexT = number, ValueT = any> implements IDataFrame<IndexT, ValueT> {

    //
    // Function to lazy evaluate the configuration of the dataframe.
    //
    private configFn: DataFrameConfigFn<IndexT, ValueT> | null = null;
    
    //
    // The content of the dataframe.
    // When this is null it means the dataframe is yet to be lazy initialised.
    //
    private content: IDataFrameContent<IndexT, ValueT> | null = null;
    
    private static readonly defaultCountIterable = new CountIterable();
    private static readonly defaultEmptyIterable = new EmptyIterable();
    
    //
    // Initialise dataframe content from an array of values.
    //
    private static initFromArray<IndexT, ValueT>(arr: ValueT[]): IDataFrameContent<IndexT, ValueT> {
        const columnNames = arr.length > 0 ? Object.keys(arr[0]) : [];
        return {
            index: DataFrame.defaultCountIterable,
            values: arr,
            pairs: new MultiIterable([DataFrame.defaultCountIterable, arr]),
            isBaked: true,
            columnNames: columnNames,
        };
    }

    //
    // Initialise an empty dataframe.
    //
    private static initEmpty<IndexT, ValueT>(): IDataFrameContent<IndexT, ValueT> {
        return {
            index: DataFrame.defaultEmptyIterable,
            values: DataFrame.defaultEmptyIterable,
            pairs: DataFrame.defaultEmptyIterable,
            isBaked: true,
            columnNames: [],
        };
    }

    //
    // Initialise dataframe column names.
    //
    private static initColumnNames(inputColumnNames: Iterable<string>): Iterable<string> {
        var outputColumnNames: string[] = [];
        var columnNamesMap: any = {};
    
        // Search for duplicate column names.
        for (let columnName of inputColumnNames) {
            var columnNameLwr = columnName.toLowerCase();
            if (columnNamesMap[columnNameLwr] === undefined) {
                columnNamesMap[columnNameLwr] = 1;
            }
            else {
                columnNamesMap[columnNameLwr] += 1;
            }
        }

        var columnNoMap: any = {};

        for (let columnName of inputColumnNames) {
            var columnNameLwr = columnName.toLowerCase();
            if (columnNamesMap[columnNameLwr] > 1) {
                var curColumnNo = 1;

                // There are duplicates of this column.
                if (columnNoMap[columnNameLwr] !== undefined) {
                    curColumnNo = columnNoMap[columnNameLwr];
                }

                outputColumnNames.push(columnName + "." + curColumnNo);
                columnNoMap[columnNameLwr] = curColumnNo + 1;
            }
            else {
                // No duplicates.
                outputColumnNames.push(columnName);
            }
        }

        return outputColumnNames;
    }

    //
    // Initialise an interable.
    // TODO: This actually does nothing except error checking.
    //
    private static initIterable<T>(input: T[] | Iterable<T>, fieldName: string): Iterable<T> {
        if (Sugar.Object.isArray(input)) {
            return input;
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
    // Initialise dataframe content from a config object.
    //
    private static initFromConfig<IndexT, ValueT>(config: IDataFrameConfig<IndexT, ValueT>): IDataFrameContent<IndexT, ValueT> {

        let index: Iterable<IndexT>;
        let values: Iterable<ValueT>;
        let pairs: Iterable<[IndexT, ValueT]>;
        let isBaked = false;
        let columnNames: Iterable<string>;

        if (config.columns) {
            assert.isObject(config.columns, "Expected 'columns' member of 'config' parameter to DataFrame constructor to be an object with fields that define columns.");

            columnNames = Object.keys(config.columns);
            let columnIterables: any[] = [];
            for (let columnName of columnNames) {
                const columnIterable = this.initIterable(config.columns[columnName], columnName);
                columnIterables.push(columnIterable);
            }

            values = new CsvRowsIterable(columnNames, new MultiIterable(columnIterables));
        }
        else {
            if (config.columnNames) {
                columnNames = this.initColumnNames(config.columnNames);
            }

            if (config.values) {
                values = this.initIterable<ValueT>(config.values, 'values');
                if (config.columnNames) {
                    // Convert data from rows to columns.
                    values = new CsvRowsIterable(columnNames!, values);
                }
                else {
                    columnNames = new ColumnNamesIterable(values, config.considerAllRows || false);
                }
            }
            else if (config.pairs) {
                values = new ExtractElementIterable(config.pairs, 1);
                if (!config.columnNames) {
                    columnNames = new ColumnNamesIterable(values, config.considerAllRows || false);
                }
            }
            else {
                values = DataFrame.defaultEmptyIterable;
                if (!config.columnNames) {
                    columnNames = DataFrame.defaultEmptyIterable;
                }
            }
        }

        if (config.index) {
            index = this.initIterable<IndexT>(config.index, 'index');
        }
        else if (config.pairs) {
            index = new ExtractElementIterable(config.pairs, 0);
        }
        else {
            index = DataFrame.defaultCountIterable;
        }

        if (config.pairs) {
            pairs = config.pairs;
        }
        else {
            pairs = new MultiIterable([index, values]);
        }

        if (config.baked !== undefined) {
            isBaked = config.baked;
        }

        return {
            index: index,
            values: values,
            pairs: pairs,
            isBaked: isBaked,
            columnNames: columnNames!,
        };
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
    constructor(config?: ValueT[] | IDataFrameConfig<IndexT, ValueT> | DataFrameConfigFn<IndexT, ValueT>) {
        if (config) {
            if (Sugar.Object.isFunction(config)) {
                this.configFn = config;
            }
            else if (Sugar.Object.isArray(config)) {
                this.content = DataFrame.initFromArray(config);
            }
            else {
                this.content = DataFrame.initFromConfig(config);
            }
        }
        else {
            this.content = DataFrame.initEmpty();
        }
    }

    //
    // Ensure the dataframe content has been initialised.
    //
    private lazyInit() {
        if (this.content === null && this.configFn !== null) {
            this.content = DataFrame.initFromConfig(this.configFn());
        }
    }

    //
    // Ensure the dataframe content is lazy initalised and return it.
    //
    private getContent(): IDataFrameContent<IndexT, ValueT> { 
        this.lazyInit();
        return this.content!;
    }
    
    /**
     * Get an iterator to enumerate the values of the dataframe.
     * Enumerating the iterator forces lazy evaluation to complete.
     */
    [Symbol.iterator](): Iterator<any> {
        return this.getContent().values[Symbol.iterator]();
    }

    /**
     * Get the names of the columns in the dataframe.
     * 
     * @returns Returns an array of the column names in the dataframe.  
     */
    getColumnNames (): string[] {
        return Array.from(this.getContent().columnNames);
    }
    
    /**
     * Get the index for the dataframe.
     */
    getIndex (): IIndex<IndexT> {
        return new Index<IndexT>(() => ({ values: this.getContent().index }));
    }

    /**
     * Apply a new index to the DataFrame.
     * 
     * @param newIndex The new index to apply to the DataFrame.
     * 
     * @returns Returns a new dataframe or dataframe with the specified index attached.
     */
    withIndex<NewIndexT> (newIndex: NewIndexT[] | Iterable<NewIndexT>): IDataFrame<NewIndexT, ValueT> {

        if (!Sugar.Object.isArray(newIndex)) {
            assert.isObject(newIndex, "'Expected 'newIndex' parameter to 'DataFrame.withIndex' to be an array, DataFrame or Index.");
        }

        return new DataFrame<NewIndexT, ValueT>(() => ({
            values: this.getContent().values,
            index: newIndex,
        }));
    }

    /**
     * Resets the index of the dataframe back to the default zero-based sequential integer index.
     * 
     * @returns Returns a new dataframe with the index reset to the default zero-based index. 
     */
    resetIndex (): IDataFrame<number, ValueT> {
        return new DataFrame<number, ValueT>(() => ({
            values: this.getContent().values // Just strip the index.
        }));
    }
    
    /**
     * Retreive a series from a column of the dataframe.
     *
     * @param columnName Specifies the name of the column that contains the series to retreive.
     */
    getSeries<SeriesValueT> (columnName: string): ISeries<IndexT, SeriesValueT> {

        assert.isString(columnName, "Expected 'columnName' parameter to 'DataFrame.getSeries' function to be a string that specifies the name of the column to retreive.");

        return new Series<IndexT, SeriesValueT>(() => ({
            values: new SelectIterable<ValueT, SeriesValueT>(
                this.getContent().values, 
                (row: any) => row[columnName],
            ),
            index: this.getContent().index,
        }));
    }

        /**
     * Returns true if the column with the requested name exists in the dataframe.
     *
     * @param columnName - Name of the column to check.
     */
    hasSeries (columnName: string): boolean {
        var columnNameLwr = columnName.toLowerCase();
        for (let existingColumnName of this.getColumnNames()) {
            if (existingColumnName.toLowerCase() === columnNameLwr) {
                return true;
            }
        }

        return false;
    }
    
    /**
     * 
     * Verify the existance of a column and return it.
     * Throws an exception if the column doesn't exist.
     *
     * @param columnName - Name or index of the column to retreive.
     */
    expectSeries<SeriesValueT> (columnName: string): ISeries<IndexT, SeriesValueT> {
        if (!this.hasSeries(columnName)) {
            throw new Error("Expected dataframe to contain series with column name: '" + columnName + "'.");
        }

        return this.getSeries(columnName);
    }

    /**
     * Create a new dataframe with an additional column specified by the passed-in series.
     *
     * @param columnNameOrSpec - The name of the column to add or replace.
     * @param [series] - When columnNameOrSpec is a string that identifies the column to add, this specifies the Series to add to the data-frame or a function that produces a series (given a dataframe).
     *
     * @returns Returns a new dataframe replacing or adding a particular named column.
     */
    withSeries<SeriesValueT> (columnNameOrSpec: string | any, series?: ISeries<IndexT, SeriesValueT> | SeriesSelectorFn<IndexT, ValueT, SeriesValueT>): IDataFrame<IndexT, ValueT> {

        if (!Sugar.Object.isObject(columnNameOrSpec)) {
            assert.isString(columnNameOrSpec, "Expected 'columnNameOrSpec' parameter to 'DataFrame.withSeries' function to be a string that specifies the column to set or replace.");
            if (!Sugar.Object.isFunction(series as Object)) {
                assert.isObject(series, "Expected 'series' parameter to 'DataFrame.withSeries' to be a Series object or a function that takes a dataframe and produces a Series.");
            }
        }
        else {
            assert.isUndefined(series, "Expected 'series' parameter to 'DataFrame.withSeries' to not be set when 'columnNameOrSpec is an object.");
        }

        var importSeries: ISeries<IndexT, SeriesValueT>;
    
        if (Sugar.Object.isFunction(series as Object)) {
            importSeries = (series! as SeriesSelectorFn<IndexT, ValueT, SeriesValueT>)(this);
        }
        else { 
            importSeries = series! as ISeries<IndexT, SeriesValueT>;
        }
    
        if (Sugar.Object.isObject(columnNameOrSpec)) {
            const columnNames = Object.keys(columnNameOrSpec);
            let workingDataFrame: IDataFrame<IndexT, ValueT> = this;
            for (const columnName of columnNames) {
                workingDataFrame = workingDataFrame.withSeries(columnName, columnNameOrSpec[columnName]);
            }

            return workingDataFrame;
        }

        return new DataFrame<IndexT, ValueT>(() => {    
            var seriesValueMap = toMap(importSeries.toPairs(), pair => pair[0], pair => pair[1]);
            var newColumnNames =  makeDistinct(this.getColumnNames().concat([columnNameOrSpec]));
    
            return {
                columnNames: newColumnNames,
                index: this.getContent().index,
                pairs: new SelectIterable<[IndexT, ValueT], [IndexT, ValueT]>(this.getContent().pairs, pair => {
                    var index = pair[0];
                    var value = pair[1];
                    var modified: any = Object.assign({}, value);
                    modified[columnNameOrSpec] = seriesValueMap[index];
                    return [
                        index,
                        modified
                    ];
                }),
            };
        });
    }
    
    /**
     * Add a series if it doesn't already exist.
     * 
     * @param columnNameOrSpec - The name of the series to add or a column spec that defines the new column.
     * @param series - The series to add to the dataframe. Can also be a function that returns the series.
     * 
     * @returns Returns a new dataframe with the specified series added, if the series didn't already exist. Otherwise if the requested series already exists the same dataframe is returned.  
     */
    ensureSeries<SeriesValueT> (columnNameOrSpec: string | any, series?: ISeries<IndexT, SeriesValueT> | SeriesSelectorFn<IndexT, ValueT, SeriesValueT>): IDataFrame<IndexT, ValueT> {

        if (!Sugar.Object.isObject(columnNameOrSpec)) {
            assert.isString(columnNameOrSpec, "Expected 'columnNameOrSpec' parameter to 'DataFrame.ensureSeries' function to be a string that specifies the column to set or replace.");
            if (!Sugar.Object.isFunction(series as Object)) {
                assert.isObject(series, "Expected 'series' parameter to 'DataFrame.ensureSeries' to be a Series object or a function that takes a dataframe and produces a Series.");
            }
        }
        else {
            assert.isUndefined(series, "Expected 'series' parameter to 'DataFrame.ensureSeries' to not be set when 'columnNameOrSpec is an object.");
        }

        if (Sugar.Object.isObject(columnNameOrSpec)) {
            const columnNames = Object.keys(columnNameOrSpec);
            let workingDataFrame = <IDataFrame<IndexT,any>> this;
            for (const columnName of columnNames) {
                workingDataFrame = workingDataFrame.ensureSeries(columnName, columnNameOrSpec[columnName]);
            }

            return workingDataFrame;
        }

        if (this.hasSeries(columnNameOrSpec)) {
            return this; // Already have the series.
        }
        else {
            return this.withSeries(columnNameOrSpec, series);
        }
    }    

    /**
    * Extract values from the dataframe as an array.
    * This forces lazy evaluation to complete.
    * 
    * @returns Returns an array of values contained within the dataframe. 
    */
    toArray (): any[] {
        const values = [];
        for (const value of this.getContent().values) {
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
    toPairs (): ([IndexT, ValueT])[] {
        const pairs = [];
        for (const pair of this.getContent().pairs) {
            pairs.push(pair);
        }
        return pairs;
    }

    /**
     * Bake the data frame to an array of rows.
     * 
     *  @returns Returns an array of rows. Each row is an array of values in column order.   
     */
    toRows (): any[][] {
        const columnNames = this.getColumnNames();
        const rows = [];
        for (const value of this.getContent().values) {
            const row = [];
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
    select<ToT> (selector: SelectorFn<ValueT, ToT>): IDataFrame<IndexT, ToT> {
        assert.isFunction(selector, "Expected 'selector' parameter to 'DataFrame.select' function to be a function.");

        return new DataFrame(() => ({
            values: new SelectIterable(this.getContent().values, selector),
            index: this.getContent().index,
        }));
    }

    /**
     * Skip a number of values in the dataframe.
     *
     * @param numValues - Number of values to skip.     * 
     * @returns Returns a new dataframe or dataframe with the specified number of values skipped. 
     */
    skip (numValues: number): IDataFrame<IndexT, ValueT> {
        return new DataFrame<IndexT, ValueT>(() => ({
            values: new SkipIterable(this.getContent().values, numValues),
            index: new SkipIterable(this.getContent().index, numValues),
            pairs: new SkipIterable(this.getContent().pairs, numValues),
        }));
    }

    /** 
     * Format the dataframe for display as a string.
     * This forces lazy evaluation to complete.
     * 
     * @returns Generates and returns a string representation of the dataframe or dataframe.
     */
    toString (): string {

        const columnNames = this.getColumnNames();
        const header = ["__index__"].concat(columnNames);

        const table = new Table();
        //TODO: for (const pair of this.asPairs()) {
        for (const pair of this.toPairs()) {
            const index = pair[0];
            const value = pair[1] as any;
            table.cell(header[0], index);
            columnNames.forEach((columnName, columnIndex) => {
                table.cell(header[columnIndex+1], value[columnName]);
            });
            table.newRow();
        }

        return table.toString();
    }

    /**
     * Forces lazy evaluation to complete and 'bakes' the dataframe into memory.
     * 
     * @returns Returns a dataframe that has been 'baked', all lazy evaluation has completed.  
     */
    bake (): IDataFrame<IndexT, ValueT> {

        if (this.getContent().isBaked) {
            // Already baked.
            return this;
        }

        return new DataFrame({
            pairs: this.toPairs(),
            baked: true,
        });
    }

    /**
     * Serialize the dataframe to JSON.
     * 
     *  @returns Returns a JSON format string representing the dataframe.   
     */
    toJSON (): string {
        return JSON.stringify(this.toArray(), null, 4);
    }

    /**
     * Serialize the dataframe to CSV.
     * 
     *  @returns Returns a CSV format string representing the dataframe.   
     */
    toCSV (): string {

        const data = [this.getColumnNames()].concat(this.toRows());
        return BabyParse.unparse(data);
    }
}

