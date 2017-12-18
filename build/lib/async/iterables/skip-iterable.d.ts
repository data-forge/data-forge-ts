export declare class SkipIterable implements AsyncIterable<any> {
    iterable: AsyncIterable<any>;
    numValues: number;
    constructor(iterable: AsyncIterable<any>, numValues: number);
    [Symbol.asyncIterator](): AsyncIterator<any>;
}
