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