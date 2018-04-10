import { ArrayIterable }  from './iterables/array-iterable';
import { EmptyIterable }  from './iterables/empty-iterable';
import { CountIterable }  from './iterables/count-iterable';
import { MultiIterable }  from './iterables/multi-iterable';
import { SelectIterable }  from './iterables/select-iterable';
import { SelectManyIterable }  from './iterables/select-many-iterable';
import { TakeIterable }  from './iterables/take-iterable';
import { TakeWhileIterable }  from './iterables/take-while-iterable';
import { WhereIterable }  from './iterables/where-iterable';
import { ConcatIterable }  from './iterables/concat-iterable';
import { DataFrameWindowIterable }  from './iterables/dataframe-window-iterable';
import { ReverseIterable }  from './iterables/reverse-iterable';
import { ZipIterable }  from './iterables/zip-iterable';
import { CsvRowsIterable }  from './iterables/csv-rows-iterable';
import { DistinctIterable }  from './iterables/distinct-iterable';
import { DataFrameRollingWindowIterable }  from './iterables/dataframe-rolling-window-iterable';
import { DataFrameVariableWindowIterable }  from './iterables/dataframe-variable-window-iterable';
import { OrderedIterable, Direction, ISortSpec, SelectorFn as SortSelectorFn }  from './iterables/ordered-iterable';
import * as Sugar from 'sugar';
import { IIndex, Index } from './index';
import { ExtractElementIterable } from './iterables/extract-element-iterable';
import { SkipIterable } from './iterables/skip-iterable';
import { SkipWhileIterable } from './iterables/skip-while-iterable';
const Table = require('easy-table');
import { assert } from 'chai';
import * as moment from 'moment';
import { ISeries, Series, SelectorWithIndexFn, PredicateFn, ComparerFn, SelectorFn, AggregateFn, Zip2Fn, Zip3Fn, Zip4Fn, Zip5Fn, ZipNFn, CallbackFn, JoinFn, GapFillFn } from './series';
import { ColumnNamesIterable } from './iterables/column-names-iterable';
import * as BabyParse from 'babyparse';
import { toMap, makeDistinct } from './utils';

/**
 * DataFrame configuration.
 */
export interface IDataFrameConfig<IndexT, ValueT> {
    values?: ValueT[] | Iterable<ValueT>,
    rows?: any[][] | Iterable<any[]>,
    index?: IndexT[] | Iterable<IndexT>,
    pairs?: [IndexT, ValueT][] | Iterable<[IndexT, ValueT]>,
    columnNames?: string[] | Iterable<string>,
    baked?: boolean,
    considerAllRows?: boolean,
    columns?: any,
};

/** 
 * Represents a name column in a dataframe.
 */
export interface IColumn {
    
    /**
     * The name of the column.
     */
    name: string;

    /**
     * The data series from the column.
     */
    series: ISeries<any, any>;
}

/** 
 * An object whose properties specify named columns.
*/
export interface IColumnSpec {
    [index: string]: ISeries<any, any> | SeriesSelectorFn<any, any, any>,
}

/**
 * Specifies how to rename columns.
 */
export interface IColumnRenameSpec {
    [index: string]: string;
}

/**
 * A selector function that can select a series from a dataframe.
 */
export type SeriesSelectorFn<IndexT, DataFrameValueT, SeriesValueT> = (dataFrame: IDataFrame<IndexT, DataFrameValueT>) => ISeries<IndexT, SeriesValueT>;

/*
 * A function that generates a dataframe content object.
 * Used to make it easy to create lazy evaluated dataframe.
 */
