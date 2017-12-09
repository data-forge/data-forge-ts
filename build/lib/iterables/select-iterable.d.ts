import { SelectorFn } from '../iterators/select-iterator';
export declare class SelectIterable<ValueT, ToT> implements Iterable<ToT> {
    iterable: Iterable<ValueT>;
    selector: SelectorFn<ValueT, ToT>;
    constructor(iterable: Iterable<ValueT>, selector: SelectorFn<ValueT, ToT>);
    [Symbol.iterator](): Iterator<ToT>;
}
