//
// An iterable that applies a selector function to each item.
//

import { SelectorFn, SelectIterator } from '../iterators/select-iterator';

export class SelectIterable implements Iterable<any> {

    iterable: Iterable<any>;
    selector: SelectorFn;

    constructor(iterable: Iterable<any>, selector: SelectorFn) {
        this.iterable = iterable;
        this.selector = selector;
    }

    [Symbol.iterator](): Iterator<any> {
        var iterator = this.iterable[Symbol.iterator]();
        return new SelectIterator(iterator, this.selector);
    }
}