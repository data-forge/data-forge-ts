'use strict';

import { assert, expect } from 'chai';
import 'mocha';
import { MultiIterator } from '../../lib/iterators/multi-iterator';
import { ArrayIterator } from '../../lib/iterators/array-iterator';

describe('multi iterator', function () {

	it('iterator for empty array 1', function () {

        var it = new MultiIterator([]);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
	});
    
	it('iterator for empty array 2', function () {

        var it = new MultiIterator([new ArrayIterator([])]);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
	});

    it('iterator for empty array 3', function () {

        var it = new MultiIterator([new ArrayIterator([]), new ArrayIterator([])]);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
	});

	it('iterator for single iterator', function () {

        var it = new MultiIterator([new ArrayIterator([10, 20])]);
        expect(it.next()).to.eql({
            done: false,
            value: [10],
        });
        expect(it.next()).to.eql({
            done: false,
            value: [20],
        });
        expect(it.next().done).to.eql(true);
	});

	it('iterator for multiple iterator', function () {

        var it = new MultiIterator([new ArrayIterator([10, 20]), new ArrayIterator([100, 200])]);
        expect(it.next()).to.eql({
            done: false,
            value: [10, 100],
        });
        expect(it.next()).to.eql({
            done: false,
            value: [20, 200],
        });
        expect(it.next().done).to.eql(true);
	});

	it('first iterator terminates iteration', function () {

        var it = new MultiIterator([new ArrayIterator([10]), new ArrayIterator([100, 200])]);
        expect(it.next()).to.eql({
            done: false,
            value: [10, 100],
        });
        expect(it.next().done).to.eql(true);
	});

	it('second iterator terminates iteration', function () {

        var it = new MultiIterator([new ArrayIterator([10, 20]), new ArrayIterator([100])]);
        expect(it.next()).to.eql({
            done: false,
            value: [10, 100],
        });
        expect(it.next().done).to.eql(true);
	});
});