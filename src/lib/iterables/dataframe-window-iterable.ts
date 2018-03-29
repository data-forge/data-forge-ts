//
// Iterates an underlying iterable in the 'windows'.
//

import { DataFrameWindowIterator } from '../iterators/dataframe-window-iterator';
import { IDataFrame } from '../dataframe';

export class DataFrameWindowIterable<IndexT, ValueT> implements Iterable<IDataFrame<IndexT, ValueT>> {

    columnNames: Iterable<string>;
    iterable: Iterable<[IndexT, ValueT]>;
    period: number;

    constructor(columnNames: Iterable<string>, iterable: Iterable<[IndexT, ValueT]>, period: number) {
        this.columnNames = columnNames;
        this.iterable = iterable;
        this.period = period;
    }

    [Symbol.iterator](): Iterator<IDataFrame<IndexT, ValueT>> {
        return new DataFrameWindowIterator(this.columnNames, this.iterable, this.period);
    }
}