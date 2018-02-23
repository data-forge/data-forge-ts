import { ISeries } from '../series';
export declare class WindowIterator<IndexT, ValueT> implements Iterator<ISeries<IndexT, ValueT>> {
    iterable: Iterable<[IndexT, ValueT]>;
    period: number;
    windowIndex: number;
    maxWindowIndex: number;
    constructor(iterable: Iterable<[IndexT, ValueT]>, period: number);
    next(): IteratorResult<ISeries<IndexT, ValueT>>;
}
