'use strict';

import { assert, expect } from 'chai';
import 'mocha';
import { SkipWhileIterator } from '../../lib/iterators/skip-while-iterator';
import { ArrayIterator } from '../../lib/iterators/array-iterator';

describe('skip while iterator', function () {

	it('empty input - skiping', function () {

		var it = new SkipWhileIterator(new ArrayIterator([]), value => true);
		expect(it.next().done).to.eql(true);
	});

	it('empty input - not skipping', function () {

		var it = new SkipWhileIterator(new ArrayIterator([]), value => false);
		expect(it.next().done).to.eql(true);
	});

	it('can skip single item', function () {

		var it = new SkipWhileIterator(new ArrayIterator([1]), value => true);
		expect(it.next().done).to.eql(true);
	});

	it('can skip based on values from child iterator', function () {

		var it = new SkipWhileIterator(new ArrayIterator([true, true, false, true]), value => value);
        expect(it.next()).to.eql({
            done: false,
            value: false,
        });
        expect(it.next()).to.eql({
            done: false,
            value: true,
        });
		expect(it.next().done).to.eql(true);
    });

	it('can skip a certain number of values', function () {

		var it = new SkipWhileIterator(new ArrayIterator([1, 2, 3, 1]), value => value < 3);
        expect(it.next()).to.eql({
            done: false,
            value: 3,
        });
        expect(it.next()).to.eql({
            done: false,
            value: 1,
        });
		expect(it.next().done).to.eql(true);
	});

});