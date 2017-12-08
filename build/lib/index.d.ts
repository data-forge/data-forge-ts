import { ISeries, Series } from './series';
/**
 * Interface that represents an index for a Series.
 */
export interface IIndex<IndexT> extends ISeries<number, IndexT> {
}
/**
 * Class that represents an index for a Series.
 */
export declare class Index<IndexT> extends Series<number, IndexT> implements IIndex<IndexT> {
    constructor(config?: any);
}
