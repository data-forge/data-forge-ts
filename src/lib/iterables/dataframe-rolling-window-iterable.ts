//
// Iterates an underlying iterable in the 'windows'.
//

import { DataFrameRollingWindowIterator } from '../iterators/dataframe-rolling-window-iterator';
import { IDataFrame } from '../dataframe';

export class DataFrameRollingWindowIterable<IndexT, ValueT> implements Iterable<IDataFrame<IndexT, ValueT>> {

    iterable: Iterable<[IndexT, ValueT]>;
    period: number;

    constructor(iterable: Iterable<[IndexT, ValueT]>, period: number) {
        this.iterable = iterable;
        this.period = period;
    }

    [Symbol.iterator](): Iterator<IDataFrame<IndexT, ValueT>> {
        return new DataFrameRollingWindowIterator(this.iterable, this.period);
    }
}