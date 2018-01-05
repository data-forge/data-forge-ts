'use strict';

import { assert, expect } from 'chai';
import 'mocha';
import { ColumnNamesIterator } from '../../lib/iterators/column-names-iterator';
import { ArrayIterable } from '../../lib/iterables/array-iterable';

describe('column names iterator', function () {

	it('iterator for empty values iterable', function () {

        var it = new ColumnNamesIterator(new ArrayIterable([]), false);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
	});

	it('iterator for column names with 1 elem, but zero fields', function () {

        var it = new ColumnNamesIterator(new ArrayIterable([
            {
            },
        ]), false);
        expect(it.next().done).to.eql(true);
	});

    
	it('iterator for column names with 1 elem', function () {

        var it = new ColumnNamesIterator(new ArrayIterable([
            {
                A: 1,
                B: 2,
            },
        ]), false);
        expect(it.next()).to.eql({
            done: false,
            value: "A",
        });
        expect(it.next()).to.eql({
            done: false,
            value: "B",
        });
        expect(it.next().done).to.eql(true);
	});

	it('iterator for column names with 2 elems', function () {

        var it = new ColumnNamesIterator(new ArrayIterable([
            {
                A: 1,
                B: 2,
            },
            {
                C: 10,
                D: 20,
            },
        ]), false);
        
        expect(it.next()).to.eql({
            done: false,
            value: "A",
        });
        expect(it.next()).to.eql({
            done: false,
            value: "B",
        });
        expect(it.next().done).to.eql(true);
    });
    
	it('iterator for column names with varying elems - when all elems are considered', function () {

        var it = new ColumnNamesIterator(new ArrayIterable([
            {
                A: 1,
                B: 2,
            },
            {
                C: 10,
                D: 20,
            },
        ]), true);
        
        expect(it.next()).to.eql({
            done: false,
            value: "A",
        });
        expect(it.next()).to.eql({
            done: false,
            value: "B",
        });
        expect(it.next()).to.eql({
            done: false,
            value: "C",
        });
        expect(it.next()).to.eql({
            done: false,
            value: "D",
        });
        expect(it.next().done).to.eql(true);
	});    
});