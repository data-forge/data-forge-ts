//
// An iterator that concatenates multiple iterables.
//

export class ConcatIterator<T> implements Iterator<T> {

    iterables: Iterable<Iterable<T>>
    iterator: Iterator<Iterable<T>>;
    curIterator: Iterator<T> | null = null;

    constructor(iterables: Iterable<Iterable<T>>) {
        this.iterables = iterables;
        this.iterator = iterables[Symbol.iterator]();
        this.moveToNextIterable();
    }

    //
    // Move onto the next iterable.
    //
    private moveToNextIterable () {
        const nextIterable = this.iterator.next();
        if (nextIterable.done) {
            this.curIterator = null;
        }
        else {
            this.curIterator = nextIterable.value[Symbol.iterator]();
        }        
    }

    next(): IteratorResult<T> {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (this.curIterator == null) {
                // Finished iterating all sub-iterators.
                // https://github.com/Microsoft/TypeScript/issues/8938
                return ({ done: true } as IteratorResult<T>)  // <= explicit cast here!;
            }

            const result = this.curIterator.next();
            if (!result.done) {
                return result; // Found a valid result from the current iterable.    
            }

            // Find the next non empty iterable.
            this.moveToNextIterable();
        }
    }

}