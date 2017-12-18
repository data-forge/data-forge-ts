export interface IStream {
    getColumnNames(): Promise<string[]>;
    read(): Promise<IteratorResult<any>>;
}
