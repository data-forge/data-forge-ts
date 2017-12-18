//
// An iterator to read column names from a file stream.
//

import { ArrayIterator } from './array-iterator';
import { StreamIterable } from '../iterables/stream-iterable';

export class StreamColumnNamesIterator implements AsyncIterator<string> {

    columnNamesIterator: ArrayIterator<string> | null = null;
    streamIterable: StreamIterable;

    constructor(csvIterable: StreamIterable) {
        this.streamIterable = csvIterable;
    }

    async next(): Promise<IteratorResult<string>> {
        if (this.columnNamesIterator === null) {
            const columnNames = await this.streamIterable.getColumnNames();
            this.columnNamesIterator = new ArrayIterator(columnNames);
        }

        return this.columnNamesIterator!.next();
    }

}