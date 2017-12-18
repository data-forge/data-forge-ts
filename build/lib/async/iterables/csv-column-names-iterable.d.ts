import { CsvIterable } from './csv-iterable';
export declare class CsvColumnNamesIterable implements AsyncIterable<string> {
    csvIterable: CsvIterable;
    constructor(csvIterable: CsvIterable);
    [Symbol.asyncIterator](): AsyncIterator<string>;
}
