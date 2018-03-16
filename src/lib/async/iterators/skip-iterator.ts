//
// An iterator that skips a number of values.
//

export class SkipIterator implements AsyncIterator<any> {

    iterator: AsyncIterator<any>;
    numValues: number;

    constructor(iterator: AsyncIterator<any>, numValues: number) {
        this.iterator = iterator;
        this.numValues = numValues;
    }

    async next(): Promise<IteratorResult<any>> {
        while (--this.numValues >= 0) {
            var result = await this.iterator.next();
            if (result.done) {
                return result;
            }
        }

        return this.iterator.next();
    }
}