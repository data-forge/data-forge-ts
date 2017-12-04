export declare class ArrayIterable<T> implements Iterable<T> {
    arr: T[];
    constructor(arr: T[]);
    [Symbol.iterator](): Iterator<any>;
}
