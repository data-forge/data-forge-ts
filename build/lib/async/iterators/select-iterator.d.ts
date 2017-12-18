export declare type SelectorFn<ValueT, ToT> = (value: ValueT, index: number) => ToT;
export declare class SelectIterator<ValueT, ToT> implements AsyncIterator<ToT> {
    iterator: AsyncIterator<ValueT>;
    selector: SelectorFn<ValueT, ToT>;
    index: number;
    constructor(iterator: AsyncIterator<ValueT>, selector: SelectorFn<ValueT, ToT>);
    next(): Promise<IteratorResult<ToT>>;
}
