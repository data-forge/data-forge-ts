export declare class TakeIterable<T> implements Iterable<T> {
    childIterable: Iterable<T>;
    numElements: number;
    constructor(childIterable: Iterable<T>, numElements: number);
    [Symbol.iterator](): Iterator<any>;
}
