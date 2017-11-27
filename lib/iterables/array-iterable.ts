
import { ArrayIterator } from '../iterators/array-iterator';

export class ArrayIterable<T> implements Iterable<T> {

    arr: T[];

    constructor(arr: T[]) {
        this.arr = arr;
    }

    [Symbol.iterator](): Iterator<any> {
        return new ArrayIterator(this.arr);
    }
}