import { PredicateFn } from '../iterators/take-while-iterator';
export declare class TakeWhileIterable<T> implements Iterable<T> {
    childIterable: Iterable<T>;
    predicate: PredicateFn<T>;
    constructor(childIterable: Iterable<T>, predicate: PredicateFn<T>);
    [Symbol.iterator](): Iterator<any>;
}
