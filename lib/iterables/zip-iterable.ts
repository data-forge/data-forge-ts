//
// An iterable that zips together each set of elements in child iterables.
//

import { ZipIterator, ZipFn } from '../iterators/zip-iterator';

export class ZipIterable<ValueT, ReturnT> implements Iterable<ReturnT> {

    iterables: Iterable<ValueT>[];
    zipper: ZipFn<ValueT, ReturnT>;

    constructor(iterables: Iterable<ValueT>[], zipper: ZipFn<ValueT, ReturnT>) {
        this.iterables = iterables;
        this.zipper = zipper;
    }

    [Symbol.iterator](): Iterator<ReturnT> {
        return new ZipIterator<ValueT, ReturnT>(this.iterables, this.zipper);
    }
}