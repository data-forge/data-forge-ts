//
// An iterable that skips a sequence of elements while a predicate function returns true.
//

import { SkipWhileIterator, PredicateFn } from '../iterators/skip-while-iterator';

export class SkipWhileIterable<T> implements Iterable<T> {

    childIterable: Iterable<T>;
    predicate: PredicateFn<T>;

    constructor(childIterable: Iterable<T>, predicate: PredicateFn<T>) {
        this.childIterable = childIterable;
        this.predicate = predicate;
    }

    [Symbol.iterator](): Iterator<any> {
        var childIterator = this.childIterable[Symbol.iterator]();
        return new SkipWhileIterator(childIterator, this.predicate);
    }
}