export declare class ColumnNamesIterable implements Iterable<string> {
    values: Iterable<any>;
    considerAllRows: boolean;
    constructor(values: Iterable<any>, considerAllRows: boolean);
    [Symbol.iterator](): Iterator<string>;
}
