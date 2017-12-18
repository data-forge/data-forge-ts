//
// An iterator to extact an element from an array.
//

export class ExtractElementIterator implements AsyncIterator<any> {

    iterator: AsyncIterator<any[]>;
    extractIndex: number;

    constructor(iterator: AsyncIterator<any[]>, extractIndex: number) {
        this.iterator = iterator;
        this.extractIndex = extractIndex;
    }

    async next(): Promise<IteratorResult<any>> {

        var result = await this.iterator.next()
        if (result.done) {
            return result;
        }
        else {
            return {
                done: false,
                value: result.value[this.extractIndex]
            };
        };
    }
}