//
// An iterable that iterates the column names of lazy dataframe.
//

import { ColumnNamesIterator } from '../iterators/column-names-iterator';

export class ColumnNamesIterable implements Iterable<string> {

    values: Iterable<any>;
    considerAllRows: boolean;

    constructor(values: Iterable<any>, considerAllRows: boolean) {
        this.values = values;
        this.considerAllRows = considerAllRows
    }

    [Symbol.iterator](): Iterator<string> {
        return new ColumnNamesIterator(this.values, this.considerAllRows);
    }
}