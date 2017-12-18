//
// An iterator that returns no values.
//

export class EmptyIterator implements AsyncIterator<any> {

    async next(): Promise<IteratorResult<any>> {
        return {
            done: true,
            value: null
        };
    }
}