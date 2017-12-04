export declare class MultiIterable implements Iterable<any[]> {
    iterables: Iterable<any>[];
    constructor(iterables: Iterable<any>[]);
    [Symbol.iterator](): Iterator<any>;
}
