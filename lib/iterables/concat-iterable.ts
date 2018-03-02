//
// An iterable that concatenates multiple iterables.
//

import { ConcatIterator } from '../iterators/concat-iterator';

export class ConcatIterable<T> implements Iterable<T> {

    iterables: Iterable<Iterable<T>>;

    constructor(iterables: Iterable<Iterable<T>>) {
        this.iterables = iterables;
    }

    [Symbol.iterator](): Iterator<any> {
        return new ConcatIterator(this.iterables);
    }
}