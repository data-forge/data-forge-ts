export declare type SelectorFn = (value: any, index: number) => any;
export declare class SelectIterator implements Iterator<any> {
    iterator: Iterator<any>;
    selector: SelectorFn;
    index: number;
    constructor(iterator: Iterator<any>, selector: SelectorFn);
    next(): IteratorResult<any>;
}
