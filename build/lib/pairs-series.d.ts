import { ISeries, Series } from './series';
/**
 * Interface that represents a series of index/value pairs.
 */
export interface IPairsSeries<IndexT, ValueT> extends ISeries<number, [IndexT, ValueT]> {
    /**
     * Convert a series of pairs to back to a regular series.
     *
     * @returns Returns a series of values where each pair has been extracted from the value of the input series.
     */
    asValues(): ISeries<IndexT, ValueT>;
}
/**
 * Class that represents a series of index/value pairs.
 */
export declare class PairsSeries<IndexT, ValueT> extends Series<number, [IndexT, ValueT]> implements IPairsSeries<IndexT, ValueT> {
    constructor(pairs: Iterable<[IndexT, ValueT]>);
}
