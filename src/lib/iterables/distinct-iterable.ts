//
// An iterable that iterates the only distinct elements of another iterable.
//

import { DistinctIterator, SelectorFnNoIndex } from '../iterators/distinct-iterator';

export class DistinctIterable<FromT, ToT> implements Iterable<FromT> {

    iterable: Iterable<FromT>;
    selector?: SelectorFnNoIndex<FromT, ToT>;

    constructor(iterable: Iterable<FromT>, selector?: SelectorFnNoIndex<FromT, ToT>) {
        this.iterable = iterable;
        this.selector = selector;
    }

    [Symbol.iterator](): Iterator<FromT> {
        return new DistinctIterator(this.iterable, this.selector);
    }
}