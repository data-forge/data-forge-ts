//
// Various shared utility functions.
//

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
export function toMap(items: Iterable<any>, keySelector: (item: any) => any, valueSelector: (item: any) => any): any {
    let output: any = {};
    for (const item of items) {
        var key = keySelector(item);
        output[key] = valueSelector(item);
    }
    return output;
}