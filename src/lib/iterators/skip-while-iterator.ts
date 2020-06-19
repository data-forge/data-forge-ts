//
// An iterator that skips a sequence of elements while a predicate function returns true.
//

/**
 * A predicate function, returns true or false based on input.
 */
export type PredicateFn<InputT> = (value: InputT) => boolean;

export class SkipWhileIterator<T> implements Iterator<T> {

    childIterator: Iterator<T>;
    predicate: PredicateFn<T>;
    doneSkipping = false;

    constructor(childIterator: Iterator<T>, predicate: PredicateFn<T>) {
        this.childIterator = childIterator;
        this.predicate = predicate;
    }

    next(): IteratorResult<T> {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            var result = this.childIterator.next();
            if (result.done) {
                return result; // Done.
            }

            if (!this.doneSkipping && this.predicate(result.value)) {
                continue; // Skip it.
            }

            // It matches, stop skipping.
            this.doneSkipping = true;
            return result;
        }
    }
}