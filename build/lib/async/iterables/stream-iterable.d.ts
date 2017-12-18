import { IStreamFactory } from '../stream/stream-factory';
export declare class StreamIterable implements AsyncIterable<any> {
    streamFactory: IStreamFactory;
    inputFilePath: string;
    config?: any;
    cachedColumnNames: string[] | null;
    constructor(streamFactory: IStreamFactory, inputFilePath: string, config?: any);
    getColumnNames(): Promise<string[]>;
    [Symbol.asyncIterator](): AsyncIterator<any>;
}
