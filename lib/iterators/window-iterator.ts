//
// Iterates an underlying iterable in the 'windows'.
//

import { TakeIterable } from '../iterables/take-iterable';
import { SkipIterable } from '../iterables/skip-iterable';
import { Series, ISeries } from '../series';

export class WindowIterator<IndexT, ValueT> implements Iterator<ISeries<IndexT, ValueT>> {

    iterable: Iterable<[IndexT, ValueT]>;
    period: number;
    windowIndex: number = 0;
    maxWindowIndex: number;
    
    constructor(iterable: Iterable<[IndexT, ValueT]>, period: number) {
        this.iterable = iterable;
        this.period = period;
    }

    next(): IteratorResult<ISeries<IndexT, ValueT>> {

        /*
        console.log('>> next'); //fio:

        for (const xx of new TakeIterable(
                new SkipIterable(
                    this.iterable,
                    this.windowIndex * this.period
                ),
                this.period
            )) {
                console.log(xx);
            }
            */

        const window = new Series<IndexT, ValueT>({
            pairs: new TakeIterable(
                new SkipIterable(
                    this.iterable,
                    this.windowIndex++ * this.period
                ),
                this.period
            )
        });

        //console.log('window'); //fio:
        //console.log(window.toPairs()); //fio:

        if (window.none()) {
            // Nothing more to read from the underlying iterable.
            // https://github.com/Microsoft/TypeScript/issues/8938
            return ({ done: true } as IteratorResult<ISeries<IndexT, ValueT>>)  // <= explicit cast here!;
        }

        return {
            value: window,
            done: false,
        };
    }
}