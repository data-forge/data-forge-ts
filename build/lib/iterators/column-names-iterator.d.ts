export declare class ColumnNamesIterator implements Iterator<string> {
    columnNamesIterator: Iterator<string> | null;
    values: Iterable<any>;
    considerAllRows: boolean;
    constructor(values: Iterable<any>, considerAllRows: boolean);
    next(): IteratorResult<string>;
}
