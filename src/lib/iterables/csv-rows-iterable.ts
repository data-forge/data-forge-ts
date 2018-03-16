//
// An iterable that iterates the rows of a CSV file.
//

import { CsvRowsIterator } from '../iterators/csv-rows-iterator';

export class CsvRowsIterable implements Iterable<any> {

    columnNames: Iterable<string>;
    rows: Iterable<any[]>;

    constructor(columnNames: Iterable<string>, rows: Iterable<any[]>) {
        this.columnNames = columnNames;
        this.rows = rows;
    }

    [Symbol.iterator](): Iterator<any> {
        return new CsvRowsIterator(this.columnNames, this.rows);
    }
}