export declare class ColumnNamesIterable implements Iterable<string> {
    values: Iterable<any>;
    constructor(values: Iterable<any>);
    [Symbol.iterator](): Iterator<string>;
}
