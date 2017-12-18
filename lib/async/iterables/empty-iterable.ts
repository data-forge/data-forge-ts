//
// An iterable that returns no values.
//

import { EmptyIterator } from '../iterators/empty-iterator';

export class EmptyIterable implements AsyncIterable<any> {

    [Symbol.asyncIterator](): AsyncIterator<any> {
        return new EmptyIterator();
    }
}