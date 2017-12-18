export declare class ColumnNamesIterator implements AsyncIterator<string> {
    columnNamesIterator: AsyncIterator<string> | null;
    values: AsyncIterable<any>;
    constructor(values: AsyncIterable<any>);
    next(): Promise<IteratorResult<string>>;
}
