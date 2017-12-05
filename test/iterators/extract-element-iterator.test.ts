'use strict';

import { assert, expect } from 'chai';
import 'mocha';
import { ExtractElementIterator } from '../../lib/iterators/extract-element-iterator';
import { ArrayIterator } from '../../lib/iterators/array-iterator';

describe('extract element iterator', function () {

	it('iterator for empty array', function () {

        var it = new ExtractElementIterator(new ArrayIterator([]), 0);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
	});

	it('can extract first element', function () {

        var it = new ExtractElementIterator(new ArrayIterator([
                [10, 100],
                [20, 200],
            ]), 0);
        expect(it.next()).to.eql({
            done: false,
            value: 10,
        });
        expect(it.next()).to.eql({
            done: false,
            value: 20,
        });
        expect(it.next().done).to.eql(true);
	});

	it('can extract first second', function () {

        var it = new ExtractElementIterator(new ArrayIterator([
                [10, 100],
                [20, 200],
            ]), 1);
        expect(it.next()).to.eql({
            done: false,
            value: 100,
        });
        expect(it.next()).to.eql({
            done: false,
            value: 200,
        });
        expect(it.next().done).to.eql(true);
	});
});