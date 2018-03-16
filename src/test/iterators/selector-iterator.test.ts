'use strict';

import { assert, expect } from 'chai';
import 'mocha';
import { SelectIterator } from '../../lib/iterators/select-iterator';
import { ArrayIterator } from '../../lib/iterators/array-iterator';

describe('select iterator', function () {

	it('iterator for empty array', function () {

        var it = new SelectIterator(new ArrayIterator([]), v => 5);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
	});

	it('select iterator transforms values', function () {

        var it = new SelectIterator(new ArrayIterator([22]), v => 5);
        expect(it.next()).to.eql({
            done: false,
            value: 5,
        });
        expect(it.next().done).to.eql(true);
	});

});