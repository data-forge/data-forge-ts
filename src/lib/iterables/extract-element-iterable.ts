//
// An iterable to extact an element from an array.
//

import { ExtractElementIterator } from '../iterators/extract-element-iterator';

export class ExtractElementIterable implements Iterable<any> {

    arrayIterable: Iterable<any[]>;
    extractIndex: number;

    constructor(arrayIterable: Iterable<any[]>, extractIndex: number) {
        this.arrayIterable = arrayIterable;
        this.extractIndex = extractIndex;
    }

    [Symbol.iterator](): Iterator<any> {
        var arrayIterator = this.arrayIterable[Symbol.iterator]();
        return new ExtractElementIterator(arrayIterator, this.extractIndex);
    }
}