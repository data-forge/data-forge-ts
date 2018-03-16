//
// An iterable that allows multiple other iterables to be iterated at once.
// This allows iterables to be composed.
// This is used in Data-Forge to combine iterables for index and values.
//

import { MultiIterator } from '../iterators/multi-iterator';

export class MultiIterable implements AsyncIterable<any[]> {

    iterables: AsyncIterable<any>[];

    constructor(iterables: AsyncIterable<any>[]) {
        this.iterables = iterables;
    }

    [Symbol.asyncIterator](): AsyncIterator<any> {
        var iterators: AsyncIterator<any>[] = [];

        for (const iterable of this.iterables) {
            iterators.push(iterable[Symbol.asyncIterator]());
        }

        return new MultiIterator(iterators);
    }
}