export declare class SkipIterable implements Iterable<any> {
    iterable: Iterable<any>;
    numValues: number;
    constructor(iterable: Iterable<any>, numValues: number);
    [Symbol.iterator](): Iterator<any>;
}
