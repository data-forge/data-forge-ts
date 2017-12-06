import { IIndex } from './index';
/**
 * Interface that represents a dataframe.
 */
export interface IDataFrame extends Iterable<any> {
    /**
     * Get an iterator to enumerate the values of the dataframe.
     */
    [Symbol.iterator](): Iterator<any>;
    /**
     * Get the names of the columns in the dataframe.
     *
     * @returns Returns an array of the column names in the dataframe.
     */
    getColumnNames(): string[];
    /**
     * Get the index for the dataframe.
     */
    getIndex(): IIndex;
    /**
     * Apply a new index to the DataFrame.
     *
     * @param newIndex The new index to apply to the DataFrame.
     *
     * @returns Returns a new dataframe with the specified index attached.
     */
    withIndex(newIndex: any): IDataFrame;
    /**
     * Resets the index of the dataframe back to the default zero-based sequential integer index.
     *
     * @returns Returns a new dataframe with the index reset to the default zero-based index.
     */
    resetIndex(): IDataFrame;
    /**
    * Extract values from the dataframe as an array.
    * This forces lazy evaluation to complete.
    *
    * @returns Returns an array of values contained within the dataframe.
    */
    toArray(): any[];
    /**
     * Retreive the index and values from the DataFrame as an array of pairs.
     * Each pairs is [index, value].
     *
     * @returns Returns an array of pairs that contains the dataframe content. Each pair is a two element array that contains an index and a value.
     */
    toPairs(): (any[])[];
    /**
     * Skip a number of values in the dataframe.
     *
     * @param numValues - Number of values to skip.     *
     * @returns Returns a new dataframe or dataframe with the specified number of values skipped.
     */
    skip(numValues: number): IDataFrame;
    /**
     * Format the dataframe for display as a string.
     * This forces lazy evaluation to complete.
     *
     * @returns Generates and returns a string representation of the dataframe or dataframe.
     */
    toString(): string;
    /**
     * Forces lazy evaluation to complete and 'bakes' the dataframe into memory.
     *
     * @returns Returns a dataframe that has been 'baked', all lazy evaluation has completed.
     */
    bake(): IDataFrame;
}
/**
 * Class that represents a dataframe of indexed values.
 */
export declare class DataFrame implements IDataFrame {
    private index;
    private values;
    private pairs;
    private columnNames;
    private isBaked;
    private initFromArray(arr);
    private initIterable(input, fieldName);
    private initFromConfig(config);
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
    constructor(config?: any);
    /**
     * Get an iterator to enumerate the values of the dataframe.
     * Enumerating the iterator forces lazy evaluation to complete.
     */
    [Symbol.iterator](): Iterator<any>;
    /**
     * Get the names of the columns in the dataframe.
     *
     * @returns Returns an array of the column names in the dataframe.
     */
    getColumnNames(): string[];
    /**
     * Get the index for the dataframe.
     */
    getIndex(): IIndex;
    /**
     * Apply a new index to the DataFrame.
     *
     * @param newIndex The new index to apply to the DataFrame.
     *
     * @returns Returns a new dataframe or dataframe with the specified index attached.
     */
    withIndex(newIndex: any): IDataFrame;
    /**
     * Resets the index of the dataframe back to the default zero-based sequential integer index.
     *
     * @returns Returns a new dataframe with the index reset to the default zero-based index.
     */
    resetIndex(): IDataFrame;
    /**
    * Extract values from the dataframe as an array.
    * This forces lazy evaluation to complete.
    *
    * @returns Returns an array of values contained within the dataframe.
    */
    toArray(): any[];
    /**
     * Retreive the index and values from the DataFrame as an array of pairs.
     * Each pair is [index, value].
     * This forces lazy evaluation to complete.
     *
     * @returns Returns an array of pairs that contains the dataframe content. Each pair is a two element array that contains an index and a value.
     */
    toPairs(): (any[])[];
    /**
     * Skip a number of values in the dataframe.
     *
     * @param numValues - Number of values to skip.     *
     * @returns Returns a new dataframe or dataframe with the specified number of values skipped.
     */
    skip(numValues: number): IDataFrame;
    /**
     * Format the dataframe for display as a string.
     * This forces lazy evaluation to complete.
     *
     * @returns Generates and returns a string representation of the dataframe or dataframe.
     */
    toString(): string;
    /**
     * Forces lazy evaluation to complete and 'bakes' the dataframe into memory.
     *
     * @returns Returns a dataframe that has been 'baked', all lazy evaluation has completed.
     */
    bake(): IDataFrame;
}
