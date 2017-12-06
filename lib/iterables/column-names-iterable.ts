//
// An iterable that iterates the column names of lazy dataframe.
//

import { ColumnNamesIterator } from '../iterators/column-names-iterator';

export class ColumnNamesIterable implements Iterable<string> {

    values: Iterable<any>;

    constructor(values: Iterable<any>) {
        this.values = values;
    }

    [Symbol.iterator](): Iterator<string> {
        return new ColumnNamesIterator(this.values);
    }
}