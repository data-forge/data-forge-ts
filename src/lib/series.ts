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
import { SeriesWindowIterable }  from './iterables/series-window-iterable';
import { ReverseIterable }  from './iterables/reverse-iterable';
import { ZipIterable }  from './iterables/zip-iterable';
import { DistinctIterable }  from './iterables/distinct-iterable';
import { SeriesRollingWindowIterable }  from './iterables/series-rolling-window-iterable';
import { SeriesVariableWindowIterable }  from './iterables/series-variable-window-iterable';
import { OrderedIterable, Direction, ISortSpec, SelectorFn as SortSelectorFn }  from './iterables/ordered-iterable';
import * as Sugar from 'sugar';
import { IIndex, Index } from './index';
import { ExtractElementIterable } from './iterables/extract-element-iterable';
import { SkipIterable } from './iterables/skip-iterable';
import { SkipWhileIterable } from './iterables/skip-while-iterable';
const Table = require('easy-table');
import { assert } from 'chai';
import { IDataFrame, DataFrame } from './dataframe';
import * as moment from 'moment';
import { toMap } from './utils';
import { range, replicate } from '..';
import * as numeral from 'numeral';

/**
 * Used to configure a series.
 */
export interface ISeriesConfig<IndexT, ValueT> {
    /**
     * Values to put in the dataframe.
     * This should be array or iterable of JavaScript values.
     */
    values?: Iterable<ValueT>,

    /***
     * The index for the serires.
     * If omitted the index will default to a 0-based index.
     */
    index?: Iterable<IndexT>,

    /**
     * Array or iterable of index,value pairs to put in the series.
     * If index and values are not separately specified they can be extracted
     * from the pairs.
     */
    pairs?: Iterable<[IndexT, ValueT]>

    /***
     * Set to true when the series has been baked into memory
     * and does not need to be lazily evaluated.
     */
    baked?: boolean,
};

/**
 * A user-defined callback function that can be applied to each value.
 */
export type CallbackFn<ValueT> = (value: ValueT, index: number) => void;

/**
 * A user-defined selector function. 
 * Transforms a value into another kind of value.
 */
export type SelectorWithIndexFn<FromT, ToT> = (value: FromT, index: number) => ToT;

/**
 * User-defined zipper functions.
 * Used to 'zip together' multiple series or dataframes.
 */
export type ZipNFn<ValueT, ReturnT> = (input: ISeries<number, ValueT>) => ReturnT;
export type Zip2Fn<T1, T2, ReturnT> = (a: T1, b : T2) => ReturnT;
export type Zip3Fn<T1, T2, T3, ReturnT> = (a: T1, b: T2, c: T3) => ReturnT;
export type Zip4Fn<T1, T2, T3, T4, ReturnT> = (a: T1, b: T2, c: T3, d: T4) => ReturnT;
export type Zip5Fn<T1, T2, T3, T4, T5, ReturnT> = (a: T1, b: T2, c: T3, d: T4) => ReturnT;

/**
 * A user-defined selector function with no index. 
 * Transforms a value into another kind of value.
 */
export type SelectorFn<FromT, ToT> = (value: FromT) => ToT;

/**
 * A user-defined function that joins two values and produces a result.
 */
export type JoinFn<ValueT1, ValueT2, ResultT> = (a: ValueT1, b: ValueT2) => ResultT;

/**
 * A user-defined predicate function, returns true or false based on input.
 */
export type PredicateFn<ValueT> = (value: ValueT) => boolean;

/**
 * A user-defined function that aggregtates a value into an accumulator
 * and returns the new result.
 */
export type AggregateFn<ValueT, ToT> = (accum: ToT, value: ValueT) => ToT;

/**
 * A user-defined comparer function that Compares to values and 
 * returns true (truthy) if they are equivalent or false (falsy) if not.
 */
export type ComparerFn<ValueT1, ValueT2> = (a: ValueT1, b: ValueT2) => boolean;

/*
 * A user-defined function that generates a series config object.
 * Used to make it easy to create lazy evaluated series.
 */
export type SeriesConfigFn<IndexT, ValueT> = () => ISeriesConfig<IndexT, ValueT>;

/*
 * A user-defined gap-filler function.
 * This function generates a sequence of values between to fill the gaps between two other values.
 */
export type GapFillFn<ValueT, ResultT> = (a: ValueT, b: ValueT) => ResultT[];

/**
 * Represents the frequency of a type in a series or dataframe.
 */
export interface ITypeFrequency {

    /**
     * The name of the type.
     */
    Type: string; 

    /**
     * The frequency of the type's appearance in the series or dataframe.
     */
    Frequency: number;
}

/**
 * Represents the frequency of a value in a series or dataframe.
 */
export interface IValueFrequency {

    /**
     * The value.
     */
    Value: any; 

    /**
     * The frequency of the value's appearance in the series or dataframe.
     */
    Frequency: number;
}

/**
 * Places a value in a bucket or range of values.
 */
export interface IBucket {
    /**
     * The bucketed value.
     */
    Value: number;

    /**
     * The index of the bucket that contains the value.
     */
    Bucket: number;

    /**
     * The minimum value in the bucket.
     */
    Min: number;

    /**
     * The mid-point value in the bucket.
     */
    Mid: number;
    
    /**
     * The maximum value in the bucket.
     */
    Max: number;
}

/**
 * Interface that represents a dataframe.
 * A series contains an indexed sequence of values.
 * A series indexed by time is a timeseries.
 * 
 * @typeparam IndexT The type to use for the index.
 * @typeparam ValueT The type to use for each value.
 */
export interface ISeries<IndexT = number, ValueT = any> extends Iterable<ValueT> {

    /**
     * Get an iterator to enumerate the values of the series.
     * Enumerating the iterator forces lazy evaluation to complete.
     * This function is automatically called by `for...of`.
     * 
     * @return An iterator for the values in the series.
     * 
     * @example
     * <pre>
     * 
     * for (const value of series) {
     *     // ... do something with the value ...
     * }
     * </pre>
     */
    [Symbol.iterator] (): Iterator<ValueT>;

    /**
     * Cast the value of the series to a new type.
     * This operation has no effect but to retype the values that the series contains.
     * 
     * @return The same series, but with the type changed.
     * 
     * @example
     * <pre>
     * 
     * const castSeries = series.cast<SomeOtherType>();
     * </pre>
     */
    cast<NewValueT> (): ISeries<IndexT, NewValueT>;

    /**
     * Get the index for the series.
     * 
     * @return The {@link Index} for the series.
     * 
     * @example
     * <pre>
     * 
     * const index = series.getIndex();
     * </pre>
     */
    getIndex (): IIndex<IndexT>;

    /**
     * Apply a new {@link Index} to the series.
     * 
     * @param newIndex The new array or iterable to be the new {@link Index} of the series. Can also be a selector to choose the {@link Index} for each value in the series.
     * 
     * @return Returns a new series with the specified {@link Index} attached.
     * 
     * @example
     * <pre>
     * 
     * const indexedSeries = series.withIndex([10, 20, 30]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const indexedSeries = series.withIndex(someOtherSeries);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const indexedSeries = series.withIndex(value => computeIndexFromValue(value));
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const indexedSeries = series.withIndex(value => value + 20);
     * </pre>
     */
    withIndex<NewIndexT> (newIndex: Iterable<NewIndexT> | SelectorFn<ValueT, NewIndexT>): ISeries<NewIndexT, ValueT>;

    /**
     * Resets the {@link Index} of the series back to the default zero-based sequential integer index.
     * 
     * @return Returns a new series with the {@link Index} reset to the default zero-based index. 
     * 
     * @example
     * <pre>
     * 
     * const seriesWithResetIndex = series.resetIndex();
     * </pre>
     */
    resetIndex (): ISeries<number, ValueT>;

    /**
    * Extract values from the series as an array.
    * This forces lazy evaluation to complete.
    * 
    * @return Returns an array of the values contained within the series.
    * 
    * @example
    * <pre>
    * const values = series.toArray();
    * </pre>
    */
   toArray (): ValueT[];

    /**
     * Retreive the index, values pairs from the seires as an array.
     * Each pair is [index, value].
     * This forces lazy evaluation to complete.
     * 
     * @return Returns an array of pairs that contains the series' values. Each pair is a two element array that contains an index and a value.
     * 
     * @example
     * <pre>
     * const pairs = series.toPairs();
     * </pre>
     */
    toPairs (): ([IndexT,ValueT])[];

    /**
     * Convert the series to a JavaScript object.
     *
     * @param keySelector User-defined selector function that selects keys for the resulting object.
     * @param valueSelector User-defined selector function that selects values for the resulting object.
     * 
     * @return Returns a JavaScript object generated from the series by applying the key and value selector functions. 
     * 
     * @example
     * <pre>
     * 
     * const someObject = series.toObject(
     *      value => value, // Specify the value to use for field names in the output object.
     *      value => value // Specify the value to use as the value for each field.
     * );
     * </pre>
     */
    toObject<KeyT = any, FieldT = any, OutT = any> (keySelector: (value: ValueT) => KeyT, valueSelector: (value: ValueT) => FieldT): OutT;

    /**
     * Generates a new dataframe by repeatedly calling a user-defined selector function on each value in the original series.
     *
     * @param selector A user-defined selector function that transforms each row to create the new dataframe.
     * 
     * @return Returns a new series with each value transformed by the selector function.
     * 
     * @example
     * <pre>
     * 
     * function transformValue (inputValue) {
     *      const outputValue = {
     *          // ... construct output value derived from input value ...
     *      };
     *
     *      return outputValue;
     * }
     *  
     * const transformedSeries = series.select(value => transformValue(value));
     * </pre>
     */
    select<ToT> (selector: SelectorWithIndexFn<ValueT, ToT>): ISeries<IndexT, ToT>;

    /**
     * Generates a new series by repeatedly calling a user-defined selector function on each row in the original series.
     * 
     * Similar to the {@link select} function, but in this case the selector function produces a collection of output values that are flattened and merged to create the new series.
     *
     * @param selector A user-defined selector function that transforms each value into a collection of output values.
     * 
     * @return Returns a new series where each value has been transformed into 0 or more new values by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * function produceOutputValues (inputValue) {
     *      const outputValues = [];
     *      while (someCondition) {
     *          // ... generate zero or more output values ...
     *          outputValues.push(... some generated value ...);
     *      }
     *      return outputValues;
     * }
     * 
     * const modifiedSeries = series.selectMany(value => produceOutputValues(value));
     * </pre>
     */
    selectMany<ToT> (selector: SelectorWithIndexFn<ValueT, Iterable<ToT>>): ISeries<IndexT, ToT>;
        
