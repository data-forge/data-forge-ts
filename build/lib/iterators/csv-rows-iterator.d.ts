export declare class CsvRowsIterator implements Iterator<any> {
    columnNames: string[];
    rows: string[][];
    index: number;
    constructor(columnNames: string[], rows: string[][]);
    next(): IteratorResult<any>;
}
