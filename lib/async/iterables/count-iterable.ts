//
// An iterable that simply counts up from zero.
// This creates the default index in Data-Forge.
//

import { CountIterator } from '../iterators/count-iterator';

export class CountIterable implements AsyncIterable<any> {

    [Symbol.asyncIterator](): AsyncIterator<any> {
        return new CountIterator();
    }
}