    /**
     * Partition a series into a {@link Series} of *data windows*. 
     * Each value in the new series is a chunk of data from the original series.
     *
     * @param period The number of values to include in each data window.
     * 
     * @return Returns a new series, each value of which is a chunk (data window) of the original series.
     * 
     * @example
     * <pre>
     * 
     * const windows = series.window(2); // Get values in pairs.
     * const pctIncrease = windows.select(pair => (pair.last() - pair.first()) / pair.first());
     * console.log(pctIncrease.toString());
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const salesDf = ... // Daily sales data.
     * const weeklySales = salesDf.window(7); // Partition up into weekly data sets.
     * console.log(weeklySales.toString());
     * </pre>
     */
    window (period: number): ISeries<number, ISeries<IndexT, ValueT>>;

    /** 
     * Partition a series into a new series of *rolling data windows*. 
     * Each value in the new series is a rolling chunk of data from the original series.
     *
     * @param period The number of data values to include in each data window.
     * 
     * @return Returns a new series, each value of which is a rolling chunk of the original series.
     * 
     * @example
     * <pre>
     * 
     * const salesData = ... // Daily sales data.
     * const rollingWeeklySales = salesData.rollingWindow(7); // Get rolling window over weekly sales data.
     * console.log(rollingWeeklySales.toString());
     * </pre>
     */
    rollingWindow (period: number): ISeries<number, ISeries<IndexT, ValueT>>;

    /**
     * Partition a series into a new series of variable-length *data windows* 
     * where the divisions between the data chunks are
     * defined by a user-provided *comparer* function.
     * 
     * @param comparer Function that compares two adjacent data values and returns true if they should be in the same window.
     * 
     * @return Returns a new series, each value of which is a chunk of data from the original series.
     * 
     * @example
     * <pre>
     * 
     * function rowComparer (valueA, valueB) {
     *      if (... valueA should be in the same data window as valueB ...) {
     *          return true;
     *      }
     *      else {
     *          return false;
     *      }
     * };
     * 
     * const variableWindows = series.variableWindow(rowComparer);
     */
    variableWindow (comparer: ComparerFn<ValueT, ValueT>): ISeries<number, ISeries<IndexT, ValueT>>;

    /**
     * Eliminates adjacent duplicate values.
     * 
     * For each group of adjacent values that are equivalent only returns the last index/row for the group, 
     * thus ajacent equivalent values are collapsed down to the last value.
     *
     * @param [selector] Optional selector function to determine the value used to compare for equivalence.
     * 
     * @return Returns a new series with groups of adjacent duplicate vlaues collapsed to a single value per group.
     * 
     * @example
     * <pre>
     * 
     * const seriesWithDuplicateRowsRemoved = series.sequentialDistinct(value => value);
     * 
     * // Or
     * const seriesWithDuplicateRowsRemoved = series.sequentialDistinct(value => value.someNestedField);
     * </pre>
     */
    sequentialDistinct<ToT> (selector: SelectorFn<ValueT, ToT>): ISeries<IndexT, ValueT>;
    
    /**
     * Aggregate the values in the series to a single result.
     *
     * @param [seed] Optional seed value for producing the aggregation.
     * @param selector Function that takes the seed and then each value in the series and produces the aggregated value.
     * 
     * @return Returns a new value that has been aggregated from the series using the 'selector' function. 
     * 
     * @example
     * <pre>
     * 
     * const dailySales = ... daily sales figures for the past month ...
     * const totalSalesForthisMonth = dailySales.aggregate(
     *      0, // Seed - the starting value.
     *      (accumulator, salesAmount) => accumulator + salesAmount // Aggregation function.
     * );
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const totalSalesAllTime = 500; // We'll seed the aggregation with this value.
     * const dailySales = ... daily sales figures for the past month ...
     * const updatedTotalSalesAllTime = dailySales.aggregate(
     *      totalSalesAllTime, 
     *      (accumulator, salesAmount) => accumulator + salesAmount
     * );
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * var salesDataSummary = salesData.aggregate({
     *      TotalSales: series => series.count(),
     *      AveragePrice: series => series.average(),
     *      TotalRevenue: series => series.sum(), 
     * });
     * </pre>
    */
    aggregate<ToT = ValueT> (seedOrSelector: AggregateFn<ValueT, ToT> | ToT, selector?: AggregateFn<ValueT, ToT>): ToT;

    /**
     * Compute the amount of change between pairs or sets of values in the series.
     * 
     * @param [period] Optional period for computing the change - defaults to 2.
     * 
     * @returns Returns a new series where each value indicates the amount of change from the previous number value in the original series.  
     * 
     * @example
     * <pre>
     * 
     * const saleFigures = ... running series of daily sales figures ...
     * const amountChanged = salesFigures.amountChanged(); // Amount that sales has changed, day to day.
     * </pre>
     * @example
     * <pre>
     * 
     * const saleFigures = ... running series of daily sales figures ...
     * const amountChanged = salesFigures.amountChanged(7); // Amount that sales has changed, week to week.
     * </pre>
     */
    amountChange (period?: number): ISeries<IndexT, number>;

    /**
     * Compute the proportion change between pairs or sets of values in the series.
     * Proportions are expressed as 0-1 values.
     * 
     * @param [period] Optional period for computing the proportion - defaults to 2.
     * 
     * @returns Returns a new series where each value indicates the proportion change from the previous number value in the original series.
     * 
     * @example
     * <pre>
     * 
     * const saleFigures = ... running series of daily sales figures ...
     * const proportionChanged = salesFigures.amountChanged(); // Proportion that sales has changed, day to day.
     * </pre>
     * @example
     * <pre>
     * 
     * const saleFigures = ... running series of daily sales figures ...
     * const proportionChanged = salesFigures.amountChanged(7); // Proportion that sales has changed, week to week.
     * </pre>
     */
    proportionChange (period?: number): ISeries<IndexT, number>;

    /**
     * Compute the percentage change between pairs or sets of values in the series.
     * Percentages are expressed as 0-100 values.
     * 
     * @param [period] Optional period for computing the percentage - defaults to 2.
     * 
     * @returns Returns a new series where each value indicates the percent change from the previous number value in the original series.
     * 
     * @example
     * <pre>
     * 
     * const saleFigures = ... running series of daily sales figures ...
     * const percentChanged = salesFigures.amountChanged(); // Percent that sales has changed, day to day.
     * </pre>
     * @example
     * <pre>
     * 
     * const saleFigures = ... running series of daily sales figures ...
     * const percentChanged = salesFigures.amountChanged(7); // Percent that sales has changed, week to week.
     * </pre>
     */
    percentChange (period?: number): ISeries<IndexT, number>;

    /**
     * Skip a number of values in the series.
     *
     * @param numValues Number of values to skip.
     * 
     * @return Returns a new series with the specified number of values skipped.
     * 
     * @example
     * <pre>
     * 
     * const seriesWithRowsSkipped = series.skip(10); // Skip 10 rows in the original series.
     * </pre>
     */
    skip (numValues: number): ISeries<IndexT, ValueT>;

