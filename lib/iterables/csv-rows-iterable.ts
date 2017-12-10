//
// An iterable that iterates the rows of a CSV file.
//

import { CsvRowsIterator } from '../iterators/csv-rows-iterator';

export class CsvRowsIterable implements Iterable<any> {

    columnNames: string[];
    rows: string[][];

    constructor(columnNames: string[], rows: string[][]) {
        this.columnNames = columnNames;
        this.rows = rows;
    }

    [Symbol.iterator](): Iterator<any> {
        return new CsvRowsIterator(this.columnNames, this.rows);
    }
}