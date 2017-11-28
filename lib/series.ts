import { ArrayIterable }  from './iterables/array-iterable';
import { CountIterable }  from './iterables/count-iterable';
import { MultiIterable }  from './iterables/multi-iterable';
import { IDataFrame } from './dataframe';
import * as Sugar from 'sugar';

export interface ISeries extends Iterable<any> {

    /*
    * Extract values from the series as an array.
    * This forces lazy evaluation to complete.
    * 
    * @returns {array} Returns an array of values contained within the series. 
    */
    toArray (): any[];

    /**
     * Retreive the index and values from the Series as an array of pairs.
     * Each pairs is [index, value].
     * 
     * @returns {array} Returns an array of pairs that contains the series content. Each pair is a two element array that contains an index and a value.  
     */
    toPairs (): (any[])[];
}

export class Series implements ISeries {

    index: Iterable<any>
    values: Iterable<any>;
    pairs: Iterable<any>;

    //
    // Initialise this Series from an array.
    //
    private initFromArray(arr: any[]): void {
        this.index = new CountIterable();
        this.values = new ArrayIterable(arr);
        this.pairs = new MultiIterable([this.index, this.values]);
    }

    //
    // Initialise the Series from a config object.
    //
    private initFromConfig(config: any): void {
        if (config.index && Sugar.Object.isArray(config.index)) {
            this.index = new ArrayIterable(config.index);
        }
        else {
            this.index = new CountIterable();
        }

        if (config.values && Sugar.Object.isArray(config.values)) {
            this.values = new ArrayIterable(config.values);
        }
        else {
            this.values = new ArrayIterable([]);
        }

        this.pairs = new MultiIterable([this.index, this.values]);
    }

    constructor(config?: any) {
        if (config) {
            if (Sugar.Object.isArray(config)) {
                this.initFromArray(config);
            }
            else {
                this.initFromConfig(config);
            }
        }
        else {
            this.initFromArray([]);
        }
    }

    [Symbol.iterator](): Iterator<any> {
        return this.values[Symbol.iterator]();
    }

    /*
    * Extract values from the series as an array.
    * This forces lazy evaluation to complete.
    * 
    * @returns {array} Returns an array of values contained within the series. 
    */
    toArray (): any[] {
        var values = [];
        for (const value of this.values) {
            values.push(value);
        }
        return values;
    }

    /**
     * Retreive the index and values from the Series as an array of pairs.
     * Each pairs is [index, value].
     * 
     * @returns {array} Returns an array of pairs that contains the series content. Each pair is a two element array that contains an index and a value.  
     */
    toPairs (): (any[])[] {
        var pairs = [];
        for (const pair of this.pairs) {
            pairs.push(pair);
        }
        return pairs;
    }

}
