export declare class ExtractElementIterable implements AsyncIterable<any> {
    arrayIterable: AsyncIterable<any[]>;
    extractIndex: number;
    constructor(arrayIterable: AsyncIterable<any[]>, extractIndex: number);
    [Symbol.asyncIterator](): AsyncIterator<any>;
}
