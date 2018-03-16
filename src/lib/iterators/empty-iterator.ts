//
// An iterator that returns no values.
//

export class EmptyIterator implements Iterator<any> {

    next(): IteratorResult<any> {
        return {
            done: true,
            value: null
        };
    }
}