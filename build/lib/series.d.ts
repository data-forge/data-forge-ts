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
}
/**
 * Class that represents a series of indexed values.
 */
export declare class Series implements ISeries {
    private index;
    private values;
    private pairs;
    private initFromArray(arr);
    private initIterable(input, fieldName);
    private initFromConfig(config);
    /**
     * Create a series.
     *
     * @param config Defines the values and index for the new series.
     */
    constructor(config?: any);
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
}
