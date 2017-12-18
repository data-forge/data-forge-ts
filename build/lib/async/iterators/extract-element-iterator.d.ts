export declare class ExtractElementIterator implements AsyncIterator<any> {
    iterator: AsyncIterator<any[]>;
    extractIndex: number;
    constructor(iterator: AsyncIterator<any[]>, extractIndex: number);
    next(): Promise<IteratorResult<any>>;
}
