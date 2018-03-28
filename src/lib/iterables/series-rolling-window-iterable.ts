//
// Iterates an underlying iterable in the 'windows'.
//

import { SeriesRollingWindowIterator } from '../iterators/series-rolling-window-iterator';
import { ISeries } from '../series';

export class SeriesRollingWindowIterable<IndexT, ValueT> implements Iterable<ISeries<IndexT, ValueT>> {

    iterable: Iterable<[IndexT, ValueT]>;
    period: number;

    constructor(iterable: Iterable<[IndexT, ValueT]>, period: number) {
        this.iterable = iterable;
        this.period = period;
    }

    [Symbol.iterator](): Iterator<ISeries<IndexT, ValueT>> {
        return new SeriesRollingWindowIterator(this.iterable, this.period);
    }
}