import { IAsyncSeries, AsyncSeries } from './async-series';

/**
 * Interface that represents an index for a Series.
 */
export interface IAsyncIndex<IndexT> extends IAsyncSeries<number, IndexT> {

}

/**
 * Class that represents an index for a Series.
 */
export class AsyncIndex<IndexT> extends AsyncSeries<number, IndexT> implements IAsyncIndex<IndexT> {

    constructor(config?: any) {
        super(config);
    }
}
