import { ArrayIterator } from './array-iterator';
import { StreamIterable } from '../iterables/stream-iterable';
export declare class StreamColumnNamesIterator implements AsyncIterator<string> {
    columnNamesIterator: ArrayIterator<string> | null;
    streamIterable: StreamIterable;
    constructor(csvIterable: StreamIterable);
    next(): Promise<IteratorResult<string>>;
}
