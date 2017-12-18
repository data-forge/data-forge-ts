//
// An iterator for the column names of lazy dataframe.
//

import { ArrayIterator } from './array-iterator';

export class ColumnNamesIterator implements AsyncIterator<string> {

    columnNamesIterator: AsyncIterator<string> | null = null;
    values: AsyncIterable<any>;

    constructor(values: AsyncIterable<any>) {
        this.values = values;
    }

    async next(): Promise<IteratorResult<string>> {
        if (this.columnNamesIterator === null)  {
            // Get first item.
            var valuesIterator = this.values[Symbol.asyncIterator]();
            var firstResult = await valuesIterator.next();
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