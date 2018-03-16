//
// An iterator that can iterate multiple other iterators at once.
// This allows iterators to be composed.
// This is used in Data-Forge to combine iterators for index and values.
//

export class MultiIterator implements Iterator<any[]> {

    iterators: Iterator<any>[];

    constructor(iterators: Iterator<any>[]) {
        this.iterators = iterators;
    }

    next(): IteratorResult<any[]> {

        if (this.iterators.length === 0) {
            return {
                done: true,
                value: [],
            };
        }

        var multiResult = [];

        for (const iterator of this.iterators) {
            var result = iterator.next();
            if (result.done) {
                return { 
                    done: true,
                    value: [],
                };
            }

            multiResult.push(result.value);
        }

        return {
            done: false,
            value: multiResult
        };
    }

}