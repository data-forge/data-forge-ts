//
// An iterator that produces a contiguous flattened array generated from each set of elements in child iterables.
// Implementation similar to https://docs.scipy.org/doc/numpy/reference/generated/numpy.ravel.html with order 'C'
//
// Note that numpy does not work with arrays of varying lengths. However, the dataforge implementation ignores
// that requirement due to the iterator architecture. Moreover, since the RavelIterator is only used internally
// such cases will not occur.
//

export class RavelIterator<T> implements Iterator<T> {

    iterators: Iterator<T>[];
    iteratorIndex = 0;

    constructor(iterables: Iterable<T>[]) {
        this.iterators = iterables.map(iterable => iterable[Symbol.iterator]());
    }

    next(): IteratorResult<T> {

        if (this.iterators.length > 0) {
            let result = this.iterators[this.iteratorIndex].next();

            while (result.done) {
                this.iteratorIndex += 1;
    
                if (this.iteratorIndex < this.iterators.length) {
                    result = this.iterators[this.iteratorIndex].next();
                }
                else {
                    // https://github.com/Microsoft/TypeScript/issues/8938
                    return ({ done: true } as IteratorResult<T>); // <= explicit cast here!;
                }
            }
    
            return {
                done: false,
                value: result.value,
            };
        }
        
        // Return done if empty array passed
        return ({ done: true } as IteratorResult<T>);
    }

}