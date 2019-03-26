//
// Iterates an underlying iterable in the 'windows'.
//

import { TakeIterable } from '../iterables/take-iterable';
import { SkipIterable } from '../iterables/skip-iterable';
import { Series, ISeries } from '../series';

export class SeriesWindowIterator<IndexT, ValueT> implements Iterator<ISeries<IndexT, ValueT>> {

    iterable: Iterable<[IndexT, ValueT]>;
    iterator: Iterator<[IndexT, ValueT]> | undefined;
    period: number;
    
    constructor(iterable: Iterable<[IndexT, ValueT]>, period: number) {
        this.iterable = iterable;
        this.period = period;
    }

    next(): IteratorResult<ISeries<IndexT, ValueT>> {

        if (!this.iterator) {
            this.iterator = this.iterable[Symbol.iterator]();
        }

        const curWindow = [];

        for (let i = 0; i < this.period; ++i) {
            const curPos = this.iterator.next();
            if (curPos.done) {
                // Underlying iterator is finished.
                break;
            }
            curWindow.push(curPos.value);
        }

        if (curWindow.length === 0) {
            // Underlying iterator doesn't have required number of elements.
            return ({ done: true } as IteratorResult<ISeries<IndexT, ValueT>>);
        }
    
        const window = new Series<IndexT, ValueT>({
            pairs: curWindow
        });

        return {
            value: window,
            done: false,
        };
    }
}