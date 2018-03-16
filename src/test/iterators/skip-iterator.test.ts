'use strict';

import { assert, expect } from 'chai';
import 'mocha';
import { SkipIterator } from '../../lib/iterators/skip-iterator';
import { ArrayIterator } from '../../lib/iterators/array-iterator';

describe('skip iterator', function () {

	it('iterator for empty array with skip 0', function () {

        var it = new SkipIterator(new ArrayIterator([]), 0);
        expect(it.next().done).to.eql(true);
	});

	it('iterator for empty array with skip 1', function () {

        var it = new SkipIterator(new ArrayIterator([]), 1);
        expect(it.next().done).to.eql(true);
	});

    it('can skip 0 elements', function () {

        var it = new SkipIterator(new ArrayIterator([1, 2, 3, 4]), 0);
        expect(it.next()).to.eql({
            done: false,
            value: 1,
        });
        expect(it.next()).to.eql({
            done: false,
            value: 2,
        });
        expect(it.next()).to.eql({
            done: false,
            value: 3,
        });
        expect(it.next()).to.eql({
            done: false,
            value: 4,
        });
        expect(it.next().done).to.eql(true);
	});
    
    it('can skip 2 elements', function () {

        var it = new SkipIterator(new ArrayIterator([1, 2, 3, 4]), 2);
        expect(it.next()).to.eql({
            done: false,
            value: 3,
        });
        expect(it.next()).to.eql({
            done: false,
            value: 4,
        });
        expect(it.next().done).to.eql(true);
	});

    it('can skip to end', function () {

        var it = new SkipIterator(new ArrayIterator([1, 2, 3, 4]), 4);
        expect(it.next().done).to.eql(true);
	});

    it('can skip past end', function () {

        var it = new SkipIterator(new ArrayIterator([1, 2, 3, 4]), 6);
        expect(it.next().done).to.eql(true);
	});
});