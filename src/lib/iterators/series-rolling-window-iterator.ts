//
// Iterates an underlying iterable in the 'windows'.
//

import { TakeIterable } from '../iterables/take-iterable';
import { SkipIterable } from '../iterables/skip-iterable';
import { Series, ISeries, WhichIndex } from '../series';

export class SeriesRollingWindowIterator<IndexT, ValueT> implements Iterator<[IndexT,ISeries<IndexT, ValueT>]> {

    iterable: Iterable<[IndexT, ValueT]>;
    iterator: Iterator<[IndexT, ValueT]> | undefined;
    period: number;
    whichIndex: WhichIndex;
    curWindow: [IndexT, ValueT][] | undefined; 
    
    constructor(iterable: Iterable<[IndexT, ValueT]>, period: number, whichIndex: WhichIndex) {
        this.iterable = iterable;
        this.period = period;
        this.whichIndex = whichIndex;
    }

    next(): IteratorResult<[IndexT,ISeries<IndexT, ValueT>]> {

        if (!this.curWindow) {
            this.curWindow = [];
            this.iterator = this.iterable[Symbol.iterator]();
            for (let i = 0; i < this.period; ++i) {
                const curPos = this.iterator.next();
                if (curPos.done) {
                    // Underlying iterator doesn't have required number of elements.
                    return ({ done: true } as IteratorResult<[IndexT,ISeries<IndexT, ValueT>]>);
                }
                this.curWindow.push(curPos.value);
            }
        }
        else {
            this.curWindow.shift(); // Remove first item from window.
            
            const curPos = this.iterator!.next();
            if (curPos.done) {
                // Underlying iterator doesn't have enough elements left.
                return ({ done: true } as IteratorResult<[IndexT,ISeries<IndexT, ValueT>]>);
            }

            this.curWindow.push(curPos.value); // Add next item to window.
        }

        const window = new Series<IndexT, ValueT>({
            pairs: this.curWindow
        });

        return {
            //TODO: The way the index is figured out could have much better performance.
            value: [this.whichIndex === WhichIndex.Start ? window.getIndex().first() : window.getIndex().last(), window],
            done: false,
        };
    }
}