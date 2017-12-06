//
// An iterator for the column names of lazy dataframe.
//

import { ArrayIterator } from './array-iterator';

export class ColumnNamesIterator implements Iterator<string> {

    columnNamesIterator: Iterator<string> | null = null;
    values: Iterable<any>;

    constructor(values: Iterable<any>) {
        this.values = values;
    }

    next(): IteratorResult<string> {
        if (this.columnNamesIterator === null)  {
            // Get first item.
            var valuesIterator = this.values[Symbol.iterator]();
            var firstResult = valuesIterator.next();
            if (firstResult.done) {
                return {
                    done: true,
                    value: "",
                };
            }

            this.columnNamesIterator = new ArrayIterator(Object.keys(firstResult.value));
        }

        return this.columnNamesIterator.next();
    }

}