import * as moment from 'moment';
import * as Sugar from 'sugar';

//
// Various shared utility functions.
//

export function* mapIterable<InT, OutT> (items: Iterable<InT>, mapFn: (item: InT) => OutT): Iterable<OutT> {
    const iterator = items[Symbol.iterator]();
    while (true) {
        let result = iterator.next();
        if (result.done) {
            break;
        }
        yield mapFn(result.value);
    }
}

//
// Helper function to only return distinct items.
//
export function makeDistinct<ItemT, KeyT>(items: Iterable<ItemT>, selector?: (item: ItemT) => KeyT): ItemT[] {
    let set: any = {};
    let output: any[] = [];
    for (const item of items) {
        var key = selector && selector(item) || item;
        if (!set[key]) {
            // Haven't yet seen this key.
            set[key] = true;
            output.push(item);
        }
    }

    return output;
}

//
// Helper function to map an array of objects.
//
export function toMap<InT, KeyT, ValueT>(items: Iterable<InT>, keySelector: (item: InT) => KeyT, valueSelector: (item: InT) => ValueT): any {
    let output: any = {};
    for (const item of items) {
        var key = keySelector(item);
        output[key] = valueSelector(item);
    }
    return output;
}

//
// Helper function to map an array of objects.
//
export function toMap2<InT, KeyT, ValueT>(items: Iterable<InT>, keySelector: (item: InT) => KeyT, valueSelector: (item: InT) => ValueT): Map<KeyT, ValueT> {
    let output = new Map<KeyT, ValueT>();
    for (const item of items) {
        output.set(keySelector(item), valueSelector(item));
    }
    return output;
}

//
// Determine the type of a value.
//
export function determineType (value: any): string {
    if (value === undefined) {
        return "undefined";
    }
    else if (Sugar.Object.isNumber(value)) {
        return "number";
    }
    else if (Sugar.Object.isString(value)) {
        return "string";
    }
    else if (value instanceof Date) {
        return "date";
    }
    else if (moment.isMoment(value)) {
        return "date";
    }
    else if (Sugar.Object.isBoolean(value)) {
        return "boolean";
    }
    else {
        return "unsupported";
    }
}