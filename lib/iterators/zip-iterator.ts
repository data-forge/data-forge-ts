//
// An iterator that zips together each set of elements in child iterables.
//
import { Series, ISeries } from '../series';

export type ZipFn<ValueT, ReturnT> = (input: ISeries<number, ValueT>) => ReturnT;

export class ZipIterator<ValueT, ReturnT> implements Iterator<ReturnT> {

    iterators: Iterator<ValueT>[];
    zipper: ZipFn<ValueT, ReturnT>;

    constructor(iterables: Iterable<ValueT>[], zipper: ZipFn<ValueT, ReturnT>) {
        this.iterators = iterables.map(iterable => iterable[Symbol.iterator]());
        this.zipper = zipper;
    }

    next(): IteratorResult<ReturnT> {
        const results = this.iterators.map(iterator => iterator.next());
        for (const result of results) {
            if (result.done) {
                // If any are done we are all done.
                // https://github.com/Microsoft/TypeScript/issues/8938
                return ({ done: true } as IteratorResult<ReturnT>)  // <= explicit cast here!;                
            }
        }

        const zippedValues = results.map(result => result.value);
        const zipperInput = new Series<number, ValueT>(zippedValues);
        return {
            done: false,
            value: this.zipper(zipperInput)
        };
    }
}