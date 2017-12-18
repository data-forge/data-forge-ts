export declare class ArrayIterator<T> implements AsyncIterator<T> {
    arr: T[];
    index: number;
    constructor(arr: T[]);
    next(): Promise<IteratorResult<T>>;
}
