//
// An iterator to extact an element from an array.
//

export class ExtractElementIterator implements Iterator<any> {

    iterator: Iterator<any[]>;
    extractIndex: number;

    constructor(iterator: Iterator<any[]>, extractIndex: number) {
        this.iterator = iterator;
        this.extractIndex = extractIndex;
    }

    next(): IteratorResult<any> {
        
        var result = this.iterator.next();
        if (result.done) {
            return result;
        }
        else {
            return {
                done: false,
                value: result.value[this.extractIndex]
            };
        }
    }
}