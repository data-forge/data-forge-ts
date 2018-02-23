import { ISeries } from '../series';
export declare class WindowIterable<IndexT, ValueT> implements Iterable<ISeries<IndexT, ValueT>> {
    iterable: Iterable<[IndexT, ValueT]>;
    period: number;
    constructor(iterable: Iterable<[IndexT, ValueT]>, period: number);
    [Symbol.iterator](): Iterator<ISeries<IndexT, ValueT>>;
}
