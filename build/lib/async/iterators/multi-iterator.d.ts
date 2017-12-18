export declare class MultiIterator implements AsyncIterator<any[]> {
    iterators: AsyncIterator<any>[];
    constructor(iterators: AsyncIterator<any>[]);
    next(): Promise<IteratorResult<any[]>>;
}
