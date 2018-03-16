//
// An iterable that skips a number of values.
//

import { SkipIterator } from '../iterators/skip-iterator';

export class SkipIterable implements AsyncIterable<any> {

    iterable: AsyncIterable<any>;
    numValues: number;

    constructor(iterable: AsyncIterable<any>, numValues: number) {
        this.iterable = iterable;
        this.numValues = numValues;
    }

    [Symbol.asyncIterator](): AsyncIterator<any> {
        var iterator = this.iterable[Symbol.asyncIterator]();
        return new SkipIterator(iterator, this.numValues);
    }
}