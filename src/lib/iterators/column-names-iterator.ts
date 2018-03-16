//
// An iterator for the column names of lazy dataframe.
//

import { ArrayIterator } from './array-iterator';

export class ColumnNamesIterator implements Iterator<string> {

    columnNamesIterator: Iterator<string> | null = null;
    values: Iterable<any>;
    considerAllRows: boolean;

    constructor(values: Iterable<any>, considerAllRows: boolean) {
        this.values = values;
        this.considerAllRows = considerAllRows;
    }

    next(): IteratorResult<string> {
        if (this.columnNamesIterator === null)  {
            if (this.considerAllRows) {
                var combinedFields: any = {};
                
                // Check all items.
                for (let value of this.values) {
                    for (let fieldName of Object.keys(value)) {
                        combinedFields[fieldName] = true;
                    }
                }

                this.columnNamesIterator = new ArrayIterator(Object.keys(combinedFields));
            }
            else {
                // Just check the first item.
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
        }

        return this.columnNamesIterator.next();
    }

}