//
// Iterates an underlying iterable in the 'windows'.
//

import { TakeIterable } from '../iterables/take-iterable';
import { SkipIterable } from '../iterables/skip-iterable';
import { DataFrame, IDataFrame } from '../dataframe';

export class DataFrameRollingWindowIterator<IndexT, ValueT> implements Iterator<IDataFrame<IndexT, ValueT>> {

    columnNames: Iterable<string>;
    iterable: Iterable<[IndexT, ValueT]>;
    iterator: Iterator<[IndexT, ValueT]> | undefined;
    period: number;
    curWindow: [IndexT, ValueT][] | undefined; 
    
    constructor(columnNames: Iterable<string>, iterable: Iterable<[IndexT, ValueT]>, period: number) {
        this.columnNames = columnNames;
        this.iterable = iterable;
        this.period = period;
    }

    next(): IteratorResult<IDataFrame<IndexT, ValueT>> {

        if (!this.curWindow) {
            this.curWindow = [];
            this.iterator = this.iterable[Symbol.iterator]();
            for (let i = 0; i < this.period; ++i) {
                const curPos = this.iterator.next();
                if (curPos.done) {
                    // Underlying iterator doesn't have required number of elements.
                    return ({ done: true } as IteratorResult<IDataFrame<IndexT, ValueT>>);
                }
                this.curWindow.push(curPos.value);
            }
        }
        else {
            this.curWindow.shift(); // Remove first item from window.
            
            const curPos = this.iterator!.next();
            if (curPos.done) {
                // Underlying iterator doesn't have enough elements left.
                return ({ done: true } as IteratorResult<IDataFrame<IndexT, ValueT>>);
            }

            this.curWindow.push(curPos.value); // Add next item to window.
        }

        const window = new DataFrame<IndexT, ValueT>({
            columnNames: this.columnNames,
            pairs: this.curWindow
        });

        return {
            value: window,
            done: false,
        };
    }
}