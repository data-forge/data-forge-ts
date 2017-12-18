//
// An iterator that simply counts up from zero.
// This creates the default index in Data-Forge.
//

export class CountIterator implements AsyncIterator<number> {

    index: number = 0;

    async next(): Promise<IteratorResult<number>> {
        return {
            done: false,
            value: this.index++
        };
    }

}