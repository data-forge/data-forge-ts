export declare class ArrayIterator<T> implements Iterator<T> {
    arr: T[];
    index: number;
    constructor(arr: T[]);
    next(): IteratorResult<T>;
}
