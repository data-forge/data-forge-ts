export declare class SkipIterator implements AsyncIterator<any> {
    iterator: AsyncIterator<any>;
    numValues: number;
    constructor(iterator: AsyncIterator<any>, numValues: number);
    next(): Promise<IteratorResult<any>>;
}
