import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { Series } from '../lib/series';
import { DataFrame } from '../lib/dataframe';

describe('Series zip', () => {

	it('can zip multiple series', function () {

		var series1 = new Series([0, 1, 2]);
		var series2 = new Series([10, 11, 12]);
		var series3 = new Series([100, 101, 102]);

		var zipped = Series.zip([series1, series2, series3], values => values.sum());

		expect(zipped.toPairs()).to.eql([
			[0,
				0+10+100
			],
			[1,
				1+11+101
			],
			[2,
				2+12+102
			],
		]);
	});

	it('can zip multiple series with ragged rows', function () {

		var series1 = new Series([0, 1, 2]);
		var series2 = new Series([10, 11]);
		var series3 = new Series([100, 101, 102]);

		var zipped = Series.zip([series1, series2, series3], values => values.sum());

		expect(zipped.toPairs()).to.eql([
			[0,
				0+10+100
			],
			[1,
				1+11+101
			],
		]);
	});

    it('can zip two series', function () {

		var zipped = new Series([0, 1, 2])
			.zip(new Series([10, 11, 12]), (s1, s2) => {
				return s1 + s2;
			});

		expect(zipped.toArray()).to.eql([0+10, 1+11, 2+12]);
	});

	it('can zip multiple series', function () {

		var zipped = new Series([0, 1, 2])
			.zip(
				new Series([10, 11, 12]), 
				new Series([100, 101, 102]),
				(s1, s2, s3) => {
					return s1 + s2 + s3;
				}
			);

		expect(zipped.toArray()).to.eql([0+10+100, 1+11+101, 2+12+102]);
	});

	it('zip preserves the index of the first series', function () {

		var s1 = new Series({ 
			values: [1, 2, 3],
			index: [10, 11, 12],
		});

		var s2 = new Series({ 
			values: [10, 20, 30],
			index: [50, 51, 52],
		});

		var zipped = s1.zip(s2, 
				(s1, s2) => {
				return s1 + s2;
				}
			);

		expect(zipped.toPairs()).to.eql([
			[10, 1+10],
			[11, 2+20],
			[12, 3+30],
		]);
	});

});