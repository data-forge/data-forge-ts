import { ArrayIterator }  from './iterators/array-iterator';

export interface ISeries extends Iterable<any> {

    [Symbol.iterator](): any;

}

export class Series implements ISeries {

    values: any[];

    constructor(config?: any) {
        if (config) {
            this.values = config as any[];
        }        
    }

    [Symbol.iterator](): Iterator<any> {
        return new ArrayIterator(this.values);
    }
}
