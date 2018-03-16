//
// An iterable that iterates the column names of lazy dataframe.
//

import { ColumnNamesIterator } from '../iterators/column-names-iterator';

export class ColumnNamesIterable implements AsyncIterable<string> {

    values: AsyncIterable<any>;

    constructor(values: AsyncIterable<any>) {
        this.values = values;
    }

    [Symbol.asyncIterator](): AsyncIterator<string> {
        return new ColumnNamesIterator(this.values);
    }
}