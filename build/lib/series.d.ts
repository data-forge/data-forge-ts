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
 * A callback function that can be applied to each value.
 */
export declare type CallbackFn<ValueT> = (value: ValueT, index: number) => void;
/**
 * A selector function. Transforms a value into another kind of value.
 */
export declare type SelectorFn<FromT, ToT> = (value: FromT, index: number) => ToT;
/**
 * A predicate function, returns true or false based on input.
 */
export declare type PredicateFn<ValueT> = (value: ValueT) => boolean;
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
     * Convert a series or a dataframe to a series of pairs in the form [pair1, pair2, pair3, ...] where each pair is [index, value].
     *
     * @returns {Pairs} Returns a series of pairs for each index and value pair in the input sequence.
     */
    asPairs(): ISeries<number, [IndexT, ValueT]>;
    /**
     * Convert a series of pairs to back to a regular series.
     *
     * @returns Returns a series of values where each pair has been extracted from the value of the input series.
     */
    asValues<NewIndexT, NewValueT>(): ISeries<NewIndexT, NewValueT>;
    /**
     * Generate a new series based by calling the selector function on each value.
     *
     * @param selector - Selector function that transforms each value to create a new series or dataframe.
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
     * Segment a Series into 'windows'. Returns a new Series. Each value in the new Series contains a 'window' (or segment) of the original series.
     * Use select or selectPairs to aggregate.
     *
     * @param period - The number of values in the window.
     *
     * @returns Returns a new series, each value of which is a 'window' (or segment) of the original series.
     */
    window(period: number): ISeries<number, ISeries<IndexT, ValueT>>;
    /**
     * Segment a Series into 'rolling windows'. Returns a new Series. Each value in the new Series contains a 'window' (or segment) of the original series.
    *
     * @param period - The number of values in the window.
     *
     * @returns Returns a new series, each value of which is a 'window' (or segment) of the original series.
     */
    rollingWindow(period: number): ISeries<number, ISeries<IndexT, ValueT>>;
    /**
     * Compute the percent change between each pair of values.
     * Percentages are expressed as 0-1 values.
     *
     * @returns Returns a new series where each value indicates the percent change from the previous number value in the original series.
     */
    percentChange(): ISeries<IndexT, number>;
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
     * Get the first value of the series.
     *
     * @returns Returns the first value of the series.
     */
    first(): ValueT;
    /**
     * Get the last value of the series.
     *
     * @returns Returns the last value of the series.
     */
    last(): ValueT;
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
     * Invoke a callback function for each value in the series.
     *
     * @param callback - The calback to invoke for each value.
     *
     * @returns Returns the input series with no modifications.
     */
    forEach(callback: CallbackFn<ValueT>): ISeries<IndexT, ValueT>;
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
    all(predicate: PredicateFn<ValueT>): boolean;
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
    any(predicate?: PredicateFn<ValueT>): boolean;
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
    none(predicate?: PredicateFn<ValueT>): boolean;
    /**
     * Get a new series containing all values starting at and after the specified index value.
     *
     * @param indexValue - The index value to search for before starting the new series.
     *
     * @returns Returns a new series containing all values starting at and after the specified index value.
     */
    startAt(indexValue: IndexT): ISeries<IndexT, ValueT>;
    /**
     * Get a new series containing all values up until and including the specified index value (inclusive).
     *
     * @param indexValue - The index value to search for before ending the new series.
     *
     * @returns Returns a new series containing all values up until and including the specified index value.
     */
    endAt(indexValue: IndexT): ISeries<IndexT, ValueT>;
    /**
     * Get a new series containing all values up to the specified index value (exclusive).
     *
     * @param indexValue - The index value to search for before ending the new series.
     *
     * @returns Returns a new series containing all values up to the specified inde value.
     */
    before(indexValue: IndexT): ISeries<IndexT, ValueT>;
    /**
     * Get a new series containing all values after the specified index value (exclusive).
     *
     * @param indexValue - The index value to search for.
     *
     * @returns Returns a new series containing all values after the specified index value.
     */
    after(indexValue: IndexT): ISeries<IndexT, ValueT>;
    /**
     * Get a new series containing all values between the specified index values (inclusive).
     *
     * @param startIndexValue - The index where the new sequence starts.
     * @param endIndexValue - The index where the new sequence ends.
     *
     * @returns Returns a new series containing all values between the specified index values (inclusive).
     */
    between(startIndexValue: IndexT, endIndexValue: IndexT): ISeries<IndexT, ValueT>;
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
    protected index: Iterable<IndexT>;
    protected values: Iterable<ValueT>;
    protected pairs: Iterable<[IndexT, ValueT]>;
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
     * Convert a series or a dataframe to a series of pairs in the form [pair1, pair2, pair3, ...] where each pair is [index, value].
     *
     * @returns {Pairs} Returns a series of pairs for each index and value pair in the input sequence.
     */
    asPairs(): ISeries<number, [IndexT, ValueT]>;
    /**
     * Convert a series of pairs to back to a regular series.
     *
     * @returns Returns a series of values where each pair has been extracted from the value of the input series.
     */
    asValues<NewIndexT = any, NewValueT = any>(): ISeries<NewIndexT, NewValueT>;
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
     * Segment a Series into 'windows'. Returns a new Series. Each value in the new Series contains a 'window' (or segment) of the original series.
     * Use select or selectPairs to aggregate.
     *
     * @param period - The number of values in the window.
     *
     * @returns Returns a new series, each value of which is a 'window' (or segment) of the original series.
     */
    window(period: number): ISeries<number, ISeries<IndexT, ValueT>>;
    /**
     * Segment a Series into 'rolling windows'. Returns a new Series. Each value in the new Series contains a 'window' (or segment) of the original series.
    *
     * @param period - The number of values in the window.
     *
     * @returns Returns a new series, each value of which is a 'window' (or segment) of the original series.
     */
    rollingWindow(period: number): ISeries<number, ISeries<IndexT, ValueT>>;
    /**
     * Compute the percent change between each pair of values.
     * Percentages are expressed as 0-1 values.
     *
     * @returns Returns a new series where each value indicates the percent change from the previous number value in the original series.
     */
    percentChange(): ISeries<IndexT, number>;
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
     * Get the first value of the series.
     *
     * @returns Returns the first value of the series.
     */
    first(): ValueT;
    /**
     * Get the last value of the series.
     *
     * @returns Returns the last value of the series.
     */
    last(): ValueT;
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
     * Invoke a callback function for each value in the series.
     *
     * @param callback - The calback to invoke for each value.
     *
     * @returns Returns the input series with no modifications.
     */
    forEach(callback: CallbackFn<ValueT>): ISeries<IndexT, ValueT>;
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
    all(predicate: PredicateFn<ValueT>): boolean;
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
    any(predicate?: PredicateFn<ValueT>): boolean;
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
    none(predicate?: PredicateFn<ValueT>): boolean;
    /**
     * Get a new series containing all values starting at and after the specified index value.
     *
     * @param indexValue - The index value to search for before starting the new series.
     *
     * @returns Returns a new series containing all values starting at and after the specified index value.
     */
    startAt(indexValue: IndexT): ISeries<IndexT, ValueT>;
    /**
     * Get a new series containing all values up until and including the specified index value (inclusive).
     *
     * @param indexValue - The index value to search for before ending the new series.
     *
     * @returns Returns a new series containing all values up until and including the specified index value.
     */
    endAt(indexValue: IndexT): ISeries<IndexT, ValueT>;
    /**
     * Get a new series containing all values up to the specified index value (exclusive).
     *
     * @param indexValue - The index value to search for before ending the new series.
     *
     * @returns Returns a new series containing all values up to the specified inde value.
     */
    before(indexValue: IndexT): ISeries<IndexT, ValueT>;
    /**
     * Get a new series containing all values after the specified index value (exclusive).
     *
     * @param indexValue - The index value to search for.
     *
     * @returns Returns a new series containing all values after the specified index value.
     */
    after(indexValue: IndexT): ISeries<IndexT, ValueT>;
    /**
     * Get a new series containing all values between the specified index values (inclusive).
     *
     * @param startIndexValue - The index where the new sequence starts.
     * @param endIndexValue - The index where the new sequence ends.
     *
     * @returns Returns a new series containing all values between the specified index values (inclusive).
     */
    between(startIndexValue: IndexT, endIndexValue: IndexT): ISeries<IndexT, ValueT>;
    /**
     * Format the series for display as a string.
     * This forces lazy evaluation to complete.
     *
     * @returns Generates and returns a string representation of the series or dataframe.
     */
    toString(): string;
    static parseInt(value: any | undefined, valueIndex: number): number | undefined;
    /**
     * Parse a series with string values to a series with int values.
     *
     * @returns Returns a new series where string values from the original series have been parsed to integer values.
     */
    parseInts(): ISeries<IndexT, number>;
    static parseFloat(value: any | undefined, valueIndex: number): number | undefined;
    /**
     * Parse a series with string values to a series with float values.
     *
     * @returns Returns a new series where string values from the original series have been parsed to floating-point values.
     */
    parseFloats(): ISeries<IndexT, number>;
    static parseDate(value: any | undefined, valueIndex: number, formatString?: string): Date | undefined;
    /**
     * Parse a series with string values to a series with date values.
     *
     * @param [formatString] Optional formatting string for dates.
     *
     * @returns Returns a new series where string values from the original series have been parsed to Date values.
     */
    parseDates(formatString?: string): ISeries<IndexT, Date>;
    static toString(value: any | undefined, formatString?: string): string | undefined | null;
    /**
     * Convert a series of values of different types to a series of string values.
     *
     * @param [formatString] Optional formatting string for dates.
     *
     * @returns Returns a new series where the values from the original series have been stringified.
     */
    toStrings(formatString?: string): ISeries<IndexT, string>;
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
