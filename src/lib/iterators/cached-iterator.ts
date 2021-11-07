//
// An iterator that iterates the a "cached iterator" iterable.
//

import { CachedIteratorIterable } from "../iterables/cached-iterator-iterable";


export class CachedIterator<T> implements Iterator<T> {

    private index = 0;

    constructor(private iterable: CachedIteratorIterable<T>) {
    }

    next(): IteratorResult<T> {
        return this.iterable._next(this.index++);
    }

}