//
// An iterable to extact an element from an array.
//

import { ExtractElementIterator } from '../iterators/extract-element-iterator';

export class ExtractElementIterable implements AsyncIterable<any> {

    arrayIterable: AsyncIterable<any[]>;
    extractIndex: number;

    constructor(arrayIterable: AsyncIterable<any[]>, extractIndex: number) {
        this.arrayIterable = arrayIterable;
        this.extractIndex = extractIndex;
    }

    [Symbol.asyncIterator](): AsyncIterator<any> {
        var arrayIterator = this.arrayIterable[Symbol.asyncIterator]();
        return new ExtractElementIterator(arrayIterator, this.extractIndex);
    }
}