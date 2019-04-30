import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { Series } from '../lib/series';
import { DataFrame } from '../lib/dataframe';
// @ts-ignore
import moment from "dayjs";

describe('Series merge', () => {

	it('can merge single series - instance', () => {

		const series = new Series([0, 1, 2]);
        const merged = series.merge();

		expect(merged.toPairs()).to.eql([
			[0, [0]],
			[1, [1]],
			[2, [2]],
		]);
	});
    
	it('can merge single series - static', () => {

		const series = new Series([0, 1, 2]);
        const merged = Series.merge([series]);

		expect(merged.toPairs()).to.eql([
			[0, [0]],
			[1, [1]],
			[2, [2]],
		]);
    });
    
	it('can merge two series - instance', () => {

		const series1 = new Series([0, 1, 2]);
		const series2 = new Series([10, 11, 12]);
        const merged = series1.merge(series2);

		expect(merged.toPairs()).to.eql([
			[0, [0, 10]],
			[1, [1, 11]],
			[2, [2, 12]],
		]);
	});

	it('can merge two series - static', () => {

		const series1 = new Series([0, 1, 2]);
		const series2 = new Series([10, 11, 12]);
        const merged = Series.merge([series1, series2]);

		expect(merged.toPairs()).to.eql([
			[0, [0, 10]],
			[1, [1, 11]],
			[2, [2, 12]],
		]);
	});
    
	it('can merge three series - instance', () => {

		const series1 = new Series([0, 1, 2]);
        const series2 = new Series([10, 11, 12]);
        const series3 = new Series([100, 111, 122]);
        const merged = series1.merge(series2, series3);

		expect(merged.toPairs()).to.eql([
			[0, [0, 10, 100]],
			[1, [1, 11, 111]],
			[2, [2, 12, 122]],
		]);
	});

	it('can merge three series - static', () => {

		const series1 = new Series([0, 1, 2]);
        const series2 = new Series([10, 11, 12]);
        const series3 = new Series([100, 111, 122]);
        const merged = Series.merge([series1, series2, series3]);

		expect(merged.toPairs()).to.eql([
			[0, [0, 10, 100]],
			[1, [1, 11, 111]],
			[2, [2, 12, 122]],
		]);
    });
    
    it('can merge series with mismatched indicies', () => {

		const series1 = new Series({
            index: [4, 5, 6],
            values: [1, 2, 3]
        });
		const series2 = new Series({
            index: [5, 6, 7],
            values: [10, 11, 12]
        });
        
        const merged = Series.merge([series1, series2]);
		expect(merged.toPairs()).to.eql([
            [4, [1, undefined]],
			[5, [2, 10]],
            [6, [3, 11]],
            [7, [undefined, 12]]
		]);
    });

    it('can merge three series with mismatched indicies in the middle', () => {

		const series1 = new Series({
            index: [1, 2, 3],
            values: [1, 2, 3],
        });
		const series2 = new Series({
            index: [1, 3, 4],
            values: [10, 12, 13],
        });
		const series3 = new Series({
            index: [1, 2, 3],
            values: [20, 30, 40],
        });
        
        const merged = Series.merge([series1, series2, series3]);
		expect(merged.toPairs()).to.eql([
            [1, [1, 10, 20]],
			[2, [2, undefined, 30]],
            [3, [3, 12, 40]],
            [4, [undefined, 13, undefined]],
		]);
    });
    
    it('merged indicies are sorted in ascending order - numbers', () => {
		const series1 = new Series({
            index: [5, 1, 3],
            values: [5, 1, 3],
        });
		const series2 = new Series({
            index: [1, 5, 3],
            values: [1, 5, 3],
        });

        const merged = Series.merge([series1, series2]);
		expect(merged.toPairs()).to.eql([
            [1, [1, 1]],
			[3, [3, 3]],
            [5, [5, 5]],
		]);
    });

    it('merged indicies are sorted in ascending order - dates', () => {
        const d1 = moment("2018/01/02", "YYYY/MM/DD").toDate();
        const d2 = moment("2018/02/02", "YYYY/MM/DD").toDate();
        const d3 = moment("2018/03/02", "YYYY/MM/DD").toDate();

		const series1 = new Series({
            index: [d3, d1, d2],
            values: [5, 1, 3],
        });
		const series2 = new Series({
            index: [d1, d3, d2],
            values: [1, 5, 3],
        });

        const merged = Series.merge([series1, series2]);
		expect(merged.toPairs()).to.eql([
            [d1, [1, 1]],
			[d2, [3, 3]],
            [d3, [5, 5]],
		]);
    });

	it('can merge empty series', () => {

		const series1 = new Series();
		const series2 = new Series();
        const merged = Series.merge([series1, series2]);
        expect(merged.toPairs()).to.eql([]);
    });
    
	it('can merge two series when second series is empty', () => {

		const series1 = new Series([0, 1, 2]);
		const series2 = new Series();
        const merged = Series.merge([series1, series2]);
		expect(merged.toPairs()).to.eql([
            [0, [0, undefined]],
            [1, [1, undefined]],
            [2, [2, undefined]],
        ]);
	});

	it('can merge two series when first series is empty', () => {

		const series1 = new Series();
		const series2 = new Series([10, 11, 12]);
        const merged = Series.merge([series1, series2]);
		expect(merged.toPairs()).to.eql([
            [0, [undefined, 10]],
            [1, [undefined, 11]],
            [2, [undefined, 12]],
        ]);
	});

});