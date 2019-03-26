//
// Iterates an underlying iterable in the 'windows'.
//

import { TakeIterable } from '../iterables/take-iterable';
import { SkipIterable } from '../iterables/skip-iterable';
import { DataFrame, IDataFrame } from '../dataframe';

export class DataFrameWindowIterator<IndexT, ValueT> implements Iterator<IDataFrame<IndexT, ValueT>> {

    columnNames: Iterable<string>;
    iterable: Iterable<[IndexT, ValueT]>;
    iterator: Iterator<[IndexT, ValueT]> | undefined;
    period: number;
    
    constructor(columnNames: Iterable<string>, iterable: Iterable<[IndexT, ValueT]>, period: number) {
        this.columnNames = columnNames;
        this.iterable = iterable;
        this.period = period;
    }

    next(): IteratorResult<IDataFrame<IndexT, ValueT>> {

        if (!this.iterator) {
            this.iterator = this.iterable[Symbol.iterator]();
        }
        
        const curWindow = [];

        for (let i = 0; i < this.period; ++i) {
            const curPos = this.iterator.next();
            if (curPos.done) {
                // Underlying iterator is finished.
                break;
            }
            curWindow.push(curPos.value);
        }

        if (curWindow.length === 0) {
            // Underlying iterator doesn't have required number of elements.
            return ({ done: true } as IteratorResult<IDataFrame<IndexT, ValueT>>);
        }
    
        const window = new DataFrame<IndexT, ValueT>({
            columnNames: this.columnNames,
            pairs: curWindow
        });

        return {
            value: window,
            done: false,
        };
    }
}