import { SelectorFn } from '../iterators/select-iterator';
export declare class SelectIterable implements Iterable<any> {
    iterable: Iterable<any>;
    selector: SelectorFn;
    constructor(iterable: Iterable<any>, selector: SelectorFn);
    [Symbol.iterator](): Iterator<any>;
}
