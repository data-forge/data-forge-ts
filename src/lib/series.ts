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
import { IIndex, Index } from './index';
import { ExtractElementIterable } from './iterables/extract-element-iterable';
import { SkipIterable } from './iterables/skip-iterable';
import { SkipWhileIterable } from './iterables/skip-while-iterable';
// @ts-ignore
import Table from 'easy-table';
import { IDataFrame, DataFrame } from './dataframe';
// @ts-ignore
import moment from "dayjs";
// @ts-ignore
import customParseFormat from 'dayjs/plugin/customParseFormat';
moment.extend(customParseFormat);
import { toMap, isArray, isFunction, isNumber, isString, isDate } from './utils';
import { range, replicate } from '..';
import numeral from 'numeral';

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
//TODO: The Zip function should actually be necessary. Should really just output a series of arrays, collecting each value into one array.
// The caller can then run select on it and this means th the zipper function is unecessary.
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
 * Specifies where from a data window the index is pulled from: the start of the window, the end or from the middle.
 */
export enum WhichIndex {
    Start = "start",
    End = "end",
}

/**
 * Interface that represents a series.
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
     * Merge one or more series into this series.
     * Values are merged by index.
     * Values at each index are combined into arrays in the resulting series.
     * 
     * @param series... One or more other series to merge into the series.
     * 
     * @returns The merged series.
     * 
     * @example
     * <pre>
     * 
     * const mergedSeries = series1.merge(series2);
     * </pre>
     * 
     * <pre>
     * 
     * const mergedSeries = series1.merge(series2, series3, etc);
     * </pre>
     */
    merge<MergedValueT = any>(...args: any[]): ISeries<IndexT, MergedValueT[]>;

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
     * Retreive the index, values pairs from the series as an array.
     * Each pair is [index, value].
     * This forces lazy evaluation to complete.
     * 
     * @return Returns an array of pairs that contains the series values. Each pair is a two element array that contains an index and a value.
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
     * Generates a new series by repeatedly calling a user-defined selector function on each value in the original series.
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
    window (period: number, whichIndex?: WhichIndex): ISeries<IndexT, ISeries<IndexT, ValueT>>;

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
    rollingWindow (period: number, whichIndex?: WhichIndex): ISeries<IndexT, ISeries<IndexT, ValueT>>;

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
     * Compute the absolute range of values in each period.
     * The range for each period is the absolute difference between largest (max) and smallest (min) values in that period.
     * 
     * @param period - Period for computing the range.
     * 
     * @returns Returns a new series where each value indicates the absolute range of values for each period in the original series.
     * 
     * @example
     * <pre>
     * 
     * const closingPrice = ... series of closing prices for a particular stock ...
     * const volatility = closingPrice.amountRange();
     * </pre>
     */
    amountRange (period: number): ISeries<IndexT, number>;

    /**
     * Compute the range of values in each period in proportion to the latest value.
     * The range for each period is the absolute difference between largest (max) and smallest (min) values in that period.
     * Proportions are expressed as 0-1 values.
     * 
     * @param period - Period for computing the range.
     * 
     * @returns Returns a new series where each value indicates the proportion change from the previous number value in the original series.
     * 
     * @returns Returns a new series where each value indicates the proportionate range of values for each period in the original series.
     * 
     * @example
     * <pre>
     * 
     * const closingPrice = ... series of closing prices for a particular stock ...
     * const proportionVolatility = closingPrice.proportionRange();
     * </pre>
     */
    proportionRange (period: number): ISeries<IndexT, number>;

    /**
     * Compute the range of values in each period in proportion to the latest value.
     * The range for each period is the absolute difference between largest (max) and smallest (min) values in that period.
     * Proportions are expressed as 0-1 values.
     * 
     * @param period - Period for computing the range.
     * 
     * @returns Returns a new series where each value indicates the proportion change from the previous number value in the original series.
     * 
     * @returns Returns a new series where each value indicates the proportionate range of values for each period in the original series.
     * 
     * @example
     * <pre>
     * 
     * const closingPrice = ... series of closing prices for a particular stock ...
     * const percentVolatility = closingPrice.percentRange();
     * </pre>
     */
    percentRange (period: number): ISeries<IndexT, number>;

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
     * For each period, compute the proportion of values that are less than the last value in the period.
     * Proportions are expressed as 0-1 values.
     * 
     * @param [period] Optional period for computing the proportion rank - defaults to 2.
     * 
     * @returns Returns a new series where each value indicates the proportion rank value for that period.
     * 
     * @example
     * <pre>
     * 
     * const proportionRank = series.proportionRank();
     * </pre>
     * @example
     * <pre>
     * 
     * const proportionRank = series.proportionRank(100);
     * </pre>
     */
    proportionRank (period?: number): ISeries<IndexT, number>;

    /**
     * For each period, compute the percent of values that are less than the last value in the period.
     * Percent are expressed as 0-100 values.
     * 
     * @param [period] Optional period for computing the percent rank - defaults to 2.
     * 
     * @returns Returns a new series where each value indicates the percent rank value for that period.
     * 
     * @example
     * <pre>
     * 
     * const percentRank = series.percentRank();
     * </pre>
     * @example
     * <pre>
     * 
     * const percentRank = series.percentRank(100);
     * </pre>
     */
    percentRank (period?: number): ISeries<IndexT, number>;
    
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
     * @param callback The calback function to invoke for each value.
     * 
     * @return Returns the original series with no modifications.
     * 
     * @example
     * <pre>
     * 
     * series.forEach(value => {
     *      // ... do something with the value ...
     * });
     * </pre>
     */
    forEach (callback: CallbackFn<ValueT>): ISeries<IndexT, ValueT>;

    /**
     * Evaluates a predicate function for every value in the series to determine 
     * if some condition is true/truthy for **all** values in the series.
     * 
     * @param predicate Predicate function that receives each value. It should returns true/truthy for a match, otherwise false/falsy.
     *
     * @return Returns true if the predicate has returned true or truthy for every value in the series, otherwise returns false. Returns false for an empty series.
     * 
     * @example
     * <pre>
     * 
     * const result = series.all(salesFigure => salesFigure > 100); // Returns true if all sales figures are greater than 100.
     * </pre>
     */
    all (predicate: PredicateFn<ValueT>): boolean;
    
    /**
     * Evaluates a predicate function for every value in the series to determine 
     * if some condition is true/truthy for **any** of values in the series.
     * 
     * If no predicate is specified then it simply checks if the series contains more than zero values.
     *
     * @param [predicate] Optional predicate function that receives each value. It should return true/truthy for a match, otherwise false/falsy.
     *
     * @return Returns true if the predicate has returned truthy for any value in the series, otherwise returns false. 
     * If no predicate is passed it returns true if the series contains any values at all.
     * Returns false for an empty series.
     * 
     * @example
     * <pre>
     * 
     * const result = series.any(salesFigure => salesFigure > 100); // Do we have any sales figures greater than 100?
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const result = series.any(); // Do we have any sales figures at all?
     * </pre>
     */
    any (predicate?: PredicateFn<ValueT>): boolean;

    /**
     * Evaluates a predicate function for every value in the series to determine 
     * if some condition is true/truthy for **none** of values in the series.
     * 
     * If no predicate is specified then it simply checks if the series contains zero values.
     *
     * @param [predicate] Optional predicate function that receives each value. It should return true/truthy for a match, otherwise false/falsy.
     *
     * @return Returns true if the predicate has returned truthy for zero values in the series, otherwise returns false. Returns false for an empty series.
     * 
     * @example
     * <pre>
     * 
     * const result = series.none(salesFigure => salesFigure > 100); // Do we have zero sales figures greater than 100?
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const result = series.none(); // Do we have zero sales figures?
     * </pre>
     */
    none (predicate?: PredicateFn<ValueT>): boolean;

    /**
     * Gets a new series containing all values starting at or after the specified index value.
     * 
     * @param indexValue The index value at which to start the new series.
     * 
     * @return Returns a new series containing all values starting at or after the specified index value. 
     * 
     * @example
     * <pre>
     * 
     * const series = new Series({ 
     *      index: [0, 1, 2, 3], // This is the default index.
     *      values: [10, 20, 30, 40],
     * });
     * 
     * const lastHalf = series.startAt(2);
     * expect(lastHalf.toArray()).to.eql([30, 40]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const timeSeries = ... a series indexed by date/time ...
     * 
     * // Get all values starting at (or after) a particular date.
     * const result = timeSeries.startAt(new Date(2016, 5, 4)); 
     * </pre>
     */
    startAt (indexValue: IndexT): ISeries<IndexT, ValueT>;

    /**
     * Gets a new series containing all values up until and including the specified index value (inclusive).
     * 
     * @param indexValue The index value at which to end the new series.
     * 
     * @return Returns a new series containing all values up until and including the specified index value.
     * 
     * @example
     * <pre>
     * 
     * const series = new Series({ 
     *      index: [0, 1, 2, 3], // This is the default index.
     *      values: [10, 20, 30, 40],
     * });
     * 
     * const firstHalf = series.endAt(1);
     * expect(firstHalf.toArray()).to.eql([10, 20]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const timeSeries = ... a series indexed by date/time ...
     * 
     * // Get all values ending at a particular date.
     * const result = timeSeries.endAt(new Date(2016, 5, 4)); 
     * </pre>
     */
    endAt (indexValue: IndexT): ISeries<IndexT, ValueT>;

    /**
     * Gets a new series containing all values up to the specified index value (exclusive).
     * 
     * @param indexValue The index value at which to end the new series.
     * 
     * @return Returns a new series containing all values up to (but not including) the specified index value. 
     * 
     * @example
     * <pre>
     * 
     * const series = new Series({ 
     *      index: [0, 1, 2, 3], // This is the default index.
     *      values: [10, 20, 30, 40],
     * });
     * 
     * const firstHalf = series.before(2);
     * expect(firstHalf.toArray()).to.eql([10, 20]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const timeSeries = ... a series indexed by date/time ...
     * 
     * // Get all values before the specified date.
     * const result = timeSeries.before(new Date(2016, 5, 4)); 
     * </pre>
     */
    before (indexValue: IndexT): ISeries<IndexT, ValueT>;

    /**
     * Gets a new series containing all values after the specified index value (exclusive).
     * 
     * @param indexValue The index value after which to start the new series.
     * 
     * @return Returns a new series containing all values after the specified index value.
     * 
     * @example
     * <pre>
     * 
     * const series = new Series({ 
     *      index: [0, 1, 2, 3], // This is the default index.
     *      values: [10, 20, 30, 40],
     * });
     * 
     * const lastHalf = df.before(1);
     * expect(lastHalf.toArray()).to.eql([30, 40]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const timeSerie = ... a series indexed by date/time ...
     * 
     * // Get all values after the specified date.
     * const result = timeSeries.after(new Date(2016, 5, 4)); 
     * </pre>
     */    
    after (indexValue: IndexT): ISeries<IndexT, ValueT>;

    /**
     * Gets a new series containing all values between the specified index values (inclusive).
     * 
     * @param startIndexValue The index at which to start the new series.
     * @param endIndexValue The index at which to end the new series.
     * 
     * @return Returns a new series containing all values between the specified index values (inclusive).
     * 
     * @example
     * <pre>
     * 
     * const series = new Series({ 
     *      index: [0, 1, 2, 3, 4, 6], // This is the default index.
     *      values: [10, 20, 30, 40, 50, 60],
     * });
     * 
     * const middleSection = series.between(1, 4);
     * expect(middleSection.toArray()).to.eql([20, 30, 40, 50]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const timeSeries = ... a series indexed by date/time ...
     * 
     * // Get all values between the start and end dates (inclusive).
     * const result = timeSeries.after(new Date(2016, 5, 4), new Date(2016, 5, 22)); 
     * </pre>
     */
    between (startIndexValue: IndexT, endIndexValue: IndexT): ISeries<IndexT, ValueT>;

    /** 
     * Format the series for display as a string.
     * This forces lazy evaluation to complete.
     * 
     * @return Generates and returns a string representation of the series.
     * 
     * @example
     * <pre>
     * 
     * console.log(series.toString());
     * </pre>
     */
    toString (): string;

    /**
     * Parse a series with string values and convert it to a series with int values.
     *
     * @return Returns a new series with values parsed from strings to ints.
     * 
     * @example
     * <pre>
     * 
     * const parsed = series.parseInts();
     * </pre>
     */
    parseInts (): ISeries<IndexT, number>;

    /**
     * Parse a series with string values and convert it to a series with float values.
     *
     * @return Returns a new series with values parsed from strings to floats.
     * 
     * @example
     * <pre>
     * 
     * const parsed = series.parseFloats();
     * </pre>
     */
    parseFloats (): ISeries<IndexT, number>;

    /**
     * Parse a series with string values and convert it to a series with date values.
     *
     * @param [formatString] Optional formatting string for dates.
     * 
     * Moment is used for date parsing.
     * https://momentjs.com
     * 
     * @return Returns a new series with values parsed from strings to dates.
     * 
     * @example
     * <pre>
     * 
     * const parsed = series.parseDates();
     * </pre>
     */
    parseDates (formatString?: string): ISeries<IndexT, Date>;

    /**
     * Convert a series of values of different types to a series containing string values.
     *
     * @param [formatString] Optional formatting string for dates.
     * 
     * Numeral.js is used for number formatting.
     * http://numeraljs.com/
     * 
     * Moment is used for date formatting.
     * https://momentjs.com/docs/#/parsing/string-format/
     * 
     * @return Returns a new series values converted from values to strings.
     * 
     * @example
     * <pre>
     * 
     * const result = series.toStrings("YYYY-MM-DD");
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const result = series.toStrings("0.00");
     * </pre>
     */
    toStrings (formatString?: string): ISeries<IndexT, string>;

    /**
     * Forces lazy evaluation to complete and 'bakes' the series into memory.
     * 
     * @return Returns a series that has been 'baked', all lazy evaluation has completed.
     * 
     * @example
     * <pre>
     * 
     * const baked = series.bake();
     * </pre>
     */
    bake (): ISeries<IndexT, ValueT>;

    /** 
     * Converts (inflates) a series to a {@link DataFrame}.
     *
     * @param [selector] Optional user-defined selector function that transforms each value to produce the dataframe.
     *
     * @returns Returns a dataframe that was created from the original series.
     * 
     * @example
     * <pre>
     * 
     * const dataframe = series.inflate(); // Inflate a series of objects to a dataframe.
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const dataframe = series.inflate(value => { AColumn:  value }); // Produces a dataframe with 1 column from a series of values.
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const dataframe = series.inflate(value => { AColumn:  value.NestedValue }); // Extract a nested value and produce a dataframe from it.
     * </pre>
     */
    inflate<ToT = ValueT> (selector?: SelectorWithIndexFn<ValueT, ToT>): IDataFrame<IndexT, ToT>;

    /**
     * Sum the values in a series and returns the result.
     * 
     * @returns Returns the sum of the number values in the series.
     * 
     * @example
     * <pre>
     * 
     * const totalSales = salesFigures.sum();
     * </pre>
     */
    sum (): number;

    /**
     * Average the values in a series and returns the result
     * 
     * @returns Returns the average of the number values in the series.
     * 
     * @example
     * <pre>
     * 
     * const averageSales = salesFigures.average();
     * </pre>
     */
    average (): number;

    /**
     * Get the median value in the series. 
     * Note that this sorts the series, which can be expensive.
     * 
     * @returns Returns the median of the values in the series.
     * 
     * @example
     * <pre>
     * 
     * const medianSales = salesFigures.median();
     * </pre>
     */
    median (): number;

    /**
     * Get the standard deviation of number values in the series. 
     * 
     * @returns Returns the standard deviation of the values in the series.
     * 
     * @example
     * <pre>
     * 
     * const salesStdDev = salesFigures.std();
     * </pre>
     */
    std (): number;

    /**
     * Get the min value in the series.
     * 
     * @returns Returns the minimum of the number values in the series.
     * 
     * @example
     * <pre>
     * 
     * const minSales = salesFigures.min();
     * </pre>
     */
    min (): number;

    /**
     * Get the max value in the series.
     * 
     * @returns Returns the maximum of the number values in the series.
     * 
     * @example
     * <pre>
     * 
     * const maxSales = salesFigures.max();
     * </pre>
     */
    max (): number;

    /**
     * Invert the sign of every number value in the series.
     * This assumes that the input series contains numbers.
     * 
     * @returns Returns a new series with all number values inverted.
     * 
     * @example
     * <pre>
     * 
     * const inverted = series.invert();
     * </pre>
     */
    invert (): ISeries<IndexT, number>;

    /**
     * Counts the number of sequential values where the predicate evaluates to truthy.
     * Outputs 0 for values when the predicate evaluates to falsy.
     * 
     * @param predicate User-defined function. Should evaluate to truthy to activate the counter or falsy to deactivate it.
     * 
     * @returns Returns a new series that counts up the number of sequential values where the predicate evaluates to truthy. 0 values appear when the prediate evaluates to falsy.
     * 
     * @example
     * <pre>
     * 
     * const series = new Series([ 1, 10, 3, 15, 8, 5 ]);
     * const counted = series.counter(value => value >= 3);
     * console.log(counted.toString());
     * </pre>
     */
    counter (predicate: PredicateFn<ValueT>): ISeries<IndexT, number>;

    /** 
     * Gets a new series in reverse order.
     * 
     * @return Returns a new series that is the reverse of the original.
     * 
     * @example
     * <pre>
     * 
     * const reversed = series.reverse();
     * </pre>
     */
    reverse (): ISeries<IndexT, ValueT>;

    /**
     * Returns only the set of values in the series that are distinct.
     * Provide a user-defined selector to specify criteria for determining the distinctness.
     * This can be used to remove duplicate values from the series.
     *
     * @param [selector] Optional user-defined selector function that specifies the criteria used to make comparisons for duplicate values.
     * 
     * @return Returns a series containing only unique values in the series. 
     * 
     * @example
     * <pre>
     * 
     * const uniqueValues = series.distinct(); // Get only non-duplicated value in the series.
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const bucketedValues = series.distinct(value => Math.floor(value / 10)); // Lump values into buckets of 10.
     * </pre>
     */
    distinct<ToT> (selector?: SelectorFn<ValueT, ToT>): ISeries<IndexT, ValueT>;

    /**
     * Collects values in the series into a new series of groups according to a user-defined selector function.
     *
     * @param selector User-defined selector function that specifies the criteriay to group by.
     *
     * @return Returns a new series of groups. Each group is a series with values that have been grouped by the 'selector' function.
     * 
     * @example
     * <pre>
     * 
     * const sales = ... product sales ...
     * const salesByProduct = sales.groupBy(sale => sale.ProductId);
     * for (const productSalesGroup of salesByProduct) {
     *      // ... do something with each product group ...
     *      const productId = productSalesGroup.first().ProductId;
     *      const totalSalesForProduct = productSalesGroup.deflate(sale => sale.Amount).sum();
     *      console.log(totalSalesForProduct);
     * }
     * </pre>
     */
    groupBy<GroupT> (selector: SelectorFn<ValueT, GroupT>): ISeries<number, ISeries<IndexT, ValueT>>;

    /**
     * Collects values in the series into a new series of groups based on if the values are the same or according to a user-defined selector function.
     *
     * @param [selector] Optional selector that specifies the criteria for grouping.
     *
     * @return Returns a new series of groups. Each group is a series with values that are the same or have been grouped by the 'selector' function.
     * 
     * @example
     * <pre>
     * 
     * // Some ultra simple stock trading strategy backtesting...
     * const dailyStockPrice = ... daily stock price for a company ...
     * const priceGroups  = dailyStockPrice.groupBy(day => day.close > day.movingAverage);
     * for (const priceGroup of priceGroups) {
     *      // ... do something with each stock price group ...
     * 
     *      const firstDay = priceGroup.first();
     *      if (firstDay.close > movingAverage) {
     *          // This group of days has the stock price above its moving average.
     *          // ... maybe enter a long trade here ...
     *      }
     *      else {
     *          // This group of days has the stock price below its moving average.
     *          // ... maybe enter a short trade here ...
     *      }
     * }
     * </pre>
     */    
    groupSequentialBy<GroupT> (selector?: SelectorFn<ValueT, GroupT>): ISeries<number, ISeries<IndexT, ValueT>>;
    
    /**
     * Concatenate multiple other series onto this series.
     * 
     * @param series Multiple arguments. Each can be either a series or an array of series.
     * 
     * @return Returns a single series concatenated from multiple input series. 
     * 
     * @example
     * <pre>
     * 
     * const concatenated = a.concat(b);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const concatenated = a.concat(b, c);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const concatenated = a.concat([b, c]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const concatenated = a.concat(b, [c, d]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const otherSeries = [... array of series...];
     * const concatenated = a.concat(otherSeries);
     * </pre>
     */    
    concat (...series: (ISeries<IndexT, ValueT>[]|ISeries<IndexT, ValueT>)[]): ISeries<IndexT, ValueT>;

    /**
    * Zip together multiple series to create a new series.
    * Preserves the index of the first series.
    * 
    * @param s2, s3, s4, s4 Multiple series to zip.
    * @param zipper User-defined zipper function that merges rows. It produces values for the new series based-on values from the input series.
    * 
    * @return Returns a single series merged from multiple input series. 
    * 
    * @example
    * <pre>
    * 
    * const a = new Series([1, 2, 3]);
    * const b = new Series([10, 20, 30]);
    * const zipped = a.zip(b (valueA, valueB) => valueA + valueB);
    * </pre>
    */    
   zip<Index2T, Value2T, ResultT>  (s2: ISeries<Index2T, Value2T>, zipper: Zip2Fn<ValueT, Value2T, ResultT> ): ISeries<IndexT, ResultT>;
   zip<Index2T, Value2T, Index3T, Value3T, ResultT>  (s2: ISeries<Index2T, Value2T>, s3: ISeries<Index3T, Value3T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): ISeries<IndexT, ResultT>;
   zip<Index2T, Value2T, Index3T, Value3T, Index4T, Value4T, ResultT>  (s2: ISeries<Index2T, Value2T>, s3: ISeries<Index3T, Value3T>, s4: ISeries<Index4T, Value4T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): ISeries<IndexT, ResultT>;
   zip<ResultT>  (...args: any[]): ISeries<IndexT, ResultT>;
   
    /**
     * Sorts the series in ascending order by a value defined by the user-defined selector function. 
     * 
     * @param selector User-defined selector function that selects the value to sort by.
     * 
     * @return Returns a new series that has been ordered accorrding to the value chosen by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * const orderedSeries = series.orderBy(value => value); 
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const orderedSeries = series.orderBy(value => value.NestedValue); 
     * </pre>
     */
    orderBy<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;

    /**
     * Sorts the series in descending order by a value defined by the user-defined selector function. 
     * 
     * @param selector User-defined selector function that selects the value to sort by.
     * 
     * @return Returns a new series that has been ordered accorrding to the value chosen by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * const orderedSeries = series.orderByDescending(value => value); 
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const orderedSeries = series.orderByDescending(value => value.NestedValue); 
     * </pre>
     */
    orderByDescending<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;

    /**
     * Creates a new series by merging two input dataframes.
     * The resulting series contains the union of value from the two input series.
     * These are the unique combination of values in both series.
     * This is basically a concatenation and then elimination of duplicates.
     *
     * @param other The other series to merge.
     * @param [selector] Optional user-defined selector function that selects the value to compare to determine distinctness.
     * 
     * @return Returns the union of the two series.
     * 
     * @example
     * <pre>
     *
     * const seriesA = ...
     * const seriesB = ...
     * const merged = seriesA.union(seriesB);
     * </pre>
     * 
     * @example
     * <pre>
     *
     * // Merge two sets of customer records that may contain the same
     * // customer record in each set. This is basically a concatenation
     * // of the series and then an elimination of any duplicate records
     * // that result.
     * const customerRecordsA = ...
     * const customerRecordsB = ...
     * const mergedCustomerRecords = customerRecordsA.union(
     *      customerRecordsB, 
     *      customerRecord => customerRecord.CustomerId
     * );
     * </pre>
     * 
     * 
     * @example
     * <pre>
     *
     * // Note that you can achieve the exact same result as the previous
     * // example by doing a {@link Series.concat) and {@link Series.distinct}
     * // of the input series and then an elimination of any duplicate records
     * // that result.
     * const customerRecordsA = ...
     * const customerRecordsB = ...
     * const mergedCustomerRecords = customerRecordsA
     *      .concat(customerRecordsB)
     *      .distinct(customerRecord => customerRecord.CustomerId);
     * </pre>
     * 
     */
    union<KeyT = ValueT> (
        other: ISeries<IndexT, ValueT>, 
        selector?: SelectorFn<ValueT, KeyT>): 
            ISeries<IndexT, ValueT>;

    /**
     * Creates a new series by merging two input series.
     * The resulting series contains the intersection of values from the two input series.
     * These are only the values that appear in both series.
     *
     * @param inner The inner series to merge (the series you call the function on is the 'outer' series).
     * @param [outerSelector] Optional user-defined selector function that selects the key from the outer series that is used to match the two series.
     * @param [innerSelector] Optional user-defined selector function that selects the key from the inner series that is used to match the two series.
     * 
     * @return Returns a new series that contains the intersection of values from the two input series.
     * 
     * @example
     * <pre>
     * 
     * const seriesA = ...
     * const seriesB = ...
     * const mergedDf = seriesA.intersection(seriesB);
     * </pre>
     * 
     * @example
     * <pre>
     *
     * // Merge two sets of customer records to find only the
     * // customers that appears in both.
     * const customerRecordsA = ...
     * const customerRecordsB = ...
     * const intersectionOfCustomerRecords = customerRecordsA.intersection(
     *      customerRecordsB, 
     *      customerRecord => customerRecord.CustomerId
     * );
     * </pre>     
     */    
    intersection<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerSelector?: SelectorFn<ValueT, KeyT>,
        innerSelector?: SelectorFn<InnerValueT, KeyT>): 
            ISeries<IndexT, ValueT>;

    /**
     * Creates a new series by merging two input series.
     * The resulting series contains only the values from the 1st series that don't appear in the 2nd series.
     * This is essentially subtracting the values from the 2nd series from the 1st and creating a new series with the remaining values.
     *
     * @param inner The inner series to merge (the series you call the function on is the 'outer' series).
     * @param [outerSelector] Optional user-defined selector function that selects the key from the outer series that is used to match the two series.
     * @param [innerSelector] Optional user-defined selector function that selects the key from the inner series that is used to match the two series.
     * 
     * @return Returns a new series that contains only the values from the 1st series that don't appear in the 2nd series.
     * 
     * @example
     * <pre>
     * 
     * const seriesA = ...
     * const seriesB = ...
     * const remainingDf = seriesA.except(seriesB);
     * </pre>
     * 
     * @example
     * <pre>
     *
     * // Find the list of customers haven't bought anything recently.
     * const allCustomers = ... list of all customers ...
     * const recentCustomers = ... list of customers who have purchased recently ...
     * const remainingCustomers = allCustomers.except(
     *      recentCustomers, 
     *      customerRecord => customerRecord.CustomerId
     * );
     * </pre>
     */    
    except<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerSelector?: SelectorFn<ValueT, KeyT>,
        innerSelector?: SelectorFn<InnerValueT, KeyT>): 
            ISeries<IndexT, ValueT>;

   /**
     * Creates a new series by merging two input series.
     * The resulting dataframe contains only those value that have matching keys in both input series.
     *
     * @param inner The 'inner' series to join (the series you are callling the function on is the 'outer' series).
     * @param outerKeySelector User-defined selector function that chooses the join key from the outer series.
     * @param innerKeySelector User-defined selector function that chooses the join key from the inner series.
     * @param resultSelector User-defined function that merges outer and inner values.
     * 
     * @return Returns the new merged series.
     * 
     * @example
     * <pre>
     * 
     * // Join together two sets of customers to find those
     * // that have bought both product A and product B.
     * const customerWhoBoughtProductA = ...
     * const customerWhoBoughtProductB = ...
     * const customersWhoBoughtBothProductsDf = customerWhoBoughtProductA.join(
     *          customerWhoBoughtProductB,
     *          customerA => customerA.CustomerId, // Join key.
     *          customerB => customerB.CustomerId, // Join key.
     *          (customerA, customerB) => {
     *              return {
     *                  // ... merge the results ...
     *              };
     *          }
     *      );
     * </pre>
     */
    join<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT, InnerValueT, ResultValueT>):
            ISeries<number, ResultValueT>;

    /**
     * Creates a new series by merging two input series.
     * The resulting series contains only those values that are only present in one or the other of the series, not both.
     *
     * @param inner The 'inner' series to join (the series you are callling the function on is the 'outer' series).
     * @param outerKeySelector User-defined selector function that chooses the join key from the outer series.
     * @param innerKeySelector User-defined selector function that chooses the join key from the inner series.
     * @param resultSelector User-defined function that merges outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @return Returns the new merged series.
     * 
     * @example
     * <pre>
     * 
     * // Join together two sets of customers to find those
     * // that have bought either product A or product B, not not both.
     * const customerWhoBoughtProductA = ...
     * const customerWhoBoughtProductB = ...
     * const customersWhoBoughtEitherProductButNotBothDf = customerWhoBoughtProductA.joinOuter(
     *          customerWhoBoughtProductB,
     *          customerA => customerA.CustomerId, // Join key.
     *          customerB => customerB.CustomerId, // Join key.
     *          (customerA, customerB) => {
     *              return {
     *                  // ... merge the results ...
     *              };
     *          }
     *      );
     * </pre>
     */    
    joinOuter<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            ISeries<number, ResultValueT>;

    /**
     * Creates a new series by merging two input series.
     * The resulting series contains only those values that are present either in both series or only in the outer (left) series.
     * 
     * @param inner The 'inner' series to join (the series you are callling the function on is the 'outer' series).
     * @param outerKeySelector User-defined selector function that chooses the join key from the outer series.
     * @param innerKeySelector User-defined selector function that chooses the join key from the inner series.
     * @param resultSelector User-defined function that merges outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @return Returns the new merged series.
     * 
     * @example
     * <pre>
     * 
     * // Join together two sets of customers to find those
     * // that have bought either just product A or both product A and product B.
     * const customerWhoBoughtProductA = ...
     * const customerWhoBoughtProductB = ...
     * const boughtJustAorAandB = customerWhoBoughtProductA.joinOuterLeft(
     *          customerWhoBoughtProductB,
     *          customerA => customerA.CustomerId, // Join key.
     *          customerB => customerB.CustomerId, // Join key.
     *          (customerA, customerB) => {
     *              return {
     *                  // ... merge the results ...
     *              };
     *          }
     *      );
     * </pre>
     */
    joinOuterLeft<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            ISeries<number, ResultValueT>;

    /**
     * Creates a new series by merging two input series.
     * The resulting series contains only those values that are present either in both series or only in the inner (right) series.
     *
     * @param inner The 'inner' series to join (the series you are callling the function on is the 'outer' series).
     * @param outerKeySelector User-defined selector function that chooses the join key from the outer series.
     * @param innerKeySelector User-defined selector function that chooses the join key from the inner series.
     * @param resultSelector User-defined function that merges outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @return Returns the new merged series.
     * 
     * @example
     * <pre>
     * 
     * // Join together two sets of customers to find those
     * // that have bought either just product B or both product A and product B.
     * const customerWhoBoughtProductA = ...
     * const customerWhoBoughtProductB = ...
     * const boughtJustAorAandB = customerWhoBoughtProductA.joinOuterRight(
     *          customerWhoBoughtProductB,
     *          customerA => customerA.CustomerId, // Join key.
     *          customerB => customerB.CustomerId, // Join key.
     *          (customerA, customerB) => {
     *              return {
     *                  // ... merge the results ...
     *              };
     *          }
     *      );
     * </pre>
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
     * 
     * @example
     * <pre>
     * 
     * const truncated = series.truncateStrings(10); // Truncate all string values to max length of 10 characters.
     * </pre>
     */
    truncateStrings (maxLength: number): ISeries<IndexT, ValueT>;

    /**
     * Insert a pair at the start of the series.
     * Doesn't modify the original series! The returned series is entirely new and contains values from the original series plus the inserted pair.
     *
     * @param pair The index/value pair to insert.
     * 
     * @return Returns a new series with the specified pair inserted.
     * 
     * @example
     * <pre>
     * 
     * const newIndex = ... index of the new row ...
     * const newRow = ... the new data row to insert ...
     * const insertedSeries = series.insertPair([newIndex, newRows]);
     * </pre>
     */
    insertPair (pair: [IndexT, ValueT]): ISeries<IndexT, ValueT>;

    /**
     * Append a pair to the end of a series.
     * Doesn't modify the original series! The returned series is entirely new and contains values from the original series plus the appended pair.
     *
     * @param pair The index/value pair to append.
     *  
     * @return Returns a new series with the specified pair appended.
     * 
     * @example
     * <pre>
     * 
     * const newIndex = ... index of the new row ...
     * const newRow = ... the new data row to append ...
     * const appendedSeries = series.appendPair([newIndex, newRows]);
     * </pre>
     */
    appendPair (pair: [IndexT, ValueT]): ISeries<IndexT, ValueT>;

    /**
     * Fill gaps in a series.
     *
     * @param comparer User-defined comparer function that is passed pairA and pairB, two consecutive values, return truthy if there is a gap between the value, or falsey if there is no gap.
     * @param generator User-defined generator function that is passed pairA and pairB, two consecutive values, returns an array of pairs that fills the gap between the values.
     *
     * @return Returns a new series with gaps filled in.
     * 
     * @example
     * <pre>
     * 
     *   var sequenceWithGaps = ...
     *
     *  // Predicate that determines if there is a gap.
     *  var gapExists = (pairA, pairB) => {
     *      // Returns true if there is a gap.
     *      return true;
     *  };
     *
     *  // Generator function that produces new rows to fill the game.
     *  var gapFiller = (pairA, pairB) => {
     *      // Create an array of index, value pairs that fill the gaps between pairA and pairB.
     *      return [
     *          newPair1,
     *          newPair2,
     *          newPair3,
     *      ];
     *  };
     *
     *  var sequenceWithoutGaps = sequenceWithGaps.fillGaps(gapExists, gapFiller);
     * </pre>
     */
    fillGaps (comparer: ComparerFn<[IndexT, ValueT], [IndexT, ValueT]>, generator: GapFillFn<[IndexT, ValueT], [IndexT, ValueT]>): ISeries<IndexT, ValueT>;

    /**
     * Returns the specified default series if the input series is empty. 
     *
     * @param defaultSequence Default series to return if the input series is empty.
     * 
     * @return Returns 'defaultSequence' if the input series is empty. 
     * 
     * @example
     * <pre>
     * 
     * const emptySeries = new Series();
     * const defaultSeries = new Series([ 1, 2, 3 ]);
     * expect(emptyDataFrame.defaultIfEmpty(defaultSeries)).to.eql(defaultSeries);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const nonEmptySeries = new Series([ 100 ]);
     * const defaultSeries = new Series([ 1, 2, 3 ]);
     * expect(nonEmptySeries.defaultIfEmpty(defaultSeries)).to.eql(nonEmptySeries);
     * </pre>
     */
    defaultIfEmpty (defaultSequence: ValueT[] | ISeries<IndexT, ValueT>): ISeries<IndexT, ValueT>;

    /**
     * Detect the the frequency of the types of the values in the series.
     * This is a good way to understand the shape of your data.
     *
     * @return Returns a {@link DataFrame} with rows that confirm to {@link ITypeFrequency} that describes the data types contained in the original series.
     * 
     * @example
     * <pre>
     * 
     * const dataTypes = series.detectTypes();
     * console.log(dataTypes.toString());
     * </pre>
     */
    detectTypes (): IDataFrame<number, ITypeFrequency>;

    /**
     * Detect the frequency of the values in the series.
     * This is a good way to understand the shape of your data.
     *
     * @return Returns a {@link DataFrame} with rows that conform to {@link IValueFrequency} that describes the values contained in the original series.
     * 
     * @example
     * <pre>
     * 
     * const dataValues = series.detectValues();
     * console.log(dataValues.toString());
     * </pre>
     */
    detectValues (): IDataFrame<number, IValueFrequency>;

    /**
     * Organise all values in the series into the specified number of buckets.
     * Assumes that the series is a series of numbers.
     * 
     * @param numBuckets - The number of buckets to create.
     * 
     * @returns Returns a dataframe containing bucketed values. The input values are divided up into these buckets.
     * 
     * @example
     * <pre>
     * 
     * const buckets = series.bucket(20); // Distribute values into 20 evenly spaced buckets.
     * console.log(buckets.toString());
     * </pre>
     */
    bucket (numBuckets: number): IDataFrame<IndexT, IBucket>;    
}

