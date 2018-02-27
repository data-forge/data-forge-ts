import { ArrayIterable }  from './iterables/array-iterable';
import { EmptyIterable }  from './iterables/empty-iterable';
import { CountIterable }  from './iterables/count-iterable';
import { MultiIterable }  from './iterables/multi-iterable';
import { SelectIterable }  from './iterables/select-iterable';
import { SelectManyIterable }  from './iterables/select-many-iterable';
import { TakeIterable }  from './iterables/take-iterable';
import { TakeWhileIterable }  from './iterables/take-while-iterable';
import { WhereIterable }  from './iterables/where-iterable';
import { WindowIterable }  from './iterables/window-iterable';
import { RollingWindowIterable }  from './iterables/rolling-window-iterable';
import { VariableWindowIterable }  from './iterables/variable-window-iterable';
import { OrderedIterable, Direction, ISortSpec, SelectorFn as SortSelectorFn }  from './iterables/ordered-iterable';
import * as Sugar from 'sugar';
import { IIndex, Index } from './index';
import { ExtractElementIterable } from './iterables/extract-element-iterable';
import { SkipIterable } from './iterables/skip-iterable';
import { SkipWhileIterable } from './iterables/skip-while-iterable';
var Table = require('easy-table');
import { assert } from 'chai';
import { IDataFrame, DataFrame } from './dataframe';
import * as moment from 'moment';

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
 * A callback function that can be applied to each value.
 */
export type CallbackFn<ValueT> = (value: ValueT, index: number) => void;

//TOOD: Rename SelectorFn and SelectorFnNoIndex.

/**
 * A selector function. Transforms a value into another kind of value.
 */
export type SelectorFn<FromT, ToT> = (value: FromT, index: number) => ToT;

/**
 * A selector function with no index. Transforms a value into another kind of value.
 */
export type SelectorFnNoIndex<FromT, ToT> = (value: FromT) => ToT;

/**
 * A predicate function, returns true or false based on input.
 */
export type PredicateFn<ValueT> = (value: ValueT) => boolean;

/**
 * Defines a function for aggregation.
 */
export type AggregateFn<ValueT, ToT> = (accum: ToT, value: ValueT) => ToT;

/**
 * Compares to values and returns true if they are equivalent.
 */
