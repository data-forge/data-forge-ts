//
// An iterator that takes elements from a child iterator based on a predicate function.
//

/**
 * A predicate function, returns true or false based on input.
 */
export type PredicateFn<InputT> = (value: InputT) => boolean;

export class WhereIterator<T> implements Iterator<T> {

    childIterator: Iterator<T>;
    predicate: PredicateFn<T>;

    constructor(childIterator: Iterator<T>, predicate: PredicateFn<T>) {
        this.childIterator = childIterator;
        this.predicate = predicate;
    }

    next(): IteratorResult<T> {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            var result = this.childIterator.next();
            if (result.done) {
                return result;
            }

            if (this.predicate(result.value)) {
                // It matches the predicate.
                return result;
            }
        }
    }
}