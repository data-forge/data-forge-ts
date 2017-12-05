import { IIndex } from './index';
/**
 * Interface that represents a series of indexed values.
 */
export interface ISeries extends Iterable<any> {
    /**
     * Get an iterator to enumerate the values of the series.
     */
    [Symbol.iterator](): Iterator<any>;
    /**
     * Get the index for the series.
     */
    getIndex(): IIndex;
    /**
    * Extract values from the series as an array.
    * This forces lazy evaluation to complete.
    *
    * @returns Returns an array of values contained within the series.
    */
    toArray(): any[];
    /**
     * Retreive the index and values from the Series as an array of pairs.
     * Each pairs is [index, value].
     *
     * @returns Returns an array of pairs that contains the series content. Each pair is a two element array that contains an index and a value.
     */
    toPairs(): (any[])[];
    /**
     * Skip a number of values in the series.
     *
     * @param numValues - Number of values to skip.     *
     * @returns Returns a new series or dataframe with the specified number of values skipped.
     */
    skip(numValues: number): ISeries;
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
    bake(): ISeries;
}
/**
 * Class that represents a series of indexed values.
 */
export declare class Series implements ISeries {
    private index;
    private values;
    private pairs;
    private isBaked;
    private initFromArray(arr);
    private initIterable(input, fieldName);
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
    constructor(config?: any);
    /**
     * Get an iterator to enumerate the values of the series.
     * Enumerating the iterator forces lazy evaluation to complete.
     */
    [Symbol.iterator](): Iterator<any>;
    /**
     * Get the index for the series.
     */
    getIndex(): IIndex;
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
    toPairs(): (any[])[];
    /**
     * Skip a number of values in the series.
     *
     * @param numValues - Number of values to skip.     *
     * @returns Returns a new series or dataframe with the specified number of values skipped.
     */
    skip(numValues: number): ISeries;
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
    bake(): ISeries;
}
