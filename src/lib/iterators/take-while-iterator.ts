//
// An iterator that takes a sequence of elements while a predicate function returns true.
//

/**
 * A predicate function, returns true or false based on input.
 */
export type PredicateFn<InputT> = (value: InputT) => boolean;

export class TakeWhileIterator<T> implements Iterator<T> {

    childIterator: Iterator<T>;
    predicate: PredicateFn<T>;
    done = false;

    constructor(childIterator: Iterator<T>, predicate: PredicateFn<T>) {
        this.childIterator = childIterator;
        this.predicate = predicate;
    }

    next(): IteratorResult<T> {
        if (!this.done) {
            var result = this.childIterator.next();
            if (result.done) {
                this.done = true;
            }
            else if (this.predicate(result.value)) {
                return result;
            }
            else {
                this.done = true;
            }
        }

        // https://github.com/Microsoft/TypeScript/issues/8938
        return ({ done: true } as IteratorResult<T>)  // <= explicit cast here!;
    }
}