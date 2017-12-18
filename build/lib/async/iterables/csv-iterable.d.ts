export declare class CsvIterable implements AsyncIterable<any> {
    inputFilePath: string;
    config?: any;
    cachedColumnNames: string[] | null;
    constructor(inputFilePath: string, config?: any);
    getColumnNames(): Promise<string[]>;
    [Symbol.asyncIterator](): AsyncIterator<any>;
}
