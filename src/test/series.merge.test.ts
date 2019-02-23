import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { Series } from '../lib/series';
import { DataFrame } from '../lib/dataframe';

describe('Series merge', () => {

	it('can merge series', function () {

		const series1 = new Series([0, 1, 2]);
		const series2 = new Series([10, 11, 12]);
        const merged = series1.merge(series2);

		expect(merged.toPairs()).to.eql([
			[0, [0,10]],
			[1, [1,11]],
			[2, [2,12]],
		]);
	});

	it('can merge multiple series', function () {

		const series1 = new Series([0, 1, 2]);
        const series2 = new Series([10, 11, 12]);
        const series3 = new Series([100, 111, 122]);
        const merged = series1.merge(series2, series3);

		expect(merged.toPairs()).to.eql([
			[0, [0,10,100]],
			[1, [1,11,111]],
			[2, [2,12,122]],
		]);
	});

    it('can merge series with mismatched indicies', function () {

		const series1 = new Series({
            index: [4, 5, 6],
            values: [1, 2, 3]
        });
		const series2 = new Series({
            index: [5, 6, 7],
            values: [10, 11, 12]
        });
        const merged = series1.merge(series2);

		expect(merged.toPairs()).to.eql([
            [4, [1, undefined]],
			[5, [2,10]],
            [6, [3,11]],
		]);
	});

	it('can merge empty series', function () {

		const series1 = new Series();
		const series2 = new Series();
        const merged = series1.merge(series2);
        expect(merged.toPairs()).to.eql([]);
    });
    
	it('can merge two series when second series is empty', function () {

		const series1 = new Series([0, 1, 2]);
		const series2 = new Series();
        const merged = series1.merge(series2);
		expect(merged.toPairs()).to.eql([
            [0, [0, undefined]],
            [1, [1, undefined]],
            [2, [2, undefined]],
        ]);
	});

	it('can merge two series when first series is empty', function () {

		const series1 = new Series();
		const series2 = new Series([10, 11, 12]);
        const merged = series1.merge(series2);
		expect(merged.toPairs()).to.eql([
            [0, [undefined, 10]],
            [1, [undefined, 11]],
            [2, [undefined, 12]],
        ]);
	});

});