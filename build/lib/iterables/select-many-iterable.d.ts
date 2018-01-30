import { SelectorFn } from '../iterators/select-many-iterator';
export declare class SelectManyIterable<ValueT, ToT> implements Iterable<ToT> {
    iterable: Iterable<ValueT>;
    selector: SelectorFn<ValueT, ToT>;
    constructor(iterable: Iterable<ValueT>, selector: SelectorFn<ValueT, ToT>);
    [Symbol.iterator](): Iterator<ToT>;
}
