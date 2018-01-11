import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { DataFrame } from '../lib/dataframe';
import { ArrayIterable } from '../lib/iterables/array-iterable';

describe('DataFrame', () => {

    it('can get series from dataframe', () => {

        var dataFrame = new DataFrame([
            {
                A: 1,
                B: 10,
            },
            {
                A: 2,
                B: 20,
            }
        ]);

        expect(dataFrame.getSeries("B").toArray()).to.eql([10, 20]);
    });

    it('can get index from series from dataframe', () => {

        var dataFrame = new DataFrame({
            pairs: [
                [
                    100, 
                    {
                        A: 1,
                        B: 10,
                    },
                ],
                [
                    200,
                    {
                        A: 2,
                        B: 20,
                    },
                ],
            ]
        });

        expect(dataFrame.getSeries("B").getIndex().toArray()).to.eql([100, 200]);
    });

	it('when a series is extracted from a dataframe, undefined values are stripped out.', function () {
		
		var dataFrame = new DataFrame({
			columnNames: [ "S" ],
			values: [
				[undefined],
				[11],
				[undefined],
				[12],
				[undefined],
			]
        });
		
		var series = dataFrame.getSeries('S');
		expect(series.toPairs()).to.eql([
			[1, 11],
			[3, 12],
		]);
    });

	it('retreive a non-existing column results in an empty series', function () {

		var dataFrame = new DataFrame({
			columnNames: ["C1"],
			values: [
				[1]
			],
		});

		var series = dataFrame.getSeries("non-existing-column");
		expect(series.toPairs()).to.eql([]);
	});
});