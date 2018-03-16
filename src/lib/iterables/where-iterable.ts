//
// An iterable that takes elements from a child iterable based on a predicate function.
//

import { WhereIterator, PredicateFn } from '../iterators/where-iterator';

export class WhereIterable<T> implements Iterable<T> {

    childIterable: Iterable<T>;
    predicate: PredicateFn<T>;

    constructor(childIterable: Iterable<T>, predicate: PredicateFn<T>) {
        this.childIterable = childIterable;
        this.predicate = predicate;
    }

    [Symbol.iterator](): Iterator<any> {
        var childIterator = this.childIterable[Symbol.iterator]();
        return new WhereIterator(childIterator, this.predicate);
    }
}