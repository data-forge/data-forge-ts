import { ArrayIterable }  from './iterables/array-iterable';

export interface ISeries extends Iterable<any> {

    asPairs(): ISeries;

    asValues(): ISeries;
}

export class Series implements ISeries {

    values: Iterable<any>;

    constructor(config?: any) {
        if (config) { //todo: if is array!
            this.values = new ArrayIterable(config); //todo: need to include the index!
        }        
    }

    [Symbol.iterator](): Iterator<any> {
        return this.values[Symbol.iterator]();
    }

    asPairs(): ISeries {
        throw "todo";
    }

    asValues(): ISeries {
        throw "todo";
    }
}
