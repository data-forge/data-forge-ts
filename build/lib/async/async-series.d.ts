import { IAsyncIndex } from './async-index';
import { IAsyncDataFrame } from './async-dataframe';
import { ISeries, SelectorFn } from '../series';
/**
 * Series configuration.
 */
export interface IAsyncSeriesConfig<IndexT, ValueT> {
    values?: ValueT[] | AsyncIterable<ValueT>;
    index?: IndexT[] | AsyncIterable<IndexT>;
    pairs?: AsyncIterable<[IndexT, ValueT]>;
}
/**
 * Interface that represents a series of indexed values.
 */
export interface IAsyncSeries<IndexT, ValueT> extends AsyncIterable<ValueT> {
    /**
     * Get an iterator to enumerate the values of the series.
     */
    [Symbol.asyncIterator](): AsyncIterator<ValueT>;
    /**
     * Get the index for the series.
     */
    getIndex(): IAsyncIndex<IndexT>;
    /**
     * Apply a new index to the Series.
     *
     * @param newIndex The new index to apply to the Series.
     *
     * @returns Returns a new series with the specified index attached.
     */
    withIndex<NewIndexT>(newIndex: NewIndexT[] | AsyncIterable<NewIndexT>): IAsyncSeries<NewIndexT, ValueT>;
    /**
     * Resets the index of the series back to the default zero-based sequential integer index.
     *
     * @returns Returns a new series with the index reset to the default zero-based index.
     */
    resetIndex(): IAsyncSeries<number, ValueT>;
    /**
    * Extract values from the series as an array.
    * This forces lazy evaluation to complete.
    *
    * @returns Returns an array of values contained within the series.
    */
    toArray(): Promise<ValueT[]>;
    /**
     * Retreive the index and values from the Series as an array of pairs.
     * Each pairs is [index, value].
     *
     * @returns Returns an array of pairs that contains the series content. Each pair is a two element array that contains an index and a value.
     */
    toPairs(): Promise<([IndexT, ValueT])[]>;
    /**
     * Generate a new series based by calling the selector function on each value.
     *
     * @param selector - Selector function that transforms each value to create a new series or dataframe.
     *
     * @returns Returns a new series that has been transformed by the selector function.
     */
    select<ToT>(selector: SelectorFn<ValueT, ToT>): IAsyncSeries<IndexT, ToT>;
    /**
     * Skip a number of values in the series.
     *
     * @param numValues Number of values to skip.
     * @returns Returns a new series with the specified number of values skipped.
     */
    skip(numValues: number): IAsyncSeries<IndexT, ValueT>;
    /**
     * Format the series for display as a string.
     * This forces lazy evaluation to complete.
     *
     * @returns Generates and returns a string representation of the series or dataframe.
     */
    toString(): Promise<string>;
    /**
     * Forces lazy evaluation to complete and 'bakes' the series into memory.
     *
     * @returns Returns a series that has been 'baked', all lazy evaluation has completed.
     */
    bake(): Promise<ISeries<IndexT, ValueT>>;
    /**
     * Inflate the series to a dataframe.
     *
     * @param [selector] Optional selector function that transforms each value in the series to a row in the new dataframe.
     *
     * @returns Returns a new dataframe that has been created from the input series via the 'selector' function.
     */
    inflate(): IAsyncDataFrame<IndexT, ValueT>;
}
/**
 * Class that represents a series of indexed values.
 */
export declare class AsyncSeries<IndexT, ValueT> implements IAsyncSeries<IndexT, ValueT> {
    private index;
    private values;
    private pairs;
    private initFromArray(arr);
    private initEmpty();
    private initIterable<T>(input, fieldName);
    private initFromConfig(config);
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
    constructor(config?: ValueT[] | IAsyncSeriesConfig<IndexT, ValueT>);
    /**
     * Get an iterator to enumerate the values of the series.
     * Enumerating the iterator forces lazy evaluation to complete.
     */
    [Symbol.asyncIterator](): AsyncIterator<ValueT>;
    /**
     * Get the index for the series.
     */
    getIndex(): IAsyncIndex<IndexT>;
    /**
     * Apply a new index to the Series.
     *
     * @param newIndex The new index to apply to the Series.
     *
     * @returns Returns a new series with the specified index attached.
     */
    withIndex<NewIndexT>(newIndex: IAsyncIndex<NewIndexT> | IAsyncSeries<any, NewIndexT> | NewIndexT[]): IAsyncSeries<NewIndexT, ValueT>;
    /**
     * Resets the index of the series back to the default zero-based sequential integer index.
     *
     * @returns Returns a new series with the index reset to the default zero-based index.
     */
    resetIndex(): IAsyncSeries<number, ValueT>;
    /**
    * Extract values from the series as an array.
    * This forces lazy evaluation to complete.
    *
    * @returns Returns an array of values contained within the series.
    */
    toArray(): Promise<any[]>;
    /**
     * Retreive the index and values from the Series as an array of pairs.
     * Each pair is [index, value].
     * This forces lazy evaluation to complete.
     *
     * @returns Returns an array of pairs that contains the series content. Each pair is a two element array that contains an index and a value.
     */
    toPairs(): Promise<([IndexT, ValueT])[]>;
    /**
     * Generate a new series based by calling the selector function on each value.
     *
     * @param selector - Selector function that transforms each value to create a new series.
     *
     * @returns Returns a new series that has been transformed by the selector function.
     */
    select<ToT>(selector: SelectorFn<ValueT, ToT>): IAsyncSeries<IndexT, ToT>;
    /**
     * Skip a number of values in the series.
     *
     * @param numValues - Number of values to skip.     *
     * @returns Returns a new series or dataframe with the specified number of values skipped.
     */
    skip(numValues: number): IAsyncSeries<IndexT, ValueT>;
    /**
     * Format the series for display as a string.
     * This forces lazy evaluation to complete.
     *
     * @returns Generates and returns a string representation of the series or dataframe.
     */
    toString(): Promise<string>;
    /**
     * Forces lazy evaluation to complete and 'bakes' the series into memory.
     *
     * @returns Returns a series that has been 'baked', all lazy evaluation has completed.
     */
    bake(): Promise<ISeries<IndexT, ValueT>>;
    /**
     * Inflate the series to a dataframe.
     *
     * @param [selector] Optional selector function that transforms each value in the series to a row in the new dataframe.
     *
     * @returns Returns a new dataframe that has been created from the input series via the 'selector' function.
     */
    inflate(): IAsyncDataFrame<IndexT, ValueT>;
}
