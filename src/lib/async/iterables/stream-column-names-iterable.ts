//
// An iterable that iterates column names that are read from a file stream.
//

import { StreamIterable } from './stream-iterable';
import { StreamColumnNamesIterator as CsvColumnNamesIterator } from '../iterators/stream-column-names-iterator';

export class StreamColumnNamesIterable implements AsyncIterable<string> {

    streamIterable: StreamIterable;

    constructor(streamIterable: StreamIterable) {
        this.streamIterable = streamIterable;
    }

    [Symbol.asyncIterator](): AsyncIterator<string> {
        return new CsvColumnNamesIterator(this.streamIterable);
    }
}