import { CsvStream } from './csv-stream';
export declare class CsvIterator implements AsyncIterator<any> {
    inputStream: CsvStream;
    cachedColumnNames: string[] | null;
    constructor(inputFilePath: string, config?: any);
    getColumnNames(): Promise<string[]>;
    next(): Promise<IteratorResult<any>>;
}
