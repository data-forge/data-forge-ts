//
// Iterates an underlying iterable in the 'windows'.
//

import { SeriesRollingWindowIterator } from '../iterators/series-rolling-window-iterator';
import { ISeries, WhichIndex } from '../series';

export class SeriesRollingWindowIterable<IndexT, ValueT> implements Iterable<[IndexT,ISeries<IndexT, ValueT>]> {

    iterable: Iterable<[IndexT, ValueT]>;
    period: number;
    whichIndex: WhichIndex;

    constructor(iterable: Iterable<[IndexT, ValueT]>, period: number, whichIndex: WhichIndex) {
        this.iterable = iterable;
        this.period = period;
        this.whichIndex = whichIndex;
    }

    [Symbol.iterator](): Iterator<[IndexT,ISeries<IndexT, ValueT>]> {
        return new SeriesRollingWindowIterator(this.iterable, this.period, this.whichIndex);
    }
}