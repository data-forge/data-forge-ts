export declare class CsvRowsIterator implements Iterator<any> {
    columnNames: string[];
    rowsIterator: Iterator<any[]>;
    index: number;
    constructor(columnNames: Iterable<string>, rowsIterable: Iterable<any[]>);
    next(): IteratorResult<any>;
}
