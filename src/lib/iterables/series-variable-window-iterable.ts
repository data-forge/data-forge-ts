//
// Iterates an underlying iterable in the 'windows'.
//

import { SeriesVariableWindowIterator, ComparerFn } from '../iterators/series-variable-window-iterator';
import { ISeries } from '../series';

export class SeriesVariableWindowIterable<IndexT, ValueT> implements Iterable<ISeries<IndexT, ValueT>> {

    iterable: Iterable<[IndexT, ValueT]>;
    comparer: ComparerFn<ValueT>;

    constructor(iterable: Iterable<[IndexT, ValueT]>, comparer: ComparerFn<ValueT>) {
        this.iterable = iterable;
        this.comparer = comparer;
    }

    [Symbol.iterator](): Iterator<ISeries<IndexT, ValueT>> {
        return new SeriesVariableWindowIterator(this.iterable, this.comparer);
    }
}