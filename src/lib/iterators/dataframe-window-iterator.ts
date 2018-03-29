//
// Iterates an underlying iterable in the 'windows'.
//

import { TakeIterable } from '../iterables/take-iterable';
import { SkipIterable } from '../iterables/skip-iterable';
import { DataFrame, IDataFrame } from '../dataframe';

export class DataFrameWindowIterator<IndexT, ValueT> implements Iterator<IDataFrame<IndexT, ValueT>> {

    columnNames: Iterable<string>;
    iterable: Iterable<[IndexT, ValueT]>;
    period: number;
    windowIndex: number = 0;
    
    constructor(columnNames: Iterable<string>, iterable: Iterable<[IndexT, ValueT]>, period: number) {
        this.columnNames = columnNames;
        this.iterable = iterable;
        this.period = period;
    }

    next(): IteratorResult<IDataFrame<IndexT, ValueT>> {

        const window = new DataFrame<IndexT, ValueT>({
            columnNames: this.columnNames,
            pairs: new TakeIterable(
                new SkipIterable(
                    this.iterable,
                    this.windowIndex++ * this.period
                ),
                this.period
            )
        });

        if (window.none()) {
            // Nothing more to read from the underlying iterable.
            // https://github.com/Microsoft/TypeScript/issues/8938
            return ({ done: true } as IteratorResult<IDataFrame<IndexT, ValueT>>)  // <= explicit cast here!;
        }

        return {
            value: window,
            done: false,
        };
    }
}