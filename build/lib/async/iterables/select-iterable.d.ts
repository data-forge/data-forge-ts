import { SelectorFn } from '../iterators/select-iterator';
export declare class SelectIterable<ValueT, ToT> implements AsyncIterable<ToT> {
    iterable: AsyncIterable<ValueT>;
    selector: SelectorFn<ValueT, ToT>;
    constructor(iterable: AsyncIterable<ValueT>, selector: SelectorFn<ValueT, ToT>);
    [Symbol.asyncIterator](): AsyncIterator<ToT>;
}
