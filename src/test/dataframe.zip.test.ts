import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { Series } from '../lib/series';
import { DataFrame } from '../lib/dataframe';

describe('DataFrame zip', () => {

	it('can zip multiple series', () => {

		var series1 = new DataFrame([0, 1, 2]);
		var series2 = new DataFrame([10, 11, 12]);
		var series3 = new DataFrame([100, 101, 102]);

		var zipped = DataFrame.zip([series1, series2, series3], values => values.sum());

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

	it('can zip multiple series with ragged rows', () => {

		var series1 = new DataFrame([0, 1, 2]);
		var series2 = new DataFrame([10, 11]);
		var series3 = new DataFrame([100, 101, 102]);

		var zipped = DataFrame.zip([series1, series2, series3], values => values.sum());

		expect(zipped.toPairs()).to.eql([
			[0,
				0+10+100
			],
			[1,
				1+11+101
			],
		]);
	});

	it('can zip multiple data-frames', () => {

		var df1 = new DataFrame({ columnNames: ["a", "b"], rows: [[1, 2], [3, 4]] });
		var df2 = new DataFrame({ columnNames: ["c", "d"], rows: [[6, 5], [8, 7]] });
		var df3 = new DataFrame({ columnNames: ["e", "f"], rows: [[9, 10], [11, 12]] });

		var zipped = DataFrame.zip([df1, df2, df3], rows => {
				return Object.assign({}, rows.at(0), rows.at(1), rows.at(2));
			});

		expect(zipped.toPairs()).to.eql([
			[0,
				{
					a: 1,
					b: 2,
					c: 6,
					d: 5,
					e: 9,
					f: 10,
				}
			],			
			[1,
				{
					a: 3,
					b: 4,
					c: 8,
					d: 7,
					e: 11,
					f: 12,
				}
			],
		]);
	});

	it('can zip multiple data-frames with ragged rows', () => {

		var df1 = new DataFrame({ columnNames: ["a", "b"], rows: [[1, 2], [3, 4]] });
		var df2 = new DataFrame({ columnNames: ["c", "d"], rows: [[6, 5]] });
		var df3 = new DataFrame({ columnNames: ["e", "f"], rows: [[9, 10], [11, 12]] });

		var zipped = DataFrame.zip([df1, df2, df3], rows => {
				return Object.assign({}, rows.at(0), rows.at(1), rows.at(2));
			});

		expect(zipped.toPairs()).to.eql([
			[0,
				{
					a: 1,
					b: 2,
					c: 6,
					d: 5,
					e: 9,
					f: 10,
				}
			],			
		]);
    });

	it('can zip two series', () => {

		var zipped = new DataFrame([0, 1, 2])
			.zip(new DataFrame([10, 11, 12]), (s1, s2) => {
				return s1 + s2;
			});

		expect(zipped.toArray()).to.eql([0+10, 1+11, 2+12]);
	});

	it('can zip multiple series', () => {

		var zipped = new DataFrame([0, 1, 2])
			.zip(
				new DataFrame([10, 11, 12]), 
				new DataFrame([100, 101, 102]),
				(s1, s2, s3) => {
					return s1 + s2 + s3;
				}
			);

		expect(zipped.toArray()).to.eql([0+10+100, 1+11+101, 2+12+102]);
	});

	it('zip preserves the index of the first series', () => {

		var s1 = new DataFrame({ 
			values: [1, 2, 3],
			index: [10, 11, 12],
		});

		var s2 = new DataFrame({ 
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

	it('can zip multiple data-frames', () => {

		var df1 = new DataFrame({
			columnNames: ["a", "b"],
			rows: [[1, 2], [3, 4]],
		});

		var df2 = new DataFrame({
			columnNames: ["c", "d"],
			rows: [[6, 5], [8, 7]],
		});

		var df3 = new DataFrame({
			columnNames: ["e", "f"],
			rows: [[9, 10], [11, 12]],
		});				

		var zipped = df1.zip(df2, df3, (row1, row2, row3) => {
				return Object.assign({}, row1, row2, row3);
			});

		expect(zipped.toPairs()).to.eql([
			[0,
				{
					a: 1,
					b: 2,
					c: 6,
					d: 5,
					e: 9,
					f: 10,
				}
			],			
			[1,
				{
					a: 3,
					b: 4,
					c: 8,
					d: 7,
					e: 11,
					f: 12,
				}
			],
		]);
    });

	it('zip preserves index of first dataframe', () => {

		var df1 = new DataFrame({
			columnNames: ["c"],
			rows: [[1], [2]],
			index: [20, 27],
		});

		var df2 = new DataFrame({
			columnNames: ["x"],
			rows: [[100], [200]],
			index: [30, 62],
		});

		var zipped = df1.zip(df2, (row1, row2) => {
					return Object.assign({}, row1, row2);
				});

		expect(zipped.toPairs()).to.eql([
			[20,
				{
					c: 1,
					x: 100,
				}
			],			
			[27,
				{
					c: 2,
					x: 200,
				}
			],
		]);
    });

});