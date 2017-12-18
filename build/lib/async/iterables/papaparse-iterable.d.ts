export declare class PapaParseIterable<T> implements AsyncIterable<T> {
    inputFilePath: string;
    config?: any;
    constructor(inputFilePath: string, config?: any);
    [Symbol.asyncIterator](): AsyncIterator<T>;
}
