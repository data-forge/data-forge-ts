//
// Iterates an underlying iterable in the 'windows'.
//

import { SeriesWindowIterator } from '../iterators/series-window-iterator';
import { ISeries, WhichIndex } from '../series';

export class SeriesWindowIterable<IndexT, ValueT> implements Iterable<[IndexT,ISeries<IndexT, ValueT>]> {

    iterable: Iterable<[IndexT, ValueT]>;
    period: number;
    whichIndex: WhichIndex;

    constructor(iterable: Iterable<[IndexT, ValueT]>, period: number, whichIndex: WhichIndex) {
        this.iterable = iterable;
        this.period = period;
        this.whichIndex = whichIndex;
    }

    [Symbol.iterator](): Iterator<[IndexT,ISeries<IndexT, ValueT>]> {
        return new SeriesWindowIterator(this.iterable, this.period, this.whichIndex);
    }
}