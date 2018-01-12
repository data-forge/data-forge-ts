'use strict';

import { assert, expect } from 'chai';
import 'mocha';
import { TakeIterator } from '../../lib/iterators/take-iterator';
import { ArrayIterator } from '../../lib/iterators/array-iterator';

describe('take iterator', function () {

	it('iterator for empty take 1', function () {

        var it = new TakeIterator<number>(new ArrayIterator([]), 0);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
	});

	it('iterator for empty take 2', function () {

        var it = new TakeIterator<number>(new ArrayIterator([]), 5);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
	});
    
	it('can take X elements from a larger input', function () {

        var it = new TakeIterator(new ArrayIterator([5, 10, 20]), 2);
        expect(it.next()).to.eql({
            done: false,
            value: 5,
        });
        expect(it.next()).to.eql({
            done: false,
            value: 10,
        });
        expect(it.next().done).to.eql(true);
	});

	it('can take X elements from a smaller input', function () {

        var it = new TakeIterator(new ArrayIterator([5]), 2);
        expect(it.next()).to.eql({
            done: false,
            value: 5,
        });
        expect(it.next().done).to.eql(true);
	});
});