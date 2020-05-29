import { expect } from 'chai';
import 'mocha';
import { RavelIterator } from '../../lib/iterators/ravel-iterator';
import { ArrayIterable } from '../../lib/iterables/array-iterable';

describe('ravel iterator', function () {

    it('iterator with empty array passed', function () {

        var it = new RavelIterator([]);
        expect(it.next().done).to.eql(true);
    });

    it('iterator for empty array', function () {

        var sampleIterator: Iterable<any> = new ArrayIterable([]);
        var it = new RavelIterator([sampleIterator]);
        expect(it.next().done).to.eql(true);
    });

    it('iterator for multiple empty arrays', function () {

        var sampleIterator: Iterable<any> = new ArrayIterable([]);
        var sampleIterator2: Iterable<any> = new ArrayIterable([]);
        var it = new RavelIterator([sampleIterator, sampleIterator2]);
        expect(it.next().done).to.eql(true);
    });
    
    it('iterator for single array with single element', function () {

        var sampleIterator: Iterable<any> = new ArrayIterable([1]);
        var it = new RavelIterator([sampleIterator]);
        expect(it.next().value).to.eql(1);
        expect(it.next().done).to.eql(true);
    });
    
    it('iterator for single array with multiple elements', function () {

        var sampleIterator: Iterable<any> = new ArrayIterable([1, 2, 3]);
        var it = new RavelIterator([sampleIterator]);
        expect(it.next().value).to.eql(1);
        expect(it.next().value).to.eql(2);
        expect(it.next().value).to.eql(3);
        expect(it.next().done).to.eql(true);
    });

    it('iterator for multiple arrays with multiple elements', function () {

        var sampleIterator: Iterable<any> = new ArrayIterable([1, 2, 3]);
        var sampleIterator1: Iterable<any> = new ArrayIterable([4, 5, 6]);
        var sampleIterator2: Iterable<any> = new ArrayIterable([7, 8, 9]);
        var it = new RavelIterator([sampleIterator, sampleIterator1, sampleIterator2]);
        expect(it.next().value).to.eql(1);
        expect(it.next().value).to.eql(2);
        expect(it.next().value).to.eql(3);
        expect(it.next().value).to.eql(4);
        expect(it.next().value).to.eql(5);
        expect(it.next().value).to.eql(6);
        expect(it.next().value).to.eql(7);
        expect(it.next().value).to.eql(8);
        expect(it.next().value).to.eql(9);
        expect(it.next().done).to.eql(true);
    });

});