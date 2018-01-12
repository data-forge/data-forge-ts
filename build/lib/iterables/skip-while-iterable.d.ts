import { PredicateFn } from '../iterators/skip-while-iterator';
export declare class SkipWhileIterable<T> implements Iterable<T> {
    childIterable: Iterable<T>;
    predicate: PredicateFn<T>;
    constructor(childIterable: Iterable<T>, predicate: PredicateFn<T>);
    [Symbol.iterator](): Iterator<any>;
}
