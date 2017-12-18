import { IStream } from '../stream/stream';
import { IStreamFactory } from '../stream/stream-factory';
export declare class StreamIterator implements AsyncIterator<any> {
    inputStream: IStream;
    cachedColumnNames: string[] | null;
    constructor(streamFactory: IStreamFactory, inputFilePath: string, config?: any);
    getColumnNames(): Promise<string[]>;
    next(): Promise<IteratorResult<any>>;
}
