export declare class CsvRowsIterable implements AsyncIterable<any> {
    columnNames: string[];
    rows: string[][];
    constructor(columnNames: string[], rows: string[][]);
    [Symbol.asyncIterator](): AsyncIterator<any>;
}
