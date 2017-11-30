import { ArrayIterable }  from './iterables/array-iterable';
import { CountIterable }  from './iterables/count-iterable';
import { MultiIterable }  from './iterables/multi-iterable';
import * as Sugar from 'sugar';

/**
 * Interface that represents an index for a Series.
 */
export interface IIndex extends ISeries {

}

/**
 * Interface that represents a series of indexed values.
 */
export interface ISeries extends Iterable<any> {

    /**
     * Get an iterator to enumerate the values of the series.
     */
    [Symbol.iterator](): Iterator<any>;

    /**
     * Get the index for the series.
     */
    getIndex (): IIndex;

    /**
    * Extract values from the series as an array.
    * This forces lazy evaluation to complete.
    * 
    * @returns Returns an array of values contained within the series. 
    */
    toArray (): any[];

    /**
     * Retreive the index and values from the Series as an array of pairs.
     * Each pairs is [index, value].
     * 
     * @returns Returns an array of pairs that contains the series content. Each pair is a two element array that contains an index and a value.  
     */
    toPairs (): (any[])[];
}

/**
 * Class that represents a series of indexed values.
 */
export class Series implements ISeries {

    private index: Iterable<any>
    private values: Iterable<any>;
    private pairs: Iterable<any>;

    //
    // Initialise this Series from an array.
    //
    private initFromArray(arr: any[]): void {
        this.index = new CountIterable();
        this.values = new ArrayIterable(arr);
        this.pairs = new MultiIterable([this.index, this.values]);
    }

    private initIterable(input: any, fieldName: string): Iterable<any> {
        if (Sugar.Object.isArray(input)) {
            return new ArrayIterable(input);
        }
        else if (Sugar.Object.isFunction(input[Symbol.iterator])) {
            // Assume it's an iterable.
            return input;
        }
        else {
            throw new Error("Expected '" + fieldName + "' field of Series config object to be an array of values or an iterable of values.");
        }
    };

    //
    // Initialise the Series from a config object.
    //
    private initFromConfig(config: any): void {
        if (config.index) {
            this.index = this.initIterable(config.index, 'index');
        }
        else {
            this.index = new CountIterable();
        }

        if (config.values) {
            this.values = this.initIterable(config.values, 'values');
        }
        else {
            this.values = new ArrayIterable([]);
        }

        this.pairs = new MultiIterable([this.index, this.values]);
    }

    /**
     * Create a series.
     * 
     * @param config Defines the values and index for the new series.
     */
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

    /**
     * Get an iterator to enumerate the values of the series.
     */
    [Symbol.iterator](): Iterator<any> {
        return this.values[Symbol.iterator]();
    }

    /**
     * Get the index for the series.
     */
    getIndex (): IIndex {
        return new Index({ values: this.index });
    }

    /**
    * Extract values from the series as an array.
    * This forces lazy evaluation to complete.
    * 
    * @returns Returns an array of values contained within the series. 
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
     * @returns Returns an array of pairs that contains the series content. Each pair is a two element array that contains an index and a value.  
     */
    toPairs (): (any[])[] {
        var pairs = [];
        for (const pair of this.pairs) {
            pairs.push(pair);
        }
        return pairs;
    }

}

/**
 * Class that represents an index for a Series.
 */
export class Index extends Series implements IIndex {

    constructor(config?: any) {
        super(config);
    }

}
