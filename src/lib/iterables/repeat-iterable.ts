//
// An iterable that iterates the elements repeatedly.
//

import { RepeatIterator } from '../iterators/repeat-iterator';

export class RepeatIterable<T> implements Iterable<T> {

    iterable: Iterable<T>;
    count: number;

    constructor(iterable: Iterable<T>, count: number) {
        this.iterable = iterable
        this.count = count;
    }

    [Symbol.iterator](): Iterator<any> {
        return new RepeatIterator(this.iterable, this.count);
    }
}