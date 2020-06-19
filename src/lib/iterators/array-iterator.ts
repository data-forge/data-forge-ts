//
// An iterator that iterates the elements of an array.
//

export class ArrayIterator<T> implements Iterator<T> {

    arr: T[];

    index = 0;

    constructor(arr: T[]) {
        this.arr = arr;
    }

    next(): IteratorResult<T> {
        if (this.index < this.arr.length) {
            return {
                done: false, 
                value: this.arr[this.index++],
            };
        }
        else {
            // https://github.com/Microsoft/TypeScript/issues/8938
            return ({ done: true } as IteratorResult<T>)  // <= explicit cast here!;
        }
    }

}