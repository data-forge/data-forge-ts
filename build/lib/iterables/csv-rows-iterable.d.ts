export declare class CsvRowsIterable implements Iterable<any> {
    columnNames: string[];
    rows: string[][];
    constructor(columnNames: string[], rows: string[][]);
    [Symbol.iterator](): Iterator<any>;
}
