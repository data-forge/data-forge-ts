import { ArrayIterator } from './array-iterator';
import { CsvIterable } from '../iterables/csv-iterable';
export declare class CsvColumnNamesIterator implements AsyncIterator<string> {
    columnNamesIterator: ArrayIterator<string> | null;
    csvIterable: CsvIterable;
    constructor(csvIterable: CsvIterable);
    next(): Promise<IteratorResult<string>>;
}
