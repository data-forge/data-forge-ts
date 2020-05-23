//
// An iterator that iterates the elements of an iterable multiple times.
// Implementation similar to - https://numpy.org/doc/stable/reference/generated/numpy.tile.html
//

export class TileIterator<T> implements Iterator<T> {

    iterator: Iterator<T>;
    iterable: Iterable<T>;
    count: number = 0;
    repetition: number = 0;
    firstIteration: boolean = true;

    constructor(iterable: Iterable<T>, count: number) {
        this.iterable = iterable;
        this.iterator = iterable[Symbol.iterator]();
        this.count = count;
    }

    next(): IteratorResult<T> {

        let result = this.iterator.next();

        // Return done for empty iterable
        if (this.firstIteration && result.done) {
            return ({ done: true } as IteratorResult<T>);
        }

        this.firstIteration = false;

        if (result.done) {
            this.repetition += 1;
            // Reinitialize iterator once iterated completely
            this.iterator = this.iterable[Symbol.iterator]();
            
            result = this.iterator.next();
        }

        if (this.repetition < this.count) {
            return {
                done: false,
                value: result.value,
            };
        }
        else {
            // https://github.com/Microsoft/TypeScript/issues/8938
            return ({ done: true } as IteratorResult<T>); // <= explicit cast here!;
        }
    }

}