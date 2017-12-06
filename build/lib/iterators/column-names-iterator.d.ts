export declare class ColumnNamesIterator implements Iterator<string> {
    columnNamesIterator: Iterator<string> | null;
    values: Iterable<any>;
    constructor(values: Iterable<any>);
    next(): IteratorResult<string>;
}
