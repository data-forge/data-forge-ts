export declare class ExtractElementIterator implements Iterator<any> {
    iterator: Iterator<any[]>;
    extractIndex: number;
    constructor(iterator: Iterator<any[]>, extractIndex: number);
    next(): IteratorResult<any>;
}
