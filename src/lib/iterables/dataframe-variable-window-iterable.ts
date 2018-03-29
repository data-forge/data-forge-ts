//
// Iterates an underlying iterable in the 'windows'.
//

import { DataFrameVariableWindowIterator, ComparerFn } from '../iterators/dataframe-variable-window-iterator';
import { IDataFrame } from '../dataframe';

export class DataFrameVariableWindowIterable<IndexT, ValueT> implements Iterable<IDataFrame<IndexT, ValueT>> {

    columnNames: Iterable<string>;
    iterable: Iterable<[IndexT, ValueT]>;
    comparer: ComparerFn<ValueT>;

    constructor(columnNames: Iterable<string>, iterable: Iterable<[IndexT, ValueT]>, comparer: ComparerFn<ValueT>) {
        this.columnNames = columnNames;
        this.iterable = iterable;
        this.comparer = comparer;
    }

    [Symbol.iterator](): Iterator<IDataFrame<IndexT, ValueT>> {
        return new DataFrameVariableWindowIterator(this.columnNames, this.iterable, this.comparer);
    }
}