export type ComparerFn<ValueT> = (a: ValueT, b: ValueT) => boolean;

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

    //TODO: These functions are deprecated.

    /** 
     * Convert a series or a dataframe to a series of pairs in the form [pair1, pair2, pair3, ...] where each pair is [index, value].
     * 
     * @returns {Pairs} Returns a series of pairs for each index and value pair in the input sequence.
     */
    asPairs (): ISeries<number, [IndexT, ValueT]>;

    /** 
     * Convert a series of pairs to back to a regular series.
     * 
     * @returns Returns a series of values where each pair has been extracted from the value of the input series.
     */
    asValues<NewIndexT, NewValueT> (): ISeries<NewIndexT, NewValueT>;
    
    /**
     * Generate a new series based by calling the selector function on each value.
     *
     * @param selector - Selector function that transforms each value to create a new series or dataframe.
     * 
     * @returns Returns a new series that has been transformed by the selector function.
     */
    select<ToT> (selector: SelectorFn<ValueT, ToT>): ISeries<IndexT, ToT>;

    /**
     * Generate a new series based on the results of the selector function.
     *
     * @param selector Selector function that transforms each value into a list of values.
     * 
     * @returns  Returns a new series with values that have been produced by the selector function. 
     */
    selectMany<ToT> (selector: SelectorFn<ValueT, Iterable<ToT>>): ISeries<IndexT, ToT>;
        
    /**
     * Segment a Series into 'windows'. Returns a new Series. Each value in the new Series contains a 'window' (or segment) of the original series.
     * Use select or selectPairs to aggregate.
     *
     * @param period - The number of values in the window.
     * 
     * @returns Returns a new series, each value of which is a 'window' (or segment) of the original series.
     */
    window (period: number): ISeries<number, ISeries<IndexT, ValueT>>;

    /** 
     * Segment a Series into 'rolling windows'. Returns a new Series. Each value in the new Series contains a 'window' (or segment) of the original series.
    *
     * @param period - The number of values in the window.
     * 
     * @returns Returns a new series, each value of which is a 'window' (or segment) of the original series.
     */
    rollingWindow (period: number): ISeries<number, ISeries<IndexT, ValueT>>;

    /**
     * Groups sequential values into variable length 'windows'.
     *
     * @param comparer - Predicate that compares two values and returns true if they should be in the same window.
     * 
     * @returns Returns a series of groups. Each group is itself a series that contains the values in the 'window'. 
     */
    variableWindow (comparer: ComparerFn<ValueT>): ISeries<number, ISeries<IndexT, ValueT>>;

    /**
     * Group sequential duplicate values into a Series of windows.
     *
     * @param selector - Selects the value used to compare for duplicates.
     * 
     * @returns Returns a series of groups. Each group is itself a series. 
     */
    sequentialDistinct<ToT> (selector: SelectorFnNoIndex<ValueT, ToT>): ISeries<IndexT, ValueT>;
    
    /**
     * Aggregate the values in the series.
     *
     * @param [seed] - Optional seed value for producing the aggregation.
     * @param selector - Function that takes the seed and then each value in the series and produces the aggregate value.
     * 
     * @returns Returns a new value that has been aggregated from the input sequence by the 'selector' function. 
     */
    aggregate<ToT = ValueT> (seedOrSelector: AggregateFn<ValueT, ToT> | ToT, selector?: AggregateFn<ValueT, ToT>): ToT;

    /**
     * Compute the percent change between each pair of values.
     * Percentages are expressed as 0-1 values.
     * 
     * @returns Returns a new series where each value indicates the percent change from the previous number value in the original series.  
     */
    percentChange (): ISeries<IndexT, number>;

    /**
     * Skip a number of values in the series.
     *
     * @param numValues Number of values to skip.
     * @returns Returns a new series with the specified number of values skipped. 
     */
    skip (numValues: number): ISeries<IndexT, ValueT>;

    /**
     * Take a number of rows in the series.
     *
     * @param numRows - Number of rows to take.
     * 
     * @returns Returns a new series with up to the specified number of values included.
     */
    take (numRows: number): ISeries<IndexT, ValueT>;
    
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
     * Get X values from the start of the series.
     *
     * @param numValues - Number of values to take.
     * 
     * @returns Returns a new series that has only the specified number of values taken from the start of the input sequence.  
     */
    head (numValues: number): ISeries<IndexT, ValueT>;

    /** 
     * Get X values from the end of the series.
     *
     * @param numValues - Number of values to take.
     * 
     * @returns Returns a new series that has only the specified number of values taken from the end of the input sequence.  
     */
    tail (numValues: number): ISeries<IndexT, ValueT>;

    /**
     * Filter a series by a predicate selector.
     *
     * @param predicate - Predicte function to filter rows of the series.
     * 
     * @returns Returns a new series containing only the values that match the predicate. 
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
    inflate<ToT> (selector?: SelectorFn<ValueT, ToT>): IDataFrame<IndexT, ToT>;

    /**
     * Sorts the series by a value defined by the selector (ascending). 
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new ordered series that has been sorted by the value returned by the selector. 
     */
    orderBy<SortT> (selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;

    /**
     * Sorts the series by a value defined by the selector (descending). 
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new ordered series that has been sorted by the value returned by the selector. 
     */
    orderByDescending<SortT> (selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;
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
    thenBy<SortT> (selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;

    /** 
     * Performs additional sorting (descending).
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new series has been additionally sorted by the value returned by the selector. 
     */
    thenByDescending<SortT> (selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;
}

//
// Helper function to map an array of objects.
//
export function toMap(items: Iterable<any>, keySelector: (item: any) => any, valueSelector: (item: any) => any): any {
    let output: any = {};
    for (const item of items) {
        var key = keySelector(item);
        output[key] = valueSelector(item);
    }
    return output;
}

/**
 * Class that represents a series of indexed values.
 */
export class Series<IndexT = number, ValueT = any> implements ISeries<IndexT, ValueT> {

    protected index: Iterable<IndexT>
    protected values: Iterable<ValueT>;
    protected pairs: Iterable<[IndexT, ValueT]>;

    //
    // Records if a series is baked into memory.
    //
    private isBaked: boolean = false;

    //
    // Initialise this Series from an array.
    //
    private initFromArray(arr: ValueT[]): void {
        this.index = new CountIterable();
        this.values = arr;
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
            return input;
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
     * Convert the series to a JavaScript object.
     *
     * @param {function} keySelector - Function that selects keys for the resulting object.
     * @param {valueSelector} keySelector - Function that selects values for the resulting object.
     * 
     * @returns {object} Returns a JavaScript object generated from the input sequence by the key and value selector funtions. 
     */
    toObject<KeyT = any, FieldT = any, OutT = any> (keySelector: (value: ValueT) => KeyT, valueSelector: (value: ValueT) => FieldT): OutT {

        assert.isFunction(keySelector, "Expected 'keySelector' parameter to Series.toObject to be a function.");
        assert.isFunction(valueSelector, "Expected 'valueSelector' parameter to Series.toObject to be a function.");

        return toMap(this, keySelector, valueSelector);
    }
    
    //TODO: These functions are deprecated.

    /** 
     * Convert a series or a dataframe to a series of pairs in the form [pair1, pair2, pair3, ...] where each pair is [index, value].
     * 
     * @returns {Pairs} Returns a series of pairs for each index and value pair in the input sequence.
     */
    asPairs (): ISeries<number, [IndexT, ValueT]> {
        return new Series<number, [IndexT, ValueT]>({ values: this.pairs });
    }

    /** 
     * Convert a series of pairs to back to a regular series.
     * 
     * @returns Returns a series of values where each pair has been extracted from the value of the input series.
     */
    asValues<NewIndexT = any, NewValueT = any> (): ISeries<NewIndexT, NewValueT> {

        //TODO: This function didn't port well to TypeScript. It's deprecated though.
        
        return new Series<NewIndexT, NewValueT>({
            index: new SelectIterable<any, NewIndexT>(this.values, (pair: [any, any], index: number) => <NewIndexT> pair[0]),
            values: new SelectIterable<any, NewValueT>(this.values, (pair: [any, any], index: number) => <NewValueT> pair[1]),
            pairs: <Iterable<[NewIndexT, NewValueT]>> <any> this.values,
        });
    };
    
    /**
     * Generate a new series based by calling the selector function on each value.
     *
     * @param selector Selector function that transforms each value to create a new series.
     * 
     * @returns Returns a new series that has been transformed by the selector function.
     */
    select<ToT> (selector: SelectorFn<ValueT, ToT>): ISeries<IndexT, ToT> {
        assert.isFunction(selector, "Expected 'selector' parameter to 'Series.select' function to be a function.");

        return new Series({
            values: new SelectIterable(this.values, selector),
            index: this.index,
        });
    }

    /**
     * Generate a new series based on the results of the selector function.
     *
     * @param selector Selector function that transforms each value into a list of values.
     * 
     * @returns  Returns a new series with values that have been produced by the selector function. 
     */
    selectMany<ToT> (selector: SelectorFn<ValueT, Iterable<ToT>>): ISeries<IndexT, ToT> {
        assert.isFunction(selector, "Expected 'selector' parameter to 'Series.selectMany' to be a function.");

        const pairsIterable = new SelectManyIterable(this.pairs, 
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
        );

        return new Series({
            pairs: pairsIterable,
        });
    }

    /**
     * Segment a Series into 'windows'. Returns a new Series. Each value in the new Series contains a 'window' (or segment) of the original series.
     * Use select or selectPairs to aggregate.
     *
     * @param period - The number of values in the window.
     * 
     * @returns Returns a new series, each value of which is a 'window' (or segment) of the original series.
     */
    window (period: number): ISeries<number, ISeries<IndexT, ValueT>> {

        assert.isNumber(period, "Expected 'period' parameter to 'Series.window' to be a number.");

        return new Series<number, ISeries<IndexT, ValueT>>({
            values: new WindowIterable<IndexT, ValueT>(this.pairs, period)
        });
    }

    /** 
     * Segment a Series into 'rolling windows'. Returns a new Series. Each value in the new Series contains a 'window' (or segment) of the original series.
    *
     * @param period - The number of values in the window.
     * 
     * @returns Returns a new series, each value of which is a 'window' (or segment) of the original series.
     */
    rollingWindow (period: number): ISeries<number, ISeries<IndexT, ValueT>> {

        assert.isNumber(period, "Expected 'period' parameter to 'Series.rollingWindow' to be a number.");

        return new Series<number, ISeries<IndexT, ValueT>>({
            values: new RollingWindowIterable<IndexT, ValueT>(this.pairs, period)
        });
    }

    /**
     * Groups sequential values into variable length 'windows'.
     *
     * @param comparer - Predicate that compares two values and returns true if they should be in the same window.
     * 
     * @returns Returns a series of groups. Each group is itself a series that contains the values in the 'window'. 
     */
    variableWindow (comparer: ComparerFn<ValueT>): ISeries<number, ISeries<IndexT, ValueT>> {
        
        assert.isFunction(comparer, "Expected 'comparer' parameter to 'Series.variableWindow' to be a function.")

        return new Series<number, ISeries<IndexT, ValueT>>({
            values: new VariableWindowIterable<IndexT, ValueT>(this.pairs, comparer)
        });
    };    

    /**
     * Group sequential duplicate values into a Series of windows.
     *
     * @param [selector] - Optional selector function to determine the value used to compare for duplicates.
     * 
     * @returns Returns a series of groups. Each group is itself a series. 
     */
    sequentialDistinct<ToT = ValueT> (selector?: SelectorFnNoIndex<ValueT, ToT>): ISeries<IndexT, ValueT> {
        
        if (selector) {
            assert.isFunction(selector, "Expected 'selector' parameter to 'Series.sequentialDistinct' to be a selector function that determines the value to compare for duplicates.")
        }
        else {
            selector = (value: ValueT): ToT => <ToT> <any> value;
        }

        return this.variableWindow((a: ValueT, b: ValueT): boolean => selector!(a) === selector!(b))
            .asPairs()
            .select(function (pair) {
                var window = pair[1];
                return [window.getIndex().first(), window.first()];
            })
            .asValues() 
            ;
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
    };
    
    /**
     * Compute the percent change between each pair of values.
     * Percentages are expressed as 0-1 values.
     * 
     * @returns Returns a new series where each value indicates the percent change from the previous number value in the original series.  
     */
    percentChange (): ISeries<IndexT, number> {

        return (<ISeries<IndexT, number>> <any> this) // Have to assume this is a number series.
            .rollingWindow(2)
            .asPairs()
            .select((pair: [number, ISeries<IndexT, number>]): [IndexT, number] => {
                var window = pair[1];
                var values = window.toArray();
                var amountChange = values[1] - values[0]; // Compute amount of change.
                var pctChange = amountChange / values[0]; // Compute % change.
                return [window.getIndex().last(), pctChange]; // Return new index and value.
            })
            .asValues<IndexT, number>() // Result is always a series.
            ;
    }    
    
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
     * Skips values in the series while a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     * 
     * @returns Returns a new series with all initial sequential values removed that match the predicate.  
     */
    skipWhile (predicate: PredicateFn<ValueT>) {
        assert.isFunction(predicate, "Expected 'predicate' parameter to 'skipWhile' function to be a predicate function that returns true/false.");

        return new Series<IndexT, ValueT>({
            values: new SkipWhileIterable(this.values, predicate),
            pairs: new SkipWhileIterable(this.pairs, pair => predicate(pair[1])),
        });
    }

    /**
     * Skips values in the series until a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     * 
     * @returns Returns a new series with all initial sequential values removed that don't match the predicate.
     */
    skipUntil (predicate: PredicateFn<ValueT>) {
        assert.isFunction(predicate, "Expected 'predicate' parameter to 'skipUntil' function to be a predicate function that returns true/false.");

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
        assert.isNumber(numRows, "Expected 'numRows' parameter to 'take' function to be a number.");

        return new Series({
            index: new TakeIterable(this.index, numRows),
            values: new TakeIterable(this.values, numRows),
            pairs: new TakeIterable(this.pairs, numRows)
        });
    };

    /**
     * Take values from the series while a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     * 
     * @returns Returns a new series that only includes the initial sequential values that have matched the predicate.
     */
    takeWhile (predicate: PredicateFn<ValueT>) {
        assert.isFunction(predicate, "Expected 'predicate' parameter to 'takeWhile' function to be a predicate function that returns true/false.");

        return new Series({
            values: new TakeWhileIterable(this.values, predicate),
            pairs: new TakeWhileIterable(this.pairs, pair => predicate(pair[1]))
        });
    }

    /**
     * Take values from the series until a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     * 
     * @returns Returns a new series or dataframe that only includes the initial sequential values that have not matched the predicate.
     */
    takeUntil (predicate: PredicateFn<ValueT>) {
        assert.isFunction(predicate, "Expected 'predicate' parameter to 'takeUntil' function to be a predicate function that returns true/false.");

        return this.takeWhile(value => !predicate(value));
    }

    /**
     * Count the number of values in the series.
     *
     * @returns Returns the count of all values in the series.
     */
    count (): number {

        var total = 0;
        for (const value of this.values) {
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
     * Get X values from the start of the series.
     *
     * @param numValues - Number of values to take.
     * 
     * @returns Returns a new series that has only the specified number of values taken from the start of the input sequence.  
     */
    head (numValues: number): ISeries<IndexT, ValueT> {

        assert.isNumber(numValues, "Expected 'values' parameter to 'head' function to be a number.");

        return this.take(numValues);
    }

    /** 
     * Get X values from the end of the series.
     *
     * @param numValues - Number of values to take.
     * 
     * @returns Returns a new series that has only the specified number of values taken from the end of the input sequence.  
     */
    tail (numValues: number): ISeries<IndexT, ValueT> {

        assert.isNumber(numValues, "Expected 'values' parameter to 'tail' function to be a number.");

        return this.skip(this.count() - numValues);
    }

    /**
     * Filter a series by a predicate selector.
     *
     * @param predicate - Predicte function to filter rows of the series.
     * 
     * @returns Returns a new series containing only the values that match the predicate. 
     */
    where (predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT> {
        assert.isFunction(predicate, "Expected 'predicate' parameter to 'where' function to be a function.");

        return new Series({
            values: new WhereIterable(this.values, predicate),
            pairs: new WhereIterable(this.pairs, pair => predicate(pair[1]))
        });
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

        var count = 0;

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
    startAt (indexValue: IndexT): ISeries<IndexT, ValueT> {

        var lessThan = this.getIndex().getLessThan();
        return new Series<IndexT, ValueT>({
            index: new SkipWhileIterable(this.index, index => lessThan(index, indexValue)),
            pairs: new SkipWhileIterable(this.pairs, pair => lessThan(pair[0], indexValue)),
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

        var lessThanOrEqualTo = this.getIndex().getLessThanOrEqualTo();
        return new Series<IndexT, ValueT>({
            index: new TakeWhileIterable(this.index, index => lessThanOrEqualTo(index, indexValue)),
            pairs: new TakeWhileIterable(this.pairs, pair => lessThanOrEqualTo(pair[0], indexValue)),
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

        var lessThan = this.getIndex().getLessThan();
        return new Series<IndexT, ValueT>({
            index: new TakeWhileIterable(this.index, index => lessThan(index, indexValue)),
            pairs: new TakeWhileIterable(this.pairs, pair => lessThan(pair[0], indexValue)),
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

        var lessThanOrEqualTo = this.getIndex().getLessThanOrEqualTo();
        return new Series<IndexT, ValueT>({
            index: new SkipWhileIterable(this.index, index => lessThanOrEqualTo(index, indexValue)),
            pairs: new SkipWhileIterable(this.pairs, pair => lessThanOrEqualTo(pair[0], indexValue)),
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
    };

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
        else {
            return value.toString();	
        }		
    }

    /**
     * Convert a series of values of different types to a series of string values.
     *
     * @param [formatString] Optional formatting string for dates.
     * 
     * @returns Returns a new series where the values from the original series have been stringified. 
     */
    toStrings (formatString?: string): ISeries<IndexT, string> {

        if (formatString) {
            assert.isString(formatString, "Expected optional 'formatString' parameter to Series.toStrings to be a string (if specified).");
        }

        return <ISeries<IndexT, string>> this.select(value => Series.toString(value, formatString));
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
    inflate<ToT = any> (selector?: SelectorFn<ValueT, ToT>): IDataFrame<IndexT, ToT> {

        if (selector) {
            assert.isFunction(selector, "Expected 'selector' parameter to Series.inflate to be a selector function.");

            return new DataFrame<IndexT, ToT>({
                values: new SelectIterable(this.values, selector),
                index: this.index,
                pairs: new SelectIterable(this.pairs, (pair: [IndexT, ValueT], index: number): [IndexT, ToT] => [pair[0], selector(pair[1], index)]),
            });            
        }
        else {
            return new DataFrame<IndexT, ToT>({
                values: <Iterable<ToT>> <any> this.values,
                index: this.index,
                pairs: <Iterable<[IndexT, ToT]>> <any> this.pairs
            });
        }
    }

    /**
     * Sorts the series by a value defined by the selector (ascending). 
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new ordered series that has been sorted by the value returned by the selector. 
     */
    orderBy<SortT> (selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT> {
        return new OrderedSeries<IndexT, ValueT, SortT>(this.values, this.pairs, selector, Direction.Ascending, null);
    }

    /**
     * Sorts the series by a value defined by the selector (descending). 
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new ordered series that has been sorted by the value returned by the selector. 
     */
    orderByDescending<SortT> (selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT> {
        return new OrderedSeries<IndexT, ValueT, SortT>(this.values, this.pairs, selector, Direction.Descending, null);
    }
    
}

//
// A series that has been ordered.
//
class OrderedSeries<IndexT = number, ValueT = any, SortT = any> 
    extends Series<IndexT, ValueT>
    implements IOrderedSeries<IndexT, ValueT, SortT> {

    parent: OrderedSeries<IndexT, ValueT, SortT> | null;
    selector: SelectorFn<ValueT, SortT>;
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

    constructor(values: Iterable<ValueT>, pairs: Iterable<[IndexT, ValueT]>, selector: SelectorFn<ValueT, SortT>, direction: Direction, parent: OrderedSeries<IndexT, ValueT> | null) {

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
        pairSortSpecs.push(OrderedSeries.makeSortSpec(sortLevel, (pair: [IndexT, ValueT], index: number) => selector(pair[1], index), direction));

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
    thenBy<SortT> (selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT> {
        return new OrderedSeries<IndexT, ValueT, SortT>(this.origValues, this.origPairs, selector, Direction.Ascending, this);
    }

    /** 
     * Performs additional sorting (descending).
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new series has been additionally sorted by the value returned by the selector. 
     */
    thenByDescending<SortT> (selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT> {
        return new OrderedSeries<IndexT, ValueT, SortT>(this.origValues, this.origPairs, selector, Direction.Descending, this);        
    }
}
    