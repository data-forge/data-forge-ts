'use strict';

import { assert, expect } from 'chai';
import 'mocha';
import { WhereIterator } from '../../lib/iterators/where-iterator';
import { ArrayIterator } from '../../lib/iterators/array-iterator';

describe('take iterator', function () {

	it('iterator for empty take 1', function () {

        var it = new WhereIterator<number>(new ArrayIterator([]), value => true);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
	});

	it('iterator for empty take 2', function () {

        var it = new WhereIterator<number>(new ArrayIterator([]), value => false);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
	});
    
	it('can allow all elements to pass through', function () {

        var it = new WhereIterator(new ArrayIterator([5, 10]), value => true);
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

	it('can filter out all elements', function () {

        var it = new WhereIterator(new ArrayIterator([5, 10]), value => false);
        expect(it.next().done).to.eql(true);
	});

	it('can filter some elements', function () {

        var it = new WhereIterator(new ArrayIterator([5, 10, 5]), value => value !== 5);
        expect(it.next()).to.eql({
            done: false,
            value: 10,
        });
        expect(it.next().done).to.eql(true);
	});
});