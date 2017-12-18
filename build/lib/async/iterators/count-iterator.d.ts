export declare class CountIterator implements AsyncIterator<number> {
    index: number;
    next(): Promise<IteratorResult<number>>;
}
