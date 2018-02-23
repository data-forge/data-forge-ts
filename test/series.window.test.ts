import { assert, expect } from 'chai';
import 'mocha';
import { Series, ISeries, Index } from '../index';

describe('Series window', () => {
    
	it('can compute window - creates an empty series from an empty data set', function () {

		var series = new Series();
		var windowed = series.window(2)
			.asPairs()
			.select((pair: any) => {
                throw new Error("This shoudl never be executed.");
			})
			.asValues()
			;

		expect(windowed.count()).to.eql(0);
	});

	it('can compute window - with even window size and even number of rows', function () {

        var series = new Series({ index: [10, 20, 30, 40], values: [1, 2, 3, 4] });
		var windowed = series
			.window(2)
			.asPairs()
			.select((pair: [number, ISeries<number, number>], index: number) => {
				var windowIndex = pair[0];
                var window = pair[1];
                return [window.getIndex().last(), window.toArray()];
			})
			.asValues()
            ;
            
		expect(windowed.toPairs()).to.eql([
			[20, [1, 2]],
			[40, [3, 4]],
		]);
	});

	it('can compute window - with even window size and odd number of rows', function () {

		var series = new Series({ index: [10, 20, 30, 40, 50], values: [1, 2, 3, 4, 5] });
		var windowed = series
			.window(2)
			.asPairs()
			.select((pair: [number, ISeries<number, number>], index: number) => {
				var windowIndex = pair[0];
				var window = pair[1];
				return [window.getIndex().first(), window.toArray()];
			})
			.asValues()
			;

		expect(windowed.toPairs()).to.eql([
			[10, [1, 2]],
			[30, [3, 4]],
			[50, [5]],
		]);
	});

	it('can compute window - with odd window size and odd number of rows', function () {

		var series = new Series({ values: [1, 2, 3, 4, 5, 6] });
		var windowed = series
			.window(3)
			.asPairs()
			.select((pair: [number, ISeries<number, number>], index: number) => {
				var windowIndex = pair[0];
				var window = pair[1];
				return [windowIndex, window.toArray()];
			})
			.asValues()
			;

		expect(windowed.toPairs()).to.eql([
			[0, [1, 2, 3]],
			[1, [4, 5, 6]],
		]);

	});

	it('can compute window - with odd window size and even number of rows', function () {

		var series = new Series({ values: [1, 2, 3, 4, 5] });
		var windowed = series
			.window(3)
			.asPairs()
			.select((pair: [number, ISeries<number, number>], index: number) => {
				var windowIndex = pair[0];
				var window = pair[1];
				return [windowIndex, window.toArray()];
			})
			.asValues()
			;

		expect(windowed.toPairs()).to.eql([
			[0, [1, 2, 3]],
			[1, [4, 5]],
		]);

	});

    
	it('can compute rolling window - from empty data set', function () {

		var series = new Series();
		var windowed = series
			.rollingWindow(2)
			.asPairs()
			.select((pair: [number, ISeries<number, number>], index: number) => {
				var windowIndex = pair[0];
				var window = pair[1];
				return [windowIndex, window.toArray()];
			})
			.asValues()
			;

		expect(windowed.toArray().length).to.eql(0);
	});

	it('rolling window returns 0 values when there are not enough values in the data set', function () {

		var series = new Series({ index: [0, 1], values: [1, 2] });
		var windowed = series
			.rollingWindow(3)
			.asPairs()
			.select((pair: [number, ISeries<number, number>], index: number) => {
				var windowIndex = pair[0];
				var window = pair[1];
				return [windowIndex, window.toArray()];
			})
			.asValues()
			;

		expect(windowed.toArray().length).to.eql(0);
	});

	it('can compute rolling window - odd data set with even period', function () {

		var series = new Series({ index: [10, 20, 30, 40, 50], values: [0, 1, 2, 3, 4] });
		var windowed = series
			.rollingWindow(2)
			.asPairs()
			.select((pair: [number, ISeries<number, number>], index: number) => {
				var window = pair[1];
				return [window.getIndex().last(), window.toArray()];
			})
			.asValues()
			;

		expect(windowed.toPairs()).to.eql([
            [20, [0, 1]],
            [30, [1, 2]],
            [40, [2, 3]],
            [50, [3, 4]],
        ]);
	});

	it('can compute rolling window - odd data set with odd period', function () {

		var series = new Series({ index: [0, 1, 2, 3, 4], values: [0, 1, 2, 3, 4] });
		var windowed = series
			.rollingWindow(3)
			.asPairs()
			.select((pair: [number, ISeries<number, number>], index: number) => {
				var windowIndex = pair[0];
				var window = pair[1];
				return [windowIndex, window.toArray()];
			})
			.asValues()
			;

		var index = windowed.getIndex().toArray();
		expect(index).to.eql([0, 1, 2]);

		var values = windowed.toArray();
		expect(values.length).to.eql(3);
		expect(values[0]).to.eql([0, 1, 2]);
		expect(values[1]).to.eql([1, 2, 3]);
		expect(values[2]).to.eql([2, 3, 4]);
	});

	it('can compute rolling window - even data set with even period', function () {

		var series = new Series({ index: [0, 1, 2, 3, 4, 5], values: [0, 1, 2, 3, 4, 5] });
		var windowed = series
			.rollingWindow(2)
			.asPairs()
			.select((pair: [number, ISeries<number, number>], index: number) => {
				var windowIndex = pair[0];
				var window = pair[1];
				return [windowIndex+10, window.toArray()];
			})
			.asValues()
			;

		var index = windowed.getIndex().toArray();
		expect(index).to.eql([10, 11, 12, 13, 14]);

		var values = windowed.toArray();
		expect(values.length).to.eql(5);
		expect(values[0]).to.eql([0, 1]);
		expect(values[1]).to.eql([1, 2]);
		expect(values[2]).to.eql([2, 3]);
		expect(values[3]).to.eql([3, 4]);
		expect(values[4]).to.eql([4, 5]);
	});

	it('can compute rolling window - even data set with odd period', function () {

		var series = new Series({ index: [0, 1, 2, 3, 4, 5], values: [0, 1, 2, 3, 4, 5] });
		var windowed = series
			.rollingWindow(3)
			.asPairs()
			.select((pair: [number, ISeries<number, number>], index: number) => {
				var windowIndex = pair[0];
				var window = pair[1];
				return [windowIndex, window.toArray()];
			})
			.asValues()
			;

		var index = windowed.getIndex().toArray();
		expect(index).to.eql([0, 1, 2, 3]);

		var values = windowed.toArray();
		expect(values.length).to.eql(4);
		expect(values[0]).to.eql([0, 1, 2]);
		expect(values[1]).to.eql([1, 2, 3]);
		expect(values[2]).to.eql([2, 3, 4]);
		expect(values[3]).to.eql([3, 4, 5]);
	});

	it('can compute rolling window - can take last index and value from each window', function () {

		var series = new Series({ index: [0, 1, 2, 3, 4, 5], values: [0, 1, 2, 3, 4, 5] });
		var windowed = series
			.rollingWindow(3)
			.asPairs()
			.select((pair: [number, ISeries<number, number>], index: number) => {
				var windowIndex = pair[0];
				var window = pair[1];
				return [window.getIndex().last(), window.last()];
			})
			.asValues()
			;

		var index = windowed.getIndex().toArray();
		expect(index).to.eql([2, 3, 4, 5]);

		var values = windowed.toArray();
		expect(values).to.eql([2, 3, 4, 5]);
	});

	it('can compute pct changed', function () {

		var series = new Series({ index: [0, 1, 2, 3], values: [1, 2, 4, 8] });
		var pctChanged = series.percentChange();
		expect(pctChanged.getIndex().toArray()).to.eql([1, 2, 3]);
		expect(pctChanged.toArray()).to.eql([1, 1, 1]);
    });

});