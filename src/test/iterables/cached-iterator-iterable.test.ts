import { assert, expect } from 'chai';
import 'mocha';
import { CachedIteratorIterable } from '../../lib/iterables/cached-iterator-iterable';

describe('cached iterator iterable', function () {

    function flattenIterable<T> (iterable: Iterable<T>): T[] {
        const output: any[] = [];
        for (const value of iterable) {
            output.push(value);
        }
        return output;
    }

	it('empty generator is empty output', function () {

        function* values(): IterableIterator<any> {
        }

        expect(flattenIterable(new CachedIteratorIterable(values()))).to.eql([]);
    });

	it('can iterate iterable multiple times', function () {

        function* values(): IterableIterator<any> {
            yield 1;
            yield 2;
        }

        const iterable = new CachedIteratorIterable(values());
        expect(flattenIterable(iterable)).to.eql([1,  2]);
        expect(flattenIterable(iterable)).to.eql([1,  2]);
    });
});



