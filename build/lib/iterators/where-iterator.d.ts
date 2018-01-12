/**
 * A predicate function, returns true or false based on input.
 */
export declare type PredicateFn<InputT> = (value: InputT) => boolean;
export declare class WhereIterator<T> implements Iterator<T> {
    childIterator: Iterator<T>;
    predicate: PredicateFn<T>;
    constructor(childIterator: Iterator<T>, predicate: PredicateFn<T>);
    next(): IteratorResult<T>;
}
