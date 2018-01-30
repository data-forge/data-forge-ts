export declare type SelectorFn<ValueT, ToT> = (value: ValueT, index: number) => Iterable<ToT>;
export declare class SelectManyIterator<ValueT, ToT> implements Iterator<ToT> {
    iterator: Iterator<ValueT>;
    outputIterator: Iterator<ToT> | null;
    selector: SelectorFn<ValueT, ToT>;
    index: number;
    constructor(iterator: Iterator<ValueT>, selector: SelectorFn<ValueT, ToT>);
    next(): IteratorResult<ToT>;
}
