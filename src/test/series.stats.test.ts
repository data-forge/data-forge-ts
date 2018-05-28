import { assert, expect } from 'chai';
import 'mocha';
import { range, Series, Index } from '../index';
import { ArrayIterable } from '../lib/iterables/array-iterable';

describe('Series stats', () => {
    
	it('sum of empty series is zero', () => {

		var series = new Series();
		expect(series.sum()).to.eql(0);
	});

	it('can sum series', () => {

		var series = new Series({ index: [0, 1, 2], values: [1, 2, 3] });
		expect(series.sum()).to.eql(6);
	});

	it('can average series', () => {

		var series = new Series({ index: [0, 1, 2], values: [1, 2, 3] });
		expect(series.average()).to.eql(2);
	});

	it('average of an empty series is zero', () => {

		var series = new Series({ index: [], values: [] });
		expect(series.average()).to.eql(0);
	});

	it('can get median of even series', () => {

		var series = new Series({ index: [0, 1, 2, 3], values: [1, 2, 3, 4] });
		expect(series.median()).to.eql(2.5);
	});

	it('can get median of odd series', () => {

		var series = new Series({ index: [0, 1, 2], values: [1, 2, 3] });
		expect(series.median()).to.eql(2);
	});

	it('median of an empty series is zero', () => {

		var series = new Series({ index: [], values: [] });
		expect(series.median()).to.eql(0);
	});


	it('can get series minimum', () => {

		var series = new Series({ index: [0, 1, 2], values: [5, 2.5, 3] });
		expect(series.min()).to.eql(2.5);
	});

	it('can get series maximum', () => {

		var series = new Series({ index: [0, 1, 2], values: [5, 6, 3] });
		expect(series.max()).to.eql(6);
	});

    it('can invert series', () => {

		var series = new Series([5, -1, 2, -10, 3, 0]);
		expect(series.invert().toArray()).to.eql([-5, 1, -2, 10, -3, -0]);
    });

    it('can count up positive values', () => {

        var series = new Series({
            values: [5, 6, -1, 2, -10, 3, 10, 8, 0, 0, -5, -3, 1],
            index: range(10, 13),
        });

        var counted = series.counter(value => value > 0);
        expect(counted.toArray()).to.eql([1, 2, 0, 1, 0, 1, 2, 3, 0, 0, 0, 0, 1]);
        expect(counted.getIndex().toArray()).to.eql(range(10, 13).toArray());
    });
});