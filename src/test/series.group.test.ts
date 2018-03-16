import { assert, expect } from 'chai';
import 'mocha';
import { Series, Index } from '../index';
import { ArrayIterable } from '../lib/iterables/array-iterable';

describe('Series group', () => {
    
	it('can group by value', function () {

		var series = new Series({
			index:  [0, 1, 2, 3, 4, 5, 6],
			values: [1, 2, 2, 3, 2, 3, 5],
		});

        var grouped = series.groupBy((value, index) => value);
		expect(grouped.count()).to.eql(4);

		var group1 = grouped.skip(0).first();
		expect(group1.toPairs()).to.eql([
			[0, 1],
		]);

		var group2 = grouped.skip(1).first();
		expect(group2.toPairs()).to.eql([
			[1, 2],
			[2, 2],
			[4, 2],
		]);

		var group3 = grouped.skip(2).first();
		expect(group3.toPairs()).to.eql([
			[3, 3],
			[5, 3],
		]);

		var group4 = grouped.skip(3).first();
		expect(group4.toPairs()).to.eql([
			[6, 5],
		]);
    });
    
	it('can group sequential duplicates and take first index', function () {

		var series = new Series({ 
			index:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			values: [1, 1, 2, 3, 3, 3, 5, 6, 6, 7],
		});

		var collapsed = series.groupSequentialBy()
			.asPairs()
			.select(function (pair) {
				var windowIndex = pair[0];
				var window = pair[1];
				return [window.getIndex().first(), window.first()];
			})
			.asValues()
			;

		expect(collapsed.toPairs()).to.eql([
			[0, 1],
			[2, 2],
			[3, 3],
			[6, 5],
			[7, 6],
			[9, 7],
		]);
	});

	it('can group sequential duplicates and take last index', function () {

		var series = new Series({ 
			index:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			values: [1, 1, 2, 3, 3, 3, 5, 6, 6, 7],
		});

		var collapsed = series.groupSequentialBy()
			.asPairs()
			.select(function (pair) {
				var windowIndex = pair[0];
				var window = pair[1];
				return [window.getIndex().last(), window.last()];
			})
			.asValues()
			;

		expect(collapsed.toPairs()).to.eql([
			[1, 1],
			[2, 2],
			[5, 3],
			[6, 5],
			[8, 6],
			[9, 7],
		]);
	});

	it('can group sequential with custom selector', function () {

		var series = new Series({ 
			index:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			values: [{ A: 1 }, { A: 1 }, { A: 2 }, { A: 3 }, { A: 3 }, { A: 3 }, { A: 5 }, { A: 6 }, { A: 6 }, { A: 7 }],
		});

		var collapsed = series.groupSequentialBy(value => value.A)
			.asPairs()
			.select(function (pair) {
				var windowIndex = pair[0];
				var window = pair[1];
				return [window.getIndex().last(), window.last().A];
			})
			.asValues()
			;

		expect(collapsed.toPairs()).to.eql([
			[1, 1],
			[2, 2],
			[5, 3],
			[6, 5],
			[8, 6],
			[9, 7],
		]);
	});    
});