/**
 * Interface to a series that has been ordered.
 */
export interface IOrderedSeries<IndexT = number, ValueT = any, SortT = any> extends ISeries<IndexT, ValueT> {

    /** 
     * Applys additional sorting (ascending) to an already sorted series.
     * 
     * @param selector User-defined selector that selects the additional value to sort by.
     * 
     * @return Returns a new series has been additionally sorted by the value chosen by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * // Order sales by salesperson and then by amount (from least to most).
     * const ordered = sales.orderBy(sale => sale.SalesPerson).thenBy(sale => sale.Amount);
     * </pre>
     */
    thenBy<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;

    /** 
     * Applys additional sorting (descending) to an already sorted series.
     * 
     * @param selector User-defined selector that selects the additional value to sort by.
     * 
     * @return Returns a new series has been additionally sorted by the value chosen by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * // Order sales by salesperson and then by amount (from most to least).
     * const ordered = sales.orderBy(sale => sale.SalesPerson).thenByDescending(sale => sale.Amount);
     * </pre>
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
        if (isArray(input)) {
            // Ok
        }
        else if (isFunction(input[Symbol.iterator])) {
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
     * @param config This can be an array, a configuration object or a function that lazily produces a configuration object. 
     * 
     * It can be an array that specifies the values that the series contains.
     * 
     * It can be a {@link ISeriesConfig} that defines the values and configuration of the series.
     * 
     * Or it can be a function that lazily produces a {@link ISeriesConfig}.
     * 
     * @example
     * <pre>
     * 
     * const series = new Series();
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const series = new Series([10, 20, 30, 40]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const series = new Series({ index: [1, 2, 3, 4], values: [10, 20, 30, 40]});
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const lazyInit = () => ({ index: [1, 2, 3, 4], values: [10, 20, 30, 40] });
     * const series = new Series(lazyInit);
     * </pre>
     */
    constructor(config?: Iterable<ValueT> | ISeriesConfig<IndexT, ValueT> | SeriesConfigFn<IndexT, ValueT>) {
        if (config) {
            if (isFunction(config)) {
                this.configFn = config;
            }
            else if (isArray(config) || 
                     isFunction((config as any)[Symbol.iterator])) {
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
     * This function is automatically called by `for...of`.
     * 
     * @return An iterator for the series.
     * 
     * @example
     * <pre>
     * 
     * for (const value of series) {
     *     // ... do something with the value ...
     * }
     * </pre>
     */
    [Symbol.iterator](): Iterator<ValueT> {
        return this.getContent().values[Symbol.iterator]();
    }

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
    cast<NewValueT> (): ISeries<IndexT, NewValueT> {
        return this as any as ISeries<IndexT, NewValueT>;
    }
    
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
    getIndex (): IIndex<IndexT> {
        return new Index<IndexT>(() => ({ values: this.getContent().index }));
    }

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
    withIndex<NewIndexT> (newIndex: Iterable<NewIndexT> | SelectorFn<ValueT, NewIndexT>): ISeries<NewIndexT, ValueT> {

        if (isFunction(newIndex)) {
            return new Series<NewIndexT, ValueT>(() => ({
                values: this.getContent().values,
                index: this.select(newIndex),
            }));
        }
        else {
            Series.checkIterable(newIndex as Iterable<NewIndexT>, 'newIndex');
            
            return new Series<NewIndexT, ValueT>(() => ({
                values: this.getContent().values,
                index: newIndex as Iterable<NewIndexT>,
            }));
        }
    };

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
    resetIndex (): ISeries<number, ValueT> {
        return new Series<number, ValueT>(() => ({
            values: this.getContent().values // Just strip the index.
        }));
    }

    /**
     * Merge multiple series into a single series.
     * Values are merged by index.
     * Values at each index are combined into arrays in the resulting series.
     * 
     * @param series An array or series of series to merge.
     * 
     * @returns The merged series.
     * 
     * @example
     * <pre>
     * 
     * const mergedSeries = Series.merge([series1, series2, etc]);
     * </pre>
     */
    static merge<MergedValueT = any, IndexT = any>(series: Iterable<ISeries<IndexT, any>>): ISeries<IndexT, MergedValueT[]> {

        const rowMap = new Map<IndexT, any[]>();
        const numSeries = Array.from(series).length; //TODO: Be nice not to have to do this.
        let seriesIndex = 0;
        for (const workingSeries of series) {
            for (const pair of workingSeries.toPairs()) {
                const index = pair[0];
                if (!rowMap.has(index)) {
                    rowMap.set(index, new Array(numSeries));
                }

                rowMap.get(index)![seriesIndex] = pair[1];
            }

            ++seriesIndex;
        }

        const mergedPairs = Array.from(rowMap.keys())
            .map(index => [index, rowMap.get(index)] as [IndexT, MergedValueT[]]);

        mergedPairs.sort((a, b) => { // Sort by index, ascending.
            if (a[0] === b[0]) {
                return 0;
            }
            else if (a[0] > b[0]) {
                return 1;
            }
            else {
                return -1;
            }
        });

        return new Series<IndexT, MergedValueT[]>({
            pairs: mergedPairs,
        });
    }

   /**
     * Merge one or more series into this series.
     * Values are merged by index.
     * Values at each index are combined into arrays in the resulting series.
     * 
     * @param series... One or more other series to merge into the series.
     * 
     * @returns The merged series.
     * 
     * @example
     * <pre>
     * 
     * const mergedSeries = series1.merge(series2);
     * </pre>
     * 
     * <pre>
     * 
     * const mergedSeries = series1.merge(series2, series3, etc);
     * </pre>
     */
    merge<MergedValueT = any>(...args: any[]): ISeries<IndexT, MergedValueT[]> {
        return Series.merge<MergedValueT, IndexT>([this].concat(args));
    }
    
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
   toArray (): any[] {
        const values = [];
        for (const value of this.getContent().values) {
            if (value !== undefined && value !== null) {
                values.push(value);
            }
        }
        return values;
    }

    /**
     * Retreive the index, values pairs from the series as an array.
     * Each pair is [index, value].
     * This forces lazy evaluation to complete.
     * 
     * @return Returns an array of pairs that contains the series values. Each pair is a two element array that contains an index and a value.
     * 
     * @example
     * <pre>
     * const pairs = series.toPairs();
     * </pre>
     */
    toPairs (): ([IndexT, ValueT])[] {
        const pairs = [];
        for (const pair of this.getContent().pairs) {
            if (pair[1] !== undefined && pair[1] !== null) {
                pairs.push(pair);
            }
        }
        return pairs;
    }

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
    toObject<KeyT = any, FieldT = any, OutT = any> (keySelector: (value: ValueT) => KeyT, valueSelector: (value: ValueT) => FieldT): OutT {

        if (!isFunction(keySelector)) throw new Error("Expected 'keySelector' parameter to Series.toObject to be a function.");
        if (!isFunction(valueSelector)) throw new Error("Expected 'valueSelector' parameter to Series.toObject to be a function.");

        return toMap(this, keySelector, valueSelector);
    }
    
    /**
     * Generates a new series by repeatedly calling a user-defined selector function on each value in the original series.
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
    select<ToT> (selector: SelectorWithIndexFn<ValueT, ToT>): ISeries<IndexT, ToT> {
        if (!isFunction(selector)) throw new Error("Expected 'selector' parameter to 'Series.select' function to be a function.");

        return new Series(() => ({
            values: new SelectIterable(this.getContent().values, selector),
            index: this.getContent().index,
        }));
    }

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
    selectMany<ToT> (selector: SelectorWithIndexFn<ValueT, Iterable<ToT>>): ISeries<IndexT, ToT> {
        if (!isFunction(selector)) throw new Error("Expected 'selector' parameter to 'Series.selectMany' to be a function.");

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
    window (period: number, whichIndex?: WhichIndex): ISeries<IndexT, ISeries<IndexT, ValueT>> {

        if (!isNumber(period)) throw new Error("Expected 'period' parameter to 'Series.window' to be a number.");

        return new Series<IndexT, ISeries<IndexT, ValueT>>(() => ({
            pairs: new SeriesWindowIterable<IndexT, ValueT>(this.getContent().pairs, period, whichIndex || WhichIndex.End),
        }));
    }

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
    rollingWindow (period: number, whichIndex?: WhichIndex): ISeries<IndexT, ISeries<IndexT, ValueT>> {

        if (!isNumber(period)) throw new Error("Expected 'period' parameter to 'Series.rollingWindow' to be a number.");

        return new Series<IndexT, ISeries<IndexT, ValueT>>(() => ({
            pairs: new SeriesRollingWindowIterable<IndexT, ValueT>(this.getContent().pairs, period, whichIndex || WhichIndex.End),
        }));
    }

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
    variableWindow (comparer: ComparerFn<ValueT, ValueT>): ISeries<number, ISeries<IndexT, ValueT>> {
        
        if (!isFunction(comparer)) throw new Error("Expected 'comparer' parameter to 'Series.variableWindow' to be a function.")

        return new Series<number, ISeries<IndexT, ValueT>>(() => ({
            values: new SeriesVariableWindowIterable<IndexT, ValueT>(this.getContent().pairs, comparer)
        }));
    };    

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
    sequentialDistinct<ToT = ValueT> (selector?: SelectorFn<ValueT, ToT>): ISeries<IndexT, ValueT> {
        
        if (selector) {
            if (!isFunction(selector)) throw new Error("Expected 'selector' parameter to 'Series.sequentialDistinct' to be a selector function that determines the value to compare for duplicates.")
        }
        else {
            selector = (value: ValueT): ToT => <ToT> <any> value;
        }

        return this.variableWindow((a, b) => selector!(a) === selector!(b))
            .select((window): [IndexT, ValueT] => {
                return [window.getIndex().first(), window.first()] ;
            })
            .withIndex(pair => pair[0])
            .select(pair => pair[1]);
    }

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
   aggregate<ToT = ValueT> (seedOrSelector: AggregateFn<ValueT, ToT> | ToT, selector?: AggregateFn<ValueT, ToT>): ToT {

        if (isFunction(seedOrSelector) && !selector) {
            return this.skip(1).aggregate(<ToT> <any> this.first(), seedOrSelector);
        }
        else {
            if (!isFunction(selector)) throw new Error("Expected 'selector' parameter to aggregate to be a function.");

            let accum = <ToT> seedOrSelector;

            for (const value of this) {
                accum = selector!(accum, value);
            }

            return accum;
        }
    }
   
    /**
     * Compute the absolute range of values in each period.
     * The range for each period is the absolute difference between largest (max) and smallest (min) values in that period.
     * 
     * @param period - Period for computing the range.
     * 
     * @returns Returns a new series where each value indicates the absolute range of values for each period in the original series.
     * 
     * @example
     * <pre>
     * 
     * const closingPrice = ... series of closing prices for a particular stock ...
     * const volatility = closingPrice.amountRange();
     * </pre>
     */
    amountRange (period: number): ISeries<IndexT, number> {
        return (<ISeries<IndexT, number>> <any> this) // Have to assume this is a number series.
            .rollingWindow(period)
            .select((window): [IndexT, number] => {
                const max = window.max();
                const min = window.min();
                const amountRange = max - min; // Compute range of values in the period.
                return [window.getIndex().last(), amountRange]; // Return new index and value.
            })
            .withIndex(pair => pair[0])
            .select(pair => pair[1]);
    }   

    /**
     * Compute the range of values in each period in proportion to the latest value.
     * The range for each period is the absolute difference between largest (max) and smallest (min) values in that period.
     * Proportions are expressed as 0-1 values.
     * 
     * @param period - Period for computing the range.
     * 
     * @returns Returns a new series where each value indicates the proportion change from the previous number value in the original series.
     * 
     * @returns Returns a new series where each value indicates the proportionate range of values for each period in the original series.
     * 
     * @example
     * <pre>
     * 
     * const closingPrice = ... series of closing prices for a particular stock ...
     * const proportionVolatility = closingPrice.proportionRange();
     * </pre>
     */
    proportionRange (period: number): ISeries<IndexT, number> {
        return (<ISeries<IndexT, number>> <any> this) // Have to assume this is a number series.
            .rollingWindow(period)
            .select((window): [IndexT, number] => {
                const max = window.max();
                const min = window.min();
                const amountRange = max - min; // Compute range of values in the period.
                const pctRange = amountRange / window.last(); // Compute proportion change.
                return [window.getIndex().last(), pctRange]; // Return new index and value.
            })
            .withIndex(pair => pair[0])
            .select(pair => pair[1]);
    }    

    /**
     * Compute the range of values in each period in proportion to the latest value.
     * The range for each period is the absolute difference between largest (max) and smallest (min) values in that period.
     * Proportions are expressed as 0-1 values.
     * 
     * @param period - Period for computing the range.
     * 
     * @returns Returns a new series where each value indicates the proportion change from the previous number value in the original series.
     * 
     * @returns Returns a new series where each value indicates the proportionate range of values for each period in the original series.
     * 
     * @example
     * <pre>
     * 
     * const closingPrice = ... series of closing prices for a particular stock ...
     * const percentVolatility = closingPrice.percentRange();
     * </pre>
     */
    percentRange (period: number): ISeries<IndexT, number> {
        return this.proportionRange(period).select(v => v * 100);
    }

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
    percentChange (period?: number): ISeries<IndexT, number> {
        return this.proportionChange(period).select(v => v * 100);
    }    
    
    /**
     * For each period, compute the proportion of values that are less than the last value in the period.
     * Proportions are expressed as 0-1 values.
     * 
     * @param [period] Optional period for computing the proportion rank - defaults to 2.
     * 
     * @returns Returns a new series where each value indicates the proportion rank value for that period.
     * 
     * @example
     * <pre>
     * 
     * const proportionRank = series.proportionRank();
     * </pre>
     * @example
     * <pre>
     * 
     * const proportionRank = series.proportionRank(100);
     * </pre>
     */
    proportionRank (period?: number): ISeries<IndexT, number> {
        if (period === undefined) {
            period = 2;
        }

        if (!isNumber(period)) {
            throw new Error("Expected 'period' parameter to 'Series.proportionRank' to be a number that specifies the time period for the ranking.");
        }
    
        return this.rollingWindow(period+1) // +1 to account for the last value being used.
            .select<[IndexT, number]>(window => {
                const latestValue = window.last();
                const numLowerValues = window.head(-1).where(prevMomentum => prevMomentum < latestValue).count();
                const proportionRank = numLowerValues / period!;
                return [
                    window.getIndex().last(),
                    proportionRank
                ];
            })
            .withIndex(pair => pair[0])
            .select(pair => pair[1]);
    }

    /**
     * For each period, compute the percent of values that are less than the last value in the period.
     * Percent are expressed as 0-100 values.
     * 
     * @param [period] Optional period for computing the percent rank - defaults to 2.
     * 
     * @returns Returns a new series where each value indicates the percent rank value for that period.
     * 
     * @example
     * <pre>
     * 
     * const percentRank = series.percentRank();
     * </pre>
     * @example
     * <pre>
     * 
     * const percentRank = series.percentRank(100);
     * </pre>
     */
    percentRank (period?: number): ISeries<IndexT, number> {
        if (period === undefined) {
            period = 2;
        }

        if (!isNumber(period)) {
            throw new Error("Expected 'period' parameter to 'Series.percentRank' to be a number that specifies the time period for the ranking.");
        }
    
        return this.proportionRank(period).select(proportion => proportion * 100);
    }
    
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
    skip (numValues: number): ISeries<IndexT, ValueT> {
        return new Series<IndexT, ValueT>(() => ({
            values: new SkipIterable(this.getContent().values, numValues),
            index: new SkipIterable(this.getContent().index, numValues),
            pairs: new SkipIterable(this.getContent().pairs, numValues),
        }));
    }
    
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
    skipWhile (predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT> {
        if (!isFunction(predicate)) throw new Error("Expected 'predicate' parameter to 'Series.skipWhile' function to be a predicate function that returns true/false.");

        return new Series<IndexT, ValueT>(() => ({
            values: new SkipWhileIterable(this.getContent().values, predicate),
            pairs: new SkipWhileIterable(this.getContent().pairs, pair => predicate(pair[1])),
        }));
    }

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
    skipUntil (predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT> {
        if (!isFunction(predicate)) throw new Error("Expected 'predicate' parameter to 'Series.skipUntil' function to be a predicate function that returns true/false.");

        return this.skipWhile(value => !predicate(value)); 
    }

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
    take (numRows: number): ISeries<IndexT, ValueT> {
        if (!isNumber(numRows)) throw new Error("Expected 'numRows' parameter to 'Series.take' function to be a number.");

        return new Series(() => ({
            index: new TakeIterable(this.getContent().index, numRows),
            values: new TakeIterable(this.getContent().values, numRows),
            pairs: new TakeIterable(this.getContent().pairs, numRows)
        }));
    };

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
    takeWhile (predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT> {
        if (!isFunction(predicate)) throw new Error("Expected 'predicate' parameter to 'Series.takeWhile' function to be a predicate function that returns true/false.");

        return new Series(() => ({
            values: new TakeWhileIterable(this.getContent().values, predicate),
            pairs: new TakeWhileIterable(this.getContent().pairs, pair => predicate(pair[1]))
        }));
    }

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
    takeUntil (predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT> {
        if (!isFunction(predicate)) throw new Error("Expected 'predicate' parameter to 'Series.takeUntil' function to be a predicate function that returns true/false.");

        return this.takeWhile(value => !predicate(value));
    }

    /**
     * Static version of the count function for use with summarize and pivot functions.
     * 
     * @param series Input series to be counted.
     * 
     * @returns Returns the count of values in the series.
     * 
     * @example
     * <pre>
     * 
     * const summary = dataFrame.summarize({
     *      ColumnToBeCounted: Series.count,
     * });
     * </pre>
     */
    static count<IndexT = any> (series: ISeries<IndexT, number>): number {
        return series.count();
    }
    
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
     * @return Returns the first value of the series.
     * 
     * @example
     * <pre>
     * 
     * const firstValue = series.first();
     * </pre>
     */
    first (): ValueT {

        for (const value of this) {
            return value; // Only need the first value.
        }

        throw new Error("Series.first: No values in Series.");
    }

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
    last (): ValueT {

        let lastValue = null;

        for (const value of this) {
            lastValue = value; // Throw away all values until we get to the last one.
        }

        if (lastValue === null) {
            throw new Error("Series.last: No values in Series.");
        }

        return lastValue;
    }    
    
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
    head (numValues: number): ISeries<IndexT, ValueT> {

        if (!isNumber(numValues)) throw new Error("Expected 'numValues' parameter to 'Series.head' function to be a number.");

        if (numValues === 0) {
            return new Series<IndexT, ValueT>(); // Empty series.
        }

        const toTake = numValues < 0 ? this.count() - Math.abs(numValues) : numValues;
        return this.take(toTake);
    }

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
    tail (numValues: number): ISeries<IndexT, ValueT> {

        if (!isNumber(numValues)) throw new Error("Expected 'numValues' parameter to 'Series.tail' function to be a number.");

        if (numValues === 0) {
            return new Series<IndexT, ValueT>(); // Empty series.
        }

        const toSkip = numValues > 0 ? this.count() - numValues : Math.abs(numValues);
        return this.skip(toSkip);
    }

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
    where (predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT> {

        if (!isFunction(predicate)) throw new Error("Expected 'predicate' parameter to 'Series.where' function to be a function.");

        return new Series(() => ({
            values: new WhereIterable(this.getContent().values, predicate),
            pairs: new WhereIterable(this.getContent().pairs, pair => predicate(pair[1]))
        }));
    }

    /**
     * Invoke a callback function for each value in the series.
     *
     * @param callback The calback function to invoke for each value.
     * 
     * @return Returns the original series with no modifications.
     * 
     * @example
     * <pre>
     * 
     * series.forEach(value => {
     *      // ... do something with the value ...
     * });
     * </pre>
     */
    forEach (callback: CallbackFn<ValueT>): ISeries<IndexT, ValueT> {
        if (!isFunction(callback)) throw new Error("Expected 'callback' parameter to 'Series.forEach' to be a function.");

        let index = 0;
        for (const value of this) {
            callback(value, index++);
        }

        return this;
    };

    /**
     * Evaluates a predicate function for every value in the series to determine 
     * if some condition is true/truthy for **all** values in the series.
     * 
     * @param predicate Predicate function that receives each value. It should returns true/truthy for a match, otherwise false/falsy.
     *
     * @return Returns true if the predicate has returned true or truthy for every value in the series, otherwise returns false. Returns false for an empty series.
     * 
     * @example
     * <pre>
     * 
     * const result = series.all(salesFigure => salesFigure > 100); // Returns true if all sales figures are greater than 100.
     * </pre>
     */
    all (predicate: PredicateFn<ValueT>): boolean {
        if (!isFunction(predicate)) throw new Error("Expected 'predicate' parameter to 'Series.all' to be a function.")

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
     * Evaluates a predicate function for every value in the series to determine 
     * if some condition is true/truthy for **any** of values in the series.
     * 
     * If no predicate is specified then it simply checks if the series contains more than zero values.
     *
     * @param [predicate] Optional predicate function that receives each value. It should return true/truthy for a match, otherwise false/falsy.
     *
     * @return Returns true if the predicate has returned truthy for any value in the series, otherwise returns false. 
     * If no predicate is passed it returns true if the series contains any values at all.
     * Returns false for an empty series.
     * 
     * @example
     * <pre>
     * 
     * const result = series.any(salesFigure => salesFigure > 100); // Do we have any sales figures greater than 100?
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const result = series.any(); // Do we have any sales figures at all?
     * </pre>
     */
    any (predicate?: PredicateFn<ValueT>): boolean {
        if (predicate) {
            if (!isFunction(predicate)) throw new Error("Expected 'predicate' parameter to 'Series.any' to be a function.")
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
     * Evaluates a predicate function for every value in the series to determine 
     * if some condition is true/truthy for **none** of values in the series.
     * 
     * If no predicate is specified then it simply checks if the series contains zero values.
     *
     * @param [predicate] Optional predicate function that receives each value. It should return true/truthy for a match, otherwise false/falsy.
     *
     * @return Returns true if the predicate has returned truthy for zero values in the series, otherwise returns false. Returns false for an empty series.
     * 
     * @example
     * <pre>
     * 
     * const result = series.none(salesFigure => salesFigure > 100); // Do we have zero sales figures greater than 100?
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const result = series.none(); // Do we have zero sales figures?
     * </pre>
     */
    none (predicate?: PredicateFn<ValueT>): boolean {

        if (predicate) {
            if (!isFunction(predicate)) throw new Error("Expected 'predicate' parameter to 'Series.none' to be a function.")
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
     * Gets a new series containing all values starting at or after the specified index value.
     * 
     * @param indexValue The index value at which to start the new series.
     * 
     * @return Returns a new series containing all values starting at or after the specified index value. 
     * 
     * @example
     * <pre>
     * 
     * const series = new Series({ 
     *      index: [0, 1, 2, 3], // This is the default index.
     *      values: [10, 20, 30, 40],
     * });
     * 
     * const lastHalf = series.startAt(2);
     * expect(lastHalf.toArray()).to.eql([30, 40]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const timeSeries = ... a series indexed by date/time ...
     * 
     * // Get all values starting at (or after) a particular date.
     * const result = timeSeries.startAt(new Date(2016, 5, 4)); 
     * </pre>
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
     * Gets a new series containing all values up until and including the specified index value (inclusive).
     * 
     * @param indexValue The index value at which to end the new series.
     * 
     * @return Returns a new series containing all values up until and including the specified index value.
     * 
     * @example
     * <pre>
     * 
     * const series = new Series({ 
     *      index: [0, 1, 2, 3], // This is the default index.
     *      values: [10, 20, 30, 40],
     * });
     * 
     * const firstHalf = series.endAt(1);
     * expect(firstHalf.toArray()).to.eql([10, 20]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const timeSeries = ... a series indexed by date/time ...
     * 
     * // Get all values ending at a particular date.
     * const result = timeSeries.endAt(new Date(2016, 5, 4)); 
     * </pre>
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
     * Gets a new series containing all values up to the specified index value (exclusive).
     * 
     * @param indexValue The index value at which to end the new series.
     * 
     * @return Returns a new series containing all values up to (but not including) the specified index value. 
     * 
     * @example
     * <pre>
     * 
     * const series = new Series({ 
     *      index: [0, 1, 2, 3], // This is the default index.
     *      values: [10, 20, 30, 40],
     * });
     * 
     * const firstHalf = series.before(2);
     * expect(firstHalf.toArray()).to.eql([10, 20]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const timeSeries = ... a series indexed by date/time ...
     * 
     * // Get all values before the specified date.
     * const result = timeSeries.before(new Date(2016, 5, 4)); 
     * </pre>
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
     * Gets a new series containing all values after the specified index value (exclusive).
     * 
     * @param indexValue The index value after which to start the new series.
     * 
     * @return Returns a new series containing all values after the specified index value.
     * 
     * @example
     * <pre>
     * 
     * const series = new Series({ 
     *      index: [0, 1, 2, 3], // This is the default index.
     *      values: [10, 20, 30, 40],
     * });
     * 
     * const lastHalf = df.before(1);
     * expect(lastHalf.toArray()).to.eql([30, 40]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const timeSerie = ... a series indexed by date/time ...
     * 
     * // Get all values after the specified date.
     * const result = timeSeries.after(new Date(2016, 5, 4)); 
     * </pre>
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
     * Gets a new series containing all values between the specified index values (inclusive).
     * 
     * @param startIndexValue The index at which to start the new series.
     * @param endIndexValue The index at which to end the new series.
     * 
     * @return Returns a new series containing all values between the specified index values (inclusive).
     * 
     * @example
     * <pre>
     * 
     * const series = new Series({ 
     *      index: [0, 1, 2, 3, 4, 6], // This is the default index.
     *      values: [10, 20, 30, 40, 50, 60],
     * });
     * 
     * const middleSection = series.between(1, 4);
     * expect(middleSection.toArray()).to.eql([20, 30, 40, 50]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const timeSeries = ... a series indexed by date/time ...
     * 
     * // Get all values between the start and end dates (inclusive).
     * const result = timeSeries.after(new Date(2016, 5, 4), new Date(2016, 5, 22)); 
     * </pre>
     */
    between (startIndexValue: IndexT, endIndexValue: IndexT): ISeries<IndexT, ValueT> {
        return this.startAt(startIndexValue).endAt(endIndexValue); 
    }

    /** 
     * Format the series for display as a string.
     * This forces lazy evaluation to complete.
     * 
     * @return Generates and returns a string representation of the series.
     * 
     * @example
     * <pre>
     * 
     * console.log(series.toString());
     * </pre>
     */
    toString (): string {

        const header = ["__index__", "__value__"];
        const rows = this.toPairs();

        const table = new Table();
        for (let rowIndex = 0; rowIndex < rows.length; ++rowIndex) {
            const row = rows[rowIndex];
            for (let cellIndex = 0; cellIndex < row.length; ++cellIndex) {
                const cell = row[cellIndex];
                table.cell(header[cellIndex], cell);
            }
            table.newRow();
        }

        return table.toString();
    };

    //
    // Helper function to parse a string to an int.
    //
    static parseInt (value: any | undefined | null, valueIndex: number): number | undefined {
        if (value === undefined || value === null) {
            return undefined;
        }
        else {
            if (!isString(value)) {
                throw new Error("Called Series.parseInts, expected all values in the series to be strings, instead found a '" + typeof(value) + "' at index " + valueIndex);
            }

            if (value.length === 0) {
                return undefined;
            }

            return parseInt(value);
        }
    }

    /**
     * Parse a series with string values and convert it to a series with int values.
     *
     * @return Returns a new series with values parsed from strings to ints.
     * 
     * @example
     * <pre>
     * 
     * const parsed = series.parseInts();
     * </pre>
     */
    parseInts (): ISeries<IndexT, number> {
        return <ISeries<IndexT, number>> this.select(Series.parseInt);
    };

    //
    // Helper function to parse a string to a float.
    //
    static parseFloat (value: any | undefined | null, valueIndex: number): number | undefined {
        if (value === undefined || value === null) {
            return undefined;
        }
        else {
            if (!isString(value)) throw new Error("Called Series.parseFloats, expected all values in the series to be strings, instead found a '" + typeof(value) + "' at index " + valueIndex);

            if (value.length === 0) {
                return undefined;
            }

            return parseFloat(value);
        }
    }

    /**
     * Parse a series with string values and convert it to a series with float values.
     *
     * @return Returns a new series with values parsed from strings to floats.
     * 
     * @example
     * <pre>
     * 
     * const parsed = series.parseFloats();
     * </pre>
     */
    parseFloats (): ISeries<IndexT, number> {
        return <ISeries<IndexT, number>> this.select(Series.parseFloat);
    };

    //
    // Helper function to parse a string to a date.
    //
    static parseDate (value: any | undefined | null, valueIndex: number, formatString?: string): Date | undefined {
        if (value === undefined || value === null) {
            return undefined;
        }
        else {
            if (!isString(value)) throw new Error("Called Series.parseDates, expected all values in the series to be strings, instead found a '" + typeof(value) + "' at index " + valueIndex);

            if (value.length === 0) {
                return undefined;
            }

            return moment(value, formatString).toDate();
        }
    }

    /**
     * Parse a series with string values and convert it to a series with date values.
     *
     * @param [formatString] Optional formatting string for dates.
     * 
     * Moment is used for date parsing.
     * https://momentjs.com
     * 
     * @return Returns a new series with values parsed from strings to dates.
     * 
     * @example
     * <pre>
     * 
     * const parsed = series.parseDates();
     * </pre>
     */
    parseDates (formatString?: string): ISeries<IndexT, Date> {

        if (formatString) {
            if (!isString(formatString)) throw new Error("Expected optional 'formatString' parameter to Series.parseDates to be a string (if specified).");
        }

        return <ISeries<IndexT, Date>> this.select((value: any | undefined, valueIndex: number) => Series.parseDate(value, valueIndex, formatString));
    }

    //
    // Helper function to convert a value to a string.
    //
    static toString(value: any | undefined | null, formatString?: string): string | undefined | null {
        if (value === undefined) {
            return undefined;
        }
        else if (value === null) {
            return null;
        }
        else if (formatString && isDate(value)) {
            return moment(value).format(formatString);
        }
        else if (formatString && isNumber(value)) {
            return numeral(value).format(formatString);
        }
        else {
            return value.toString();	
        }		
    }

    /**
     * Convert a series of values of different types to a series containing string values.
     *
     * @param [formatString] Optional formatting string for dates.
     * 
     * Numeral.js is used for number formatting.
     * http://numeraljs.com/
     * 
     * Moment is used for date formatting.
     * https://momentjs.com/docs/#/parsing/string-format/
     * 
     * @return Returns a new series values converted from values to strings.
     * 
     * @example
     * <pre>
     * 
     * const result = series.toStrings("YYYY-MM-DD");
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const result = series.toStrings("0.00");
     * </pre>
     */
    toStrings (formatString?: string): ISeries<IndexT, string> {

        if (formatString) {
            if (!isString(formatString)) throw new Error("Expected optional 'formatString' parameter to Series.toStrings to be a string (if specified).");
        }

        return <ISeries<IndexT, string>> this.select(value => Series.toString(value, formatString));
    }

    /**
     * Forces lazy evaluation to complete and 'bakes' the series into memory.
     * 
     * @return Returns a series that has been 'baked', all lazy evaluation has completed.
     * 
     * @example
     * <pre>
     * 
     * const baked = series.bake();
     * </pre>
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
     * Converts (inflates) a series to a {@link DataFrame}.
     *
     * @param [selector] Optional user-defined selector function that transforms each value to produce the dataframe.
     *
     * @returns Returns a dataframe that was created from the original series.
     * 
     * @example
     * <pre>
     * 
     * const dataframe = series.inflate(); // Inflate a series of objects to a dataframe.
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const dataframe = series.inflate(value => { AColumn:  value }); // Produces a dataframe with 1 column from a series of values.
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const dataframe = series.inflate(value => { AColumn:  value.NestedValue }); // Extract a nested value and produce a dataframe from it.
     * </pre>
     */
    inflate<ToT = ValueT> (selector?: SelectorWithIndexFn<ValueT, ToT>): IDataFrame<IndexT, ToT> {

        if (selector) {
            if (!isFunction(selector)) throw new Error("Expected 'selector' parameter to Series.inflate to be a selector function.");

            return new DataFrame<IndexT, ToT>(() => {
                const content = this.getContent();
                return {
                    values: new SelectIterable(content.values, selector),
                    index: content.index,
                    pairs: new SelectIterable(content.pairs, (pair: [IndexT, ValueT], index: number): [IndexT, ToT] => [pair[0], selector(pair[1], index)]),
                };
            });
        }
        else {
            return new DataFrame<IndexT, ToT>(() => {
                const content = this.getContent();
                return {
                    values: <Iterable<ToT>> <any> content.values,
                    index: content.index,
                    pairs: <Iterable<[IndexT, ToT]>> <any> content.pairs,
                };
            });
        }
    }

    /**
     * Static version of the sum function for use with summarize and pivot functions.
     * 
     * @param series Input series to be summed.
     * 
     * @returns Returns the sum of the number values in the series.
     * 
     * @example
     * <pre>
     * 
     * const summary = dataFrame.summarize({
     *      ColumnToBeSummed: Series.sum,
     * });
     * </pre>
     */
    static sum<IndexT = any> (series: ISeries<IndexT, number>): number {
        return series.sum();
    }

    /**
     * Sum the values in a series and returns the result.
     * 
     * @returns Returns the sum of the number values in the series.
     * 
     * @example
     * <pre>
     * 
     * const totalSales = salesFigures.sum();
     * </pre>
     */
    sum (): number {

        if (this.none()) {
            return 0;
        }

        const numberSeries = <ISeries<IndexT, number>> <any> this; // Have to assume we are working with a number series here.
        return numberSeries.aggregate((prev: number, value: number) => prev + value);
    }

    /**
     * Static version of the average function for use with summarize and pivot functions.
     * 
     * @param series Input series to be averaged.
     * 
     * @returns Returns the average of the number values in the series.
     * 
     * @example
     * <pre>
     * 
     * const summary = dataFrame.summarize({
     *      ColumnToBeAveraged: Series.average,
     * });
     * </pre>
     */
    static average<IndexT = any> (series: ISeries<IndexT, number>): number {
        return series.average();
    }
    
    /**
     * Average the values in a series and returns the result
     * 
     * @returns Returns the average of the number values in the series.
     * 
     * @example
     * <pre>
     * 
     * const averageSales = salesFigures.average();
     * </pre>
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
     * Static version of the median function for use with summarize and pivot functions.
     * 
     * @param series Input series to find the median of.
     * 
     * @returns Returns the median of the number values in the series.
     * 
     * @example
     * <pre>
     * 
     * const summary = dataFrame.summarize({
     *      InputColumn: Series.median,
     * });
     * </pre>
     */
    static median<IndexT = any> (series: ISeries<IndexT, number>): number {
        return series.median();
    }

    /**
     * Get the median value in the series. 
     * Note that this sorts the series, which can be expensive.
     * 
     * @returns Returns the median of the values in the series.
     * 
     * @example
     * <pre>
     * 
     * const medianSales = salesFigures.median();
     * </pre>
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
     * Static version of the standard deviation function for use with summarize and pivot functions.
     * 
     * @param series Input series to find the standard deviation of.
     * 
     * @returns Returns the standard deviation of the values in the series.
     * 
     * @example
     * <pre>
     * 
     * const summary = dataFrame.summarize({
     *      InputColumn: Series.std,
     * });
     * </pre>
     */
    static std<IndexT = any> (series: ISeries<IndexT, number>): number {
        return series.std();
    }
    
    /**
     * Get the standard deviation of number values in the series. 
     * 
     * @returns Returns the standard deviation of the values in the series.
     * 
     * @example
     * <pre>
     * 
     * const salesStdDev = salesFigures.std();
     * </pre>
     */
    std (): number {

        // Have to assume we are working with a number series here.
        // Bake so we don't evaluate multiple times.
        // TODO: Caching can help here.
        const numberSeries = (<ISeries<IndexT, number>> <any> this.bake()); 
        const valueCount = numberSeries.count();
        if (valueCount === 0) {
            return 0;
        }

        // https://en.wikipedia.org/wiki/Standard_deviation
        const mean = numberSeries.average();
        const sumOfSquaredDiffs = numberSeries
            .select(value  => { 
                const diffFromMean = value - mean;
                return diffFromMean * diffFromMean;
            })
            .sum();
        return Math.sqrt(sumOfSquaredDiffs / valueCount);
    }

    /**
     * Static version of the min function for use with summarize and pivot functions.
     * 
     * @param series Input series to find the minimum of.
     * 
     * @returns Returns the minimum of number values in the series.
     * 
     * @example
     * <pre>
     * 
     * const summary = dataFrame.summarize({
     *      Column: Series.min,
     * });
     * </pre>
     */
    static min<IndexT = any> (series: ISeries<IndexT, number>): number {
        return series.min();
    }

    /**
     * Get the min value in the series.
     * 
     * @returns Returns the minimum of the number values in the series.
     * 
     * @example
     * <pre>
     * 
     * const minSales = salesFigures.min();
     * </pre>
     */
    min (): number {

        const numberSeries = <ISeries<IndexT, number>> <any> this; // Have to assume we are working with a number series here.
        return numberSeries.aggregate((prev, value) => Math.min(prev, value));
    }

    /**
     * Static version of the max function for use with summarize and pivot functions.
     * 
     * @param series Input series to find the maximum of.
     * 
     * @returns Returns the maximum of number values in the series.
     * 
     * @example
     * <pre>
     * 
     * const summary = dataFrame.summarize({
     *      Column: Series.max,
     * });
     * </pre>
     */
    static max<IndexT = any> (series: ISeries<IndexT, number>): number {
        return series.max();
    }
    
    /**
     * Get the max value in the series.
     * 
     * @returns Returns the maximum of the number values in the series.
     * 
     * @example
     * <pre>
     * 
     * const maxSales = salesFigures.max();
     * </pre>
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
     * 
     * @example
     * <pre>
     * 
     * const inverted = series.invert();
     * </pre>
     */
    invert (): ISeries<IndexT, number> {
        const inputSeries = this as any as ISeries<IndexT, number>;
        return inputSeries.select(value => -value);
    }

    /**
     * Counts the number of sequential values where the predicate evaluates to truthy.
     * Outputs 0 for values when the predicate evaluates to falsy.
     * 
     * @param predicate User-defined function. Should evaluate to truthy to activate the counter or falsy to deactivate it.
     * 
     * @returns Returns a new series that counts up the number of sequential values where the predicate evaluates to truthy. 0 values appear when the prediate evaluates to falsy.
     * 
     * @example
     * <pre>
     * 
     * const series = new Series([ 1, 10, 3, 15, 8, 5 ]);
     * const counted = series.counter(value => value >= 3);
     * console.log(counted.toString());
     * </pre>
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
     * Gets a new series in reverse order.
     * 
     * @return Returns a new series that is the reverse of the original.
     * 
     * @example
     * <pre>
     * 
     * const reversed = series.reverse();
     * </pre>
     */
    reverse (): ISeries<IndexT, ValueT> {

        return new Series<IndexT, ValueT>(() => ({
            values: new ReverseIterable(this.getContent().values),
            index: new ReverseIterable(this.getContent().index),
            pairs: new ReverseIterable(this.getContent().pairs)
        }));
    }

    /**
     * Returns only the set of values in the series that are distinct.
     * Provide a user-defined selector to specify criteria for determining the distinctness.
     * This can be used to remove duplicate values from the series.
     *
     * @param [selector] Optional user-defined selector function that specifies the criteria used to make comparisons for duplicate values.
     * 
     * @return Returns a series containing only unique values in the series. 
     * 
     * @example
     * <pre>
     * 
     * const uniqueValues = series.distinct(); // Get only non-duplicated value in the series.
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const bucketedValues = series.distinct(value => Math.floor(value / 10)); // Lump values into buckets of 10.
     * </pre>
     */
    distinct<ToT> (selector?: SelectorFn<ValueT, ToT>): ISeries<IndexT, ValueT> {

        return new Series<IndexT, ValueT>(() => ({
            values: new DistinctIterable<ValueT, ToT>(this.getContent().values, selector),
            pairs: new DistinctIterable<[IndexT, ValueT],ToT>(this.getContent().pairs, (pair: [IndexT, ValueT]): ToT => selector && selector(pair[1]) || <ToT> <any> pair[1])
        }));
    }

    /**
     * Collects values in the series into a new series of groups according to a user-defined selector function.
     *
     * @param selector User-defined selector function that specifies the criteriay to group by.
     *
     * @return Returns a new series of groups. Each group is a series with values that have been grouped by the 'selector' function.
     * 
     * @example
     * <pre>
     * 
     * const sales = ... product sales ...
     * const salesByProduct = sales.groupBy(sale => sale.ProductId);
     * for (const productSalesGroup of salesByProduct) {
     *      // ... do something with each product group ...
     *      const productId = productSalesGroup.first().ProductId;
     *      const totalSalesForProduct = productSalesGroup.deflate(sale => sale.Amount).sum();
     *      console.log(totalSalesForProduct);
     * }
     * </pre>
     */
    groupBy<GroupT> (selector: SelectorWithIndexFn<ValueT, GroupT>): ISeries<number, ISeries<IndexT, ValueT>> {

        if (!isFunction(selector)) throw new Error("Expected 'selector' parameter to 'Series.groupBy' to be a selector function that determines the value to group the series by.");

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
     * Collects values in the series into a new series of groups based on if the values are the same or according to a user-defined selector function.
     *
     * @param [selector] Optional selector that specifies the criteria for grouping.
     *
     * @return Returns a new series of groups. Each group is a series with values that are the same or have been grouped by the 'selector' function.
     * 
     * @example
     * <pre>
     * 
     * // Some ultra simple stock trading strategy backtesting...
     * const dailyStockPrice = ... daily stock price for a company ...
     * const priceGroups  = dailyStockPrice.groupBy(day => day.close > day.movingAverage);
     * for (const priceGroup of priceGroups) {
     *      // ... do something with each stock price group ...
     * 
     *      const firstDay = priceGroup.first();
     *      if (firstDay.close > movingAverage) {
     *          // This group of days has the stock price above its moving average.
     *          // ... maybe enter a long trade here ...
     *      }
     *      else {
     *          // This group of days has the stock price below its moving average.
     *          // ... maybe enter a short trade here ...
     *      }
     * }
     * </pre>
     */    
    groupSequentialBy<GroupT> (selector?: SelectorFn<ValueT, GroupT>): ISeries<number, ISeries<IndexT, ValueT>> {

        if (selector) {
            if (!isFunction(selector)) throw new Error("Expected 'selector' parameter to 'Series.groupSequentialBy' to be a selector function that determines the value to group the series by.")
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
        if (!isArray(series)) throw new Error("Expected 'series' parameter to 'Series.concat' to be an array of series.");

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
     * @param series Multiple arguments. Each can be either a series or an array of series.
     * 
     * @return Returns a single series concatenated from multiple input series. 
     * 
     * @example
     * <pre>
     * 
     * const concatenated = a.concat(b);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const concatenated = a.concat(b, c);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const concatenated = a.concat([b, c]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const concatenated = a.concat(b, [c, d]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const otherSeries = [... array of series...];
     * const concatenated = a.concat(otherSeries);
     * </pre>
     */    
    concat (...series: (ISeries<IndexT, ValueT>[]|ISeries<IndexT, ValueT>)[]): ISeries<IndexT, ValueT> {
        const concatInput: ISeries<IndexT, ValueT>[] = [this];

        for (const input of series) {
            if (isArray(input)) {
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
    * @param series - An iterable of series to be zipped.
    * @param zipper - Selector function that produces a new series based on the input series.
    * 
    * @returns Returns a single series zipped from multiple input series. 
    */
    static zip<IndexT = any, ValueT = any, ResultT = any> (series: Iterable<ISeries<IndexT, ValueT>>, zipper: ZipNFn<ValueT, ResultT>): ISeries<IndexT, ResultT> {

        const input = Array.from(series);

        if (input.length === 0) {
            return new Series<IndexT, ResultT>();
        }

        const firstSeries = input[0];
        if (firstSeries.none()) {
            return new Series<IndexT, ResultT>();
        }

        return new Series<IndexT, ResultT>(() => {
            const firstSeriesUpCast = <Series<IndexT, ValueT>> firstSeries;
            const upcast = <Series<IndexT, ValueT>[]> input; // Upcast so that we can access private index, values and pairs.
            
            return {
                index: <Iterable<IndexT>> firstSeriesUpCast.getContent().index,
                values: new ZipIterable<ValueT, ResultT>(upcast.map(s => s.getContent().values), zipper),
            };
        });
    }
    
    /**
    * Merge together multiple series to create a new series.
    * Preserves the index of the first series.
    * 
    * @param s2, s3, s4, s4 Multiple series to zip.
    * @param zipper User-defined zipper function that merges rows. It produces values for the new series based-on values from the input series.
    * 
    * @return Returns a single series merged from multiple input series. 
    * 
    * @example
    * <pre>
    * 
    * const a = new Series([1, 2, 3]);
    * const b = new Series([10, 20, 30]);
    * const zipped = a.zip(b (valueA, valueB) => valueA + valueB);
    * </pre>
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
     * Sorts the series in ascending order by a value defined by the user-defined selector function. 
     * 
     * @param selector User-defined selector function that selects the value to sort by.
     * 
     * @return Returns a new series that has been ordered accorrding to the value chosen by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * const orderedSeries = series.orderBy(value => value); 
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const orderedSeries = series.orderBy(value => value.NestedValue); 
     * </pre>
     */
    orderBy<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT> {
        const content = this.getContent();
        return new OrderedSeries<IndexT, ValueT, SortT>({
            values: content.values, 
            pairs: content.pairs, 
            selector: selector, 
            direction: Direction.Ascending, 
            parent: null,
        });
    }

    /**
     * Sorts the series in descending order by a value defined by the user-defined selector function. 
     * 
     * @param selector User-defined selector function that selects the value to sort by.
     * 
     * @return Returns a new series that has been ordered accorrding to the value chosen by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * const orderedSeries = series.orderByDescending(value => value); 
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const orderedSeries = series.orderByDescending(value => value.NestedValue); 
     * </pre>
     */
    orderByDescending<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT> {
        const content = this.getContent();
        return new OrderedSeries<IndexT, ValueT, SortT>({
            values: content.values, 
            pairs: content.pairs, 
            selector: selector, 
            direction: Direction.Descending, 
            parent: null,
        });
    }
        
    /**
     * Creates a new series by merging two input dataframes.
     * The resulting series contains the union of value from the two input series.
     * These are the unique combination of values in both series.
     * This is basically a concatenation and then elimination of duplicates.
     *
     * @param other The other series to merge.
     * @param [selector] Optional user-defined selector function that selects the value to compare to determine distinctness.
     * 
     * @return Returns the union of the two series.
     * 
     * @example
     * <pre>
     *
     * const seriesA = ...
     * const seriesB = ...
     * const merged = seriesA.union(seriesB);
     * </pre>
     * 
     * @example
     * <pre>
     *
     * // Merge two sets of customer records that may contain the same
     * // customer record in each set. This is basically a concatenation
     * // of the series and then an elimination of any duplicate records
     * // that result.
     * const customerRecordsA = ...
     * const customerRecordsB = ...
     * const mergedCustomerRecords = customerRecordsA.union(
     *      customerRecordsB, 
     *      customerRecord => customerRecord.CustomerId
     * );
     * </pre>
     * 
     * 
     * @example
     * <pre>
     *
     * // Note that you can achieve the exact same result as the previous
     * // example by doing a {@link Series.concat) and {@link Series.distinct}
     * // of the input series and then an elimination of any duplicate records
     * // that result.
     * const customerRecordsA = ...
     * const customerRecordsB = ...
     * const mergedCustomerRecords = customerRecordsA
     *      .concat(customerRecordsB)
     *      .distinct(customerRecord => customerRecord.CustomerId);
     * </pre>
     * 
     */
    union<KeyT = ValueT> (
        other: ISeries<IndexT, ValueT>, 
        selector?: SelectorFn<ValueT, KeyT>): 
            ISeries<IndexT, ValueT> {

        if (selector) {
            if (!isFunction(selector)) throw new Error("Expected optional 'selector' parameter to 'Series.union' to be a selector function.");
        }

        return this.concat(other).distinct(selector);
    };

    /**
     * Creates a new series by merging two input series.
     * The resulting series contains the intersection of values from the two input series.
     * These are only the values that appear in both series.
     *
     * @param inner The inner series to merge (the series you call the function on is the 'outer' series).
     * @param [outerSelector] Optional user-defined selector function that selects the key from the outer series that is used to match the two series.
     * @param [innerSelector] Optional user-defined selector function that selects the key from the inner series that is used to match the two series.
     * 
     * @return Returns a new series that contains the intersection of values from the two input series.
     * 
     * @example
     * <pre>
     * 
     * const seriesA = ...
     * const seriesB = ...
     * const mergedDf = seriesA.intersection(seriesB);
     * </pre>
     * 
     * @example
     * <pre>
     *
     * // Merge two sets of customer records to find only the
     * // customers that appears in both.
     * const customerRecordsA = ...
     * const customerRecordsB = ...
     * const intersectionOfCustomerRecords = customerRecordsA.intersection(
     *      customerRecordsB, 
     *      customerRecord => customerRecord.CustomerId
     * );
     * </pre>     
     */    
    intersection<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerSelector?: SelectorFn<ValueT, KeyT>,
        innerSelector?: SelectorFn<InnerValueT, KeyT>): 
            ISeries<IndexT, ValueT> {

        if (outerSelector) {
            if (!isFunction(outerSelector)) throw new Error("Expected optional 'outerSelector' parameter to 'Series.intersection' to be a function.");
        }
        else {
            outerSelector = value => <KeyT> <any> value;
        }
        
        if (innerSelector) {
            if (!isFunction(innerSelector)) throw new Error("Expected optional 'innerSelector' parameter to 'Series.intersection' to be a function.");
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
     * Creates a new series by merging two input series.
     * The resulting series contains only the values from the 1st series that don't appear in the 2nd series.
     * This is essentially subtracting the values from the 2nd series from the 1st and creating a new series with the remaining values.
     *
     * @param inner The inner series to merge (the series you call the function on is the 'outer' series).
     * @param [outerSelector] Optional user-defined selector function that selects the key from the outer series that is used to match the two series.
     * @param [innerSelector] Optional user-defined selector function that selects the key from the inner series that is used to match the two series.
     * 
     * @return Returns a new series that contains only the values from the 1st series that don't appear in the 2nd series.
     * 
     * @example
     * <pre>
     * 
     * const seriesA = ...
     * const seriesB = ...
     * const remainingDf = seriesA.except(seriesB);
     * </pre>
     * 
     * @example
     * <pre>
     *
     * // Find the list of customers haven't bought anything recently.
     * const allCustomers = ... list of all customers ...
     * const recentCustomers = ... list of customers who have purchased recently ...
     * const remainingCustomers = allCustomers.except(
     *      recentCustomers, 
     *      customerRecord => customerRecord.CustomerId
     * );
     * </pre>
     */    
    except<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerSelector?: SelectorFn<ValueT, KeyT>,
        innerSelector?: SelectorFn<InnerValueT, KeyT>): 
            ISeries<IndexT, ValueT> {

        if (outerSelector) {
            if (!isFunction(outerSelector)) throw new Error("Expected optional 'outerSelector' parameter to 'Series.except' to be a function.");
        }
        else {
            outerSelector = value => <KeyT> <any> value;
        }

        if (innerSelector) {
            if (!isFunction(innerSelector)) throw new Error("Expected optional 'innerSelector' parameter to 'Series.except' to be a function.");
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
     * Creates a new series by merging two input series.
     * The resulting dataframe contains only those value that have matching keys in both input series.
     *
     * @param inner The 'inner' series to join (the series you are callling the function on is the 'outer' series).
     * @param outerKeySelector User-defined selector function that chooses the join key from the outer series.
     * @param innerKeySelector User-defined selector function that chooses the join key from the inner series.
     * @param resultSelector User-defined function that merges outer and inner values.
     * 
     * @return Returns the new merged series.
     * 
     * @example
     * <pre>
     * 
     * // Join together two sets of customers to find those
     * // that have bought both product A and product B.
     * const customerWhoBoughtProductA = ...
     * const customerWhoBoughtProductB = ...
     * const customersWhoBoughtBothProductsDf = customerWhoBoughtProductA.join(
     *          customerWhoBoughtProductB,
     *          customerA => customerA.CustomerId, // Join key.
     *          customerB => customerB.CustomerId, // Join key.
     *          (customerA, customerB) => {
     *              return {
     *                  // ... merge the results ...
     *              };
     *          }
     *      );
     * </pre>
     */
    join<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT, InnerValueT, ResultValueT>):
            ISeries<number, ResultValueT> {

        if (!isFunction(outerKeySelector)) throw new Error("Expected 'outerKeySelector' parameter of 'Series.join' to be a selector function.");
        if (!isFunction(innerKeySelector)) throw new Error("Expected 'innerKeySelector' parameter of 'Series.join' to be a selector function.");
        if (!isFunction(resultSelector)) throw new Error("Expected 'resultSelector' parameter of 'Series.join' to be a selector function.");

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
     * Creates a new series by merging two input series.
     * The resulting series contains only those values that are only present in one or the other of the series, not both.
     *
     * @param inner The 'inner' series to join (the series you are callling the function on is the 'outer' series).
     * @param outerKeySelector User-defined selector function that chooses the join key from the outer series.
     * @param innerKeySelector User-defined selector function that chooses the join key from the inner series.
     * @param resultSelector User-defined function that merges outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @return Returns the new merged series.
     * 
     * @example
     * <pre>
     * 
     * // Join together two sets of customers to find those
     * // that have bought either product A or product B, not not both.
     * const customerWhoBoughtProductA = ...
     * const customerWhoBoughtProductB = ...
     * const customersWhoBoughtEitherProductButNotBothDf = customerWhoBoughtProductA.joinOuter(
     *          customerWhoBoughtProductB,
     *          customerA => customerA.CustomerId, // Join key.
     *          customerB => customerB.CustomerId, // Join key.
     *          (customerA, customerB) => {
     *              return {
     *                  // ... merge the results ...
     *              };
     *          }
     *      );
     * </pre>
     */    
    joinOuter<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            ISeries<number, ResultValueT> {

        if (!isFunction(outerKeySelector)) throw new Error("Expected 'outerKeySelector' parameter of 'Series.joinOuter' to be a selector function.");
        if (!isFunction(innerKeySelector)) throw new Error("Expected 'innerKeySelector' parameter of 'Series.joinOuter' to be a selector function.");
        if (!isFunction(resultSelector)) throw new Error("Expected 'resultSelector' parameter of 'Series.joinOuter' to be a selector function.");

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
     * Creates a new series by merging two input series.
     * The resulting series contains only those values that are present either in both series or only in the outer (left) series.
     * 
     * @param inner The 'inner' series to join (the series you are callling the function on is the 'outer' series).
     * @param outerKeySelector User-defined selector function that chooses the join key from the outer series.
     * @param innerKeySelector User-defined selector function that chooses the join key from the inner series.
     * @param resultSelector User-defined function that merges outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @return Returns the new merged series.
     * 
     * @example
     * <pre>
     * 
     * // Join together two sets of customers to find those
     * // that have bought either just product A or both product A and product B.
     * const customerWhoBoughtProductA = ...
     * const customerWhoBoughtProductB = ...
     * const boughtJustAorAandB = customerWhoBoughtProductA.joinOuterLeft(
     *          customerWhoBoughtProductB,
     *          customerA => customerA.CustomerId, // Join key.
     *          customerB => customerB.CustomerId, // Join key.
     *          (customerA, customerB) => {
     *              return {
     *                  // ... merge the results ...
     *              };
     *          }
     *      );
     * </pre>
     */
    joinOuterLeft<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            ISeries<number, ResultValueT> {

        if (!isFunction(outerKeySelector)) throw new Error("Expected 'outerKeySelector' parameter of 'Series.joinOuterLeft' to be a selector function.");
        if (!isFunction(innerKeySelector)) throw new Error("Expected 'innerKeySelector' parameter of 'Series.joinOuterLeft' to be a selector function.");
        if (!isFunction(resultSelector)) throw new Error("Expected 'resultSelector' parameter of 'Series.joinOuterLeft' to be a selector function.");

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
     * Creates a new series by merging two input series.
     * The resulting series contains only those values that are present either in both series or only in the inner (right) series.
     *
     * @param inner The 'inner' series to join (the series you are callling the function on is the 'outer' series).
     * @param outerKeySelector User-defined selector function that chooses the join key from the outer series.
     * @param innerKeySelector User-defined selector function that chooses the join key from the inner series.
     * @param resultSelector User-defined function that merges outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @return Returns the new merged series.
     * 
     * @example
     * <pre>
     * 
     * // Join together two sets of customers to find those
     * // that have bought either just product B or both product A and product B.
     * const customerWhoBoughtProductA = ...
     * const customerWhoBoughtProductB = ...
     * const boughtJustAorAandB = customerWhoBoughtProductA.joinOuterRight(
     *          customerWhoBoughtProductB,
     *          customerA => customerA.CustomerId, // Join key.
     *          customerB => customerB.CustomerId, // Join key.
     *          (customerA, customerB) => {
     *              return {
     *                  // ... merge the results ...
     *              };
     *          }
     *      );
     * </pre>
     */
    joinOuterRight<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            ISeries<number, ResultValueT> {

        if (!isFunction(outerKeySelector)) throw new Error("Expected 'outerKeySelector' parameter of 'Series.joinOuterRight' to be a selector function.");
        if (!isFunction(innerKeySelector)) throw new Error("Expected 'innerKeySelector' parameter of 'Series.joinOuterRight' to be a selector function.");
        if (!isFunction(resultSelector)) throw new Error("Expected 'resultSelector' parameter of 'Series.joinOuterRight' to be a selector function.");

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
     * 
     * @example
     * <pre>
     * 
     * const truncated = series.truncateStrings(10); // Truncate all string values to max length of 10 characters.
     * </pre>
     */
    truncateStrings (maxLength: number): ISeries<IndexT, ValueT> {

        if (!isNumber(maxLength)) {
            throw new Error("Expected 'maxLength' parameter to 'Series.truncateStrings' to be a number.");
        }

        return this.select((value: any) => {
            if (isString(value)) {
                if (value.length > maxLength) {
                    return value.substring(0, maxLength);
                }
            }

            return value;
        });
    };

    /**
     * Insert a pair at the start of the series.
     * Doesn't modify the original series! The returned series is entirely new and contains values from the original series plus the inserted pair.
     *
     * @param pair The index/value pair to insert.
     * 
     * @return Returns a new series with the specified pair inserted.
     * 
     * @example
     * <pre>
     * 
     * const newIndex = ... index of the new row ...
     * const newRow = ... the new data row to insert ...
     * const insertedSeries = series.insertPair([newIndex, newRows]);
     * </pre>
     */
    insertPair (pair: [IndexT, ValueT]): ISeries<IndexT, ValueT> {
        if (!isArray(pair)) throw new Error("Expected 'pair' parameter to 'Series.insertPair' to be an array.");
        if (pair.length !== 2) throw new Error("Expected 'pair' parameter to 'Series.insertPair' to be an array with two elements. The first element is the index, the second is the value.");

        return (new Series<IndexT, ValueT>({ pairs: [pair] })).concat(this);
    }

    /**
     * Append a pair to the end of a series.
     * Doesn't modify the original series! The returned series is entirely new and contains values from the original series plus the appended pair.
     *
     * @param pair The index/value pair to append.
     *  
     * @return Returns a new series with the specified pair appended.
     * 
     * @example
     * <pre>
     * 
     * const newIndex = ... index of the new row ...
     * const newRow = ... the new data row to append ...
     * const appendedSeries = series.appendPair([newIndex, newRows]);
     * </pre>
     */
    appendPair (pair: [IndexT, ValueT]): ISeries<IndexT, ValueT> {
        if (!isArray(pair)) throw new Error("Expected 'pair' parameter to 'Series.appendPair' to be an array.");
        if (pair.length !== 2) throw new Error("Expected 'pair' parameter to 'Series.appendPair' to be an array with two elements. The first element is the index, the second is the value.");

        return this.concat(new Series<IndexT, ValueT>({ pairs: [pair] }));
    }

    /**
     * Fill gaps in a series.
     *
     * @param comparer User-defined comparer function that is passed pairA and pairB, two consecutive values, return truthy if there is a gap between the value, or falsey if there is no gap.
     * @param generator User-defined generator function that is passed pairA and pairB, two consecutive values, returns an array of pairs that fills the gap between the values.
     *
     * @return Returns a new series with gaps filled in.
     * 
     * @example
     * <pre>
     * 
     *   var sequenceWithGaps = ...
     *
     *  // Predicate that determines if there is a gap.
     *  var gapExists = (pairA, pairB) => {
     *      // Returns true if there is a gap.
     *      return true;
     *  };
     *
     *  // Generator function that produces new rows to fill the game.
     *  var gapFiller = (pairA, pairB) => {
     *      // Create an array of index, value pairs that fill the gaps between pairA and pairB.
     *      return [
     *          newPair1,
     *          newPair2,
     *          newPair3,
     *      ];
     *  };
     *
     *  var sequenceWithoutGaps = sequenceWithGaps.fillGaps(gapExists, gapFiller);
     * </pre>
     */
    fillGaps (comparer: ComparerFn<[IndexT, ValueT], [IndexT, ValueT]>, generator: GapFillFn<[IndexT, ValueT], [IndexT, ValueT]>): ISeries<IndexT, ValueT> {
        if (!isFunction(comparer)) throw new Error("Expected 'comparer' parameter to 'Series.fillGaps' to be a comparer function that compares two values and returns a boolean.")
        if (!isFunction(generator)) throw new Error("Expected 'generator' parameter to 'Series.fillGaps' to be a generator function that takes two values and returns an array of generated pairs to span the gap.")

        return this.rollingWindow(2)
            .selectMany((window): [IndexT, ValueT][] => {
                const pairs = window.toPairs();
                const pairA = pairs[0];
                const pairB = pairs[1];
                if (!comparer(pairA, pairB)) {
                    return [pairA];
                }

                const generatedRows = generator(pairA, pairB);
                if (!isArray(generatedRows)) throw new Error("Expected return from 'generator' parameter to 'Series.fillGaps' to be an array of pairs, instead got a " + typeof(generatedRows));

                return [pairA].concat(generatedRows);
            })
            .withIndex(pair => pair[0])
            .select(pair => pair[1])
            .concat(this.tail(1));
    }

    /**
     * Returns the specified default series if the input series is empty. 
     *
     * @param defaultSequence Default series to return if the input series is empty.
     * 
     * @return Returns 'defaultSequence' if the input series is empty. 
     * 
     * @example
     * <pre>
     * 
     * const emptySeries = new Series();
     * const defaultSeries = new Series([ 1, 2, 3 ]);
     * expect(emptyDataFrame.defaultIfEmpty(defaultSeries)).to.eql(defaultSeries);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const nonEmptySeries = new Series([ 100 ]);
     * const defaultSeries = new Series([ 1, 2, 3 ]);
     * expect(nonEmptySeries.defaultIfEmpty(defaultSeries)).to.eql(nonEmptySeries);
     * </pre>
     */
    defaultIfEmpty (defaultSequence: ValueT[] | ISeries<IndexT, ValueT>): ISeries<IndexT, ValueT> {

        if (this.none()) {
            if (defaultSequence instanceof Series) {
                return <ISeries<IndexT, ValueT>> defaultSequence;
            }
            else if (isArray(defaultSequence)) {
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
     * Detect the the frequency of the types of the values in the series.
     * This is a good way to understand the shape of your data.
     *
     * @return Returns a {@link DataFrame} with rows that confirm to {@link ITypeFrequency} that describes the data types contained in the original series.
     * 
     * @example
     * <pre>
     * 
     * const dataTypes = series.detectTypes();
     * console.log(dataTypes.toString());
     * </pre>
     */
    detectTypes (): IDataFrame<number, ITypeFrequency> {

        return new DataFrame<number, ITypeFrequency>(() => {
            const totalValues = this.count();

            const typeFrequencies = this.select(value => {
                    let valueType: string = typeof(value);
                    if (valueType === "object") {
                        if (isDate(value)) {
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
     * Detect the frequency of the values in the series.
     * This is a good way to understand the shape of your data.
     *
     * @return Returns a {@link DataFrame} with rows that conform to {@link IValueFrequency} that describes the values contained in the original series.
     * 
     * @example
     * <pre>
     * 
     * const dataValues = series.detectValues();
     * console.log(dataValues.toString());
     * </pre>
     */
    detectValues (): IDataFrame<number, IValueFrequency> {

        return new DataFrame<number, IValueFrequency>(() => {
            const totalValues = this.count();
            const valueFrequencies = this.aggregate(new Map<any, any>(), (accumulated: Map<any, any>, value: any) => {
                let valueInfo = accumulated.get(value);
                if (!valueInfo) {
                    valueInfo = {
                        count: 0,
                        value: value,
                    };
                    accumulated.set(value, valueInfo);
                }
                ++valueInfo.count;
                return accumulated;
            });

            return {
                columnNames: ["Value", "Frequency"],
                rows: Array.from(valueFrequencies.keys())
                    .map(value => {
                        const valueInfo = valueFrequencies.get(value);
                        return [
                            valueInfo.value,
                            (valueInfo.count / totalValues) * 100
                        ];
                    }),
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
     * 
     * @example
     * <pre>
     * 
     * const buckets = series.bucket(20); // Distribute values into 20 evenly spaced buckets.
     * console.log(buckets.toString());
     * </pre>
     */
    bucket (numBuckets: number): IDataFrame<IndexT, IBucket> {

        if (!isNumber(numBuckets)) {
            throw new Error(`Expected 'numBuckets' parameter to 'Series.bucket' to be a number.`);
        }

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

    /***
     * Allows the series to be queried to confirm that it is actually a series.
     * Used from JavaScript to tell the difference between a Series and a DataFrame.
     * 
     * @return Returns the string "series".
     */
    getTypeCode (): string {
        return "series";
    }    
}

/**
 * @hidden
 * The configuration for an ordered series.
 */
interface IOrderedSeriesConfig<IndexT, ValueT, SortT> {

    //
    // The source values for the ordered series.
    //
    values: Iterable<ValueT>;

    //
    // The source pairs (index,value) for the ordered series.
    //
    pairs: Iterable<[IndexT, ValueT]>;

    //
    // The selector used to get the sorting key for the orderby operation.
    //
    selector: SelectorWithIndexFn<ValueT, SortT>;

    //
    // The sort direction, ascending or descending.
    //
    direction: Direction;

    //
    // The parent series in the orderby operation or null if none.
    //
    parent: OrderedSeries<IndexT, ValueT, any> | null;
}

/**
 * @hidden
 * A series that has been ordered.
 */
class OrderedSeries<IndexT = number, ValueT = any, SortT = any> 
    extends Series<IndexT, ValueT>
    implements IOrderedSeries<IndexT, ValueT, SortT> {

    //
    // Configuration for the ordered series.
    //
    config: IOrderedSeriesConfig<IndexT, ValueT, SortT>;

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

    constructor(config: IOrderedSeriesConfig<IndexT, ValueT, SortT>) {

        const valueSortSpecs: ISortSpec[] = [];
        const pairSortSpecs: ISortSpec[] = [];
        let sortLevel = 0;

        let parent = config.parent;

        while (parent !== null) {
            const parentConfig = parent.config;
            valueSortSpecs.push(OrderedSeries.makeSortSpec(sortLevel, parentConfig.selector, parentConfig.direction));
            pairSortSpecs.push(OrderedSeries.makeSortSpec(sortLevel, OrderedSeries.makePairsSelector(parentConfig.selector), parentConfig.direction));
            ++sortLevel;
            parent = parentConfig.parent;
        }

        valueSortSpecs.push(OrderedSeries.makeSortSpec(sortLevel, config.selector, config.direction));
        pairSortSpecs.push(OrderedSeries.makeSortSpec(sortLevel, OrderedSeries.makePairsSelector(config.selector), config.direction));

        super({
            values: new OrderedIterable(config.values, valueSortSpecs),
            pairs: new OrderedIterable(config.pairs, pairSortSpecs)
        });

        this.config = config;
    }

    /** 
     * Applys additional sorting (ascending) to an already sorted series.
     * 
     * @param selector User-defined selector that selects the additional value to sort by.
     * 
     * @return Returns a new series has been additionally sorted by the value chosen by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * // Order sales by salesperson and then by amount (from least to most).
     * const ordered = sales.orderBy(sale => sale.SalesPerson).thenBy(sale => sale.Amount);
     * </pre>
     */
    thenBy<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT> {
        return new OrderedSeries<IndexT, ValueT, SortT>({
            values: this.config.values, 
            pairs: this.config.pairs, 
            selector: selector, 
            direction: Direction.Ascending, 
            parent: this,
        });
    }

    /** 
     * Applys additional sorting (descending) to an already sorted series.
     * 
     * @param selector User-defined selector that selects the additional value to sort by.
     * 
     * @return Returns a new series has been additionally sorted by the value chosen by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * // Order sales by salesperson and then by amount (from most to least).
     * const ordered = sales.orderBy(sale => sale.SalesPerson).thenByDescending(sale => sale.Amount);
     * </pre>
     */
    thenByDescending<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT> {
        return new OrderedSeries<IndexT, ValueT, SortT>({
            values: this.config.values,
            pairs: this.config.pairs, 
            selector: selector, 
            direction: Direction.Descending, 
            parent: this
        });
    }
}
