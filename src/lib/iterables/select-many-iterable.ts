//
// An iterable that applies a selector function to each item.
//

import { SelectorFn, SelectManyIterator } from '../iterators/select-many-iterator';

export class SelectManyIterable<ValueT, ToT> implements Iterable<ToT> {

    iterable: Iterable<ValueT>;
    selector: SelectorFn<ValueT, ToT>;

    constructor(iterable: Iterable<ValueT>, selector: SelectorFn<ValueT, ToT>) {
        this.iterable = iterable;
        this.selector = selector;
    }

    [Symbol.iterator](): Iterator<ToT> {
        var iterator = this.iterable[Symbol.iterator]();
        return new SelectManyIterator<ValueT, ToT>(iterator, this.selector);
    }
}