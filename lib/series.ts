import { ArrayIterable }  from './iterables/array-iterable';
import { IDataFrame } from './dataframe';
import * as Sugar from 'sugar';

export interface ISeries extends Iterable<any> {

    toArray (): any[];

}

export class Series implements ISeries {

    values: Iterable<any>; // Pair iterable.

    constructor(config?: any) {
        if (config) {
            if (Sugar.Object.isArray(config)) {
                this.values = new ArrayIterable(config);
            }
            else if (config.values && Sugar.Object.isArray(config.values)) {
                this.values = new ArrayIterable(config.values);
            }
        }
        else {
            this.values = new ArrayIterable([]);
        }
    }

    [Symbol.iterator](): Iterator<any> {
        return this.values[Symbol.iterator](); //todo: this needs to extract pairs.
    }

    /*
    * Extract values from the series as an array.
    * This forces lazy evaluation to complete.
    * 
    * @returns {array} Returns an array of values contained within the series. 
    */
    toArray (): any[] {
        var values = [];
        for (const value of this) {
            values.push(value);
        }
        return values;
    }

}
