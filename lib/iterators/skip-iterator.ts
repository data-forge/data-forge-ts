//
// An iterator that skips a number of values.
//

export class SkipIterator implements Iterator<any> {

    iterator: Iterator<any>;
    numValues: number;

    constructor(iterator: Iterator<any>, numValues: number) {
        this.iterator = iterator;
        this.numValues = numValues;
    }

    next(): IteratorResult<any> {
        while (--this.numValues >= 0) {
            var result = this.iterator.next();
            if (result.done) {
                return result;
            }
        }

        return this.iterator.next();
    }
}