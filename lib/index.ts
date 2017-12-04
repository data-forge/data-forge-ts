import { ISeries, Series } from './series';

/**
 * Interface that represents an index for a Series.
 */
export interface IIndex extends ISeries {

}



/**
 * Class that represents an index for a Series.
 */
export class Index extends Series implements IIndex {

    constructor(config?: any) {
        super(config);
    }

}
