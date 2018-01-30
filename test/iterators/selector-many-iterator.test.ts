'use strict';

import { assert, expect } from 'chai';
import 'mocha';
import { SelectManyIterator } from '../../lib/iterators/select-many-iterator';
import { ArrayIterator } from '../../lib/iterators/array-iterator';

describe('select many iterator', function () {

	it('empty input', function () {

		var it = new SelectManyIterator(new ArrayIterator([]), value => []);
        expect(it.next().done).to.eql(true);
    });
    
	it('can expand collection', function () {

		var it = new SelectManyIterator(new ArrayIterator([1, 2]), value => [value, value]);
        expect(it.next()).to.eql({
            done: false,
            value: 1,
        });
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
            value: 2,
        });
        expect(it.next().done).to.eql(true);
	});

	it('can cull elements', function () {

		var it = new SelectManyIterator(new ArrayIterator([1, 2, 3]), value => []);
        expect(it.next().done).to.eql(true);
	});

});