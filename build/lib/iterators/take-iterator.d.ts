export declare class TakeIterator<T> implements Iterator<T> {
    childIterator: Iterator<T>;
    numElements: number;
    constructor(childIterator: Iterator<T>, numElements: number);
    next(): IteratorResult<T>;
}
