export declare class CsvRowsIterable implements Iterable<any> {
    columnNames: Iterable<string>;
    rows: Iterable<any[]>;
    constructor(columnNames: Iterable<string>, rows: Iterable<any[]>);
    [Symbol.iterator](): Iterator<any>;
}
