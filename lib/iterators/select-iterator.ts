//
// An iterator that applies a selector function to each item.
//

export type SelectorFn = (value: any, index: number) => any;

export class SelectIterator implements Iterator<any> {

    iterator: Iterator<any>;
    selector: SelectorFn;
    index: number = 0;

    constructor(iterator: Iterator<any>, selector: SelectorFn) {
        this.iterator = iterator;
        this.selector = selector;
    }

    next(): IteratorResult<any> {
        var result = this.iterator.next();
        if (result.done) {
            return result;
        }

        return {
            done: false,
            value: this.selector(result.value, this.index++)
        };
    }
}