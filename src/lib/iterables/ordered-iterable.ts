//
// An iterable that sorts it's input before iterating it.
//

import { ArrayIterator } from '../iterators/array-iterator';

export type SelectorFn = (value: any, index: number) => any;

export enum Direction {
    Ascending,
    Descending
}

export interface ISortSpec {
    sortLevel: number; // Debug helper. Sort level 0 is the first level.
    selector: SelectorFn;
    direction: Direction,
}

class SortOperation {

    values: any[];
    sortSpec: ISortSpec;
    keys: any[];

    constructor(values: any[], sortSpec: ISortSpec) {
        this.values = values;
        this.sortSpec = sortSpec;
        this.keys = [];
    }

    genKeys (): void {
        if (this.keys.length > 0) {
            // Already cached.
            return;
        }
        
        const index = 0;
        for (const value of this.values) {
            this.keys.push(this.sortSpec.selector(value, index));
        }        
    }

    compare (indexA: number, indexB: number): number {
        this.genKeys();

        const keyA = this.keys[indexA];
        const keyB = this.keys[indexB];
        let comparison = -1;
        if (keyA === keyB) {
            comparison = 0;
        }
        else if (keyA > keyB) {
            comparison = 1;
        }

        return (this.sortSpec.direction === Direction.Descending) ? -comparison : comparison;
    }
}

export class OrderedIterable implements Iterable<any> {

    //TODO: Would probably be good to cache the sorted data here.

    iterable: Iterable<any>;
    sortSpec: ISortSpec[];

    constructor(iterable: Iterable<any>, sortSpec: ISortSpec[]) {
        this.iterable = iterable;
        this.sortSpec = sortSpec;
    }

    [Symbol.iterator](): Iterator<any> {

        const indexes: number[] = [];
        const values: any[] = [];

        let index = 0;
        for (const value of this.iterable) {
            indexes.push(index);
            values.push(value);
            ++index;
        }

        const sortOperations: SortOperation[] = [];
        for (const sortSpec of this.sortSpec) {
            sortOperations.push(new SortOperation(values, sortSpec));
        }

        sortOperations[0].genKeys();

        indexes.sort((indexA: number, indexB: number): number => {
            for (const sortOperation of sortOperations) {
                const comparison = sortOperation.compare(indexA, indexB);
                if (comparison !== 0) {
                    return comparison;
                }
            }

            return 0;
        });

        const sortedValues: any[] = [];

        for (const index of indexes) {
            sortedValues.push(values[index]);
        }        

        return new ArrayIterator(sortedValues);
    }
}