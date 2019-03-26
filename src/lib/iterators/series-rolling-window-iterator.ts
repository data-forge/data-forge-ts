//
// Iterates an underlying iterable in the 'windows'.
//

import { TakeIterable } from '../iterables/take-iterable';
import { SkipIterable } from '../iterables/skip-iterable';
import { Series, ISeries } from '../series';

export class SeriesRollingWindowIterator<IndexT, ValueT> implements Iterator<ISeries<IndexT, ValueT>> {

    iterable: Iterable<[IndexT, ValueT]>;
    iterator: Iterator<[IndexT, ValueT]> | undefined;
    period: number;
    curWindow: [IndexT, ValueT][] | undefined; 
    
    constructor(iterable: Iterable<[IndexT, ValueT]>, period: number) {
        this.iterable = iterable;
        this.period = period;
    }

    next(): IteratorResult<ISeries<IndexT, ValueT>> {

        if (!this.curWindow) {
            this.curWindow = [];
            this.iterator = this.iterable[Symbol.iterator]();
            for (let i = 0; i < this.period; ++i) {
                const curPos = this.iterator.next();
                if (curPos.done) {
                    // Underlying iterator doesn't have required number of elements.
                    return ({ done: true } as IteratorResult<ISeries<IndexT, ValueT>>);
                }
                this.curWindow.push(curPos.value);
            }
        }
        else {
            this.curWindow.shift(); // Remove first item from window.
            
            const curPos = this.iterator!.next();
            if (curPos.done) {
                // Underlying iterator doesn't have enough elements left.
                return ({ done: true } as IteratorResult<ISeries<IndexT, ValueT>>);
            }

            this.curWindow.push(curPos.value); // Add next item to window.
        }

        const window = new Series<IndexT, ValueT>({
            pairs: this.curWindow
        });

        return {
            value: window,
            done: false,
        };
    }
}