//
// An iterable that takes a certain number of elements from a child iterable.
//

import { TakeIterator } from '../iterators/take-iterator';

export class TakeIterable<T> implements Iterable<T> {

    childIterable: Iterable<T>;
    numElements: number;

    constructor(childIterable: Iterable<T>, numElements: number) {
        this.childIterable = childIterable;
        this.numElements = numElements;
    }

    [Symbol.iterator](): Iterator<any> {
        var childIterator = this.childIterable[Symbol.iterator]();
        return new TakeIterator(childIterator, this.numElements);
    }
}