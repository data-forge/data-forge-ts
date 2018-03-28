//
// Iterates an underlying iterable in the 'windows'.
//

import { SeriesWindowIterator } from '../iterators/series-window-iterator';
import { ISeries } from '../series';

export class SeriesWindowIterable<IndexT, ValueT> implements Iterable<ISeries<IndexT, ValueT>> {

    iterable: Iterable<[IndexT, ValueT]>;
    period: number;

    constructor(iterable: Iterable<[IndexT, ValueT]>, period: number) {
        this.iterable = iterable;
        this.period = period;
    }

    [Symbol.iterator](): Iterator<ISeries<IndexT, ValueT>> {
        return new SeriesWindowIterator(this.iterable, this.period);
    }
}