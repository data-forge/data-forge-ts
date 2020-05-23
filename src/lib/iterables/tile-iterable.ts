//
// An iterable that iterates the elements repeatedly.
//

import { TileIterator } from '../iterators/tile-iterator';

export class TileIterable<T> implements Iterable<T> {

    iterable: Iterable<T>;
    count: number;

    constructor(iterable: Iterable<T>, count: number) {
        this.iterable = iterable
        this.count = count;
    }

    [Symbol.iterator](): Iterator<any> {
        return new TileIterator(this.iterable, this.count);
    }
}