export type DataFrameConfigFn<IndexT, ValueT> = () => IDataFrameConfig<IndexT, ValueT>;

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
     * Retreive a collection of all columns in the dataframe.
     * 
     * @returns Returns a series the columns in the dataframe.
     */
    getColumns (): ISeries<number, IColumn>;

    /**
     * Get the index for the dataframe.
     */
    getIndex (): IIndex<IndexT>;

    /**
     * Set a named column as the index of the data-frame.
     *
     * @param columnName - Name or index of the column to set as the index.
     *
     * @returns Returns a new dataframe with the values of a particular named column as the index.  
     */
    setIndex<NewIndexT = any> (columnName: string): IDataFrame<NewIndexT, ValueT>;
    
    /**
     * Apply a new index to the dataframe.
     * 
     * @param newIndex The new index to apply to the dataframe.
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
    withSeries<SeriesValueT> (columnNameOrSpec: string | IColumnSpec, series?: ISeries<IndexT, SeriesValueT> | SeriesSelectorFn<IndexT, ValueT, SeriesValueT>): IDataFrame<IndexT, ValueT>;
    
    /**
     * Add a series if it doesn't already exist.
     * 
     * @param columnNameOrSpec - The name of the series to add or a column spec that defines the new column.
     * @param series - The series to add to the dataframe. Can also be a function that returns the series.
     * 
     * @returns Returns a new dataframe with the specified series added, if the series didn't already exist. Otherwise if the requested series already exists the same dataframe is returned.  
     */
    ensureSeries<SeriesValueT> (columnNameOrSpec: string | IColumnSpec, series?: ISeries<IndexT, SeriesValueT> | SeriesSelectorFn<IndexT, ValueT, SeriesValueT>): IDataFrame<IndexT, ValueT>;

    /**
     * Create a new data-frame from a subset of columns.
     *
     * @param columnNames - Array of column names to include in the new data-frame.
     * 
     * @returns Returns a dataframe with a subset of columns from the input dataframe.
     */
    subset<NewValueT = ValueT> (columnNames: string[]): IDataFrame<IndexT, NewValueT>;

    /**
     * Create a new data frame with the requested column or columns dropped.
     *
     * @param columnOrColumns - Specifies the column name (a string) or columns (array of column names) to drop.
     * 
     * @returns Returns a new dataframe with a particular name column or columns removed.
     */
    dropSeries<NewValueT = ValueT> (columnOrColumns: string | string[]): IDataFrame<IndexT, NewValueT>;

    /**
     * Create a new data frame with columns reordered.
     * New column names create new columns (with undefined values), omitting existing column names causes those columns to be dropped.
     * 
     * @param columnNames - The new order for columns.
     * 
     * @returns Returns a new dataframe with columns remapped according to the specified column layout.   
     */
    reorderSeries<NewValueT = ValueT> (columnNames: string[]): IDataFrame<IndexT, NewValueT>;

    /**
     * Create a new data-frame with renamed series.
     *
     * @param newColumnNames - A column rename spec - maps existing column names to new column names.
     * 
     * @returns Returns a new dataframe with columns renamed.
     */
    renameSeries<NewValueT = ValueT> (newColumnNames: IColumnRenameSpec): IDataFrame<IndexT, NewValueT>;

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
     * Convert the dataframe to a JavaScript object.
     *
     * @param {function} keySelector - Function that selects keys for the resulting object.
     * @param {valueSelector} keySelector - Function that selects values for the resulting object.
     * 
     * @returns {object} Returns a JavaScript object generated from the input sequence by the key and value selector funtions. 
     */
    toObject<KeyT = any, FieldT = any, OutT = any> (keySelector: (value: ValueT) => KeyT, valueSelector: (value: ValueT) => FieldT): OutT;

    /**
     * Bake the data frame to an array of rows.
     * 
     *  @returns Returns an array of rows. Each row is an array of values in column order.   
     */
    toRows (): any[][];

    /** 
     * Convert a dataframe to a DataFrame of pairs in the form [pair1, pair2, pair3, ...] where each pair is [index, value].
     * THIS FUNCTION IS DEPRECATED.
     * 
     * @returns {Pairs} Returns a dataframe of pairs for each index and value pair in the input sequence.
     */
    asPairs (): IDataFrame<number, [IndexT, ValueT]>;

    /** 
     * Convert a dataframe of pairs to back to a regular dataframe.
     * THIS FUNCTION IS DEPRECATED.
     * 
     * @returns Returns a dataframe of values where each pair has been extracted from the value of the input dataframe.
     */
    asValues<NewIndexT = any, NewValueT = any> (): IDataFrame<NewIndexT, NewValueT>;
    
    /**
     * Generate a new dataframe based by calling the selector function on each value.
     *
     * @param selector Selector function that transforms each value to create a new dataframe.
     * 
     * @returns Returns a new dataframe that has been transformed by the selector function.
     */
    select<ToT> (selector: SelectorWithIndexFn<ValueT, ToT>): IDataFrame<IndexT, ToT>;

    /**
     * Generate a new dataframe based on the results of the selector function.
     *
     * @param selector Selector function that transforms each value into a list of values.
     * 
     * @returns  Returns a new dataframe with values that have been produced by the selector function. 
     */
    selectMany<ToT> (selector: SelectorWithIndexFn<ValueT, Iterable<ToT>>): IDataFrame<IndexT, ToT>;

    /**
     * Segment a dataframe into 'windows'. Returns a new series. Each value in the new dataframe contains a 'window' (or segment) of the original dataframe.
     * Use select or selectPairs to aggregate.
     *
     * @param period - The number of values in the window.
     * 
     * @returns Returns a new series, each value of which is a 'window' (or segment) of the original dataframe.
     */
    window (period: number): ISeries<number, IDataFrame<IndexT, ValueT>>;

    /** 
     * Segment a dataframe into 'rolling windows'. Returns a new series. Each value in the new series contains a 'window' (or segment) of the original dataframe.
    *
     * @param period - The number of values in the window.
     * 
     * @returns Returns a new series, each value of which is a 'window' (or segment) of the original dataframe.
     */
    rollingWindow (period: number): ISeries<number, IDataFrame<IndexT, ValueT>>;

    /**
     * Groups sequential values into variable length 'windows'.
     *
     * @param comparer - Predicate that compares two values and returns true if they should be in the same window.
     * 
     * @returns Returns a series of groups. Each group is itself a dataframe that contains the values in the 'window'. 
     */
    variableWindow (comparer: ComparerFn<ValueT, ValueT>): ISeries<number, IDataFrame<IndexT, ValueT>>;

    /**
     * Collapase distinct values that happen to be sequential.
     *
     * @param [selector] - Optional selector function to determine the value used to compare for duplicates.
     * 
     * @returns Returns a new dataframe with duplicate values that are sequential removed.
     */
    sequentialDistinct<ToT = ValueT> (selector?: SelectorFn<ValueT, ToT>): IDataFrame<IndexT, ValueT>;

    /**
     * Aggregate the values in the dataframe.
     *
     * @param [seed] - Optional seed value for producing the aggregation.
     * @param selector - Function that takes the seed and then each value in the dataframe and produces the aggregate value.
     * 
     * @returns Returns a new value that has been aggregated from the input sequence by the 'selector' function. 
     */
    aggregate<ToT = ValueT> (seedOrSelector: AggregateFn<ValueT, ToT> | ToT, selector?: AggregateFn<ValueT, ToT>): ToT;
    
    /**
     * Skip a number of values in the dataframe.
     *
     * @param numValues - Number of values to skip.     * 
     * @returns Returns a new dataframe or dataframe with the specified number of values skipped. 
     */
    skip (numValues: number): IDataFrame<IndexT, ValueT>;

    /**
     * Skips values in the series while a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     * 
     * @returns Returns a new series with all initial sequential values removed that match the predicate.  
     */
    skipWhile (predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT>;

    /**
     * Skips values in the series until a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     * 
     * @returns Returns a new series with all initial sequential values removed that don't match the predicate.
     */
    skipUntil (predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT>;

    /**
     * Take a number of rows in the series.
     *
     * @param numRows - Number of rows to take.
     * 
     * @returns Returns a new series with up to the specified number of values included.
     */
    take (numRows: number): IDataFrame<IndexT, ValueT>;

    /**
     * Take values from the series while a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     * 
     * @returns Returns a new series that only includes the initial sequential values that have matched the predicate.
     */
    takeWhile (predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT>;

    /**
     * Take values from the series until a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     * 
     * @returns Returns a new series or dataframe that only includes the initial sequential values that have not matched the predicate.
     */
    takeUntil (predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT>;

    /**
     * Count the number of values in the series.
     *
     * @returns Returns the count of all values in the series.
     */
    count (): number;

    /**
     * Get the first value of the series.
     *
     * @returns Returns the first value of the series.
     */
    first (): ValueT;

    /**
     * Get the last value of the series.
     *
     * @returns Returns the last value of the series.
     */
    last (): ValueT;
    
    /**
     * Get the value at a specified index.
     *
     * @param index - Index to for which to retreive the value.
     *
     * @returns Returns the value from the specified index in the sequence or undefined if there is no such index in the series.
     */
    at (index: IndexT): ValueT | undefined;
    
    /** 
     * Get X values from the start of the series.
     *
     * @param numValues - Number of values to take.
     * 
     * @returns Returns a new series that has only the specified number of values taken from the start of the input sequence.  
     */
    head (numValues: number): IDataFrame<IndexT, ValueT>;

    /** 
     * Get X values from the end of the series.
     *
     * @param numValues - Number of values to take.
     * 
     * @returns Returns a new series that has only the specified number of values taken from the end of the input sequence.  
     */
    tail (numValues: number): IDataFrame<IndexT, ValueT>;

    /**
     * Filter a series by a predicate selector.
     *
     * @param predicate - Predicte function to filter rows of the series.
     * 
     * @returns Returns a new series containing only the values that match the predicate. 
     */
    where (predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT>;

    /**
     * Invoke a callback function for each value in the series.
     *
     * @param callback - The calback to invoke for each value.
     * 
     * @returns Returns the input series with no modifications.
     */
    forEach (callback: CallbackFn<ValueT>): IDataFrame<IndexT, ValueT>;

    /**
     * Determine if the predicate returns truthy for all values in the series.
     * Returns false as soon as the predicate evaluates to falsy.
     * Returns true if the predicate returns truthy for all values in the series.
     * Returns false if the series is empty.
     *
     * @param predicate - Predicate function that receives each value in turn and returns truthy for a match, otherwise falsy.
     *
     * @returns {boolean} Returns true if the predicate has returned truthy for every value in the sequence, otherwise returns false. 
     */
    all (predicate: PredicateFn<ValueT>): boolean;

    /**
     * Determine if the predicate returns truthy for any of the values in the series.
     * Returns true as soon as the predicate returns truthy.
     * Returns false if the predicate never returns truthy.
     * If no predicate is specified the value itself is checked. 
     *
     * @param [predicate] - Optional predicate function that receives each value in turn and returns truthy for a match, otherwise falsy.
     *
     * @returns Returns true if the predicate has returned truthy for any value in the sequence, otherwise returns false. 
     */
    any (predicate?: PredicateFn<ValueT>): boolean;

    /**
     * Determine if the predicate returns truthy for none of the values in the series.
     * Returns true for an empty series.
     * Returns true if the predicate always returns falsy.
     * Otherwise returns false.
     * If no predicate is specified the value itself is checked.
     *
     * @param [predicate] - Optional predicate function that receives each value in turn and returns truthy for a match, otherwise falsy.
     * 
     * @returns Returns true if the predicate has returned truthy for no values in the series, otherwise returns false. 
     */
    none (predicate?: PredicateFn<ValueT>): boolean;

    /**
     * Get a new series containing all values starting at and after the specified index value.
     * 
     * @param indexValue - The index value to search for before starting the new series.
     * 
     * @returns Returns a new series containing all values starting at and after the specified index value. 
     */
    startAt (indexValue: IndexT): IDataFrame<IndexT, ValueT>;

    /**
     * Get a new series containing all values up until and including the specified index value (inclusive).
     * 
     * @param indexValue - The index value to search for before ending the new series.
     * 
     * @returns Returns a new series containing all values up until and including the specified index value. 
     */
    endAt (indexValue: IndexT): IDataFrame<IndexT, ValueT>;

    /**
     * Get a new series containing all values up to the specified index value (exclusive).
     * 
     * @param indexValue - The index value to search for before ending the new series.
     * 
     * @returns Returns a new series containing all values up to the specified inde value. 
     */
    before (indexValue: IndexT): IDataFrame<IndexT, ValueT>;

    /**
     * Get a new series containing all values after the specified index value (exclusive).
     * 
     * @param indexValue - The index value to search for.
     * 
     * @returns Returns a new series containing all values after the specified index value.
     */
    after (indexValue: IndexT): IDataFrame<IndexT, ValueT>;

    /**
     * Get a new dataframe containing all values between the specified index values (inclusive).
     * 
     * @param startIndexValue - The index where the new sequence starts. 
     * @param endIndexValue - The index where the new sequence ends.
     * 
     * @returns Returns a new dataframe containing all values between the specified index values (inclusive).
     */
    between (startIndexValue: IndexT, endIndexValue: IndexT): IDataFrame<IndexT, ValueT>;

    /** 
     * Format the dataframe for display as a string.
     * This forces lazy evaluation to complete.
     * 
     * @returns Generates and returns a string representation of the dataframe or dataframe.
     */
    toString (): string;

    /**
     * Parse a column with string values to a column with int values.
     *
     * @param columnNameOrNames - Specifies the column name or array of column names to parse.
     * 
     * @returns Returns a new dataframe with a particular named column parsed as ints.  
     */
    parseInts (columnNameOrNames: string | string[]): IDataFrame<IndexT, ValueT>;

    /**
     * Parse a column with string values to a column with float values.
     *
     * @param columnNameOrNames - Specifies the column name or array of column names to parse.
     * 
     * @returns  Returns a new dataframe with a particular named column parsed as floats.  
     */
    parseFloats (columnNameOrNames: string | string[]): IDataFrame<IndexT, ValueT>;

    /**
     * Parse a column with string values to a column with date values.
     *
     * @param columnNameOrNames - Specifies the column name or array of column names to parse.
     * @param [formatString] - Optional formatting string for dates.
     * 
     * @returns Returns a new dataframe with a particular named column parsed as dates.  
     */
    parseDates (columnNameOrNames: string | string[], formatString?: string): IDataFrame<IndexT, ValueT>;

    /**
     * Convert a column of values of different types to a column of string values.
     *
     * @param columnNameOrNames - Specifies the column name or array of column names to convert to strings.
     * @param [formatString] - Optional formatting string for dates.
     * 
     * @returns Returns a new dataframe with a particular named column convert to strings.  
     */
    toStrings (columnNameOrNames: string | string[], formatString?: string): IDataFrame<IndexT, ValueT>;    

    /**
     * Produces a new data frame with all string values truncated to the requested maximum length.
     *
     * @param maxLength - The maximum length of the string values after truncation.
     * 
     * @returns Returns a new dataframe with all strings truncated to the specified maximum length.
     */
    truncateStrings (maxLength: number): IDataFrame<IndexT, ValueT>;

    /**
     * Forces lazy evaluation to complete and 'bakes' the dataframe into memory.
     * 
     * @returns Returns a dataframe that has been 'baked', all lazy evaluation has completed.  
     */
    bake (): IDataFrame<IndexT, ValueT>;

    /** 
     * Reverse the dataframe.
     * 
     * @returns Returns a new dataframe that is the reverse of the input.
     */
    reverse (): IDataFrame<IndexT, ValueT>;

    /**
     * Returns only values in the dataframe that have distinct values.
     *
     * @param selector - Selects the value used to compare for duplicates.
     * 
     * @returns Returns a dataframe containing only unique values as determined by the 'selector' function. 
     */
    distinct<ToT> (selector?: SelectorFn<ValueT, ToT>): IDataFrame<IndexT, ValueT>;

    /**
     * Group the dataframe according to the selector.
     *
     * @param selector - Selector that defines the value to group by.
     *
     * @returns Returns a series of groups. Each group is a dataframe with values that have been grouped by the 'selector' function.
     */
    groupBy<GroupT> (selector: SelectorWithIndexFn<ValueT, GroupT>): ISeries<number, IDataFrame<IndexT, ValueT>>;
    
    /**
     * Group sequential values into a series of windows.
     *
     * @param selector - Optional selector that defines the value to group by.
     *
     * @returns Returns a series of groups. Each group is a series with values that have been grouped by the 'selector' function.
     */
    groupSequentialBy<GroupT> (selector?: SelectorFn<ValueT, GroupT>): ISeries<number, IDataFrame<IndexT, ValueT>>;
    
    /**
     * Concatenate multiple other dataframes onto this dataframe.
     * 
     * @param dataframes - Multiple arguments. Each can be either a dataframe or an array of dataframes.
     * 
     * @returns Returns a single dataframe concatenated from multiple input dataframes. 
     */    
    concat (...dataframes: (IDataFrame<IndexT, ValueT>[] | IDataFrame<IndexT, ValueT>)[]): IDataFrame<IndexT, ValueT>;
    
    /**
    * Zip together multiple dataframes to create a new dataframe.
    * Preserves the index of the first dataframe.
    * 
    * @param s2, s3, s4, s4 - Multiple dataframes to zip.
    * @param zipper - Zipper function that produces a new dataframe based on the input dataframes.
    * 
    * @returns Returns a single dataframe concatenated from multiple input dataframes. 
    */    
    zip<Index2T, Value2T, ResultT>  (s2: IDataFrame<Index2T, Value2T>, zipper: Zip2Fn<ValueT, Value2T, ResultT> ): IDataFrame<IndexT, ResultT>;
    zip<Index2T, Value2T, Index3T, Value3T, ResultT>  (s2: IDataFrame<Index2T, Value2T>, s3: IDataFrame<Index3T, Value3T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): IDataFrame<IndexT, ResultT>;
    zip<Index2T, Value2T, Index3T, Value3T, Index4T, Value4T, ResultT>  (s2: IDataFrame<Index2T, Value2T>, s3: IDataFrame<Index3T, Value3T>, s4: IDataFrame<Index4T, Value4T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): IDataFrame<IndexT, ResultT>;
    zip<ResultT>  (...args: any[]): IDataFrame<IndexT, ResultT>;

    /**
     * Sorts the dataframe by a value defined by the selector (ascending). 
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new ordered dataframe that has been sorted by the value returned by the selector. 
     */
    orderBy<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT>;

    /**
     * Sorts the dataframe by a value defined by the selector (descending). 
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new ordered dataframe that has been sorted by the value returned by the selector. 
     */
    orderByDescending<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT>;
        
    /**
     * Returns the unique union of values between two dataframes.
     *
     * @param other - The other dataframe to combine.
     * @param [selector] - Optional function that selects the value to compare to detemrine distinctness.
     * 
     * @returns Returns the union of two dataframes.
     */
    union<KeyT = ValueT> (
        other: IDataFrame<IndexT, ValueT>, 
        selector?: SelectorFn<ValueT, KeyT>): 
            IDataFrame<IndexT, ValueT>;

    /**
     * Returns the intersection of values between two dataframes.
     *
     * @param inner - The other dataframes to combine.
     * @param [outerSelector] - Optional function to select the key for matching the two dataframes.
     * @param [innerSelector] - Optional function to select the key for matching the two dataframes.
     * 
     * @returns Returns the intersection of two dataframes.
     */
    intersection<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerSelector?: SelectorFn<ValueT, KeyT>,
        innerSelector?: SelectorFn<InnerValueT, KeyT>): 
            IDataFrame<IndexT, ValueT>;
    

    /**
     * Returns the exception of values between two dataframes.
     *
     * @param inner - The other dataframe to combine.
     * @param [outerSelector] - Optional function to select the key for matching the two dataframes.
     * @param [innerSelector] - Optional function to select the key for matching the two dataframes.
     * 
     * @returns Returns the difference between the two dataframes.
     */
    except<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerSelector?: SelectorFn<ValueT, KeyT>,
        innerSelector?: SelectorFn<InnerValueT, KeyT>): 
            IDataFrame<IndexT, ValueT>;

   /**
     * Correlates the elements of two dataframes on matching keys.
     *
     * @param this - The outer dataframe to join. 
     * @param inner - The inner dataframe to join.
     * @param outerKeySelector - Selector that chooses the join key from the outer sequence.
     * @param innerKeySelector - Selector that chooses the join key from the inner sequence.
     * @param resultSelector - Selector that defines how to merge outer and inner values.
     * 
     * @returns Returns the joined dataframe. 
     */
    join<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT, InnerValueT, ResultValueT>):
            IDataFrame<number, ResultValueT>;

    /**
     * Performs an outer join on two dataframes. Correlates the elements based on matching keys.
     * Includes elements from both dataframes that have no correlation in the other dataframe.
     *
     * @param this - The outer dataframe to join. 
     * @param inner - The inner dataframe to join.
     * @param outerKeySelector - Selector that chooses the join key from the outer sequence.
     * @param innerKeySelector - Selector that chooses the join key from the inner sequence.
     * @param resultSelector - Selector that defines how to merge outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @returns Returns the joined dataframe. 
     */
    joinOuter<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            IDataFrame<number, ResultValueT>;
    

    /**
     * Performs a left outer join on two dataframe. Correlates the elements based on matching keys.
     * Includes left elements that have no correlation.
     *
     * @param this - The outer dataframe to join. 
     * @param inner - The inner dataframe to join.
     * @param outerKeySelector - Selector that chooses the join key from the outer sequence.
     * @param innerKeySelector - Selector that chooses the join key from the inner sequence.
     * @param resultSelector - Selector that defines how to merge outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @returns Returns the joined dataframe. 
     */
    joinOuterLeft<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            IDataFrame<number, ResultValueT>;

    /**
     * Performs a right outer join on two dataframes. Correlates the elements based on matching keys.
     * Includes right elements that have no correlation.
     *
     * @param this - The outer dataframe to join. 
     * @param inner - The inner dataframe to join.
     * @param outerKeySelector - Selector that chooses the join key from the outer sequence.
     * @param innerKeySelector - Selector that chooses the join key from the inner sequence.
     * @param resultSelector - Selector that defines how to merge outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @returns Returns the joined dataframe. 
     */
    joinOuterRight<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            IDataFrame<number, ResultValueT>;

    /**
     * Insert a pair at the start of the dataframe.
     *
     * @param pair - The pair to insert.
     * 
     * @returns Returns a new dataframe with the specified pair inserted.
     */
    insertPair (pair: [IndexT, ValueT]): IDataFrame<IndexT, ValueT>;

    /**
     * Append a pair to the end of a dataframe.
     *
     * @param pair - The pair to append.
     *  
     * @returns Returns a new dataframe with the specified pair appended.
     */
    appendPair (pair: [IndexT, ValueT]): IDataFrame<IndexT, ValueT>;

    /**
     * Fill gaps in a dataframe.
     *
     * @param comparer - Comparer that is passed pairA and pairB, two consecutive rows, return truthy if there is a gap between the rows, or falsey if there is no gap.
     * @param generator - Generator that is passed pairA and pairB, two consecutive rows, returns an array of pairs that fills the gap between the rows.
     *
     * @returns Returns a new dataframe with gaps filled in.
     */
    fillGaps (comparer: ComparerFn<[IndexT, ValueT], [IndexT, ValueT]>, generator: GapFillFn<[IndexT, ValueT], [IndexT, ValueT]>): IDataFrame<IndexT, ValueT>;

    /**
     * Returns the specified default sequence if the dataframe is empty. 
     *
     * @param defaultSequence - Default sequence to return if the dataframe is empty.
     * 
     * @returns Returns 'defaultSequence' if the dataframe is empty. 
     */
    defaultIfEmpty (defaultSequence: ValueT[] | IDataFrame<IndexT, ValueT>): IDataFrame<IndexT, ValueT>;
    
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

    /**
     * Treat the dataframe as CSV data for purposes of serialization.
     * 
     * @returns Returns an object that represents the dataframe for serialization in the CSV format. Call `writeFile`, `writeFileSync` to output the dataframe via different media.
     */
    asCSV (): ICsvSerializer;

    /**
     * Treat the dataframe as JSON data for purposes of serialization.
     * 
     * @returns Returns an object that can serialize the dataframe in the JSON format. Call `writeFile` or `writeFileSync` to output the dataframe via different media.
     */
    asJSON (): IJsonSerializer;
}

/**
 * Interface to a dataframe that has been ordered.
 */
export interface IOrderedDataFrame<IndexT = number, ValueT = any, SortT = any> extends IDataFrame<IndexT, ValueT> {

    /** 
     * Performs additional sorting (ascending).
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new dataframe has been additionally sorted by the value returned by the selector. 
     */
    thenBy<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT>;

    /** 
     * Performs additional sorting (descending).
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new dataframe has been additionally sorted by the value returned by the selector. 
     */
    thenByDescending<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT>;
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
        const outputColumnNames: string[] = [];
        const columnNamesMap: any = {};
    
        // Search for duplicate column names.
        for (const columnName of inputColumnNames) {
            const columnNameLwr = columnName.toLowerCase();
            if (columnNamesMap[columnNameLwr] === undefined) {
                columnNamesMap[columnNameLwr] = 1;
            }
            else {
                columnNamesMap[columnNameLwr] += 1;
            }
        }

        const columnNoMap: any = {};

        for (const columnName of inputColumnNames) {
            const columnNameLwr = columnName.toLowerCase();
            if (columnNamesMap[columnNameLwr] > 1) {
                let curColumnNo = 1;

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
    // Check that a value is an interable.
    //
    private static checkIterable<T>(input: T[] | Iterable<T>, fieldName: string): void {
        if (Sugar.Object.isArray(input)) {
            // Ok
        }
        else if (Sugar.Object.isFunction(input[Symbol.iterator])) {
            // Assume it's an iterable.
            // Ok
        }
        else {
            // Not ok
            throw new Error("Expected '" + fieldName + "' field of DataFrame config object to be an array of values or an iterable of values.");
        }
    };

    //
    // Initialise dataframe content from a config object.
    //
    private static initFromConfig<IndexT, ValueT>(config: IDataFrameConfig<IndexT, ValueT>): IDataFrameContent<IndexT, ValueT> {

        let index: Iterable<IndexT>;
        let values: Iterable<ValueT>;
        let pairs: Iterable<[IndexT, ValueT]> | undefined;
        let isBaked = false;
        let columnNames: Iterable<string>;

        if (config.pairs) {
            DataFrame.checkIterable<[IndexT, ValueT]>(config.pairs, "pairs");
            pairs = config.pairs;
        }
        
        if (config.columns) {
            assert.isObject(config.columns, "Expected 'columns' member of 'config' parameter to DataFrame constructor to be an object with fields that define columns.");

            columnNames = Object.keys(config.columns);
            let columnIterables: any[] = [];
            for (let columnName of columnNames) {
                DataFrame.checkIterable(config.columns[columnName], columnName);
                columnIterables.push(config.columns[columnName]);
            }

            values = new CsvRowsIterable(columnNames, new MultiIterable(columnIterables));
        }
        else {
            if (config.columnNames) {
                columnNames = this.initColumnNames(config.columnNames);
            }

            if (config.rows) {
                if (!config.columnNames) {
                    columnNames = new SelectIterable(new CountIterable(), c => "Column." + c.toString());
                }

                DataFrame.checkIterable<any[][]>(config.rows, 'rows')
                values = new CsvRowsIterable(columnNames!, config.rows); // Convert data from rows to columns.
            }
            else if (config.values) {
                DataFrame.checkIterable<ValueT>(config.values, 'values')
                values = config.values;
                if (!config.columnNames) {
                    columnNames = new ColumnNamesIterable(values, config.considerAllRows || false);
                }
            }
            else if (pairs) {
                values = new ExtractElementIterable(pairs, 1);
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
            DataFrame.checkIterable<IndexT>(config.index, 'index');
            index = config.index;
        }
        else if (pairs) {
            index = new ExtractElementIterable(pairs, 0);
        }
        else {
            index = DataFrame.defaultCountIterable;
        }

        if (!pairs) {
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
     * Retreive a collection of all columns in the dataframe.
     * 
     * @returns Returns a series the columns in the dataframe.
     */
    getColumns (): ISeries<number, IColumn> {
        return new Series<number, IColumn>(() => {
            const columnNames = this.getColumnNames();
            return {
                values: columnNames.map(columnName => {
                    return {
                        name: columnName,
                        series: this.getSeries(columnName),
                    };
                }),
            };
        });
    }    
    
    /**
     * Get the index for the dataframe.
     */
    getIndex (): IIndex<IndexT> {
        return new Index<IndexT>(() => ({ values: this.getContent().index }));
    }

    /**
     * Set a named column as the index of the data-frame.
     *
     * @param columnName - Name or index of the column to set as the index.
     *
     * @returns Returns a new dataframe with the values of a particular named column as the index.  
     */
    setIndex<NewIndexT = any> (columnName: string): IDataFrame<NewIndexT, ValueT> {
        assert.isString(columnName, "Expected 'columnName' parameter to 'DataFrame.setIndex' to be a string that specifies the name of the column to set as the index for the dataframe.");

        return this.withIndex<NewIndexT>(this.getSeries(columnName));
    }
    
    /**
     * Apply a new index to the dataframe.
     * 
     * @param newIndex The new index to apply to the dataframe.
     * 
     * @returns Returns a new dataframe or dataframe with the specified index attached.
     */
    withIndex<NewIndexT> (newIndex: NewIndexT[] | Iterable<NewIndexT>): IDataFrame<NewIndexT, ValueT> {

        DataFrame.checkIterable(newIndex, 'newIndex');

        return new DataFrame<NewIndexT, ValueT>(() => {
            const content = this.getContent();
            return {
                columnNames: content.columnNames,
                values: content.values,
                index: newIndex,    
            };
        });
    }

    /**
     * Resets the index of the dataframe back to the default zero-based sequential integer index.
     * 
     * @returns Returns a new dataframe with the index reset to the default zero-based index. 
     */
    resetIndex (): IDataFrame<number, ValueT> {
        return new DataFrame<number, ValueT>(() => {
            const content = this.getContent();
            return {
                columnNames: content.columnNames,
                values: content.values,
                // Strip the index.
            };
        });
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
        const columnNameLwr = columnName.toLowerCase();
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
    withSeries<SeriesValueT> (columnNameOrSpec: string | IColumnSpec, series?: ISeries<IndexT, SeriesValueT> | SeriesSelectorFn<IndexT, ValueT, SeriesValueT>): IDataFrame<IndexT, ValueT> {

        if (!Sugar.Object.isObject(columnNameOrSpec)) {
            assert.isString(columnNameOrSpec, "Expected 'columnNameOrSpec' parameter to 'DataFrame.withSeries' function to be a string that specifies the column to set or replace.");
            if (!Sugar.Object.isFunction(series as Object)) {
                assert.isObject(series, "Expected 'series' parameter to 'DataFrame.withSeries' to be a Series object or a function that takes a dataframe and produces a Series.");
            }
        }
        else {
            assert.isUndefined(series, "Expected 'series' parameter to 'DataFrame.withSeries' to not be set when 'columnNameOrSpec is an object.");
        }

        if (Sugar.Object.isObject(columnNameOrSpec)) {
            const columnSpec: IColumnSpec = <IColumnSpec> columnNameOrSpec;
            const columnNames = Object.keys(columnSpec);
            let workingDataFrame: IDataFrame<IndexT, ValueT> = this;
            for (const columnName of columnNames) {
                workingDataFrame = workingDataFrame.withSeries(columnName, columnSpec[columnName]);
            }

            return workingDataFrame;
        }

        const columnName: string = <string> columnNameOrSpec;

        if (this.none()) { // We have an empty data frame.
            let importSeries: ISeries<IndexT, SeriesValueT>;
    
            if (Sugar.Object.isFunction(series as Object)) {
                importSeries = (series! as SeriesSelectorFn<IndexT, ValueT, SeriesValueT>)(this);
            }
            else { 
                importSeries = series! as ISeries<IndexT, SeriesValueT>;
            }
                
            
            return importSeries.inflate<ValueT>(value => {
                    var row: any = {};
                    row[columnName] = value;
                    return row;
                });
        }

        return new DataFrame<IndexT, ValueT>(() => {    
            let importSeries: ISeries<IndexT, SeriesValueT>;
    
            if (Sugar.Object.isFunction(series as Object)) {
                importSeries = (series! as SeriesSelectorFn<IndexT, ValueT, SeriesValueT>)(this);
            }
            else { 
                importSeries = series! as ISeries<IndexT, SeriesValueT>;
            }

            const seriesValueMap = toMap(importSeries.toPairs(), pair => pair[0], pair => pair[1]);
            const newColumnNames =  makeDistinct(this.getColumnNames().concat([columnName]));
    
            return {
                columnNames: newColumnNames,
                index: this.getContent().index,
                pairs: new SelectIterable<[IndexT, ValueT], [IndexT, ValueT]>(this.getContent().pairs, pair => {
                    const index = pair[0];
                    const value = pair[1];
                    const modified: any = Object.assign({}, value);
                    modified[columnName] = seriesValueMap[index];
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
    ensureSeries<SeriesValueT> (columnNameOrSpec: string | IColumnSpec, series?: ISeries<IndexT, SeriesValueT> | SeriesSelectorFn<IndexT, ValueT, SeriesValueT>): IDataFrame<IndexT, ValueT> {

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
            const columnSpec: IColumnSpec = <IColumnSpec> columnNameOrSpec;
            const columnNames = Object.keys(columnNameOrSpec);
            let workingDataFrame = <IDataFrame<IndexT,any>> this;
            for (const columnName of columnNames) {
                workingDataFrame = workingDataFrame.ensureSeries(columnName, columnSpec[columnName]);
            }

            return workingDataFrame;
        }

        const columnName: string = <string> columnNameOrSpec;
        if (this.hasSeries(columnName)) {
            return this; // Already have the series.
        }
        else {
            return this.withSeries(columnName, series);
        }
    }    

    /**
     * Create a new data-frame from a subset of columns.
     *
     * @param columnNames - Array of column names to include in the new data-frame.
     * 
     * @returns Returns a dataframe with a subset of columns from the input dataframe.
     */
    subset<NewValueT = ValueT> (columnNames: string[]): IDataFrame<IndexT, NewValueT> {
        assert.isArray(columnNames, "Expected 'columnNames' parameter to 'DataFrame.subset' to be an array of column names to keep.");	

        return new DataFrame<IndexT, NewValueT>(() => {
            const content = this.getContent();
            return {
                columnNames: columnNames,
                index: content.index,
                values: new SelectIterable<ValueT, NewValueT>(content.values, (value: any) => {
                    const output: any = {};
                    for (const columnName of columnNames) {
                        output[columnName] = value[columnName];
                    }
                    return output;
                }),
                pairs: new SelectIterable<[IndexT, ValueT], [IndexT, NewValueT]>(content.pairs, (pair: any) => {
                    const output: any = {};
                    const value = pair[1];
                    for (const columnName of columnNames) {
                        output[columnName] = value[columnName];
                    }
                    return [pair[0], output];
                }),
            }
        });
    };
    
    /**
     * Create a new data frame with the requested column or columns dropped.
     *
     * @param columnOrColumns - Specifies the column name (a string) or columns (array of column names) to drop.
     * 
     * @returns Returns a new dataframe with a particular name column or columns removed.
     */
    dropSeries<NewValueT = ValueT> (columnOrColumns: string | string[]): IDataFrame<IndexT, NewValueT> {

        if (!Sugar.Object.isArray(columnOrColumns)) {
            assert.isString(columnOrColumns, "'DataFrame.dropSeries' expected either a string or an array or strings.");

            columnOrColumns = [columnOrColumns]; // Convert to array for coding convenience.
        }

        return new DataFrame<IndexT, NewValueT>(() => {
            const content = this.getContent();
            const newColumnNames = [];
            for (const columnName of content.columnNames) {
                if (columnOrColumns.indexOf(columnName) === -1) {
                    newColumnNames.push(columnName); // This column is not being dropped.
                }
            }

            return {
                columnNames: newColumnNames,
                index: content.index,
                values: new SelectIterable<ValueT, NewValueT>(content.values, value => {
                    const clone: any = Object.assign({}, value);
                    for (const droppedColumnName of columnOrColumns) {
                        delete clone[droppedColumnName];
                    }
                    return clone;
                }),
                pairs: new SelectIterable<[IndexT, ValueT], [IndexT, NewValueT]>(content.pairs, pair => {
                    const clone: any = Object.assign({}, pair[1]);
                    for (const droppedColumnName of columnOrColumns) {
                        delete clone[droppedColumnName];
                    }
                    return [pair[0], clone];
                }),
            };
        });
    }
        
    /**
     * Create a new data frame with columns reordered.
     * New column names create new columns (with undefined values), omitting existing column names causes those columns to be dropped.
     * 
     * @param columnNames - The new order for columns.
     * 
     * @returns Returns a new dataframe with columns remapped according to the specified column layout.   
     */
    reorderSeries<NewValueT = ValueT> (columnNames: string[]): IDataFrame<IndexT, NewValueT> {

        assert.isArray(columnNames, "Expected parameter 'columnNames' to 'DataFrame.reorderSeries' to be an array with column names.");

        for (const columnName of columnNames) {
            assert.isString(columnName, "Expected parameter 'columnNames' to 'DataFrame.reorderSeries' to be an array with column names.");
        }

        return new DataFrame<IndexT, NewValueT>(() => {
            const content = this.getContent();
            return {
                columnNames: columnNames,
                index: content.index,
                values: new SelectIterable<ValueT, NewValueT>(content.values, (value: any) => {
                    const output: any = {};
                    for (const columnName of columnNames) {
                        output[columnName] = value[columnName];
                    }

                    return <NewValueT> output;
                }),
                pairs:  new SelectIterable<[IndexT, ValueT], [IndexT, NewValueT]>(content.pairs, (pair: [IndexT, ValueT]) => {
                    const value: any = <any> pair[1];
                    const output: any = {};
                    for (const columnName of columnNames) {
                        output[columnName] = value[columnName];
                    }

                    return [pair[0], <NewValueT> output];
                }),
            };
        });
    }
    
    /**
     * Create a new data-frame with renamed series.
     *
     * @param newColumnNames - A column rename spec - maps existing column names to new column names.
     * 
     * @returns Returns a new dataframe with columns renamed.
     */
    renameSeries<NewValueT = ValueT> (newColumnNames: IColumnRenameSpec): IDataFrame<IndexT, NewValueT> {

        assert.isObject(newColumnNames, "Expected parameter 'newColumnNames' to 'DataFrame.renameSeries' to be an array with column names.");

        const existingColumnsToRename = Object.keys(newColumnNames);
        for (const existingColumnName of existingColumnsToRename) {
            assert.isString(existingColumnName, "Expected existing column name '" + existingColumnName + "' of 'newColumnNames' parameter to 'DataFrame.renameSeries' to be a string.");
            assert.isString(newColumnNames[existingColumnName], "Expected new column name '" + newColumnNames[existingColumnName] + "' for existing column '" + existingColumnName + "' of 'newColumnNames' parameter to 'DataFrame.renameSeries' to be a string.");
        }

        return new DataFrame<IndexT, NewValueT>(() => {
            const content = this.getContent();
            const renamedColumns: string[] = [];

            for (const existingColumnName of content.columnNames) { // Convert the column rename spec to array of new column names.
                const columnIndex = existingColumnsToRename.indexOf(existingColumnName);
                if (columnIndex === -1) {
                    renamedColumns.push(existingColumnName); // This column is not renamed.                    
                }
                else {
                    renamedColumns.push(newColumnNames[existingColumnName]); // This column is renamed.
                }
                
            }
    
            //
            // Remap each row of the data frame to the new column names.
            //
            function remapValue (value: any): any {
                const clone = Object.assign({}, value);
    
                for (const existingColumName of existingColumnsToRename) {
                    clone[newColumnNames[existingColumName]] = clone[existingColumName];
                    delete clone[existingColumName];
                }
    
                return clone;
            }
    
            return {
                columnNames: renamedColumns,
                index: content.index,
                values: new SelectIterable<ValueT, NewValueT>(content.values, remapValue),
                pairs: new SelectIterable<[IndexT, ValueT], [IndexT, NewValueT]>(content.pairs, pair => {
                    return [pair[0], remapValue(pair[1])];
                }),
            };
        });
    };
    
    /**
    * Extract values from the dataframe as an array.
    * This forces lazy evaluation to complete.
    * 
    * @returns Returns an array of values contained within the dataframe. 
    */
    toArray (): any[] {
        const values = [];
        for (const value of this.getContent().values) {
            if (value !== undefined) {
                values.push(value);
            }
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
            if (pair[1] != undefined) {
                pairs.push(pair);
            }
        }
        return pairs;
    }

    /**
     * Convert the dataframe to a JavaScript object.
     *
     * @param keySelector - Function that selects keys for the resulting object.
     * @param valueSelector - Function that selects values for the resulting object.
     * 
     * @returns Returns a JavaScript object generated from the input sequence by the key and value selector funtions. 
     */
    toObject<KeyT = any, FieldT = any, OutT = any> (keySelector: (value: ValueT) => KeyT, valueSelector: (value: ValueT) => FieldT): OutT {

        assert.isFunction(keySelector, "Expected 'keySelector' parameter to DataFrame.toObject to be a function.");
        assert.isFunction(valueSelector, "Expected 'valueSelector' parameter to DataFrame.toObject to be a function.");

        return toMap(this, keySelector, valueSelector);
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
     * Convert a dataframe to a DataFrame of pairs in the form [pair1, pair2, pair3, ...] where each pair is [index, value].
     * THIS FUNCTION IS DEPRECATED.
     * 
     * @returns {Pairs} Returns a dataframe of pairs for each index and value pair in the input sequence.
     */
    asPairs (): IDataFrame<number, [IndexT, ValueT]> {
        return new DataFrame<number, [IndexT, ValueT]>(() => ({ values: this.getContent().pairs }));
    }

    /** 
     * Convert a dataframe of pairs to back to a regular dataframe.
     * THIS FUNCTION IS DEPRECATED.
     * 
     * @returns Returns a dataframe of values where each pair has been extracted from the value of the input dataframe.
     */
    asValues<NewIndexT = any, NewValueT = any> (): IDataFrame<NewIndexT, NewValueT> {

        //TODO: This function didn't port well to TypeScript. It's deprecated though.
        
        return new DataFrame<NewIndexT, NewValueT>(() => ({
            index: new SelectIterable<any, NewIndexT>(this.getContent().values, (pair: [any, any], index: number) => <NewIndexT> pair[0]),
            values: new SelectIterable<any, NewValueT>(this.getContent().values, (pair: [any, any], index: number) => <NewValueT> pair[1]),
            pairs: <Iterable<[NewIndexT, NewValueT]>> <any> this.getContent().values,
        }));
    }    

    /**
     * Generate a new dataframe based by calling the selector function on each value.
     *
     * @param selector Selector function that transforms each value to create a new dataframe.
     * 
     * @returns Returns a new dataframe that has been transformed by the selector function.
     */
    select<ToT> (selector: SelectorWithIndexFn<ValueT, ToT>): IDataFrame<IndexT, ToT> {
        assert.isFunction(selector, "Expected 'selector' parameter to 'DataFrame.select' function to be a function.");

        return new DataFrame(() => {
            const content = this.getContent();
            return {
                values: new SelectIterable<ValueT, ToT>(content.values, selector),
                index: content.index,    
            };
        });
    }

    /**
     * Generate a new dataframe based on the results of the selector function.
     *
     * @param selector Selector function that transforms each value into a list of values.
     * 
     * @returns  Returns a new dataframe with values that have been produced by the selector function. 
     */
    selectMany<ToT> (selector: SelectorWithIndexFn<ValueT, Iterable<ToT>>): IDataFrame<IndexT, ToT> {
        assert.isFunction(selector, "Expected 'selector' parameter to 'DataFrame.selectMany' to be a function.");

        return new DataFrame(() => ({
            pairs: new SelectManyIterable(
                this.getContent().pairs, 
                (pair: [IndexT, ValueT], index: number): Iterable<[IndexT, ToT]> => {
                    const outputPairs: [IndexT, ToT][] = [];
                    for (const transformed of selector(pair[1], index)) {
                        outputPairs.push([
                            pair[0],
                            transformed
                        ]);
                    }
                    return outputPairs;
                }
            )
        }));
    }

    /**
     * Segment a dataframe into 'windows'. Returns a new series. Each value in the new series contains a 'window' (or segment) of the original dataframe.
     * Use select or selectPairs to aggregate.
     *
     * @param period - The number of values in the window.
     * 
     * @returns Returns a new series, each value of which is a 'window' (or segment) of the original dataframe.
     */
    window (period: number): ISeries<number, IDataFrame<IndexT, ValueT>> {

        assert.isNumber(period, "Expected 'period' parameter to 'DataFrame.window' to be a number.");

        return new Series<number, IDataFrame<IndexT, ValueT>>(() => {
            const content = this.getContent();
            return {
                values: new DataFrameWindowIterable<IndexT, ValueT>(content.columnNames, content.pairs, period)
            };            
        });
    }

    /** 
     * Segment a dataframe into 'rolling windows'. Returns a new series. Each value in the new series contains a 'window' (or segment) of the original series.
    *
     * @param period - The number of values in the window.
     * 
     * @returns Returns a new series, each value of which is a 'window' (or segment) of the original series.
     */
    rollingWindow (period: number): ISeries<number, IDataFrame<IndexT, ValueT>> {

        assert.isNumber(period, "Expected 'period' parameter to 'DataFrame.rollingWindow' to be a number.");

        return new Series<number, IDataFrame<IndexT, ValueT>>(() => {
            const content = this.getContent();
            return {
                values: new DataFrameRollingWindowIterable<IndexT, ValueT>(content.columnNames, content.pairs, period)
            };            
        });
    }

    /**
     * Groups sequential values into variable length 'windows'.
     *
     * @param comparer - Predicate that compares two values and returns true if they should be in the same window.
     * 
     * @returns Returns a series of groups. Each group is itself a series that contains the values in the 'window'. 
     */
    variableWindow (comparer: ComparerFn<ValueT, ValueT>): ISeries<number, IDataFrame<IndexT, ValueT>> {
        
        assert.isFunction(comparer, "Expected 'comparer' parameter to 'DataFrame.variableWindow' to be a function.")

        return new Series<number, IDataFrame<IndexT, ValueT>>(() => {
            const content = this.getContent();
            return {
                values: new DataFrameVariableWindowIterable<IndexT, ValueT>(content.columnNames, content.pairs, comparer)
            };            
        });
    }

    /**
     * Group sequential duplicate values into a series of windows.
     *
     * @param [selector] - Optional selector function to determine the value used to compare for duplicates.
     * 
     * @returns Returns a series of groups. Each group is itself a series. 
     */
    sequentialDistinct<ToT = ValueT> (selector?: SelectorFn<ValueT, ToT>): IDataFrame<IndexT, ValueT> {
        
        if (selector) {
            assert.isFunction(selector, "Expected 'selector' parameter to 'DataFrame.sequentialDistinct' to be a selector function that determines the value to compare for duplicates.")
        }
        else {
            selector = (value: ValueT): ToT => <ToT> <any> value;
        }

        return this.variableWindow((a: ValueT, b: ValueT): boolean => selector!(a) === selector!(b))
            .asPairs()
            .select((pair: [number, IDataFrame<IndexT, ValueT>], index: number): [IndexT, ValueT] => {
                const window = pair[1];
                return [window.getIndex().first(), window.first()];
            })
            .asValues<IndexT, ValueT>() 
            .inflate();
    }

    /**
     * Aggregate the values in the dataframe.
     *
     * @param [seed] - Optional seed value for producing the aggregation.
     * @param selector - Function that takes the seed and then each value in the dataframe and produces the aggregate value.
     * 
     * @returns Returns a new value that has been aggregated from the input sequence by the 'selector' function. 
     */
    aggregate<ToT = ValueT> (seedOrSelector: AggregateFn<ValueT, ToT> | ToT, selector?: AggregateFn<ValueT, ToT>): ToT {

        if (Sugar.Object.isFunction(seedOrSelector) && !selector) {
            return this.skip(1).aggregate(<ToT> <any> this.first(), seedOrSelector);
        }
        else {
            assert.isFunction(selector, "Expected 'selector' parameter to aggregate to be a function.");

            let accum = <ToT> seedOrSelector;

            for (const value of this) {
                accum = selector!(accum, value);                
            }

            return accum;
        }
    };
    
    /**
     * Skip a number of values in the dataframe.
     *
     * @param numValues - Number of values to skip.
     * @returns Returns a new dataframe or dataframe with the specified number of values skipped. 
     */
    skip (numValues: number): IDataFrame<IndexT, ValueT> {
        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            return {
                columnNames: content.columnNames,
                values: new SkipIterable(content.values, numValues),
                index: new SkipIterable(content.index, numValues),
                pairs: new SkipIterable(content.pairs, numValues),
            };
        });
    }

    /**
     * Skips values in the series while a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     * 
     * @returns Returns a new series with all initial sequential values removed that match the predicate.  
     */
    skipWhile (predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT> {
        assert.isFunction(predicate, "Expected 'predicate' parameter to 'DataFrame.skipWhile' function to be a predicate function that returns true/false.");

        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            return {
                columnNames: content.columnNames,
                values: new SkipWhileIterable(content.values, predicate),
                pairs: new SkipWhileIterable(content.pairs, pair => predicate(pair[1])),
            };
        });
    }

    /**
     * Skips values in the series until a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     * 
     * @returns Returns a new series with all initial sequential values removed that don't match the predicate.
     */
    skipUntil (predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT> {
        assert.isFunction(predicate, "Expected 'predicate' parameter to 'DataFrame.skipUntil' function to be a predicate function that returns true/false.");

        return this.skipWhile(value => !predicate(value)); 
    }

    /**
     * Take a number of rows in the series.
     *
     * @param numRows - Number of rows to take.
     * 
     * @returns Returns a new series with up to the specified number of values included.
     */
    take (numRows: number): IDataFrame<IndexT, ValueT> {
        assert.isNumber(numRows, "Expected 'numRows' parameter to 'DataFrame.take' function to be a number.");

        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            return {
                columnNames: content.columnNames,
                index: new TakeIterable(content.index, numRows),
                values: new TakeIterable(content.values, numRows),
                pairs: new TakeIterable(content.pairs, numRows)
            };
        });
    };

    /**
     * Take values from the series while a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     * 
     * @returns Returns a new series that only includes the initial sequential values that have matched the predicate.
     */
    takeWhile (predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT> {
        assert.isFunction(predicate, "Expected 'predicate' parameter to 'DataFrame.takeWhile' function to be a predicate function that returns true/false.");

        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            return {
                columnNames: content.columnNames,
                values: new TakeWhileIterable(content.values, predicate),
                pairs: new TakeWhileIterable(content.pairs, pair => predicate(pair[1]))
            };
        });
    }

    /**
     * Take values from the series until a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     * 
     * @returns Returns a new series or dataframe that only includes the initial sequential values that have not matched the predicate.
     */
    takeUntil (predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT> {
        assert.isFunction(predicate, "Expected 'predicate' parameter to 'DataFrame.takeUntil' function to be a predicate function that returns true/false.");

        return this.takeWhile(value => !predicate(value));
    }

    /**
     * Count the number of values in the series.
     *
     * @returns Returns the count of all values in the series.
     */
    count (): number {

        let total = 0;
        for (const value of this.getContent().values) {
            ++total;
        }
        return total;
    }

    /**
     * Get the first value of the series.
     *
     * @returns Returns the first value of the series.
     */
    first (): ValueT {

        for (const value of this) {
            return value; // Only need the first value.
        }

        throw new Error("No values in Series.");
    }

    /**
     * Get the last value of the series.
     *
     * @returns Returns the last value of the series.
     */
    last (): ValueT {

        let lastValue = null;

        for (const value of this) {
            lastValue = value; // Throw away all values until we get to the last one.
        }

        if (lastValue === null) {
            throw new Error("No values in Series.");
        }

        return lastValue;
    }    
    
    /**
     * Get the value at a specified index.
     *
     * @param index - Index to for which to retreive the value.
     *
     * @returns Returns the value from the specified index in the sequence or undefined if there is no such index in the series.
     */
    at (index: IndexT): ValueT | undefined {

        if (this.none()) {
            return undefined;
        }

        //
        // This is pretty expensive.
        // A specialised index could improve this.
        //

        for (const pair of this.getContent().pairs) {
            if (pair[0] === index) {
                return pair[1];
            }
        }

        return undefined;
    }
    
    /** 
     * Get X values from the start of the series.
     *
     * @param numValues - Number of values to take.
     * 
     * @returns Returns a new series that has only the specified number of values taken from the start of the input sequence.  
     */
    head (numValues: number): IDataFrame<IndexT, ValueT> {

        assert.isNumber(numValues, "Expected 'values' parameter to 'DataFrame.head' function to be a number.");

        return this.take(numValues);
    }

    /** 
     * Get X values from the end of the series.
     *
     * @param numValues - Number of values to take.
     * 
     * @returns Returns a new series that has only the specified number of values taken from the end of the input sequence.  
     */
    tail (numValues: number): IDataFrame<IndexT, ValueT> {

        assert.isNumber(numValues, "Expected 'values' parameter to 'DataFrame.tail' function to be a number.");

        return this.skip(this.count() - numValues);
    }

    /**
     * Filter a series by a predicate selector.
     *
     * @param predicate - Predicte function to filter rows of the series.
     * 
     * @returns Returns a new series containing only the values that match the predicate. 
     */
    where (predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT> {

        assert.isFunction(predicate, "Expected 'predicate' parameter to 'DataFrame.where' function to be a function.");

        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            return {
                columnNames: content.columnNames,
                values: new WhereIterable(content.values, predicate),
                pairs: new WhereIterable(content.pairs, pair => predicate(pair[1]))
            };
        });
    }

    /**
     * Invoke a callback function for each value in the series.
     *
     * @param callback - The calback to invoke for each value.
     * 
     * @returns Returns the input series with no modifications.
     */
    forEach (callback: CallbackFn<ValueT>): IDataFrame<IndexT, ValueT> {
        assert.isFunction(callback, "Expected 'callback' parameter to 'DataFrame.forEach' to be a function.");

        let index = 0;
        for (const value of this) {
            callback(value, index++);
        }

        return this;
    }

    /**
     * Determine if the predicate returns truthy for all values in the series.
     * Returns false as soon as the predicate evaluates to falsy.
     * Returns true if the predicate returns truthy for all values in the series.
     * Returns false if the series is empty.
     *
     * @param predicate - Predicate function that receives each value in turn and returns truthy for a match, otherwise falsy.
     *
     * @returns {boolean} Returns true if the predicate has returned truthy for every value in the sequence, otherwise returns false. 
     */
    all (predicate: PredicateFn<ValueT>): boolean {
        assert.isFunction(predicate, "Expected 'predicate' parameter to 'DataFrame.all' to be a function.")

        let count = 0;

        for (const value of this) {
            if (!predicate(value)) {
                return false;
            }

            ++count;
        }

        return count > 0;
    }

    /**
     * Determine if the predicate returns truthy for any of the values in the series.
     * Returns true as soon as the predicate returns truthy.
     * Returns false if the predicate never returns truthy.
     * If no predicate is specified the value itself is checked. 
     *
     * @param [predicate] - Optional predicate function that receives each value in turn and returns truthy for a match, otherwise falsy.
     *
     * @returns Returns true if the predicate has returned truthy for any value in the sequence, otherwise returns false. 
     */
    any (predicate?: PredicateFn<ValueT>): boolean {
        if (predicate) {
            assert.isFunction(predicate, "Expected 'predicate' parameter to 'DataFrame.any' to be a function.")
        }

        if (predicate) {
            // Use the predicate to check each value.
            for (const value of this) {
                if (predicate(value)) {
                    return true;
                }
            }
        }
        else {
            // Check each value directly.
            for (const value of this) {
                if (value) {
                    return true;
                }
            }
        }

        return false; // Nothing passed.
    }

    /**
     * Determine if the predicate returns truthy for none of the values in the series.
     * Returns true for an empty series.
     * Returns true if the predicate always returns falsy.
     * Otherwise returns false.
     * If no predicate is specified the value itself is checked.
     *
     * @param [predicate] - Optional predicate function that receives each value in turn and returns truthy for a match, otherwise falsy.
     * 
     * @returns Returns true if the predicate has returned truthy for no values in the series, otherwise returns false. 
     */
    none (predicate?: PredicateFn<ValueT>): boolean {

        if (predicate) {
            assert.isFunction(predicate, "Expected 'predicate' parameter to 'DataFrame.none' to be a function.")
        }

        if (predicate) {
            // Use the predicate to check each value.
            for (const value of this) {
                if (predicate(value)) {
                    return false;
                }
            }
        }
        else {
            // Check each value directly.
            for (const value of this) {
                if (value) {
                    return false;
                }
            }
        }

        return true; // Nothing failed the predicate.
    }

    /**
     * Get a new series containing all values starting at and after the specified index value.
     * 
     * @param indexValue - The index value to search for before starting the new series.
     * 
     * @returns Returns a new series containing all values starting at and after the specified index value. 
     */
    startAt (indexValue: IndexT): IDataFrame<IndexT, ValueT> {

        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            const lessThan = this.getIndex().getLessThan();
            return {                
                columnNames: content.columnNames,
                index: new SkipWhileIterable(content.index, index => lessThan(index, indexValue)),
                pairs: new SkipWhileIterable(content.pairs, pair => lessThan(pair[0], indexValue)),
            };
        });
    }

    /**
     * Get a new series containing all values up until and including the specified index value (inclusive).
     * 
     * @param indexValue - The index value to search for before ending the new series.
     * 
     * @returns Returns a new series containing all values up until and including the specified index value. 
     */
    endAt (indexValue: IndexT): IDataFrame<IndexT, ValueT> {

        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            const lessThanOrEqualTo = this.getIndex().getLessThanOrEqualTo();
            return {
                columnNames: content.columnNames,
                index: new TakeWhileIterable(content.index, index => lessThanOrEqualTo(index, indexValue)),
                pairs: new TakeWhileIterable(content.pairs, pair => lessThanOrEqualTo(pair[0], indexValue)),
            };
        });
    }

    /**
     * Get a new series containing all values up to the specified index value (exclusive).
     * 
     * @param indexValue - The index value to search for before ending the new series.
     * 
     * @returns Returns a new series containing all values up to the specified inde value. 
     */
    before (indexValue: IndexT): IDataFrame<IndexT, ValueT> {

        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            const lessThan = this.getIndex().getLessThan();
            return {
                columnNames: content.columnNames,
                index: new TakeWhileIterable(content.index, index => lessThan(index, indexValue)),
                pairs: new TakeWhileIterable(content.pairs, pair => lessThan(pair[0], indexValue)),
            };
        });
    }

    /**
     * Get a new series containing all values after the specified index value (exclusive).
     * 
     * @param indexValue - The index value to search for.
     * 
     * @returns Returns a new series containing all values after the specified index value.
     */
    after (indexValue: IndexT): IDataFrame<IndexT, ValueT> {
        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            const lessThanOrEqualTo = this.getIndex().getLessThanOrEqualTo();
            return {
                columnNames: content.columnNames,
                index: new SkipWhileIterable(content.index, index => lessThanOrEqualTo(index, indexValue)),
                pairs: new SkipWhileIterable(content.pairs, pair => lessThanOrEqualTo(pair[0], indexValue)),
            };
        });
    }

    /**
     * Get a new dataframe containing all values between the specified index values (inclusive).
     * 
     * @param startIndexValue - The index where the new sequence starts. 
     * @param endIndexValue - The index where the new sequence ends.
     * 
     * @returns Returns a new dataframe containing all values between the specified index values (inclusive).
     */
    between (startIndexValue: IndexT, endIndexValue: IndexT): IDataFrame<IndexT, ValueT> {
        return this.startAt(startIndexValue).endAt(endIndexValue); 
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
     * Parse a column with string values to a column with int values.
     *
     * @param columnNameOrNames - Specifies the column name or array of column names to parse.
     * 
     * @returns Returns a new dataframe with a particular named column parsed as ints.  
     */
    parseInts (columnNameOrNames: string | string[]): IDataFrame<IndexT, ValueT> {

        if (Sugar.Object.isArray(columnNameOrNames)) {
            let working: IDataFrame<IndexT, ValueT> = this;
            for (const columnName of columnNameOrNames) {
                working = working.parseInts(columnName);
            }
            
            return working;
        }
        else {
            return this.withSeries(columnNameOrNames, this.getSeries(columnNameOrNames).parseInts());
        }
    }

    /**
     * Parse a column with string values to a column with float values.
     *
     * @param columnNameOrNames - Specifies the column name or array of column names to parse.
     * 
     * @returns  Returns a new dataframe with a particular named column parsed as floats.  
     */
    parseFloats (columnNameOrNames: string | string[]): IDataFrame<IndexT, ValueT> {

        if (Sugar.Object.isArray(columnNameOrNames)) {
            let working: IDataFrame<IndexT, ValueT> = this;
            for (const columnName of columnNameOrNames) {
                working = working.parseFloats(columnName);
            }
            
            return working;
        }
        else {
            return this.withSeries(columnNameOrNames, this.getSeries(columnNameOrNames).parseFloats());
        }
    }

    /**
     * Parse a column with string values to a column with date values.
     *
     * @param columnNameOrNames - Specifies the column name or array of column names to parse.
     * @param [formatString] - Optional formatting string for dates.
     * 
     * @returns Returns a new dataframe with a particular named column parsed as dates.  
     */
    parseDates (columnNameOrNames: string | string[], formatString?: string): IDataFrame<IndexT, ValueT> {

        if (formatString) {
            assert.isString(formatString, "Expected optional 'formatString' parameter to 'DataFrame.parseDates' to be a string (if specified).");
        }

        if (Sugar.Object.isArray(columnNameOrNames)) {
            let working: IDataFrame<IndexT, ValueT> = this;
            for (const columnName of columnNameOrNames) {
                working = working.parseDates(columnName, formatString);
            }
            
            return working;
        }
        else {
            return this.withSeries(columnNameOrNames, this.getSeries(columnNameOrNames).parseDates(formatString));
        }
    }

    /**
     * Convert a column of values of different types to a column of string values.
     *
     * @param columnNameOrNames - Specifies the column name or array of column names to convert to strings.
     * @param [formatString] - Optional formatting string for dates.
     * 
     * @returns Returns a new dataframe with a particular named column convert to strings.  
     */
    toStrings (columnNameOrNames: string | string[], formatString?: string): IDataFrame<IndexT, ValueT> {

        if (formatString) {
            assert.isString(formatString, "Expected optional 'formatString' parameter to 'DataFrame.parseDates' to be a string (if specified).");
        }

        if (Sugar.Object.isArray(columnNameOrNames)) {
            let working: IDataFrame<IndexT, ValueT> = this;
            for (const columnName of columnNameOrNames) {
                working = working.toStrings(columnName, formatString);
            }
            
            return working;
        }
        else {
            return this.withSeries(columnNameOrNames, this.getSeries(columnNameOrNames).toStrings(formatString));
        }
    }

    /**
     * Produces a new data frame with all string values truncated to the requested maximum length.
     *
     * @param maxLength - The maximum length of the string values after truncation.
     * 
     * @returns Returns a new dataframe with all strings truncated to the specified maximum length.
     */
    truncateStrings (maxLength: number): IDataFrame<IndexT, ValueT> {
        assert.isNumber(maxLength, "Expected 'maxLength' parameter to 'truncateStrings' to be an integer.");

        return this.select((row: any) => {
            const output: any = {};
            for (const key of Object.keys(row)) {
                const value = row[key];
                if (Sugar.Object.isString(value)) {
                    output[key] = value.substring(0, maxLength);
                }
                else {
                    output[key] = value;
                }
            }
           return <ValueT> output;
        });
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
            columnNames: this.getColumnNames(),
            values: this.toArray(),
            index: this.getIndex().toArray(),
            pairs: this.toPairs(),
            baked: true,
        });
    }

    /** 
     * Reverse the dataframe.
     * 
     * @returns Returns a new dataframe that is the reverse of the input.
     */
    reverse (): IDataFrame<IndexT, ValueT> {
        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            return {
                columnNames: content.columnNames,
                values: new ReverseIterable(content.values),
                index: new ReverseIterable(content.index),
                pairs: new ReverseIterable(content.pairs)
            };
        });
    }

    /**
     * Returns only values in the dataframe that are distinct.
     *
     * @param selector - Selects the value used to compare for duplicates.
     * 
     * @returns Returns a dataframe containing only unique values as determined by the 'selector' function. 
     */
    distinct<ToT> (selector?: SelectorFn<ValueT, ToT>): IDataFrame<IndexT, ValueT> {
        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            return {
                columnNames: content.columnNames,
                values: new DistinctIterable<ValueT, ToT>(content.values, selector),
                pairs: new DistinctIterable<[IndexT, ValueT],ToT>(content.pairs, (pair: [IndexT, ValueT]): ToT => selector && selector(pair[1]) || <ToT> <any> pair[1])
            };
        });
    }

    /**
     * Groups the dataframe according to the selector.
     *
     * @param selector - Selector that defines the value to group by.
     *
     * @returns Returns a series of groups. Each group is a series with values that have been grouped by the 'selector' function.
     */
    groupBy<GroupT> (selector: SelectorWithIndexFn<ValueT, GroupT>): ISeries<number, IDataFrame<IndexT, ValueT>> {

        assert.isFunction(selector, "Expected 'selector' parameter to 'DataFrame.groupBy' to be a selector function that determines the value to group the series by.");

        return new Series<number, IDataFrame<IndexT, ValueT>>(() => {
            const groups: any[] = []; // Each group, in order of discovery.
            const groupMap: any = {}; // Group map, records groups by key.
            
            let valueIndex = 0;
    
            for (const pair of this.getContent().pairs) {
                const groupKey = selector(pair[1], valueIndex);
                ++valueIndex;
                const existingGroup = groupMap[groupKey];
                if (existingGroup) {
                    existingGroup.push(pair);
                }
                else {
                    const newGroup: any[] = [];
                    newGroup.push(pair);
                    groups.push(newGroup);
                    groupMap[groupKey] = newGroup;
                }
            }

            return {
                values: groups.map(group => new DataFrame<IndexT, ValueT>({ pairs: group }))
            };            
        });
    }
    
    /**
     * Group sequential values into a series of windows.
     *
     * @param selector - Optional selector that defines the value to group by.
     *
     * @returns Returns a series of groups. Each group is a dataframe with values that have been grouped by the 'selector' function.
     */
    groupSequentialBy<GroupT> (selector?: SelectorFn<ValueT, GroupT>): ISeries<number, IDataFrame<IndexT, ValueT>> {

        if (selector) {
            assert.isFunction(selector, "Expected 'selector' parameter to 'DataFrame.groupSequentialBy' to be a selector function that determines the value to group the series by.")
        }
        else {
            selector = value => <GroupT> <any> value;
        }
        
        return this.variableWindow((a: ValueT, b: ValueT): boolean => selector!(a) === selector!(b));
    }

    /**
     * Concatenate multiple dataframes into a single dataframe.
     *
     * @param dataframes - Array of dataframes to concatenate.
     * 
     * @returns Returns a single dataframe concatenated from multiple input dataframes. 
     */
    static concat<IndexT = any, ValueT = any> (dataframes: IDataFrame<IndexT, ValueT>[]): IDataFrame<IndexT, ValueT > {
        assert.isArray(dataframes, "Expected 'dataframes' parameter to 'DataFrame.concat' to be an array of dataframes.");

        return new DataFrame(() => {
            const upcast = <DataFrame<IndexT, ValueT>[]> dataframes; // Upcast so that we can access private index, values and pairs.
            const contents = upcast.map(dataframe => dataframe.getContent());

            let columnNames: string[] = [];
            for (const content of contents) {
                for (const columnName of content.columnNames) {
                    columnNames.push(columnName);
                }
            }

            columnNames = makeDistinct(columnNames);

            return {
                columnNames: columnNames,
                values: new ConcatIterable(contents.map(content => content.values)),
                pairs: new ConcatIterable(contents.map(content => content.pairs)),
            };
        });    
    }
    
    /**
     * Concatenate multiple other dataframes onto this dataframe.
     * 
     * @param dataframes - Multiple arguments. Each can be either a dataframe or an array of dataframes.
     * 
     * @returns Returns a single dataframes concatenated from multiple input dataframes. 
     */    
    concat (...dataframes: (IDataFrame<IndexT, ValueT>[] | IDataFrame<IndexT, ValueT>)[]): IDataFrame<IndexT, ValueT> {
        const concatInput: IDataFrame<IndexT, ValueT>[] = [this];

        for (const input of dataframes) {
            if (Sugar.Object.isArray(input)) {
                for (const subInput of input) {
                    concatInput.push(subInput);
                }
            }
            else {
                concatInput.push(input);
            }
        }

        return DataFrame.concat<IndexT, ValueT>(concatInput);
    }
   
    /**
    * Zip together multiple dataframes to create a new dataframe.
    * Preserves the index of the first dataframe.
    *
    * @param dataframes - Multiple arguments. Each can be either a dataframe or an array of dataframes.
    * @param zipper - Selector function that produces a new dataframe based on the input dataframes.
    * 
    * @returns Returns a single dataframe zipped from multiple input dataframes. 
    */
    static zip<IndexT = any, ValueT = any, ResultT = any> (dataframes: IDataFrame<IndexT, ValueT>[], zipper: ZipNFn<ValueT, ResultT>): IDataFrame<IndexT, ResultT> {

        assert.isArray(dataframes, "Expected 'dataframe' parameter to 'DataFrame.zip' to be an array of dataframes.");

        if (dataframes.length === 0) {
            return new DataFrame<IndexT, ResultT>();
        }

        const firstSeries = dataframes[0];
        if (firstSeries.none()) {
            return new DataFrame<IndexT, ResultT>();
        }

        return new DataFrame<IndexT, ResultT>(() => {
            const firstSeriesUpCast = <DataFrame<IndexT, ValueT>> firstSeries;
            const upcast = <DataFrame<IndexT, ValueT>[]> dataframes; // Upcast so that we can access private index, values and pairs.
            
            return {
                index: <Iterable<IndexT>> firstSeriesUpCast.getContent().index,
                values: new ZipIterable<ValueT, ResultT>(upcast.map(s => s.getContent().values), zipper),
            };
        });
    }
    
    /**
    * Zip together multiple dataframes to create a new dataframe.
    * Preserves the index of the first dataframe.
    * 
    * @param s2, s3, s4, s4 - Multiple dataframes to zip.
    * @param zipper - Zipper function that produces a new dataframe based on the input dataframes.
    * 
    * @returns Returns a single dataframe concatenated from multiple input dataframes. 
    */    
    zip<Index2T, Value2T, ResultT>  (s2: IDataFrame<Index2T, Value2T>, zipper: Zip2Fn<ValueT, Value2T, ResultT> ): IDataFrame<IndexT, ResultT>;
    zip<Index2T, Value2T, Index3T, Value3T, ResultT>  (s2: IDataFrame<Index2T, Value2T>, s3: IDataFrame<Index3T, Value3T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): IDataFrame<IndexT, ResultT>;
    zip<Index2T, Value2T, Index3T, Value3T, Index4T, Value4T, ResultT>  (s2: IDataFrame<Index2T, Value2T>, s3: IDataFrame<Index3T, Value3T>, s4: IDataFrame<Index4T, Value4T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): IDataFrame<IndexT, ResultT>;
    zip<ResultT>  (...args: any[]): IDataFrame<IndexT, ResultT> {

        const selector: Function = args[args.length-1];
        const input: IDataFrame<IndexT, any>[] = [this].concat(args.slice(0, args.length-1));
        return DataFrame.zip<IndexT, any, ResultT>(input, values => selector(...values));
    }    

    /**
     * Sorts the dataframe by a value defined by the selector (ascending). 
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new ordered dataframe that has been sorted by the value returned by the selector. 
     */
    orderBy<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT> {
        //TODO: Should pass a config fn to OrderedSeries.
        return new OrderedDataFrame<IndexT, ValueT, SortT>(this.getContent().values, this.getContent().pairs, selector, Direction.Ascending, null);
    }

    /**
     * Sorts the dataframe by a value defined by the selector (descending). 
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new ordered dataframe that has been sorted by the value returned by the selector. 
     */
    orderByDescending<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT> {
        //TODO: Should pass a config fn to OrderedSeries.
        return new OrderedDataFrame<IndexT, ValueT, SortT>(this.getContent().values, this.getContent().pairs, selector, Direction.Descending, null);
    }
        
    /**
     * Returns the unique union of values between two dataframes.
     *
     * @param other - The other dataframes to combine.
     * @param [selector] - Optional function that selects the value to compare to detemrine distinctness.
     * 
     * @returns Returns the union of two dataframes.
     */
    union<KeyT = ValueT> (
        other: IDataFrame<IndexT, ValueT>, 
        selector?: SelectorFn<ValueT, KeyT>): 
            IDataFrame<IndexT, ValueT> {

        if (selector) {
            assert.isFunction(selector, "Expected optional 'selector' parameter to 'DataFrame.union' to be a selector function.");
        }

        return this.concat(other).distinct(selector);
    };

    /**
     * Returns the intersection of values between two dataframes.
     *
     * @param inner - The other dataframe to combine.
     * @param [outerSelector] - Optional function to select the key for matching the two dataframes.
     * @param [innerSelector] - Optional function to select the key for matching the two dataframes.
     * 
     * @returns Returns the intersection of two series.
     */
    intersection<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerSelector?: SelectorFn<ValueT, KeyT>,
        innerSelector?: SelectorFn<InnerValueT, KeyT>): 
            IDataFrame<IndexT, ValueT> {

        if (outerSelector) {
            assert.isFunction(outerSelector, "Expected optional 'outerSelector' parameter to 'DataFrame.intersection' to be a function.");
        }
        else {
            outerSelector = value => <KeyT> <any> value;
        }
        
        if (innerSelector) {
            assert.isFunction(innerSelector, "Expected optional 'innerSelector' parameter to 'DataFrame.intersection' to be a function.");
        }
        else {
            innerSelector = value => <KeyT> <any> value;
        }

        const outer = this;
        return outer.where(outerValue => {
                const outerKey = outerSelector!(outerValue);
                return inner
                    .where(innerValue => outerKey === innerSelector!(innerValue))
                    .any();
            });
    };

    /**
     * Returns the exception of values between two dataframes.
     *
     * @param inner - The other dataframe to combine.
     * @param [outerSelector] - Optional function to select the key for matching the two dataframes.
     * @param [innerSelector] - Optional function to select the key for matching the two dataframes.
     * 
     * @returns Returns the difference between the two series.
     */
    except<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerSelector?: SelectorFn<ValueT, KeyT>,
        innerSelector?: SelectorFn<InnerValueT, KeyT>): 
            IDataFrame<IndexT, ValueT> {

        if (outerSelector) {
            assert.isFunction(outerSelector, "Expected optional 'outerSelector' parameter to 'DataFrame.except' to be a function.");
        }
        else {
            outerSelector = value => <KeyT> <any> value;
        }

        if (innerSelector) {
            assert.isFunction(innerSelector, "Expected optional 'innerSelector' parameter to 'DataFrame.except' to be a function.");
        }
        else {
            innerSelector = value => <KeyT> <any> value;
        }

        const outer = this;
        return outer.where(outerValue => {
                const outerKey = outerSelector!(outerValue);
                return inner
                    .where(innerValue => outerKey === innerSelector!(innerValue))
                    .none();
            });
    };

   /**
     * Correlates the elements of two dataframes on matching keys.
     *
     * @param this - The outer dataframe to join. 
     * @param inner - The inner dataframe to join.
     * @param outerKeySelector - Selector that chooses the join key from the outer sequence.
     * @param innerKeySelector - Selector that chooses the join key from the inner sequence.
     * @param resultSelector - Selector that defines how to merge outer and inner values.
     * 
     * @returns Returns the joined dataframe. 
     */
    join<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT, InnerValueT, ResultValueT>):
            IDataFrame<number, ResultValueT> {

        assert.isFunction(outerKeySelector, "Expected 'outerKeySelector' parameter of 'DataFrame.join' to be a selector function.");
        assert.isFunction(innerKeySelector, "Expected 'innerKeySelector' parameter of 'DataFrame.join' to be a selector function.");
        assert.isFunction(resultSelector, "Expected 'resultSelector' parameter of 'DataFrame.join' to be a selector function.");

        const outer = this;

        return new DataFrame<number, ResultValueT>(() => {
            const innerMap = inner
                .groupBy(innerKeySelector)
                .toObject(
                    group => innerKeySelector(group.first()), 
                    group => group
                );

            const outerContent = outer.getContent();

            const output: ResultValueT[] = [];
            
            for (const outerValue of outer) { //TODO: There should be an enumerator that does this.
                const outerKey = outerKeySelector(outerValue);
                const innerGroup = innerMap[outerKey];
                if (innerGroup) {
                    for (const innerValue of innerGroup) {
                        output.push(resultSelector(outerValue, innerValue));
                    }    
                }
            }

            return {
                values: output
            };
        });
    }

    /**
     * Performs an outer join on two series. Correlates the elements based on matching keys.
     * Includes elements from both series that have no correlation in the other series.
     *
     * @param this - The outer series to join. 
     * @param inner - The inner series to join.
     * @param outerKeySelector - Selector that chooses the join key from the outer sequence.
     * @param innerKeySelector - Selector that chooses the join key from the inner sequence.
     * @param resultSelector - Selector that defines how to merge outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @returns Returns the joined series. 
     */
    joinOuter<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            IDataFrame<number, ResultValueT> {

        assert.isFunction(outerKeySelector, "Expected 'outerKeySelector' parameter of 'DataFrame.joinOuter' to be a selector function.");
        assert.isFunction(innerKeySelector, "Expected 'innerKeySelector' parameter of 'DataFrame.joinOuter' to be a selector function.");
        assert.isFunction(resultSelector, "Expected 'resultSelector' parameter of 'DataFrame.joinOuter' to be a selector function.");

        // Get the results in the outer that are not in the inner.
        const outer = this;
        const outerResult = outer.except<InnerIndexT, InnerValueT, KeyT>(inner, outerKeySelector, innerKeySelector)
            .select(outer => resultSelector(outer, null))
            .resetIndex();

        // Get the results in the inner that are not in the outer.
        const innerResult = inner.except<IndexT, ValueT, KeyT>(outer, innerKeySelector, outerKeySelector)
            .select(inner => resultSelector(null, inner))
            .resetIndex();

        // Get the intersection of results between inner and outer.
        const intersectionResults = outer.join<KeyT, InnerIndexT, InnerValueT, ResultValueT>(inner, outerKeySelector, innerKeySelector, resultSelector);

        return outerResult
            .concat(intersectionResults)
            .concat(innerResult)
            .resetIndex();
    };

    /**
     * Performs a left outer join on two dataframes. Correlates the elements based on matching keys.
     * Includes left elements that have no correlation.
     *
     * @param this - The outer dataframe to join. 
     * @param inner - The inner dataframe to join.
     * @param outerKeySelector - Selector that chooses the join key from the outer sequence.
     * @param innerKeySelector - Selector that chooses the join key from the inner sequence.
     * @param resultSelector - Selector that defines how to merge outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @returns Returns the joined dataframes. 
     */
    joinOuterLeft<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            IDataFrame<number, ResultValueT> {

        assert.isFunction(outerKeySelector, "Expected 'outerKeySelector' parameter of 'DataFrame.joinOuterLeft' to be a selector function.");
        assert.isFunction(innerKeySelector, "Expected 'innerKeySelector' parameter of 'DataFrame.joinOuterLeft' to be a selector function.");
        assert.isFunction(resultSelector, "Expected 'resultSelector' parameter of 'DataFrame.joinOuterLeft' to be a selector function.");

        // Get the results in the outer that are not in the inner.
        const outer = this;
        const outerResult = outer.except<InnerIndexT, InnerValueT, KeyT>(inner, outerKeySelector, innerKeySelector)
            .select(outer => resultSelector(outer, null))
            .resetIndex();

        // Get the intersection of results between inner and outer.
        const intersectionResults = outer.join<KeyT, InnerIndexT, InnerValueT, ResultValueT>(inner, outerKeySelector, innerKeySelector, resultSelector);

        return outerResult
            .concat(intersectionResults)
            .resetIndex();
    };

    /**
     * Performs a right outer join on two dataframes. Correlates the elements based on matching keys.
     * Includes right elements that have no correlation.
     *
     * @param this - The outer dataframe to join. 
     * @param inner - The inner dataframe to join.
     * @param outerKeySelector - Selector that chooses the join key from the outer sequence.
     * @param innerKeySelector - Selector that chooses the join key from the inner sequence.
     * @param resultSelector - Selector that defines how to merge outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @returns Returns the joined dataframes. 
     */
    joinOuterRight<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            IDataFrame<number, ResultValueT> {

        assert.isFunction(outerKeySelector, "Expected 'outerKeySelector' parameter of 'DataFrame.joinOuterRight' to be a selector function.");
        assert.isFunction(innerKeySelector, "Expected 'innerKeySelector' parameter of 'DataFrame.joinOuterRight' to be a selector function.");
        assert.isFunction(resultSelector, "Expected 'resultSelector' parameter of 'DataFrame.joinOuterRight' to be a selector function.");

        // Get the results in the inner that are not in the outer.
        const outer = this;
        const innerResult = inner.except<IndexT, ValueT, KeyT>(outer, innerKeySelector, outerKeySelector)
            .select(inner => resultSelector(null, inner))
            .resetIndex();

        // Get the intersection of results between inner and outer.
        const intersectionResults = outer.join<KeyT, InnerIndexT, InnerValueT, ResultValueT>(inner, outerKeySelector, innerKeySelector, resultSelector);

        return intersectionResults
            .concat(innerResult)
            .resetIndex();
    }    

    /**
     * Insert a pair at the start of the dataframe.
     *
     * @param pair - The pair to insert.
     * 
     * @returns Returns a new dataframe with the specified pair inserted.
     */
    insertPair (pair: [IndexT, ValueT]): IDataFrame<IndexT, ValueT> {
        assert.isArray(pair, "Expected 'pair' parameter to 'DataFrame.insertPair' to be an array.");
        assert(pair.length === 2, "Expected 'pair' parameter to 'DataFrame.insertPair' to be an array with two elements. The first element is the index, the second is the value.");

        return (new DataFrame<IndexT, ValueT>({ pairs: [pair] })).concat(this);
    }

    /**
     * Append a pair to the end of a dataframe.
     *
     * @param pair - The pair to append.
     *  
     * @returns Returns a new dataframe with the specified pair appended.
     */
    appendPair (pair: [IndexT, ValueT]): IDataFrame<IndexT, ValueT> {
        assert.isArray(pair, "Expected 'pair' parameter to 'DataFrame.appendPair' to be an array.");
        assert(pair.length === 2, "Expected 'pair' parameter to 'DataFrame.appendPair' to be an array with two elements. The first element is the index, the second is the value.");

        return this.concat(new DataFrame<IndexT, ValueT>({ pairs: [pair] }));
    }

    /**
     * Fill gaps in a dataframe.
     *
     * @param comparer - Comparer that is passed pairA and pairB, two consecutive rows, return truthy if there is a gap between the rows, or falsey if there is no gap.
     * @param generator - Generator that is passed pairA and pairB, two consecutive rows, returns an array of pairs that fills the gap between the rows.
     *
     * @returns Returns a new dataframe with gaps filled in.
     */
    fillGaps (comparer: ComparerFn<[IndexT, ValueT], [IndexT, ValueT]>, generator: GapFillFn<[IndexT, ValueT], [IndexT, ValueT]>): IDataFrame<IndexT, ValueT> {
        assert.isFunction(comparer, "Expected 'comparer' parameter to 'DataFrame.fillGaps' to be a comparer function that compares two values and returns a boolean.")
        assert.isFunction(generator, "Expected 'generator' parameter to 'DataFrame.fillGaps' to be a generator function that takes two values and returns an array of generated pairs to span the gap.")

        return this.rollingWindow(2)
            .asPairs()
            .selectMany((pair: [number, IDataFrame<IndexT, ValueT>]) => {
                const window = pair[1];
                const pairA = window.asPairs().first();
                const pairB = window.asPairs().last();
                if (!comparer(pairA, pairB)) {
                    return [pairA];
                }

                const generatedRows = generator(pairA, pairB);
                assert.isArray(generatedRows, "Expected return from 'generator' parameter to 'DataFrame.fillGaps' to be an array of pairs, instead got a " + typeof(generatedRows));

                return [pairA].concat(generatedRows);
            })
            .asValues<IndexT, ValueT>()
            .appendPair(this.asPairs().last())
            .inflate();
    }

    /**
     * Returns the specified default sequence if the dataframe is empty. 
     *
     * @param defaultSequence - Default sequence to return if the dataframe is empty.
     * 
     * @returns Returns 'defaultSequence' if the dataframe is empty. 
     */
    defaultIfEmpty (defaultSequence: ValueT[] | IDataFrame<IndexT, ValueT>): IDataFrame<IndexT, ValueT> {

        if (this.none()) {
            if (defaultSequence instanceof DataFrame) {
                return <IDataFrame<IndexT, ValueT>> defaultSequence;
            }
            else if (Sugar.Object.isArray(defaultSequence)) {
                return new DataFrame<IndexT, ValueT>(defaultSequence);
            }
            else {
                throw new Error("Expected 'defaultSequence' parameter to 'DataFrame.defaultIfEmpty' to be an array or a series.");
            }
        } 
        else {
            return this;
        }
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

    /**
     * Treat the dataframe as CSV data for purposes of serialization.
     * 
     * @returns Returns an object that represents the dataframe for serialization in the CSV format. Call `writeFile`, `writeFileSync` to output the dataframe via different media.
     */
    asCSV (): ICsvSerializer {
        return new CsvSerializer<IndexT, ValueT>(this);
    }

    /**
     * Treat the dataframe as JSON data for purposes of serialization.
     * 
     * @returns Returns an object that can serialize the dataframe in the JSON format. Call `writeFile` or `writeFileSync` to output the dataframe via different media.
     */
    asJSON (): IJsonSerializer {
        return new JsonSerializer<IndexT, ValueT>(this);        
    }
}

