//
// An iterable that returns no values.
//

import { EmptyIterator } from '../iterators/empty-iterator';

export class EmptyIterable implements Iterable<any> {

    [Symbol.iterator](): Iterator<any> {
        return new EmptyIterator();
    }
}