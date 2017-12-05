export declare class ExtractElementIterable implements Iterable<any> {
    arrayIterable: Iterable<any[]>;
    extractIndex: number;
    constructor(arrayIterable: Iterable<any[]>, extractIndex: number);
    [Symbol.iterator](): Iterator<any>;
}
