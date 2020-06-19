//
// An iterator that iterates the elements of an iterable multiple times.
// Implementation similar to https://numpy.org/doc/stable/reference/generated/numpy.repeat.html
//

export class RepeatIterator<T> implements Iterator<T> {

    iterator: Iterator<T>;
    count: number;
    repetition = 0;
    result: IteratorResult<T>;

    constructor(iterable: Iterable<T>, count: number) {
        this.iterator = iterable[Symbol.iterator]();
        this.count = count;
        this.result = this.iterator.next()
    }

    next(): IteratorResult<T> {

        if (this.count == 0) {
            return ({ done: true } as IteratorResult<T>);
        }

        if (this.repetition == this.count) {
            this.result = this.iterator.next();
            this.repetition = 0;
        }

        this.repetition += 1;

        if (this.result.done) {
            // https://github.com/Microsoft/TypeScript/issues/8938
            return ({ done: true } as IteratorResult<T>); // <= explicit cast here!;
        }

        return {
            done: false,
            value: this.result.value
        };
    }

}