//
// An iterable that simply counts up from zero.
// This creates the default index in Data-Forge.
//

import { CountIterator } from '../iterators/count-iterator';

export class CountIterable implements Iterable<any> {

    [Symbol.iterator](): Iterator<any> {
        return new CountIterator();
    }
}