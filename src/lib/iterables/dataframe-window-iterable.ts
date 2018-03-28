//
// Iterates an underlying iterable in the 'windows'.
//

import { DataFrameWindowIterator } from '../iterators/dataframe-window-iterator';
import { IDataFrame } from '../dataframe';

export class DataFrameWindowIterable<IndexT, ValueT> implements Iterable<IDataFrame<IndexT, ValueT>> {

    iterable: Iterable<[IndexT, ValueT]>;
    period: number;

    constructor(iterable: Iterable<[IndexT, ValueT]>, period: number) {
        this.iterable = iterable;
        this.period = period;
    }

    [Symbol.iterator](): Iterator<IDataFrame<IndexT, ValueT>> {
        return new DataFrameWindowIterator(this.iterable, this.period);
    }
}