/** 
 * Packages a dataframe ready for CSV serialization.
 * */
export interface ICsvSerializer {

    /**
     * Serialize the dataframe to a CSV file in the local file system.
     * Asynchronous version.
     * 
     * @param filePath - Specifies the output path for the file. 
     * 
     *  @returns Returns a promise that resolves when the file has been written.   
     */
    writeFile (filePath: string): Promise<void>;

    /**
     * Serialize the dataframe to a CSV file in the local file system.
     * Synchronous version.
     * 
     * @param filePath - Specifies the output path for the file. 
     */
    writeFileSync (filePath: string): void;
}

//
// Packages a dataframe ready for CSV serialization.
//
class CsvSerializer<IndexT, ValueT> implements ICsvSerializer {

    dataframe: IDataFrame<IndexT, ValueT>;

    constructor (dataframe: IDataFrame<IndexT, ValueT>) {
        this.dataframe = dataframe;
    }
    
    /**
     * Serialize the dataframe to a CSV file in the local file system.
     * Asynchronous version.
     * 
     * @param filePath - Specifies the output path for the file. 
     * 
     *  @returns Returns a promise that resolves when the file has been written.   
     */
    writeFile (filePath: string): Promise<void> {
        assert.isString(filePath, "Expected 'filePath' parameter to 'DataFrame.asCSV().writeFile' to be a string that specifies the path of the file to write to the local file system.");

        return new Promise((resolve, reject) => {
            var fs = require('fs');	
            fs.writeFile(filePath, this.dataframe.toCSV(), (err: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    }

    /**
     * Serialize the dataframe to a CSV file in the local file system.
     * Synchronous version.
     * 
     * @param filePath - Specifies the output path for the file. 
     */
    writeFileSync (filePath: string): void {
        assert.isString(filePath, "Expected 'filePath' parameter to 'DataFrame.asCSV().writeFileSync' to be a string that specifies the path of the file to write to the local file system.");

        var fs = require('fs');	
        fs.writeFileSync(filePath, this.dataframe.toCSV());
    }
}

/**
 * Packages a dataframe ready for JSON serialization.
 */
export interface IJsonSerializer {

    /**
     * Serialize the dataframe to a JSON file in the local file system.
     * Asynchronous version.
     * 
     * @param filePath - Specifies the output path for the file. 
     * 
     *  @returns Returns a promise that resolves when the file has been written.   
     */
    /*async*/ writeFile (filePath: string): Promise<void>;

    /**
     * Serialize the dataframe to a JSON file in the local file system.
     * Synchronous version.
     * 
     * @param filePath - Specifies the output path for the file. 
     */
    writeFileSync (filePath: string): void;
}

//
// Packages a dataframe ready for JSON serialization.
//
class JsonSerializer<IndexT, ValueT> implements IJsonSerializer {

    dataframe: IDataFrame<IndexT, ValueT>;

    constructor (dataframe: IDataFrame<IndexT, ValueT>) {
        this.dataframe = dataframe;
    }

    /**
     * Serialize the dataframe to a JSON file in the local file system.
     * Asynchronous version.
     * 
     * @param filePath - Specifies the output path for the file. 
     * 
     *  @returns Returns a promise that resolves when the file has been written.   
     */
    writeFile (filePath: string): Promise<void> {
        assert.isString(filePath, "Expected 'filePath' parameter to 'DataFrame.asJSON().writeFile' to be a string that specifies the path of the file to write to the local file system.");

        return new Promise((resolve, reject) => {
            var fs = require('fs');	
            fs.writeFile(filePath, this.dataframe.toJSON(), (err: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    }

    /**
     * Serialize the dataframe to a JSON file in the local file system.
     * Synchronous version.
     * 
     * @param filePath - Specifies the output path for the file. 
     */
    writeFileSync (filePath: string): void {
        assert.isString(filePath, "Expected 'filePath' parameter to 'DataFrame.asJSON().writeFile' to be a string that specifies the path of the file to write to the local file system.");

        var fs = require('fs');	
        fs.writeFileSync(filePath, this.dataframe.toJSON());
    }
}

//
// A dataframe that has been ordered.
//
class OrderedDataFrame<IndexT = number, ValueT = any, SortT = any> 
    extends DataFrame<IndexT, ValueT>
    implements IOrderedDataFrame<IndexT, ValueT, SortT> {

    parent: OrderedDataFrame<IndexT, ValueT, SortT> | null;
    selector: SelectorWithIndexFn<ValueT, SortT>;
    direction: Direction;
    origValues: Iterable<ValueT>;
    origPairs: Iterable<[IndexT, ValueT]>;

    //
    // Helper function to create a sort spec.
    //
    private static makeSortSpec (sortLevel: number, selector: SortSelectorFn, direction: Direction): ISortSpec {
        return { sortLevel: sortLevel, selector: selector, direction: direction };
    }

    //
    // Helper function to make a sort selector for pairs, this captures the parent correct when generating the closure.
    //
    private static makePairsSelector (selector: SortSelectorFn): SortSelectorFn {
        return (pair: any, index: number) => selector(pair[1], index);
    }

    constructor(values: Iterable<ValueT>, pairs: Iterable<[IndexT, ValueT]>, selector: SelectorWithIndexFn<ValueT, SortT>, direction: Direction, parent: OrderedDataFrame<IndexT, ValueT> | null) {

        const valueSortSpecs: ISortSpec[] = [];
        const pairSortSpecs: ISortSpec[] = [];
        let sortLevel = 0;

        while (parent !== null) {
            valueSortSpecs.push(OrderedDataFrame.makeSortSpec(sortLevel, parent.selector, parent.direction));
            pairSortSpecs.push(OrderedDataFrame.makeSortSpec(sortLevel, OrderedDataFrame.makePairsSelector(parent.selector), parent.direction));
            ++sortLevel;
            parent = parent.parent;
        }

        valueSortSpecs.push(OrderedDataFrame.makeSortSpec(sortLevel, selector, direction));
        pairSortSpecs.push(OrderedDataFrame.makeSortSpec(sortLevel, (pair: [IndexT, ValueT], index: number) => selector(pair[1], index), direction));

        super({
            values: new OrderedIterable(values, valueSortSpecs),
            pairs: new OrderedIterable(pairs, pairSortSpecs)
        });

        this.parent = parent;
        this.selector = selector;
        this.direction = direction;
        this.origValues = values;
        this.origPairs = pairs;
    }

    /** 
     * Performs additional sorting (ascending).
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new dataframe has been additionally sorted by the value returned by the selector. 
     */
    thenBy<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT> {
        //TODO: Should pass a config fn to OrderedSeries.
        return new OrderedDataFrame<IndexT, ValueT, SortT>(this.origValues, this.origPairs, selector, Direction.Ascending, this);
    }

    /** 
     * Performs additional sorting (descending).
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new dataframe has been additionally sorted by the value returned by the selector. 
     */
    thenByDescending<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT> {
        //TODO: Should pass a config fn to OrderedSeries.
        return new OrderedDataFrame<IndexT, ValueT, SortT>(this.origValues, this.origPairs, selector, Direction.Descending, this);        
    }
}
    