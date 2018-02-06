export declare type SelectorFn = (value: any, index: number) => any;
export declare enum Direction {
    Ascending = 0,
    Descending = 1,
}
export interface ISortSpec {
    sortLevel: number;
    selector: SelectorFn;
    direction: Direction;
}
export declare class OrderedIterable implements Iterable<any> {
    iterable: Iterable<any>;
    sortSpec: ISortSpec[];
    constructor(iterable: Iterable<any>, sortSpec: ISortSpec[]);
    [Symbol.iterator](): Iterator<any>;
}
