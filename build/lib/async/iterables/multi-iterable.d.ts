export declare class MultiIterable implements AsyncIterable<any[]> {
    iterables: AsyncIterable<any>[];
    constructor(iterables: AsyncIterable<any>[]);
    [Symbol.asyncIterator](): AsyncIterator<any>;
}
