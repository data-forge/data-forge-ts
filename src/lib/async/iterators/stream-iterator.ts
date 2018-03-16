import { IStream } from '../stream/stream';
import { IStreamFactory } from '../stream/stream-factory';

//
// An iterator that iterates obejcts retreived from a file stream.
//

export class StreamIterator implements AsyncIterator<any> {

    inputStream: IStream;
    cachedColumnNames: string[] | null = null;

    constructor(streamFactory: IStreamFactory, inputFilePath: string, config?: any) {
        this.inputStream = streamFactory.instantiate(inputFilePath, config);
    }

    getColumnNames (): Promise<string[]> {
        return this.inputStream.getColumnNames();
    }

    async next(): Promise<IteratorResult<any>> {
        var result = await this.inputStream.read();
        if (result.done) {
            return result; // Finished.
        }

        if (this.cachedColumnNames === null) {
            // Cache column names after first object in stream has been read.
            this.cachedColumnNames = await this.inputStream.getColumnNames();
        }
        
        return result;
    }
}