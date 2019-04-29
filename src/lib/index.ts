import { ISeries, Series, SeriesConfigFn } from './series';
// @ts-ignore
import moment from "dayjs/esm";
import { determineType } from './utils';

/**
 * A predicate function for testing a value against another.
 */
export type PredicateFn = (value: any, against: any) => boolean;

/**
 * Interface that represents an index for a Series.
 */
export interface IIndex<IndexT> extends ISeries<number, IndexT> {

    /**
     * Get the type of the index.
     * 
     * @returns Returns a string that specifies the type of the index.
     */
    getType (): string;

    /**
     * Get the less than operation for the index.
     * 
     * @returns Returns a function that can be used to compare a value against an index value.
     */
    getLessThan (): PredicateFn;

    /**
     * Get the less than or equal to operation for the index.
     * 
     * @returns Returns a function that can be used to compare a value against an index value.
     */
    getLessThanOrEqualTo (): PredicateFn;

    /**
     * Get the greater than operation for the index.
     * 
     * @returns Returns a function that can be used to compare a value against an index value.
     */
    getGreaterThan (): PredicateFn;
    
}

/**
 * Class that represents an index for a Series.
 */
export class Index<IndexT> extends Series<number, IndexT> implements IIndex<IndexT> {

    //
    // Records the type of the index.
    //
    private _type?: string;

    constructor(config?: any | SeriesConfigFn<number, IndexT>) {
        super(config);
    }

    /**
     * Get the type of the index.
     * 
     * @returns Returns a string that specifies the type of the index.
     */
    getType (): string {

        if (!this._type) {
            //
            // Detect the type.
            //
            if (this.any()) {
                this._type = determineType(this.first());
            }
            else {
                this._type = 'empty';
            }
        }

        return this._type;
    };

    /**
     * Get the less than operation for the index.
     * 
     * @returns Returns a function that can be used to compare a value against an index value.
     */
    getLessThan (): PredicateFn {

        switch (this.getType()) {
            case "date":
                return (d1: Date, d2: Date) => moment(d1).isBefore(d2);

            case "string":
            case "number":
                return (v1: any, v2: any) => v1 < v2;

            case "empty":
                return () => true; // Series is empty, so this makes no difference.

            default:
                throw new Error("No less than operation available for type: " + this.getType());
        }
    };

    /**
     * Get the less than or equal to operation for the index.
     * 
     * @returns Returns a function that can be used to compare a value against an index value.
     */
    getLessThanOrEqualTo (): PredicateFn {
        return (v1: any, v2: any) => !this.getGreaterThan()(v1, v2); //TODO: Should expand  this out.
    }
    
    /**
     * Get the greater than operation for the index.
     * 
     * @returns Returns a function that can be used to compare a value against an index value.
     */
    getGreaterThan (): PredicateFn {

        switch (this.getType()) {
            case "date":
                return (d1: Date, d2: Date) => moment(d1).isAfter(d2);

            case "string":
            case "number":
                return (v1: any, v2: any) => v1 > v2;

            case "empty":
                return () => true; // Series is empty, so this makes no difference.

            default:
                throw new Error("No greater than operation available for type: " + this.getType());
        }
    };

}