    /**
     * Skips values in the series while a condition evaluates to true or truthy.
     *
     * @param predicate Returns true/truthy to continue to skip values in the original series.
     * 
     * @return Returns a new series with all initial sequential values removed while the predicate returned true/truthy.
     * 
     * @example
     * <pre>
     * 
     * const seriesWithRowsSkipped = series.skipWhile(salesFigure => salesFigure > 100); // Skip initial sales figure that are less than 100.
     * </pre>
     */
    skipWhile (predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT>;

    /**
     * Skips values in the series untils a condition evaluates to true or truthy.
     *
     * @param predicate Return true/truthy to stop skipping values in the original series.
     * 
     * @return Returns a new series with all initial sequential values removed until the predicate returned true/truthy.
     * 
     * @example
     * <pre>
     * 
     * const seriesWithRowsSkipped = series.skipUntil(salesFigure => salesFigure > 100); // Skip initial sales figures unitl we see one greater than 100.
     * </pre>
     */
    skipUntil (predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT>;
    
    /**
     * Take a number of  values from the series.
     *
     * @param numValues Number of values to take.
     * 
     * @return Returns a new series with only the specified number of values taken from the original series.
     * 
     * @example
     * <pre>
     * 
     * const seriesWithRowsTaken = series.take(15); // Take only the first 15 values from the original series.
     * </pre>
     */
    take (numRows: number): ISeries<IndexT, ValueT>;
    
    /**
     * Takes values from the series while a condition evaluates to true or truthy.
     *
     * @param predicate Returns true/truthy to continue to take values from the original series.
     * 
     * @return Returns a new series with only the initial sequential values that were taken while the predicate returned true/truthy.
     * 
     * @example
     * <pre>
     * 
     * const seriesWithRowsTaken = series.takeWhile(salesFigure => salesFigure > 100); // Take only initial sales figures that are greater than 100.
     * </pre>
     */
    takeWhile (predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT>;

    /**
     * Takes values from the series until a condition evaluates to true or truthy.
     *
     * @param predicate Return true/truthy to stop taking values in the original series.
     * 
     * @return Returns a new series with only the initial sequential values taken until the predicate returned true/truthy.
     * 
     * @example
     * <pre>
     * 
     * const seriesWithRowsTaken = series.takeUntil(salesFigure => salesFigure > 100); // Take all initial sales figures until we see one that is greater than 100.
     * </pre>
     */
    takeUntil (predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT>;
    
    /**
     * Count the number of values in the seriese
     *
     * @return Returns the count of all values.
     * 
     * @example
     * <pre>
     * 
     * const numValues = series.count();
     * </pre>
     */
    count (): number;
    
    /**
     * Get the first value of the series.
     *
     * @return Returns the first value of the series.
     * 
     * @example
     * <pre>
     * 
     * const firstValue = series.first();
     * </pre>
     */
    first (): ValueT;

    /**
     * Get the last value of the series.
     *
     * @return Returns the last value of the series.
     * 
     * @example
     * <pre>
     * 
     * const lastValue = series.last();
     * </pre>
     */
    last (): ValueT;

    /**
     * Get the value, if there is one, with the specified index.
     *
     * @param index Index to for which to retreive the value.
     *
     * @return Returns the value from the specified index in the series or undefined if there is no such index in the present in the series.
     * 
     * @example
     * <pre>
     * 
     * const value = series.at(5); // Get the value at index 5 (with a default 0-based index).
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const date = ... some date ...
     * // Retreive the value with specified date from a time-series (assuming date indexed has been applied).
     * const value = series.at(date); 
     * </pre>
     */
    at (index: IndexT): ValueT | undefined;

    /** 
     * Get X value from the start of the series.
     * Pass in a negative value to get all values at the head except for X values at the tail.
     *
     * @param numValues Number of values to take.
     * 
     * @return Returns a new series that has only the specified number of values taken from the start of the original series.
     * 
     * @examples
     * <pre>
     * 
     * const sample = series.head(10); // Take a sample of 10 values from the start of the series.
     * </pre>
     */
    head (numValues: number): ISeries<IndexT, ValueT>;

    /** 
     * Get X values from the end of the series.
     * Pass in a negative value to get all values at the tail except X values at the head.
     *
     * @param numValues Number of values to take.
     * 
     * @return Returns a new series that has only the specified number of values taken from the end of the original series.  
     * 
     * @examples
     * <pre>
     * 
     * const sample = series.tail(12); // Take a sample of 12 values from the end of the series.
     * </pre>
     */
    tail (numValues: number): ISeries<IndexT, ValueT>;

    /**
     * Filter the series using user-defined predicate function.
     *
     * @param predicate Predicte function to filter values from the series. Returns true/truthy to keep values, or false/falsy to omit values.
     * 
     * @return Returns a new series containing only the values from the original series that matched the predicate. 
     * 
     * @example
     * <pre>
     * 
     * const filtered = series.where(salesFigure => salesFigure > 100); // Filter so we only have sales figures greater than 100.
     * </pre>
     */
    where (predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT>;

    /**
     * Invoke a callback function for each value in the series.
     *
     * @param callback - The calback to invoke for each value.
     * 
     * @returns Returns the input series with no modifications.
     */
    forEach (callback: CallbackFn<ValueT>): ISeries<IndexT, ValueT>;

    /**
     * Determine if the predicate returns truthy for all values in the series.
     * Returns false as soon as the predicate evaluates to falsy.
     * Returns true if the predicate returns truthy for all values in the series.
     * Returns false if the series is empty.
     * 
     * TODO: Should predicate here by optional  as well same as in any and none?
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
    startAt (indexValue: IndexT): ISeries<IndexT, ValueT>;

    /**
     * Get a new series containing all values up until and including the specified index value (inclusive).
     * 
     * @param indexValue - The index value to search for before ending the new series.
     * 
     * @returns Returns a new series containing all values up until and including the specified index value. 
     */
    endAt (indexValue: IndexT): ISeries<IndexT, ValueT>;

    /**
     * Get a new series containing all values up to the specified index value (exclusive).
     * 
     * @param indexValue - The index value to search for before ending the new series.
     * 
     * @returns Returns a new series containing all values up to the specified inde value. 
     */
    before (indexValue: IndexT): ISeries<IndexT, ValueT>;

    /**
     * Get a new series containing all values after the specified index value (exclusive).
     * 
     * @param indexValue - The index value to search for.
     * 
     * @returns Returns a new series containing all values after the specified index value.
     */
    after (indexValue: IndexT): ISeries<IndexT, ValueT>;

    /**
     * Get a new series containing all values between the specified index values (inclusive).
     * 
     * @param startIndexValue - The index where the new sequence starts. 
     * @param endIndexValue - The index where the new sequence ends.
     * 
     * @returns Returns a new series containing all values between the specified index values (inclusive).
     */
    between (startIndexValue: IndexT, endIndexValue: IndexT): ISeries<IndexT, ValueT>;

    /** 
     * Format the series for display as a string.
     * This forces lazy evaluation to complete.
     * 
     * @returns Generates and returns a string representation of the series or dataframe.
     */
    toString (): string;

    /**
     * Parse a series with string values to a series with int values.
     * 
     * @returns Returns a new series where string values from the original series have been parsed to integer values.
     */
    parseInts (): ISeries<IndexT, number>;

    /**
     * Parse a series with string values to a series with float values.
     * 
     * @returns Returns a new series where string values from the original series have been parsed to floating-point values.
     */
    parseFloats (): ISeries<IndexT, number>;

    /**
     * Parse a series with string values to a series with date values.
     *
     * @param [formatString] Optional formatting string for dates.
     * 
     * @returns Returns a new series where string values from the original series have been parsed to Date values.
     */
    parseDates (formatString?: string): ISeries<IndexT, Date>;

    /**
     * Convert a series of values of different types to a series of string values.
     *
     * @param [formatString] Optional formatting string for numbers and dates.
     * 
     * Numeral.js is used for number formatting.
     * http://numeraljs.com/
     * 
     * Moment is used for date formatting.
     * https://momentjs.com/docs/#/parsing/string-format/
     * 
     * @returns Returns a new series where the values from the original series have been stringified. 
     */
    toStrings (formatString?: string): ISeries<IndexT, string>;

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
    inflate<ToT = ValueT> (selector?: SelectorWithIndexFn<ValueT, ToT>): IDataFrame<IndexT, ToT>;

    /**
     * Sum the values in a series.
     * 
     * @returns Returns the sum of the number values in the series.
     */
    sum (): number;

    /**
     * Average the values in a series.
     * 
     * @returns Returns the average of the number values in the series.
     */
    average (): number;

    /**
     * Get the median value in the series. Not this sorts the series, so can be expensive.
     * 
     * @returns Returns the median of the values in the series.
     */
    median (): number;

    /**
     * Get the min value in the series.
     * 
     * @returns Returns the minimum of the number values in the series.
     */
    min (): number;

    /**
     * Get the max value in the series.
     * 
     * @returns Returns the maximum of the number values in the series.
     */
    max (): number;

    /**
     * Invert the sign of every number value in the series.
     * This assumes that the input series contains numbers.
     * 
     * @returns Returns a new series with all number values inverted.
     */
    invert (): ISeries<IndexT, number>;

    /** 
     * Reverse the series.
     * 
     * @returns Returns a new series that is the reverse of the input.
     */
    reverse (): ISeries<IndexT, ValueT>;

    /**
     * Returns only values in the series that have distinct values.
     *
     * @param selector - Selects the value used to compare for duplicates.
     * 
     * @returns Returns a series containing only unique values as determined by the 'selector' function. 
     */
    distinct<ToT> (selector?: SelectorFn<ValueT, ToT>): ISeries<IndexT, ValueT>;

    /**
     * Group the series according to the selector.
     *
     * @param selector - Selector that defines the value to group by.
     *
     * @returns Returns a series of groups. Each group is a series with values that have been grouped by the 'selector' function.
     */
    groupBy<GroupT> (selector: SelectorFn<ValueT, GroupT>): ISeries<number, ISeries<IndexT, ValueT>>;

    /**
     * Group sequential values into a Series of windows.
     *
     * @param selector - Optional selector that defines the value to group by.
     *
     * @returns Returns a series of groups. Each group is a series with values that have been grouped by the 'selector' function.
     */
    groupSequentialBy<GroupT> (selector?: SelectorFn<ValueT, GroupT>): ISeries<number, ISeries<IndexT, ValueT>>;
    
    /**
     * Concatenate multiple other series onto this series.
     * 
     * @param series - Multiple arguments. Each can be either a series or an array of series.
     * 
     * @returns Returns a single series concatenated from multiple input series. 
     */    
    concat (...series: (ISeries<IndexT, ValueT>[]|ISeries<IndexT, ValueT>)[]): ISeries<IndexT, ValueT>;

    /**
    * Zip together multiple series to create a new series.
    * Preserves the index of the first series.
    * 
    * @param s2, s3, s4, s4 - Multiple series to zip.
    * @param zipper - Zipper function that produces a new series based on the input series.
    * 
    * @returns Returns a single series concatenated from multiple input series. 
    */    
   zip<Index2T, Value2T, ResultT>  (s2: ISeries<Index2T, Value2T>, zipper: Zip2Fn<ValueT, Value2T, ResultT> ): ISeries<IndexT, ResultT>;
   zip<Index2T, Value2T, Index3T, Value3T, ResultT>  (s2: ISeries<Index2T, Value2T>, s3: ISeries<Index3T, Value3T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): ISeries<IndexT, ResultT>;
   zip<Index2T, Value2T, Index3T, Value3T, Index4T, Value4T, ResultT>  (s2: ISeries<Index2T, Value2T>, s3: ISeries<Index3T, Value3T>, s4: ISeries<Index4T, Value4T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): ISeries<IndexT, ResultT>;
   zip<ResultT>  (...args: any[]): ISeries<IndexT, ResultT>;
   
    /**
     * Sorts the series by a value defined by the selector (ascending). 
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new ordered series that has been sorted by the value returned by the selector. 
     */
    orderBy<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;

    /**
     * Sorts the series by a value defined by the selector (descending). 
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new ordered series that has been sorted by the value returned by the selector. 
     */
    orderByDescending<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;

    /**
     * Returns the unique union of values between two series.
     *
     * @param other - The other Series or DataFrame to combine.
     * @param [selector] - Optional function that selects the value to compare to detemrine distinctness.
     * 
     * @returns Returns the union of two series.
     */
    union<KeyT = ValueT> (
        other: ISeries<IndexT, ValueT>, 
        selector?: SelectorFn<ValueT, KeyT>): 
            ISeries<IndexT, ValueT>;

    /**
     * Returns the intersection of values between two series.
     *
     * @param inner - The other series to combine.
     * @param [outerSelector] - Optional function to select the key for matching the two series.
     * @param [innerSelector] - Optional function to select the key for matching the two series.
     * 
     * @returns Returns the intersection of two series.
     */
    intersection<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerSelector?: SelectorFn<ValueT, KeyT>,
        innerSelector?: SelectorFn<InnerValueT, KeyT>): 
            ISeries<IndexT, ValueT>;

    /**
     * Returns the exception of values between two series.
     *
     * @param inner - The other series to combine.
     * @param [outerSelector] - Optional function to select the key for matching the two series.
     * @param [innerSelector] - Optional function to select the key for matching the two series.
     * 
     * @returns Returns the difference between the two series.
     */
    except<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerSelector?: SelectorFn<ValueT, KeyT>,
        innerSelector?: SelectorFn<InnerValueT, KeyT>): 
            ISeries<IndexT, ValueT>;

    /**
     * Correlates the elements of two series on matching keys.
     *
     * @param this - The outer Series or DataFrame to join. 
     * @param inner - The inner Series or DataFrame to join.
     * @param outerKeySelector - Selector that chooses the join key from the outer sequence.
     * @param innerKeySelector - Selector that chooses the join key from the inner sequence.
     * @param resultSelector - Selector that defines how to merge outer and inner values.
     * 
     * @returns Returns the joined series. 
     */
    join<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT, InnerValueT, ResultValueT>):
            ISeries<number, ResultValueT>;

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
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            ISeries<number, ResultValueT>;

    /**
     * Performs a left outer join on two series. Correlates the elements based on matching keys.
     * Includes left elements that have no correlation.
     *
     * @param this - The outer Series or DataFrame to join. 
     * @param inner - The inner Series or DataFrame to join.
     * @param outerKeySelector - Selector that chooses the join key from the outer sequence.
     * @param innerKeySelector - Selector that chooses the join key from the inner sequence.
     * @param resultSelector - Selector that defines how to merge outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @returns {Series|DataFrame} Returns the joined series or dataframe. 
     */
    joinOuterLeft<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            ISeries<number, ResultValueT>;

    /**
     * Performs a right outer join on two series. Correlates the elements based on matching keys.
     * Includes right elements that have no correlation.
     *
     * @param this - The outer Series or DataFrame to join. 
     * @param inner - The inner Series or DataFrame to join.
     * @param outerKeySelector - Selector that chooses the join key from the outer sequence.
     * @param innerKeySelector - Selector that chooses the join key from the inner sequence.
     * @param resultSelector - Selector that defines how to merge outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @returns {Series|DataFrame} Returns the joined series or dataframe. 
     */
    joinOuterRight<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            ISeries<number, ResultValueT>;

    /**
     * Produces a new series with all string values truncated to the requested maximum length.
     *
     * @param maxLength - The maximum length of the string values after truncation.
     * 
     * @returns Returns a new series with strings that are truncated to the specified maximum length. 
     */
    truncateStrings (maxLength: number): ISeries<IndexT, ValueT>;

    /**
     * Insert a pair at the start of the series.
     *
     * @param pair - The pair to insert.
     * 
     * @returns Returns a new series with the specified pair inserted.
     */
    insertPair (pair: [IndexT, ValueT]): ISeries<IndexT, ValueT>;

    /**
     * Append a pair to the end of a Series.
     *
     * @param pair - The pair to append.
     *  
     * @returns Returns a new series with the specified pair appended.
     */
    appendPair (pair: [IndexT, ValueT]): ISeries<IndexT, ValueT>;

    /**
     * Fill gaps in a series or dataframe.
     *
     * @param comparer - Comparer that is passed pairA and pairB, two consecutive rows, return truthy if there is a gap between the rows, or falsey if there is no gap.
     * @param generator - Generator that is passed pairA and pairB, two consecutive rows, returns an array of pairs that fills the gap between the rows.
     *
     * @returns {Series} Returns a new series with gaps filled in.
     */
    fillGaps (comparer: ComparerFn<[IndexT, ValueT], [IndexT, ValueT]>, generator: GapFillFn<[IndexT, ValueT], [IndexT, ValueT]>): ISeries<IndexT, ValueT>;

    /**
     * Returns the specified default sequence if the series is empty. 
     *
     * @param defaultSequence - Default sequence to return if the series is empty.
     * 
     * @returns Returns 'defaultSequence' if the series is empty. 
     */
    defaultIfEmpty (defaultSequence: ValueT[] | ISeries<IndexT, ValueT>): ISeries<IndexT, ValueT>;

    /** 
     * Detect the types of the values in the sequence.
     *
     * @returns Returns a dataframe that describes the data types contained in the input series or dataframe.
     */
    detectTypes (): IDataFrame<number, ITypeFrequency>;

    /** 
     * Detect the frequency of values in the sequence.
     *
     * @returns Returns a dataframe that describes the values contained in the input sequence.
     */
    detectValues (): IDataFrame<number, IValueFrequency>;
}

/**
 * Interface to a series that has been ordered.
 */
export interface IOrderedSeries<IndexT = number, ValueT = any, SortT = any> extends ISeries<IndexT, ValueT> {

    /** 
     * Performs additional sorting (ascending).
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new series has been additionally sorted by the value returned by the selector. 
     */
    thenBy<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;

    /** 
     * Performs additional sorting (descending).
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new series has been additionally sorted by the value returned by the selector. 
     */
    thenByDescending<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;
}

//
// Represents the contents of a series.
//
interface ISeriesContent<IndexT, ValueT> {
    index: Iterable<IndexT>;
    values: Iterable<ValueT>;
    pairs: Iterable<[IndexT, ValueT]>;

    //
    // Records if a series is baked into memory.
    //
    isBaked: boolean;
}

/**
 * Class that represents a series containing a sequence of indexed values.
 */
export class Series<IndexT = number, ValueT = any> implements ISeries<IndexT, ValueT> {

    //
    // Function to lazy evaluate the configuration of the series.
    //
    private configFn: SeriesConfigFn<IndexT, ValueT> | null = null;

    //
    // The content of the series.
    // When this is null it means the series is yet to be lazy initialised.
    //
    private content: ISeriesContent<IndexT, ValueT> | null = null;

    private static readonly defaultCountIterable = new CountIterable();
    private static readonly defaultEmptyIterable = new EmptyIterable();

    //
    // Initialise series content from an array of values.
    //
    private static initFromArray<IndexT, ValueT>(arr: Iterable<ValueT>): ISeriesContent<IndexT, ValueT> {
        return {
            index: Series.defaultCountIterable,
            values: arr,
            pairs: new MultiIterable([Series.defaultCountIterable, arr]),
            isBaked: true,
        };
    }

    //
    // Initialise an empty series.
    //
    private static initEmpty<IndexT, ValueT>(): ISeriesContent<IndexT, ValueT> {
        return {
            index: Series.defaultEmptyIterable,
            values: Series.defaultEmptyIterable,
            pairs: Series.defaultEmptyIterable,
            isBaked: true,
        };
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
            throw new Error("Expected '" + fieldName + "' field of Series config object to be an array of values or an iterable of values.");
        }
    };

    //
    // Initialise series content from a config object.
    //
    private static initFromConfig<IndexT, ValueT>(config: ISeriesConfig<IndexT, ValueT>): ISeriesContent<IndexT, ValueT> {

        let index: Iterable<IndexT>;
        let values: Iterable<ValueT>;
        let pairs: Iterable<[IndexT, ValueT]> | undefined;
        let isBaked = false;

        if (config.pairs) {
            Series.checkIterable<[IndexT, ValueT]>(config.pairs, "pairs");
            pairs = config.pairs;
        }

        if (config.index) {
            Series.checkIterable<IndexT>(config.index, "index")
            index = config.index;
        }
        else if (pairs) {
            index = new ExtractElementIterable(pairs, 0);
        }
        else {
            index = Series.defaultCountIterable;
        }

        if (config.values) {
            Series.checkIterable<ValueT>(config.values, "values");
            values = config.values;
        }
        else if (pairs) {
            values = new ExtractElementIterable(pairs, 1);
        }
        else {
            values = Series.defaultEmptyIterable;
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
        };
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
    constructor(config?: Iterable<ValueT> | ISeriesConfig<IndexT, ValueT> | SeriesConfigFn<IndexT, ValueT>) {
        if (config) {
            if (Sugar.Object.isFunction(config)) {
                this.configFn = config;
            }
            else if (Sugar.Object.isArray(config) || 
                     Sugar.Object.isFunction((config as any)[Symbol.iterator])) {
                this.content = Series.initFromArray(config as Iterable<ValueT>);
            }
            else {
                this.content = Series.initFromConfig(config as ISeriesConfig<IndexT, ValueT>);
            }
        }
        else {
            this.content = Series.initEmpty();
        }
    }

    //
    // Ensure the series content has been initialised.
    //
    private lazyInit() {
        if (this.content === null && this.configFn !== null) {
            this.content = Series.initFromConfig(this.configFn());
        }
    }

    //
    // Ensure the series content is lazy initalised and return it.
    //
    private getContent(): ISeriesContent<IndexT, ValueT> { 
        this.lazyInit();
        return this.content!;
    }

    /**
     * Get an iterator to enumerate the values of the series.
     * Enumerating the iterator forces lazy evaluation to complete.
     */
    [Symbol.iterator](): Iterator<ValueT> {
        return this.getContent().values[Symbol.iterator]();
    }

    /**
     * Cast the value of the series to a new type.
     * This operation has no effect but to retype the value that the series contains.
     */
    cast<NewValueT> (): ISeries<IndexT, NewValueT> {
        return this as any as ISeries<IndexT, NewValueT>;
    }
    
    /**
     * Get the index for the series.
     */
    getIndex (): IIndex<IndexT> {
        return new Index<IndexT>(() => ({ values: this.getContent().index }));
    }

    /**
     * Apply a new index to the Series.
     * 
     * @param newIndex The new array or iterable to apply to the dataframe. Can also be a selector to choose the index for each row in the dataframe.
     * 
     * @returns Returns a new series with the specified index attached.
     */
    withIndex<NewIndexT> (newIndex: Iterable<NewIndexT> | SelectorFn<ValueT, NewIndexT>): ISeries<NewIndexT, ValueT> {

        if (Sugar.Object.isFunction(newIndex)) {
            return new Series<NewIndexT, ValueT>(() => ({
                values: this.getContent().values,
                index: this.select(newIndex),
            }));
        }
        else {
            Series.checkIterable(newIndex, 'newIndex');
            
            return new Series<NewIndexT, ValueT>(() => ({
                values: this.getContent().values,
                index: newIndex,
            }));
        }
    };

    /**
     * Resets the index of the series back to the default zero-based sequential integer index.
     * 
     * @returns Returns a new series with the index reset to the default zero-based index. 
     */
    resetIndex (): ISeries<number, ValueT> {
        return new Series<number, ValueT>(() => ({
            values: this.getContent().values // Just strip the index.
        }));
    }
    
    /**
    * Extract values from the series as an array.
    * This forces lazy evaluation to complete.
    * 
    * @returns Returns an array of values contained within the series. 
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
     * Retreive the index and values from the Series as an array of pairs.
     * Each pair is [index, value].
     * This forces lazy evaluation to complete.
     * 
     * @returns Returns an array of pairs that contains the series content. Each pair is a two element array that contains an index and a value.  
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
     * Convert the series to a JavaScript object.
     *
     * @param keySelector - Function that selects keys for the resulting object.
     * @param valueSelector - Function that selects values for the resulting object.
     * 
     * @returns {object} Returns a JavaScript object generated from the input sequence by the key and value selector funtions. 
     */
    toObject<KeyT = any, FieldT = any, OutT = any> (keySelector: (value: ValueT) => KeyT, valueSelector: (value: ValueT) => FieldT): OutT {

        assert.isFunction(keySelector, "Expected 'keySelector' parameter to Series.toObject to be a function.");
        assert.isFunction(valueSelector, "Expected 'valueSelector' parameter to Series.toObject to be a function.");

        return toMap(this, keySelector, valueSelector);
    }
    
    /**
     * Generate a new series based by calling the selector function on each value.
     *
     * @param selector Selector function that transforms each value to create a new series.
     * 
     * @returns Returns a new series that has been transformed by the selector function.
     */
    select<ToT> (selector: SelectorWithIndexFn<ValueT, ToT>): ISeries<IndexT, ToT> {
        assert.isFunction(selector, "Expected 'selector' parameter to 'Series.select' function to be a function.");

        return new Series(() => ({
            values: new SelectIterable(this.getContent().values, selector),
            index: this.getContent().index,
        }));
    }

    /**
     * Generate a new series based on the results of the selector function.
     *
     * @param selector Selector function that transforms each value into a list of values.
     * 
     * @returns  Returns a new series with values that have been produced by the selector function. 
     */
    selectMany<ToT> (selector: SelectorWithIndexFn<ValueT, Iterable<ToT>>): ISeries<IndexT, ToT> {
        assert.isFunction(selector, "Expected 'selector' parameter to 'Series.selectMany' to be a function.");

        return new Series(() => ({
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
     * Segment a series into 'windows'. Returns a new series. Each value in the new series contains a 'window' (or segment) of the original series.
     * Use select or selectPairs to aggregate.
     *
     * @param period - The number of values in the window.
     * 
     * @returns Returns a new series, each value of which is a 'window' (or segment) of the original series.
     */
    window (period: number): ISeries<number, ISeries<IndexT, ValueT>> {

        assert.isNumber(period, "Expected 'period' parameter to 'Series.window' to be a number.");

        return new Series<number, ISeries<IndexT, ValueT>>(() => ({
            values: new SeriesWindowIterable<IndexT, ValueT>(this.getContent().pairs, period)
        }));
    }

    /** 
     * Segment a series into 'rolling windows'. Returns a new series. Each value in the new series contains a 'window' (or segment) of the original series.
    *
     * @param period - The number of values in the window.
     * 
     * @returns Returns a new series, each value of which is a 'window' (or segment) of the original series.
     */
    rollingWindow (period: number): ISeries<number, ISeries<IndexT, ValueT>> {

        assert.isNumber(period, "Expected 'period' parameter to 'Series.rollingWindow' to be a number.");

        return new Series<number, ISeries<IndexT, ValueT>>(() => ({
            values: new SeriesRollingWindowIterable<IndexT, ValueT>(this.getContent().pairs, period)
        }));
    }

    /**
     * Groups sequential values into variable length 'windows'.
     *
     * @param comparer - Predicate that compares two values and returns true if they should be in the same window.
     * 
     * @returns Returns a series of groups. Each group is itself a series that contains the values in the 'window'. 
     */
    variableWindow (comparer: ComparerFn<ValueT, ValueT>): ISeries<number, ISeries<IndexT, ValueT>> {
        
        assert.isFunction(comparer, "Expected 'comparer' parameter to 'Series.variableWindow' to be a function.")

        return new Series<number, ISeries<IndexT, ValueT>>(() => ({
            values: new SeriesVariableWindowIterable<IndexT, ValueT>(this.getContent().pairs, comparer)
        }));
    };    

    /**
     * Collapase distinct values that happen to be sequential.
     *
     * @param [selector] - Optional selector function to determine the value used to compare for duplicates.
     * 
     * @returns Returns a new series with duplicate values that are sequential removed.
     */
    sequentialDistinct<ToT = ValueT> (selector?: SelectorFn<ValueT, ToT>): ISeries<IndexT, ValueT> {
        
        if (selector) {
            assert.isFunction(selector, "Expected 'selector' parameter to 'Series.sequentialDistinct' to be a selector function that determines the value to compare for duplicates.")
        }
        else {
            selector = (value: ValueT): ToT => <ToT> <any> value;
        }

        return this.variableWindow((a, b) => selector!(a) === selector!(b))
            .select((window): [IndexT, ValueT] => {
                return [window.getIndex().first(), window.first()]  ;
            })
            .withIndex(pair => pair[0])
            .select(pair => pair[1]);
    }

    /**
     * Aggregate the values in the series.
     *
     * @param [seed] - Optional seed value for producing the aggregation.
     * @param selector - Function that takes the seed and then each value in the series and produces the aggregate value.
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
    }
   
    /**
     * Compute the amount of change between each pair of values.
     * 
     * @param [period] - Optional period for computing the change - defaults to 2.
     * 
     * @returns Returns a new series where each value indicates the amount of change from the previous number value in the original series.  
     */
    amountChange (period?: number): ISeries<IndexT, number> {
        return (<ISeries<IndexT, number>> <any> this) // Have to assume this is a number series.
            .rollingWindow(period === undefined ? 2 : period)
            .select((window): [IndexT, number] => {
                const first = window.first();
                const last = window.last();
                const amountChange = last - first; // Compute amount of change.
                return [window.getIndex().last(), amountChange]; // Return new index and value.
            })
            .withIndex(pair => pair[0])
            .select(pair => pair[1]);
    }   

    /**
     * Compute the proportion change between each pair of values.
     * Proportions are expressed as 0-1 values.
     * 
     * @param [period] - Optional period for computing the proportion - defaults to 2.
     * 
     * @returns Returns a new series where each value indicates the proportion change from the previous number value in the original series.  
     */
    proportionChange (period?: number): ISeries<IndexT, number> {
        return (<ISeries<IndexT, number>> <any> this) // Have to assume this is a number series.
            .rollingWindow(period === undefined ? 2 : period)
            .select((window): [IndexT, number] => {
                const first = window.first();
                const last = window.last();
                const amountChange = last - first; // Compute amount of change.
                const pctChange = amountChange / first; // Compute proportion change.
                return [window.getIndex().last(), pctChange]; // Return new index and value.
            })
            .withIndex(pair => pair[0])
            .select(pair => pair[1]);
    }    

    /**
     * Compute the percent change between each pair of values.
     * Percentages are expressed as 0-100 values.
     * 
     * @param [period] - Optional period for computing the percentage - defaults to 2.
     * 
     * @returns Returns a new series where each value indicates the percent change from the previous number value in the original series.  
     */
    percentChange (period?: number): ISeries<IndexT, number> {
        return this.proportionChange(period).select(v => v * 100);
    }    
    
    /**
     * Skip a number of values in the series.
     *
     * @param numValues - Number of values to skip.     * 
     * @returns Returns a new series or dataframe with the specified number of values skipped. 
     */
    skip (numValues: number): ISeries<IndexT, ValueT> {
        return new Series<IndexT, ValueT>(() => ({
            values: new SkipIterable(this.getContent().values, numValues),
            index: new SkipIterable(this.getContent().index, numValues),
            pairs: new SkipIterable(this.getContent().pairs, numValues),
        }));
    }
    
    /**
     * Skips values in the series while a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     * 
     * @returns Returns a new series with all initial sequential values removed that match the predicate.  
     */
    skipWhile (predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT> {
        assert.isFunction(predicate, "Expected 'predicate' parameter to 'Series.skipWhile' function to be a predicate function that returns true/false.");

        return new Series<IndexT, ValueT>(() => ({
            values: new SkipWhileIterable(this.getContent().values, predicate),
            pairs: new SkipWhileIterable(this.getContent().pairs, pair => predicate(pair[1])),
        }));
    }

    /**
     * Skips values in the series until a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     * 
     * @returns Returns a new series with all initial sequential values removed that don't match the predicate.
     */
    skipUntil (predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT> {
        assert.isFunction(predicate, "Expected 'predicate' parameter to 'Series.skipUntil' function to be a predicate function that returns true/false.");

        return this.skipWhile(value => !predicate(value)); 
    }

    /**
     * Take a number of rows in the series.
     *
     * @param numRows - Number of rows to take.
     * 
     * @returns Returns a new series with up to the specified number of values included.
     */
    take (numRows: number): ISeries<IndexT, ValueT> {
        assert.isNumber(numRows, "Expected 'numRows' parameter to 'Series.take' function to be a number.");

        return new Series(() => ({
            index: new TakeIterable(this.getContent().index, numRows),
            values: new TakeIterable(this.getContent().values, numRows),
            pairs: new TakeIterable(this.getContent().pairs, numRows)
        }));
    };

    /**
     * Take values from the series while a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     * 
     * @returns Returns a new series that only includes the initial sequential values that have matched the predicate.
     */
    takeWhile (predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT> {
        assert.isFunction(predicate, "Expected 'predicate' parameter to 'Series.takeWhile' function to be a predicate function that returns true/false.");

        return new Series(() => ({
            values: new TakeWhileIterable(this.getContent().values, predicate),
            pairs: new TakeWhileIterable(this.getContent().pairs, pair => predicate(pair[1]))
        }));
    }

    /**
     * Take values from the series until a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     * 
     * @returns Returns a new series or dataframe that only includes the initial sequential values that have not matched the predicate.
     */
    takeUntil (predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT> {
        assert.isFunction(predicate, "Expected 'predicate' parameter to 'Series.takeUntil' function to be a predicate function that returns true/false.");

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
     * Pass in a negative value to get all items at the head except X values at the tail.
     *
     * @param numValues - Number of values to take.
     * 
     * @returns Returns a new series that has only the specified number of values taken from the start of the input sequence.  
     */
    head (numValues: number): ISeries<IndexT, ValueT> {

        assert.isNumber(numValues, "Expected 'numValues' parameter to 'Series.head' function to be a number.");

        if (numValues === 0) {
            return new Series<IndexT, ValueT>(); // Empty series.
        }

        const toTake = numValues < 0 ? this.count() - Math.abs(numValues) : numValues;
        return this.take(toTake);
    }

    /** 
     * Get X values from the end of the series.
     * Pass in a negative value to get all items at the tail except X values at the head.
     *
     * @param numValues - Number of values to take.
     * 
     * @returns Returns a new series that has only the specified number of values taken from the end of the input sequence.  
     */
    tail (numValues: number): ISeries<IndexT, ValueT> {

        assert.isNumber(numValues, "Expected 'numValues' parameter to 'Series.tail' function to be a number.");

        if (numValues === 0) {
            return new Series<IndexT, ValueT>(); // Empty series.
        }

        const toSkip = numValues > 0 ? this.count() - numValues : Math.abs(numValues);
        return this.skip(toSkip);
    }

    /**
     * Filter a series by a predicate selector.
     *
     * @param predicate - Predicte function to filter rows of the series.
     * 
     * @returns Returns a new series containing only the values that match the predicate. 
     */
    where (predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT> {

        assert.isFunction(predicate, "Expected 'predicate' parameter to 'Series.where' function to be a function.");

        return new Series(() => ({
            values: new WhereIterable(this.getContent().values, predicate),
            pairs: new WhereIterable(this.getContent().pairs, pair => predicate(pair[1]))
        }));
    }

    /**
     * Invoke a callback function for each value in the series.
     *
     * @param callback - The calback to invoke for each value.
     * 
     * @returns Returns the input series with no modifications.
     */
    forEach (callback: CallbackFn<ValueT>): ISeries<IndexT, ValueT> {
        assert.isFunction(callback, "Expected 'callback' parameter to 'Series.forEach' to be a function.");

        let index = 0;
        for (const value of this) {
            callback(value, index++);
        }

        return this;
    };

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
        assert.isFunction(predicate, "Expected 'predicate' parameter to 'Series.all' to be a function.")

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
            assert.isFunction(predicate, "Expected 'predicate' parameter to 'Series.any' to be a function.")
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
            // Just check if there is at least one item.
            const iterator = this[Symbol.iterator]()
            return !iterator.next().done;
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
            assert.isFunction(predicate, "Expected 'predicate' parameter to 'Series.none' to be a function.")
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
            // Just check if empty.
            const iterator = this[Symbol.iterator]()
            return iterator.next().done;
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
    startAt (indexValue: IndexT): ISeries<IndexT, ValueT> {
        return new Series<IndexT, ValueT>(() => {
            const lessThan = this.getIndex().getLessThan();
            return {                
                index: new SkipWhileIterable(this.getContent().index, index => lessThan(index, indexValue)),
                pairs: new SkipWhileIterable(this.getContent().pairs, pair => lessThan(pair[0], indexValue)),
            }
        });
    }

    /**
     * Get a new series containing all values up until and including the specified index value (inclusive).
     * 
     * @param indexValue - The index value to search for before ending the new series.
     * 
     * @returns Returns a new series containing all values up until and including the specified index value. 
     */
    endAt (indexValue: IndexT): ISeries<IndexT, ValueT> {
        return new Series<IndexT, ValueT>(() => {
            const lessThanOrEqualTo = this.getIndex().getLessThanOrEqualTo();
            return {
                index: new TakeWhileIterable(this.getContent().index, index => lessThanOrEqualTo(index, indexValue)),
                pairs: new TakeWhileIterable(this.getContent().pairs, pair => lessThanOrEqualTo(pair[0], indexValue)),
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
    before (indexValue: IndexT): ISeries<IndexT, ValueT> {
        return new Series<IndexT, ValueT>(() => {
            const lessThan = this.getIndex().getLessThan();
            return {
                index: new TakeWhileIterable(this.getContent().index, index => lessThan(index, indexValue)),
                pairs: new TakeWhileIterable(this.getContent().pairs, pair => lessThan(pair[0], indexValue)),
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
    after (indexValue: IndexT): ISeries<IndexT, ValueT> {
        return new Series<IndexT, ValueT>(() => {
            const lessThanOrEqualTo = this.getIndex().getLessThanOrEqualTo();
            return {
                index: new SkipWhileIterable(this.getContent().index, index => lessThanOrEqualTo(index, indexValue)),
                pairs: new SkipWhileIterable(this.getContent().pairs, pair => lessThanOrEqualTo(pair[0], indexValue)),
            };
        });
    }

    /**
     * Get a new series containing all values between the specified index values (inclusive).
     * 
     * @param startIndexValue - The index where the new sequence starts. 
     * @param endIndexValue - The index where the new sequence ends.
     * 
     * @returns Returns a new series containing all values between the specified index values (inclusive).
     */
    between (startIndexValue: IndexT, endIndexValue: IndexT): ISeries<IndexT, ValueT> {
        return this.startAt(startIndexValue).endAt(endIndexValue); 
    }

    /** 
     * Format the series for display as a string.
     * This forces lazy evaluation to complete.
     * 
     * @returns Generates and returns a string representation of the series or dataframe.
     */
    toString (): string {

        const header = ["__index__", "__value__"];
        const rows = this.toPairs();

        const table = new Table();
        rows.forEach((row, rowIndex) => {
            row.forEach((cell, cellIndex) => {
                table.cell(header[cellIndex], cell);
            });
            table.newRow();
        });

        return table.toString();
    };

    //
    // Helper function to parse a string to an int.
    //
    static parseInt (value: any | undefined, valueIndex: number): number | undefined {
        if (value === undefined) {
            return undefined;
        }
        else {
            assert.isString(value, "Called Series.parseInts, expected all values in the series to be strings, instead found a '" + typeof(value) + "' at index " + valueIndex);

            if (value.length === 0) {
                return undefined;
            }

            return parseInt(value);
        }
    }

    /**
     * Parse a series with string values to a series with int values.
     * 
     * @returns Returns a new series where string values from the original series have been parsed to integer values.
     */
    parseInts (): ISeries<IndexT, number> {
        return <ISeries<IndexT, number>> this.select(Series.parseInt);
    };

    //
    // Helper function to parse a string to a float.
    //
    static parseFloat (value: any | undefined, valueIndex: number): number | undefined {
        if (value === undefined) {
            return undefined;
        }
        else {
            assert.isString(value, "Called Series.parseFloats, expected all values in the series to be strings, instead found a '" + typeof(value) + "' at index " + valueIndex);

            if (value.length === 0) {
                return undefined;
            }

            return parseFloat(value);
        }
    }

    /**
     * Parse a series with string values to a series with float values.
     * 
     * @returns Returns a new series where string values from the original series have been parsed to floating-point values.
     */
    parseFloats (): ISeries<IndexT, number> {
        return <ISeries<IndexT, number>> this.select(Series.parseFloat);
    };

    //
    // Helper function to parse a string to a date.
    //
    static parseDate (value: any | undefined, valueIndex: number, formatString?: string): Date | undefined {
        if (value === undefined) {
            return undefined;
        }
        else {
            assert.isString(value, "Called Series.parseDates, expected all values in the series to be strings, instead found a '" + typeof(value) + "' at index " + valueIndex);

            if (value.length === 0) {
                return undefined;
            }

            return moment(value, formatString).toDate();
        }
    }

    /**
     * Parse a series with string values to a series with date values.
     *
     * @param [formatString] Optional formatting string for dates.
     * 
     * @returns Returns a new series where string values from the original series have been parsed to Date values.
     */
    parseDates (formatString?: string): ISeries<IndexT, Date> {

        if (formatString) {
            assert.isString(formatString, "Expected optional 'formatString' parameter to Series.parseDates to be a string (if specified).");
        }

        return <ISeries<IndexT, Date>> this.select((value: any | undefined, valueIndex: number) => Series.parseDate(value, valueIndex, formatString));
    }

    //
    // Helper function to convert a value to a string.
    //
    static toString(value: any | undefined, formatString?: string): string | undefined | null {
        if (value === undefined) {
            return undefined;
        }
        else if (value === null) {
            return null;
        }
        else if (formatString && Sugar.Object.isDate(value)) {
            return moment(value).format(formatString);
        }
        else if (formatString && moment.isMoment(value)) {
            return value.format(formatString);
        }
        else if (formatString && Sugar.Object.isNumber(value)) {
            return numeral(value).format(formatString);
        }
        else {
            return value.toString();	
        }		
    }

    /**
     * Convert a series of values of different types to a series of string values.
     *
     * @param [formatString] Optional formatting string for numbers and dates.
     * 
     * Numeral.js is used for number formatting.
     * http://numeraljs.com/
     * 
     * Moment is used for date formatting.
     * https://momentjs.com/docs/#/parsing/string-format/
     * 
     * @returns Returns a new series where the values from the original series have been stringified. 
     */
    toStrings (formatString?: string): ISeries<IndexT, string> {

        if (formatString) {
            assert.isString(formatString, "Expected optional 'formatString' parameter to Series.toStrings to be a string (if specified).");
        }

        return <ISeries<IndexT, string>> this.select(value => Series.toString(value, formatString));
    }

    /**
     * Forces lazy evaluation to complete and 'bakes' the series into memory.
     * 
     * @returns Returns a series that has been 'baked', all lazy evaluation has completed.  
     */
    bake (): ISeries<IndexT, ValueT> {

        if (this.getContent().isBaked) {
            // Already baked.
            return this;
        }

        return new Series<IndexT, ValueT>({
            values: this.toArray(),
            pairs: this.toPairs(),
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
    inflate<ToT = ValueT> (selector?: SelectorWithIndexFn<ValueT, ToT>): IDataFrame<IndexT, ToT> {

        if (selector) {
            assert.isFunction(selector, "Expected 'selector' parameter to Series.inflate to be a selector function.");

            return new DataFrame<IndexT, ToT>({ //TODO: Pass a fn in here.
                values: new SelectIterable(this.getContent().values, selector),
                index: this.getContent().index,
                pairs: new SelectIterable(this.getContent().pairs, (pair: [IndexT, ValueT], index: number): [IndexT, ToT] => [pair[0], selector(pair[1], index)]),
            });            
        }
        else {
            return new DataFrame<IndexT, ToT>({ //TODO: Pass a fn in here.
                values: <Iterable<ToT>> <any> this.getContent().values,
                index: this.getContent().index,
                pairs: <Iterable<[IndexT, ToT]>> <any> this.getContent().pairs
            });
        }
    }

    /**
     * Sum the values in a series.
     * 
     * @returns Returns the sum of the number values in the series.
     */
    sum (): number {

        if (this.none()) {
            return 0;
        }

        const numberSeries = <ISeries<IndexT, number>> <any> this; // Have to assume we are working with a number series here.
        return numberSeries.aggregate((prev: number, value: number) => prev + value);
    }

    /**
     * Average the values in a series.
     * 
     * @returns Returns the average of the number values in the series.
     */
    average (): number {

        const count = this.count();
        if (count > 0) {
            return this.sum() / count;
        }
        else {
            return 0;
        }
    }

    /**
     * Get the median value in the series. Not this sorts the series, so can be expensive.
     * 
     * @returns Returns the median of the values in the series.
     */
    median (): number {

        //
        // From here: http://stackoverflow.com/questions/5275115/add-a-median-method-to-a-list
        //
        const numberSeries = <ISeries<IndexT, number>> <any> this; // Have to assume we are working with a number series here.

        const count = numberSeries.count();
        if (count === 0) {
            return 0;
        }

        const ordered = numberSeries.orderBy(value => value).toArray();
        if ((count % 2) == 0) {
            // Even.
            const a = ordered[count / 2 - 1];
            const b = ordered[count / 2];
            return (a + b) / 2;	
        }

        // Odd
        return ordered[Math.floor(count / 2)];
    }

    /**
     * Get the min value in the series.
     * 
     * @returns Returns the minimum of the number values in the series.
     */
    min (): number {

        const numberSeries = <ISeries<IndexT, number>> <any> this; // Have to assume we are working with a number series here.
        return numberSeries.aggregate((prev, value) => Math.min(prev, value));
    }

    /**
     * Get the max value in the series.
     * 
     * @returns Returns the maximum of the number values in the series.
     */
    max (): number {

        const numberSeries = <ISeries<IndexT, number>> <any> this; // Have to assume we are working with a number series here.
        return numberSeries.aggregate((prev, value) => Math.max(prev, value));
    }
    
    /**
     * Invert the sign of every number value in the series.
     * This assumes that the input series contains numbers.
     * 
     * @returns Returns a new series with all number values inverted.
     */
    invert (): ISeries<IndexT, number> {
        const inputSeries = this as any as ISeries<IndexT, number>;
        return inputSeries.select(value => -value);
    }

    /**
     * Counts the number of sequential values where the predicate evaluates to truthy.
     * Outputs 0 values when the predicate evaluates to falsy.
     * 
     * @param predicate User-defined function. Should evaluate to truthy to activate the counter or falsy to deactivate it.
     * 
     * @returns Returns a new series that counts up the number of sequential values where the predicate evaluates to truthy. 0 values appear when the prediate evaluates to falsy.
     */
    counter (predicate: PredicateFn<ValueT>): ISeries<IndexT, number> {
        return this.groupSequentialBy(predicate)
            .selectMany((group, i) => {
                if (predicate(group.first())) {
                    // This group matches the predicate.
                    return range(1, group.count())
                        .withIndex(group.getIndex())
                        .toPairs(); //TODO: selectMany wipes the index. It needs to respect it!
                }
                else {
                    // This group doesn't match the predicate.
                    return replicate(0, group.count())
                        .withIndex(group.getIndex())
                        .toPairs(); //TODO: selectMany wipes the index. It needs to respect it!
                }
            }) 
            .withIndex(pair => pair[0])
            .select(pair => pair[1]) as any as ISeries<IndexT, number>;
    }
    
    /** 
     * Reverse the series.
     * 
     * @returns Returns a new series that is the reverse of the input.
     */
    reverse (): ISeries<IndexT, ValueT> {

        return new Series<IndexT, ValueT>(() => ({
            values: new ReverseIterable(this.getContent().values),
            index: new ReverseIterable(this.getContent().index),
            pairs: new ReverseIterable(this.getContent().pairs)
        }));
    }

    /**
     * Returns only values in the series that have distinct values.
     *
     * @param selector - Selects the value used to compare for duplicates.
     * 
     * @returns Returns a series containing only unique values as determined by the 'selector' function. 
     */
    distinct<ToT> (selector?: SelectorFn<ValueT, ToT>): ISeries<IndexT, ValueT> {

        return new Series<IndexT, ValueT>(() => ({
            values: new DistinctIterable<ValueT, ToT>(this.getContent().values, selector),
            pairs: new DistinctIterable<[IndexT, ValueT],ToT>(this.getContent().pairs, (pair: [IndexT, ValueT]): ToT => selector && selector(pair[1]) || <ToT> <any> pair[1])
        }));
    }

    /**
     * Group the series according to the selector.
     *
     * @param selector - Selector that defines the value to group by.
     *
     * @returns Returns a series of groups. Each group is a series with values that have been grouped by the 'selector' function.
     */
    groupBy<GroupT> (selector: SelectorWithIndexFn<ValueT, GroupT>): ISeries<number, ISeries<IndexT, ValueT>> {

        assert.isFunction(selector, "Expected 'selector' parameter to 'Series.groupBy' to be a selector function that determines the value to group the series by.");

        return new Series<number, ISeries<IndexT, ValueT>>(() => {
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
                values: groups.map(group => new Series<IndexT, ValueT>({ pairs: group }))
            };            
        });
    }
    
    /**
     * Group sequential values into a Series of windows.
     *
     * @param selector - Optional selector that defines the value to group by.
     *
     * @returns Returns a series of groups. Each group is a series with values that have been grouped by the 'selector' function.
     */
    groupSequentialBy<GroupT> (selector?: SelectorFn<ValueT, GroupT>): ISeries<number, ISeries<IndexT, ValueT>> {

        if (selector) {
            assert.isFunction(selector, "Expected 'selector' parameter to 'Series.groupSequentialBy' to be a selector function that determines the value to group the series by.")
        }
        else {
            selector = value => <GroupT> <any> value;
        }
        
        return this.variableWindow((a: ValueT, b: ValueT): boolean => selector!(a) === selector!(b));
    }

    /**
     * Concatenate multiple series into a single series.
     *
     * @param series - Array of series to concatenate.
     * 
     * @returns Returns a single series concatenated from multiple input series. 
     */
    static concat<IndexT = any, ValueT = any> (series: ISeries<IndexT, ValueT>[]): ISeries<IndexT, ValueT> {
        assert.isArray(series, "Expected 'series' parameter to 'Series.concat' to be an array of series.");

        return new Series(() => {
            const upcast = <Series<IndexT, ValueT>[]> series; // Upcast so that we can access private index, values and pairs.
            const contents = upcast.map(series => series.getContent());
            return {
                values: new ConcatIterable(contents.map(content => content.values)),
                pairs: new ConcatIterable(contents.map(content => content.pairs)),
            };
        });
    }
    
    /**
     * Concatenate multiple other series onto this series.
     * 
     * @param series - Multiple arguments. Each can be either a series or an array of series.
     * 
     * @returns Returns a single series concatenated from multiple input series. 
     */    
    concat (...series: (ISeries<IndexT, ValueT>[]|ISeries<IndexT, ValueT>)[]): ISeries<IndexT, ValueT> {
        const concatInput: ISeries<IndexT, ValueT>[] = [this];

        for (const input of series) {
            if (Sugar.Object.isArray(input)) {
                for (const subInput of input) {
                    concatInput.push(subInput);
                }
            }
            else {
                concatInput.push(input);
            }
        }

        return Series.concat<IndexT, ValueT>(concatInput);
    }
   
    /**
    * Zip together multiple series to create a new series.
    * Preserves the index of the first series.
    *
    * @param series - Multiple arguments. Each can be either a series or an array of series.
    * @param zipper - Selector function that produces a new series based on the input series.
    * 
    * @returns Returns a single series zipped from multiple input series. 
    */
    static zip<IndexT = any, ValueT = any, ResultT = any> (series: ISeries<IndexT, ValueT>[], zipper: ZipNFn<ValueT, ResultT>): ISeries<IndexT, ResultT> {

        assert.isArray(series, "Expected 'series' parameter to 'Series.zip' to be an array of series.");

        if (series.length === 0) {
            return new Series<IndexT, ResultT>();
        }

        const firstSeries = series[0];
        if (firstSeries.none()) {
            return new Series<IndexT, ResultT>();
        }

        return new Series<IndexT, ResultT>(() => {
            const firstSeriesUpCast = <Series<IndexT, ValueT>> firstSeries;
            const upcast = <Series<IndexT, ValueT>[]> series; // Upcast so that we can access private index, values and pairs.
            
            return {
                index: <Iterable<IndexT>> firstSeriesUpCast.getContent().index,
                values: new ZipIterable<ValueT, ResultT>(upcast.map(s => s.getContent().values), zipper),
            };
        });
    }
    
    /**
    * Zip together multiple series to create a new series.
    * Preserves the index of the first series.
    * 
    * @param s2, s3, s4, s4 - Multiple series to zip.
    * @param zipper - Zipper function that produces a new series based on the input series.
    * 
    * @returns Returns a single series concatenated from multiple input series. 
    */    
    zip<Index2T, Value2T, ResultT>  (s2: ISeries<Index2T, Value2T>, zipper: Zip2Fn<ValueT, Value2T, ResultT> ): ISeries<IndexT, ResultT>;
    zip<Index2T, Value2T, Index3T, Value3T, ResultT>  (s2: ISeries<Index2T, Value2T>, s3: ISeries<Index3T, Value3T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): ISeries<IndexT, ResultT>;
    zip<Index2T, Value2T, Index3T, Value3T, Index4T, Value4T, ResultT>  (s2: ISeries<Index2T, Value2T>, s3: ISeries<Index3T, Value3T>, s4: ISeries<Index4T, Value4T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): ISeries<IndexT, ResultT>;
    zip<ResultT>  (...args: any[]): ISeries<IndexT, ResultT> {

        const selector: Function = args[args.length-1];
        const input: ISeries<IndexT, any>[] = [this].concat(args.slice(0, args.length-1));
        return Series.zip<IndexT, any, ResultT>(input, values => selector(...values));
    }    

    /**
     * Sorts the series by a value defined by the selector (ascending). 
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new ordered series that has been sorted by the value returned by the selector. 
     */
    orderBy<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT> {
        //TODO: Should pass a config fn to OrderedSeries. Could just pass in 'this'. The getContent() wouldn't have to be evaluated here.
        return new OrderedSeries<IndexT, ValueT, SortT>(this.getContent().values, this.getContent().pairs, selector, Direction.Ascending, null);
    }

    /**
     * Sorts the series by a value defined by the selector (descending). 
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new ordered series that has been sorted by the value returned by the selector. 
     */
    orderByDescending<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT> {
        //TODO: Should pass a config fn to OrderedSeries.
        return new OrderedSeries<IndexT, ValueT, SortT>(this.getContent().values, this.getContent().pairs, selector, Direction.Descending, null);
    }
        
    /**
     * Returns the unique union of values between two series.
     *
     * @param other - The other series to combine.
     * @param [selector] - Optional function that selects the value to compare to detemrine distinctness.
     * 
     * @returns Returns the union of two series.
     */
    union<KeyT = ValueT> (
        other: ISeries<IndexT, ValueT>, 
        selector?: SelectorFn<ValueT, KeyT>): 
            ISeries<IndexT, ValueT> {

        if (selector) {
            assert.isFunction(selector, "Expected optional 'selector' parameter to 'Series.union' to be a selector function.");
        }

        return this.concat(other).distinct(selector);
    };

    /**
     * Returns the intersection of values between two series.
     *
     * @param inner - The other series to combine.
     * @param [outerSelector] - Optional function to select the key for matching the two series.
     * @param [innerSelector] - Optional function to select the key for matching the two series.
     * 
     * @returns Returns the intersection of two series.
     */
    intersection<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerSelector?: SelectorFn<ValueT, KeyT>,
        innerSelector?: SelectorFn<InnerValueT, KeyT>): 
            ISeries<IndexT, ValueT> {

        if (outerSelector) {
            assert.isFunction(outerSelector, "Expected optional 'outerSelector' parameter to 'Series.intersection' to be a function.");
        }
        else {
            outerSelector = value => <KeyT> <any> value;
        }
        
        if (innerSelector) {
            assert.isFunction(innerSelector, "Expected optional 'innerSelector' parameter to 'Series.intersection' to be a function.");
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
     * Returns the exception of values between two series.
     *
     * @param inner - The other series to combine.
     * @param [outerSelector] - Optional function to select the key for matching the two series.
     * @param [innerSelector] - Optional function to select the key for matching the two series.
     * 
     * @returns Returns the difference between the two series.
     */
    except<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerSelector?: SelectorFn<ValueT, KeyT>,
        innerSelector?: SelectorFn<InnerValueT, KeyT>): 
            ISeries<IndexT, ValueT> {

        if (outerSelector) {
            assert.isFunction(outerSelector, "Expected optional 'outerSelector' parameter to 'Series.except' to be a function.");
        }
        else {
            outerSelector = value => <KeyT> <any> value;
        }

        if (innerSelector) {
            assert.isFunction(innerSelector, "Expected optional 'innerSelector' parameter to 'Series.except' to be a function.");
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
     * Correlates the elements of two series on matching keys.
     *
     * @param this - The outer series to join. 
     * @param inner - The inner series to join.
     * @param outerKeySelector - Selector that chooses the join key from the outer sequence.
     * @param innerKeySelector - Selector that chooses the join key from the inner sequence.
     * @param resultSelector - Selector that defines how to merge outer and inner values.
     * 
     * @returns Returns the joined series. 
     */
    join<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT, InnerValueT, ResultValueT>):
            ISeries<number, ResultValueT> {

        assert.isFunction(outerKeySelector, "Expected 'outerKeySelector' parameter of 'Series.join' to be a selector function.");
        assert.isFunction(innerKeySelector, "Expected 'innerKeySelector' parameter of 'Series.join' to be a selector function.");
        assert.isFunction(resultSelector, "Expected 'resultSelector' parameter of 'Series.join' to be a selector function.");

        const outer = this;

        return new Series<number, ResultValueT>(() => {
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
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            ISeries<number, ResultValueT> {

        assert.isFunction(outerKeySelector, "Expected 'outerKeySelector' parameter of 'Series.joinOuter' to be a selector function.");
        assert.isFunction(innerKeySelector, "Expected 'innerKeySelector' parameter of 'Series.joinOuter' to be a selector function.");
        assert.isFunction(resultSelector, "Expected 'resultSelector' parameter of 'Series.joinOuter' to be a selector function.");

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
     * Performs a left outer join on two series. Correlates the elements based on matching keys.
     * Includes left elements that have no correlation.
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
    joinOuterLeft<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            ISeries<number, ResultValueT> {

        assert.isFunction(outerKeySelector, "Expected 'outerKeySelector' parameter of 'Series.joinOuterLeft' to be a selector function.");
        assert.isFunction(innerKeySelector, "Expected 'innerKeySelector' parameter of 'Series.joinOuterLeft' to be a selector function.");
        assert.isFunction(resultSelector, "Expected 'resultSelector' parameter of 'Series.joinOuterLeft' to be a selector function.");

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
     * Performs a right outer join on two series. Correlates the elements based on matching keys.
     * Includes right elements that have no correlation.
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
    joinOuterRight<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            ISeries<number, ResultValueT> {

        assert.isFunction(outerKeySelector, "Expected 'outerKeySelector' parameter of 'Series.joinOuterRight' to be a selector function.");
        assert.isFunction(innerKeySelector, "Expected 'innerKeySelector' parameter of 'Series.joinOuterRight' to be a selector function.");
        assert.isFunction(resultSelector, "Expected 'resultSelector' parameter of 'Series.joinOuterRight' to be a selector function.");

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
     * Produces a new series with all string values truncated to the requested maximum length.
     *
     * @param maxLength - The maximum length of the string values after truncation.
     * 
     * @returns Returns a new series with strings that are truncated to the specified maximum length. 
     */
    truncateStrings (maxLength: number): ISeries<IndexT, ValueT> {

        assert.isNumber(maxLength, "Expected 'maxLength' parameter to 'Series.truncateStrings' to be a number.");

        return this.select((value: any) => {
                if (Sugar.Object.isString(value)) {
                    if (value.length > maxLength) {
                        return value.substring(0, maxLength);
                    }
                }

                return value;
            });
    };    

    /**
     * Insert a pair at the start of the series.
     *
     * @param pair - The pair to insert.
     * 
     * @returns Returns a new series with the specified pair inserted.
     */
    insertPair (pair: [IndexT, ValueT]): ISeries<IndexT, ValueT> {
        assert.isArray(pair, "Expected 'pair' parameter to 'Series.insertPair' to be an array.");
        assert(pair.length === 2, "Expected 'pair' parameter to 'Series.insertPair' to be an array with two elements. The first element is the index, the second is the value.");

        return (new Series<IndexT, ValueT>({ pairs: [pair] })).concat(this);
    }

    /**
     * Append a pair to the end of a Series.
     *
     * @param pair - The pair to append.
     *  
     * @returns Returns a new series with the specified pair appended.
     */
    appendPair (pair: [IndexT, ValueT]): ISeries<IndexT, ValueT> {
        assert.isArray(pair, "Expected 'pair' parameter to 'Series.appendPair' to be an array.");
        assert(pair.length === 2, "Expected 'pair' parameter to 'Series.appendPair' to be an array with two elements. The first element is the index, the second is the value.");

        return this.concat(new Series<IndexT, ValueT>({ pairs: [pair] }));
    }

    /**
     * Fill gaps in a series.
     *
     * @param comparer - Comparer that is passed pairA and pairB, two consecutive rows, return truthy if there is a gap between the rows, or falsey if there is no gap.
     * @param generator - Generator that is passed pairA and pairB, two consecutive rows, returns an array of pairs that fills the gap between the rows.
     *
     * @returns Returns a new series with gaps filled in.
     */
    fillGaps (comparer: ComparerFn<[IndexT, ValueT], [IndexT, ValueT]>, generator: GapFillFn<[IndexT, ValueT], [IndexT, ValueT]>): ISeries<IndexT, ValueT> {
        assert.isFunction(comparer, "Expected 'comparer' parameter to 'Series.fillGaps' to be a comparer function that compares two values and returns a boolean.")
        assert.isFunction(generator, "Expected 'generator' parameter to 'Series.fillGaps' to be a generator function that takes two values and returns an array of generated pairs to span the gap.")

        return this.rollingWindow(2)
            .selectMany((window): [IndexT, ValueT][] => {
                const pairs = window.toPairs();
                const pairA = pairs[0];
                const pairB = pairs[1];
                if (!comparer(pairA, pairB)) {
                    return [pairA];
                }

                const generatedRows = generator(pairA, pairB);
                assert.isArray(generatedRows, "Expected return from 'generator' parameter to 'Series.fillGaps' to be an array of pairs, instead got a " + typeof(generatedRows));

                return [pairA].concat(generatedRows);
            })
            .withIndex(pair => pair[0])
            .select(pair => pair[1])
            .concat(this.tail(1));
    }

    /**
     * Returns the specified default sequence if the series is empty. 
     *
     * @param defaultSequence - Default sequence to return if the series is empty.
     * 
     * @returns Returns 'defaultSequence' if the series is empty. 
     */
    defaultIfEmpty (defaultSequence: ValueT[] | ISeries<IndexT, ValueT>): ISeries<IndexT, ValueT> {

        if (this.none()) {
            if (defaultSequence instanceof Series) {
                return <ISeries<IndexT, ValueT>> defaultSequence;
            }
            else if (Sugar.Object.isArray(defaultSequence)) {
                return new Series<IndexT, ValueT>(defaultSequence);
            }
            else {
                throw new Error("Expected 'defaultSequence' parameter to 'Series.defaultIfEmpty' to be an array or a series.");
            }
        } 
        else {
            return this;
        }
    }

    /** 
     * Detect the types of the values in the sequence.
     *
     * @returns Returns a dataframe that describes the data types contained in the input series or dataframe.
     */
    detectTypes (): IDataFrame<number, ITypeFrequency> {

        return new DataFrame<number, ITypeFrequency>(() => {
            const values = this.toArray();
            const totalValues = values.length;

            const typeFrequencies = this.select(value => {
                    let valueType: string = typeof(value);
                    if (valueType === "object") {
                        if (Sugar.Object.isDate(value)) {
                            valueType = "date";
                        }
                    }
                    return valueType;
                })
                .aggregate({}, (accumulated: any, valueType: string) => {
                    var typeInfo = accumulated[valueType];
                    if (!typeInfo) {
                        typeInfo = {
                            count: 0
                        };
                        accumulated[valueType] = typeInfo;
                    }
                    ++typeInfo.count;
                    return accumulated;
                });

                

            return {
                columnNames: ["Type", "Frequency"],
                rows: Object.keys(typeFrequencies)
                    .map(valueType => {
                        return [
                            valueType,
                            (typeFrequencies[valueType].count / totalValues) * 100
                        ];
                    })
            };
        });
    }

    /** 
     * Detect the frequency of values in the sequence.
     *
     * @returns Returns a dataframe that describes the values contained in the input sequence.
     */
    detectValues (): IDataFrame<number, IValueFrequency> {

        return new DataFrame<number, IValueFrequency>(() => {
            const values = this.toArray();
            const totalValues = values.length;
            const valueFrequencies = this.aggregate({}, (accumulated: any, value: any) => {
                const valueKey = (value !== null && value.toString() || "null") + "-" + typeof(value);
                let valueInfo = accumulated[valueKey];
                if (!valueInfo) {
                    valueInfo = {
                        count: 0,
                        value: value,
                    };
                    accumulated[valueKey] = valueInfo;
                }
                ++valueInfo.count;
                return accumulated;
            });

            return {
                columnNames: ["Value", "Frequency"],
                rows: Object.keys(valueFrequencies)
                    .map(valueKey => {
                        const valueInfo = valueFrequencies[valueKey];
                        return [
                            valueInfo.value,
                            (valueInfo.count / totalValues) * 100
                        ];
                    })
            };
        });
    }

    /**
     * Organise all values in the series into the specified number of buckets.
     * Assumes that the series is a series of numbers.
     * 
     * @param numBuckets - The number of buckets to create.
     * 
     * @returns Returns a dataframe containing bucketed values. The input values are divided up into these buckets.
     */
    bucket (numBuckets: number): IDataFrame<IndexT, IBucket> {

        if (this.none()) {
            return new DataFrame();
        }

        const numberSeries = this as any as ISeries<IndexT, number>;
        var min = numberSeries.min();
        var max = numberSeries.max();
        var range = max - min;
        var width = range / (numBuckets-1);
        return numberSeries.select(v => {
                var bucket = Math.floor((v - min) / width);
                var bucketMin = (bucket * width) + min;
                return {
                    Value: v,
                    Bucket: bucket,
                    Min: bucketMin,
                    Mid: bucketMin + (width*0.5),
                    Max: bucketMin + width,
                };
            })
            .inflate();
    }

    getTypeCode (): string {
        return "series";
    }    
}

/**
 * @hidden
 * A series that has been ordered.
 */
class OrderedSeries<IndexT = number, ValueT = any, SortT = any> 
    extends Series<IndexT, ValueT>
    implements IOrderedSeries<IndexT, ValueT, SortT> {

    parent: OrderedSeries<IndexT, ValueT, SortT> | null;
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

    constructor(values: Iterable<ValueT>, pairs: Iterable<[IndexT, ValueT]>, selector: SelectorWithIndexFn<ValueT, SortT>, direction: Direction, parent: OrderedSeries<IndexT, ValueT> | null) {

        const valueSortSpecs: ISortSpec[] = [];
        const pairSortSpecs: ISortSpec[] = [];
        let sortLevel = 0;

        while (parent !== null) {
            valueSortSpecs.push(OrderedSeries.makeSortSpec(sortLevel, parent.selector, parent.direction));
            pairSortSpecs.push(OrderedSeries.makeSortSpec(sortLevel, OrderedSeries.makePairsSelector(parent.selector), parent.direction));
            ++sortLevel;
            parent = parent.parent;
        }

        valueSortSpecs.push(OrderedSeries.makeSortSpec(sortLevel, selector, direction));
        pairSortSpecs.push(OrderedSeries.makeSortSpec(sortLevel, OrderedSeries.makePairsSelector(selector), direction));

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
     * @returns Returns a new series has been additionally sorted by the value returned by the selector. 
     */
    thenBy<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT> {
        //TODO: Should pass a config fn to OrderedSeries.
        return new OrderedSeries<IndexT, ValueT, SortT>(this.origValues, this.origPairs, selector, Direction.Ascending, this);
    }

    /** 
     * Performs additional sorting (descending).
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new series has been additionally sorted by the value returned by the selector. 
     */
    thenByDescending<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT> {
        //TODO: Should pass a config fn to OrderedSeries.
        return new OrderedSeries<IndexT, ValueT, SortT>(this.origValues, this.origPairs, selector, Direction.Descending, this);        
    }
}
    