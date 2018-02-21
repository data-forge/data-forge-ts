import { ISeries, Series } from './series';
/**
 * A predicate function for testing a value against another.
 */
export declare type PredicateFn = (value: any, against: any) => boolean;
/**
 * Interface that represents an index for a Series.
 */
export interface IIndex<IndexT> extends ISeries<number, IndexT> {
    /**
     * Get the type of the index.
     *
     * @returns Returns a string that specifies the type of the index.
     */
    getType(): string;
    /**
     * Get the less than operation for the index.
     *
     * @returns Returns a function that can be used to compare a value against an index value.
     */
    getLessThan(): PredicateFn;
    /**
     * Get the less than or equal to operation for the index.
     *
     * @returns Returns a function that can be used to compare a value against an index value.
     */
    getLessThanOrEqualTo(): PredicateFn;
    /**
     * Get the greater than operation for the index.
     *
     * @returns Returns a function that can be used to compare a value against an index value.
     */
    getGreaterThan(): PredicateFn;
}
/**
 * Class that represents an index for a Series.
 */
export declare class Index<IndexT> extends Series<number, IndexT> implements IIndex<IndexT> {
    private _type?;
    constructor(config?: any);
    /**
     * Get the type of the index.
     *
     * @returns Returns a string that specifies the type of the index.
     */
    getType(): string;
    /**
     * Get the less than operation for the index.
     *
     * @returns Returns a function that can be used to compare a value against an index value.
     */
    getLessThan(): PredicateFn;
    /**
     * Get the less than or equal to operation for the index.
     *
     * @returns Returns a function that can be used to compare a value against an index value.
     */
    getLessThanOrEqualTo(): PredicateFn;
    /**
     * Get the greater than operation for the index.
     *
     * @returns Returns a function that can be used to compare a value against an index value.
     */
    getGreaterThan(): PredicateFn;
}
