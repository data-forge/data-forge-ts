import { assert, expect } from 'chai';
import 'mocha';
import { Series, Index } from '../index';
import { ArrayIterable } from '../lib/iterables/array-iterable';

describe('Series stats', () => {
    
	it('sum of empty series is zero', function () {

		var series = new Series();
		expect(series.sum()).to.eql(0);
	});

	it('can sum series', function () {

		var series = new Series({ index: [0, 1, 2], values: [1, 2, 3] });
		expect(series.sum()).to.eql(6);
	});

	it('can average series', function () {

		var series = new Series({ index: [0, 1, 2], values: [1, 2, 3] });
		expect(series.average()).to.eql(2);
	});

	it('average of an empty series is zero', function () {

		var series = new Series({ index: [], values: [] });
		expect(series.average()).to.eql(0);
	});

	it('can get median of even series', function () {

		var series = new Series({ index: [0, 1, 2, 3], values: [1, 2, 3, 4] });
		expect(series.median()).to.eql(2.5);
	});

	it('can get median of odd series', function () {

		var series = new Series({ index: [0, 1, 2], values: [1, 2, 3] });
		expect(series.median()).to.eql(2);
	});

	it('median of an empty series is zero', function () {

		var series = new Series({ index: [], values: [] });
		expect(series.median()).to.eql(0);
	});


	it('can get series minimum', function () {

		var series = new Series({ index: [0, 1, 2], values: [5, 2.5, 3] });
		expect(series.min()).to.eql(2.5);
	});

	it('can get series maximum', function () {

		var series = new Series({ index: [0, 1, 2], values: [5, 6, 3] });
		expect(series.max()).to.eql(6);
	});

});