//
// An iterator that applies a selector function to each item.
//

export type SelectorFn<ValueT, ToT> = (value: ValueT, index: number) => Iterable<ToT>;

export class SelectManyIterator<ValueT, ToT> implements Iterator<ToT> {

    iterator: Iterator<ValueT>;
    outputIterator: Iterator<ToT> | null;
    selector: SelectorFn<ValueT, ToT>;
    index: number = 0;

    constructor(iterator: Iterator<ValueT>, selector: SelectorFn<ValueT, ToT>) {
        this.iterator = iterator;
        this.selector = selector;
        this.outputIterator = null;
    }

    next(): IteratorResult<ToT> {     
        while (true) {
            if (this.outputIterator === null) {
                var result = this.iterator.next();
                if (result.done) {
                    // https://github.com/Microsoft/TypeScript/issues/8938
                    return ({ done: true } as IteratorResult<ToT>)  // <= explicit cast here!;
                }

                let outputIterable = this.selector(result.value, this.index++);
                this.outputIterator = outputIterable[Symbol.iterator]();
            }

            var outputResult = this.outputIterator!.next();
            if (outputResult.done) {
                this.outputIterator = null;
                continue;
            }
            else {
                return outputResult;
            }
        }   
    }
}