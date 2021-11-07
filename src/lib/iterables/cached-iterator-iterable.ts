//
// An iterable that captures an iterator (e.g. from a generator function)
// and caches it to make it resusable 
// (iterators or the output of a generator is generally not reusable).
//

import { CachedIterator } from '../iterators/cached-iterator';

export class CachedIteratorIterable<T> implements Iterable<T> {

    private cached: T[] = [];

    constructor(private iterator: Iterator<T>) {
    }

    [Symbol.iterator](): Iterator<any> {
        return new CachedIterator<T>(this);
    }

    //
    // Gets from the cache or populates the cache.
    //
    _next(index: number): IteratorResult<T> {

        if (index >= this.cached.length) {
            // Beyond the cache.
            const result = this.iterator.next();
            if (result.done) {
                // Finished.
                return ({ done: true } as IteratorResult<T>)  // <= explicit cast here!;
            }

            // Cache result and return it.
            this.cached.push(result.value);
        }

        return {
            done: false, 
            value: this.cached[index],
        };
    }
}


