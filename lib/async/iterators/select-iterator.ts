//
// An iterator that applies a selector function to each item.
//

export type SelectorFn<ValueT, ToT> = (value: ValueT, index: number) => ToT;

export class SelectIterator<ValueT, ToT> implements AsyncIterator<ToT> {

    iterator: AsyncIterator<ValueT>;
    selector: SelectorFn<ValueT, ToT>;
    index: number = 0;

    constructor(iterator: AsyncIterator<ValueT>, selector: SelectorFn<ValueT, ToT>) {
        this.iterator = iterator;
        this.selector = selector;
    }

    async next(): Promise<IteratorResult<ToT>> {
        var result = await this.iterator.next();
        if (result.done) {
            // https://github.com/Microsoft/TypeScript/issues/8938
            return ({ done: true } as IteratorResult<ToT>)  // <= explicit cast here!;
        }

        return {
            done: false,
            value: this.selector(result.value, this.index++)
        };
    }
}