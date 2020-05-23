//
// An iterable that converts sets of elements in child iterables to a single contiguous array.
//

import { RavelIterator } from '../iterators/ravel-iterator';

export class RavelIterable<T> implements Iterable<T> {

    iterables: Iterable<T>[];

    constructor(iterables: Iterable<T>[]) {
        this.iterables = iterables;
    }

    [Symbol.iterator](): Iterator<T> {
        return new RavelIterator<T>(this.iterables);
    }
}