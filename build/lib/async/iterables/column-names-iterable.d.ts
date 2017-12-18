export declare class ColumnNamesIterable implements AsyncIterable<string> {
    values: AsyncIterable<any>;
    constructor(values: AsyncIterable<any>);
    [Symbol.asyncIterator](): AsyncIterator<string>;
}
