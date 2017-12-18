//
// An iterable that iterates object retrieved from a file stream.
//

import { StreamIterator } from '../iterators/stream-iterator';
import { IStreamFactory } from '../stream/stream-factory';

export class StreamIterable implements AsyncIterable<any> {

    streamFactory: IStreamFactory;
    inputFilePath: string;
    config?: any;
    cachedColumnNames: string[] | null = null;

    constructor(streamFactory: IStreamFactory, inputFilePath: string, config?: any) {
        this.streamFactory = streamFactory;
        this.inputFilePath = inputFilePath;
        this.config = config;
    }

    async getColumnNames (): Promise<string[]> {
        if (this.cachedColumnNames == null) {
            var iterator = new StreamIterator(this.streamFactory, this.inputFilePath, this.config);
            this.cachedColumnNames = await iterator.getColumnNames();
        }

        return this.cachedColumnNames;
    }

    [Symbol.asyncIterator](): AsyncIterator<any> {
        var iterator = new StreamIterator(this.streamFactory, this.inputFilePath, this.config);
        if (this.cachedColumnNames === null) {
            // Use the first iterator to read in the column names.
            iterator.getColumnNames()
                .then(columnNames => {
                    // Cache columns for later use.
                    this.cachedColumnNames = columnNames;
                });
        }
        return iterator;
    }
}