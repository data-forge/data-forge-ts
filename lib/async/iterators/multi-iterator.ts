//
// An iterator that can iterate multiple other iterators at once.
// This allows iterators to be composed.
// This is used in Data-Forge to combine iterators for index and values.
//

export class MultiIterator implements AsyncIterator<any[]> {

    iterators: AsyncIterator<any>[];

    constructor(iterators: AsyncIterator<any>[]) {
        this.iterators = iterators;
    }

    async next(): Promise<IteratorResult<any[]>> {

        if (this.iterators.length === 0) {
            return Promise.resolve({
                done: true,
                value: [],
            });
        }

        var multiResult = [];

        for (const iterator of this.iterators) {
            var result = await iterator.next();
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