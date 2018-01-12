//
// An iterable that takes a sequence of elements while a predicate function returns true.
//

import { TakeWhileIterator, PredicateFn } from '../iterators/take-while-iterator';

export class TakeWhileIterable<T> implements Iterable<T> {

    childIterable: Iterable<T>;
    predicate: PredicateFn<T>;

    constructor(childIterable: Iterable<T>, predicate: PredicateFn<T>) {
        this.childIterable = childIterable;
        this.predicate = predicate;
    }

    [Symbol.iterator](): Iterator<any> {
        var childIterator = this.childIterable[Symbol.iterator]();
        return new TakeWhileIterator(childIterator, this.predicate);
    }
}