//
// An iterable that iterates the elements of an array.
//

import { ArrayIterator } from '../iterators/array-iterator';

export class ArrayIterable<T> implements AsyncIterable<T> {

    arr: T[];

    constructor(arr: T[]) {
        this.arr = arr;
    }

    [Symbol.asyncIterator](): AsyncIterator<any> {
        return new ArrayIterator(this.arr);
    }
}