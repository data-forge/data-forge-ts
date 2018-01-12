'use strict';

import { assert, expect } from 'chai';
import 'mocha';
import { TakeWhileIterator } from '../../lib/iterators/take-while-iterator';
import { ArrayIterator } from '../../lib/iterators/array-iterator';

describe('take while iterator', function () {

	it('empty input - taking', function () {

		var it = new TakeWhileIterator(new ArrayIterator([]), value => true);
		expect(it.next().done).to.eql(true);
	});

	it('empty input - not taking', function () {

		var it = new TakeWhileIterator(new ArrayIterator([]), value => false);
		expect(it.next().done).to.eql(true);
	});

	it('can take single item', function () {

		var it = new TakeWhileIterator(new ArrayIterator([1]), value => true);
        expect(it.next()).to.eql({
            done: false,
            value: 1,
        });
		expect(it.next().done).to.eql(true);
	});

	it('can take based on values from child iterator', function () {

		var it = new TakeWhileIterator(new ArrayIterator([true, true, false, true]), value => value);
        expect(it.next()).to.eql({
            done: false,
            value: true,
        });
        expect(it.next()).to.eql({
            done: false,
            value: true,
        });
		expect(it.next().done).to.eql(true);
    });

	it('can take a certain number of values', function () {

		var it = new TakeWhileIterator(new ArrayIterator([1, 2, 3, 4]), value => value < 3);
        expect(it.next()).to.eql({
            done: false,
            value: 1,
        });
        expect(it.next()).to.eql({
            done: false,
            value: 2,
        });
		expect(it.next().done).to.eql(true);
	});

});