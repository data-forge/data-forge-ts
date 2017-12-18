export declare class ArrayIterable<T> implements AsyncIterable<T> {
    arr: T[];
    constructor(arr: T[]);
    [Symbol.asyncIterator](): AsyncIterator<any>;
}
