import { StreamIterable } from './stream-iterable';
export declare class StreamColumnNamesIterable implements AsyncIterable<string> {
    streamIterable: StreamIterable;
    constructor(streamIterable: StreamIterable);
    [Symbol.asyncIterator](): AsyncIterator<string>;
}
