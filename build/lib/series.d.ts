import { IIndex } from './index';
import { IDataFrame } from './dataframe';
/**
 * Series configuration.
 */
export interface ISeriesConfig<IndexT, ValueT> {
    values?: ValueT[] | Iterable<ValueT>;
    index?: IndexT[] | Iterable<IndexT>;
    pairs?: Iterable<[IndexT, ValueT]>;
    baked?: boolean;
}
/**
 * A selector function. Transforms a value into another kind of value.
 */
export declare type SelectorFn<FromT, ToT> = (value: FromT, index: number) => ToT;
/**
 * A predicate function, returns true or false based on input.
 */
export declare type PredicateFn<InputT> = (value: InputT) => boolean;
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
    getIndex(): IIndex<IndexT>;
    /**
     * Apply a new index to the Series.
     *
     * @param newIndex The new index to apply to the Series.
     *
     * @returns Returns a new series with the specified index attached.
     */
    withIndex<NewIndexT>(newIndex: NewIndexT[] | Iterable<NewIndexT>): ISeries<NewIndexT, ValueT>;
    /**
     * Resets the index of the series back to the default zero-based sequential integer index.
     *
     * @returns Returns a new series with the index reset to the default zero-based index.
     */
    resetIndex(): ISeries<number, ValueT>;
    /**
    * Extract values from the series as an array.
    * This forces lazy evaluation to complete.
    *
    * @returns Returns an array of values contained within the series.
    */
    toArray(): ValueT[];
    /**
     * Retreive the index and values from the Series as an array of pairs.
     * Each pairs is [index, value].
     *
     * @returns Returns an array of pairs that contains the series content. Each pair is a two element array that contains an index and a value.
     */
    toPairs(): ([IndexT, ValueT])[];
    /**
     * Generate a new series based by calling the selector function on each value.
     *
     * @param selector - Selector function that transforms each value to create a new series or dataframe.
     *
     * @returns Returns a new series that has been transformed by the selector function.
     */
    select<ToT>(selector: SelectorFn<ValueT, ToT>): ISeries<IndexT, ToT>;
    /**
     * Skip a number of values in the series.
     *
     * @param numValues Number of values to skip.
     * @returns Returns a new series with the specified number of values skipped.
     */
    skip(numValues: number): ISeries<IndexT, ValueT>;
    /**
     * Take a number of rows in the series.
     *
     * @param numRows - Number of rows to take.
     *
     * @returns Returns a new series with up to the specified number of values included.
     */
    take(numRows: number): ISeries<IndexT, ValueT>;
    /**
     * Count the number of values in the series.
     *
     * @returns Returns the count of all values in the series.
     */
    count(): number;
    /**
     * Get X values from the start of the series.
     *
     * @param numValues - Number of values to take.
     *
     * @returns Returns a new series that has only the specified number of values taken from the start of the input sequence.
     */
    head(numValues: number): ISeries<IndexT, ValueT>;
    /**
     * Get X values from the end of the series.
     *
     * @param numValues - Number of values to take.
     *
     * @returns Returns a new series that has only the specified number of values taken from the end of the input sequence.
     */
    tail(numValues: number): ISeries<IndexT, ValueT>;
    /**
     * Filter a series by a predicate selector.
     *
     * @param predicate - Predicte function to filter rows of the series.
     *
     * @returns Returns a new series containing only the values that match the predicate.
     */
    where(predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT>;
    /**
     * Format the series for display as a string.
     * This forces lazy evaluation to complete.
     *
     * @returns Generates and returns a string representation of the series or dataframe.
     */
    toString(): string;
    /**
     * Forces lazy evaluation to complete and 'bakes' the series into memory.
     *
     * @returns Returns a series that has been 'baked', all lazy evaluation has completed.
     */
    bake(): ISeries<IndexT, ValueT>;
    /**
     * Inflate the series to a dataframe.
     *
     * @param [selector] Optional selector function that transforms each value in the series to a row in the new dataframe.
     *
     * @returns Returns a new dataframe that has been created from the input series via the 'selector' function.
     */
    inflate(): IDataFrame<IndexT, ValueT>;
    /**
     * Sorts the series by a value defined by the selector (ascending).
     *
     * @param selector Selects the value to sort by.
     *
     * @returns Returns a new ordered series that has been sorted by the value returned by the selector.
     */
    orderBy<SortT>(selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;
    /**
     * Sorts the series by a value defined by the selector (descending).
     *
     * @param selector Selects the value to sort by.
     *
     * @returns Returns a new ordered series that has been sorted by the value returned by the selector.
     */
    orderByDescending<SortT>(selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;
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
    thenBy<SortT>(selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;
    /**
     * Performs additional sorting (descending).
     *
     * @param selector Selects the value to sort by.
     *
     * @returns Returns a new series has been additionally sorted by the value returned by the selector.
     */
    thenByDescending<SortT>(selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;
}
/**
 * Class that represents a series of indexed values.
 */
export declare class Series<IndexT = number, ValueT = any> implements ISeries<IndexT, ValueT> {
    protected index: Iterable<any>;
    protected values: Iterable<any>;
    protected pairs: Iterable<[any, any]>;
    private isBaked;
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
    constructor(config?: ValueT[] | ISeriesConfig<IndexT, ValueT>);
    /**
     * Get an iterator to enumerate the values of the series.
     * Enumerating the iterator forces lazy evaluation to complete.
     */
    [Symbol.iterator](): Iterator<ValueT>;
    /**
     * Get the index for the series.
     */
    getIndex(): IIndex<IndexT>;
    /**
     * Apply a new index to the Series.
     *
     * @param newIndex The new index to apply to the Series.
     *
     * @returns Returns a new series with the specified index attached.
     */
    withIndex<NewIndexT>(newIndex: IIndex<NewIndexT> | ISeries<any, NewIndexT> | NewIndexT[]): ISeries<NewIndexT, ValueT>;
    /**
     * Resets the index of the series back to the default zero-based sequential integer index.
     *
     * @returns Returns a new series with the index reset to the default zero-based index.
     */
    resetIndex(): ISeries<number, ValueT>;
    /**
    * Extract values from the series as an array.
    * This forces lazy evaluation to complete.
    *
    * @returns Returns an array of values contained within the series.
    */
    toArray(): any[];
    /**
     * Retreive the index and values from the Series as an array of pairs.
     * Each pair is [index, value].
     * This forces lazy evaluation to complete.
     *
     * @returns Returns an array of pairs that contains the series content. Each pair is a two element array that contains an index and a value.
     */
    toPairs(): ([IndexT, ValueT])[];
    /**
     * Generate a new series based by calling the selector function on each value.
     *
     * @param selector Selector function that transforms each value to create a new series.
     *
     * @returns Returns a new series that has been transformed by the selector function.
     */
    select<ToT>(selector: SelectorFn<ValueT, ToT>): ISeries<IndexT, ToT>;
    /**
     * Generate a new series based on the results of the selector function.
     *
     * @param selector Selector function that transforms each value into a list of values.
     *
     * @returns  Returns a new series with values that have been produced by the selector function.
     */
    selectMany<ToT>(selector: SelectorFn<ValueT, Iterable<ToT>>): ISeries<IndexT, ToT>;
    /**
     * Skip a number of values in the series.
     *
     * @param numValues - Number of values to skip.     *
     * @returns Returns a new series or dataframe with the specified number of values skipped.
     */
    skip(numValues: number): ISeries<IndexT, ValueT>;
    /**
     * Skips values in the series while a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     *
     * @returns Returns a new series with all initial sequential values removed that match the predicate.
     */
    skipWhile(predicate: PredicateFn<ValueT>): Series<IndexT, ValueT>;
    /**
     * Skips values in the series until a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     *
     * @returns Returns a new series with all initial sequential values removed that don't match the predicate.
     */
    skipUntil(predicate: PredicateFn<ValueT>): Series<IndexT, ValueT>;
    /**
     * Take a number of rows in the series.
     *
     * @param numRows - Number of rows to take.
     *
     * @returns Returns a new series with up to the specified number of values included.
     */
    take(numRows: number): ISeries<IndexT, ValueT>;
    /**
     * Take values from the series while a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     *
     * @returns Returns a new series that only includes the initial sequential values that have matched the predicate.
     */
    takeWhile(predicate: PredicateFn<ValueT>): Series<number, any>;
    /**
     * Take values from the series until a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     *
     * @returns Returns a new series or dataframe that only includes the initial sequential values that have not matched the predicate.
     */
    takeUntil(predicate: PredicateFn<ValueT>): Series<number, any>;
    /**
     * Count the number of values in the series.
     *
     * @returns Returns the count of all values in the series.
     */
    count(): number;
    /**
     * Get X values from the start of the series.
     *
     * @param numValues - Number of values to take.
     *
     * @returns Returns a new series that has only the specified number of values taken from the start of the input sequence.
     */
    head(numValues: number): ISeries<IndexT, ValueT>;
    /**
     * Get X values from the end of the series.
     *
     * @param numValues - Number of values to take.
     *
     * @returns Returns a new series that has only the specified number of values taken from the end of the input sequence.
     */
    tail(numValues: number): ISeries<IndexT, ValueT>;
    /**
     * Filter a series by a predicate selector.
     *
     * @param predicate - Predicte function to filter rows of the series.
     *
     * @returns Returns a new series containing only the values that match the predicate.
     */
    where(predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT>;
    /**
     * Format the series for display as a string.
     * This forces lazy evaluation to complete.
     *
     * @returns Generates and returns a string representation of the series or dataframe.
     */
    toString(): string;
    /**
     * Forces lazy evaluation to complete and 'bakes' the series into memory.
     *
     * @returns Returns a series that has been 'baked', all lazy evaluation has completed.
     */
    bake(): ISeries<IndexT, ValueT>;
    /**
     * Inflate the series to a dataframe.
     *
     * @param [selector] Optional selector function that transforms each value in the series to a row in the new dataframe.
     *
     * @returns Returns a new dataframe that has been created from the input series via the 'selector' function.
     */
    inflate(): IDataFrame<IndexT, ValueT>;
    /**
     * Sorts the series by a value defined by the selector (ascending).
     *
     * @param selector Selects the value to sort by.
     *
     * @returns Returns a new ordered series that has been sorted by the value returned by the selector.
     */
    orderBy<SortT>(selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;
    /**
     * Sorts the series by a value defined by the selector (descending).
     *
     * @param selector Selects the value to sort by.
     *
     * @returns Returns a new ordered series that has been sorted by the value returned by the selector.
     */
    orderByDescending<SortT>(selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;
}
