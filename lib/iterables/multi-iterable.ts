//
// An iterable that allows multiple other iterables to be iterated at once.
// This allows iterables to be composed.
// This is used in Data-Forge to combine iterables for index and values.
//

import { MultiIterator } from '../iterators/multi-iterator';

export class MultiIterable implements Iterable<any[]> {

    iterables: Iterable<any>[];

    constructor(iterables: Iterable<any>[]) {
        this.iterables = iterables;
    }

    [Symbol.iterator](): Iterator<any> {
        var iterators: Iterator<any>[] = [];

        for (const iterable of this.iterables) {
            iterators.push(iterable[Symbol.iterator]());
        }

        return new MultiIterator(iterators);
    }
}