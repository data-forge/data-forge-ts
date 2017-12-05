//
// An iterable that skips a number of values.
//

import { SkipIterator } from '../iterators/skip-iterator';

export class SkipIterable implements Iterable<any> {

    iterable: Iterable<any>;
    numValues: number;

    constructor(iterable: Iterable<any>, numValues: number) {
        this.iterable = iterable;
        this.numValues = numValues;
    }

    [Symbol.iterator](): Iterator<any> {
        var iterator = this.iterable[Symbol.iterator]();
        return new SkipIterator(iterator, this.numValues);
    }
}