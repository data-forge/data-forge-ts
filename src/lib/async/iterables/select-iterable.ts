//
// An iterable that applies a selector function to each item.
//

import { SelectorFn, SelectIterator } from '../iterators/select-iterator';

export class SelectIterable<ValueT, ToT> implements AsyncIterable<ToT> {

    iterable: AsyncIterable<ValueT>;
    selector: SelectorFn<ValueT, ToT>;

    constructor(iterable: AsyncIterable<ValueT>, selector: SelectorFn<ValueT, ToT>) {
        this.iterable = iterable;
        this.selector = selector;
    }

    [Symbol.asyncIterator](): AsyncIterator<ToT> {
        var iterator = this.iterable[Symbol.asyncIterator]();
        return new SelectIterator<ValueT, ToT>(iterator, this.selector);
    }
}