export declare type SelectorFn<ValueT, ToT> = (value: ValueT, index: number) => ToT;
export declare class SelectIterator<ValueT, ToT> implements Iterator<ToT> {
    iterator: Iterator<ValueT>;
    selector: SelectorFn<ValueT, ToT>;
    index: number;
    constructor(iterator: Iterator<ValueT>, selector: SelectorFn<ValueT, ToT>);
    next(): IteratorResult<ToT>;
}
