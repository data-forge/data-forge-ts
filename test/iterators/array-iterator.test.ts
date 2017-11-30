'use strict';

import { assert, expect } from 'chai';
import 'mocha';
import { ArrayIterator } from '../../lib/iterators/array-iterator';

describe('array iterator', function () {

	it('iterator for empty array', function () {

        var it = new ArrayIterator([]);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
	});

	it('iterator for array with 1 elem', function () {

        var it = new ArrayIterator([5]);
        expect(it.next()).to.eql({
            done: false,
            value: 5,
        });
        expect(it.next().done).to.eql(true);
	});

	it('iterator for array with 2 elems', function () {

        var it = new ArrayIterator([5, 10]);
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
});