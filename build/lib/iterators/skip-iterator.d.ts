export declare class SkipIterator implements Iterator<any> {
    iterator: Iterator<any>;
    numValues: number;
    constructor(iterator: Iterator<any>, numValues: number);
    next(): IteratorResult<any>;
}
