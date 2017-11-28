//
// An iterator that simply counts up from zero.
// This creates the default index in Data-Forge.
//

export class CountIterator implements Iterator<number> {

    index: number = 0;

    next(): IteratorResult<number> {
        return {
            done: false,
            value: this.index++
        };
    }

}