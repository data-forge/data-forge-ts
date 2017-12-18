export declare class CsvRowsIterator implements AsyncIterator<any> {
    columnNames: string[];
    rows: string[][];
    index: number;
    constructor(columnNames: string[], rows: string[][]);
    next(): Promise<IteratorResult<any>>;
}
