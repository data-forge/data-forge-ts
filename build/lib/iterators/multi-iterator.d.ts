export declare class MultiIterator implements Iterator<any[]> {
    iterators: Iterator<any>[];
    constructor(iterators: Iterator<any>[]);
    next(): IteratorResult<any[]>;
}
