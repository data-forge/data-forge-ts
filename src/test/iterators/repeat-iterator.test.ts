import { expect } from 'chai';
import 'mocha';
import { RepeatIterator } from '../../lib/iterators/repeat-iterator';
import { ArrayIterable } from '../../lib/iterables/array-iterable';

describe('repeat iterator', function () {

    it('iterator for empty array', function () {
        var sampleIterator: Iterable<any> = new ArrayIterable([]);

        var it = new RepeatIterator(sampleIterator, 3);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
    });
    
    it('iterator for array with single element', function () {
        var sampleIterator: Iterable<any> = new ArrayIterable([1]);

        var it = new RepeatIterator(sampleIterator, 3);
        expect(it.next().value).to.eql(1);
        expect(it.next().value).to.eql(1);
        expect(it.next().value).to.eql(1);
        expect(it.next().done).to.eql(true);
    });
    
    it('iterator for array with multiple elements', function () {
        var sampleIterator: Iterable<any> = new ArrayIterable([1, 2, 3]);

        var it = new RepeatIterator(sampleIterator, 2);
        expect(it.next().value).to.eql(1);
        expect(it.next().value).to.eql(1);
        expect(it.next().value).to.eql(2);
        expect(it.next().value).to.eql(2);
        expect(it.next().value).to.eql(3);
        expect(it.next().value).to.eql(3);
        expect(it.next().done).to.eql(true);
    });
    
    it('iterator for array with count 0', function () {
        var sampleIterator: Iterable<any> = new ArrayIterable([1, 2, 3]);

        var it = new RepeatIterator(sampleIterator, 0);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
    });
    
    it('iterator for array with count 1', function () {
        var sampleIterator: Iterable<any> = new ArrayIterable([1, 2, 3]);

        var it = new RepeatIterator(sampleIterator, 1);
        expect(it.next().value).to.eql(1);
        expect(it.next().value).to.eql(2);
        expect(it.next().value).to.eql(3);
        expect(it.next().done).to.eql(true);
	});
})