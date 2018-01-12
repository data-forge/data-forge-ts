import { PredicateFn } from '../iterators/where-iterator';
export declare class WhereIterable<T> implements Iterable<T> {
    childIterable: Iterable<T>;
    predicate: PredicateFn<T>;
    constructor(childIterable: Iterable<T>, predicate: PredicateFn<T>);
    [Symbol.iterator](): Iterator<any>;
}
