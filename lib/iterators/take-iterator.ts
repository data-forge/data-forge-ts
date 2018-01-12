//
// An iterator that takes a certain number of elements from a child iterator.
//

export class TakeIterator<T> implements Iterator<T> {

    childIterator: Iterator<T>;
    numElements: number;

    constructor(childIterator: Iterator<T>, numElements: number) {
        this.childIterator = childIterator;
        this.numElements = numElements;
    }

    next(): IteratorResult<T> {
        if (this.numElements <= 0) {
            // https://github.com/Microsoft/TypeScript/issues/8938
            return ({ done: true } as IteratorResult<T>)  // <= explicit cast here!;
        }

        --this.numElements;
        return this.childIterator.next();
    }
}