import { ISeries } from '../series';
export declare class RollingWindowIterator<IndexT, ValueT> implements Iterator<ISeries<IndexT, ValueT>> {
    iterable: Iterable<[IndexT, ValueT]>;
    period: number;
    windowIndex: number;
    constructor(iterable: Iterable<[IndexT, ValueT]>, period: number);
    next(): IteratorResult<ISeries<IndexT, ValueT>>;
}
