import { assert, expect } from 'chai';
import 'mocha';
import { DataFrame, Series, ISeries, Index } from '../index';

describe('DataFrame window', () => {
    
	it('can compute window - creates an empty series from an empty data set', function () {

		var dataframe = new DataFrame();
		var windowed = dataframe.window(2)
			.asPairs()
			.select((pair: any) => {
                throw new Error("This shoudl never be executed.");
			})
			.asValues()
			;

		expect(windowed.count()).to.eql(0);
	});

	it('can compute window - with even window size and even number of rows', function () {

        var dataframe = new DataFrame({ index: [10, 20, 30, 40], values: [1, 2, 3, 4] });
		var windowed = dataframe
			.window(2)
			.asPairs()
			.select((pair, index) => {
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

		var dataframe = new DataFrame({ index: [10, 20, 30, 40, 50], values: [1, 2, 3, 4, 5] });
		var windowed = dataframe
			.window(2)
			.asPairs()
			.select((pair, index) => {
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

		var dataframe = new DataFrame({ values: [1, 2, 3, 4, 5, 6] });
		var windowed = dataframe
			.window(3)
			.asPairs()
			.select((pair, index) => {
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

		var dataframe = new DataFrame({ values: [1, 2, 3, 4, 5] });
		var windowed = dataframe
			.window(3)
			.asPairs()
			.select((pair, index) => {
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

		var dataframe = new DataFrame();
		var windowed = dataframe
			.rollingWindow(2)
			.asPairs()
			.select((pair, index) => {
				var windowIndex = pair[0];
				var window = pair[1];
				return [windowIndex, window.toArray()];
			})
			.asValues()
			;

		expect(windowed.toArray().length).to.eql(0);
	});

	it('rolling window returns 0 values when there are not enough values in the data set', function () {

		var dataframe = new DataFrame({ index: [0, 1], values: [1, 2] });
		var windowed = dataframe
			.rollingWindow(3)
			.asPairs()
			.select((pair, index) => {
				var windowIndex = pair[0];
				var window = pair[1];
				return [windowIndex, window.toArray()];
			})
			.asValues()
			;

		expect(windowed.toArray().length).to.eql(0);
	});

	it('can compute rolling window - odd data set with even period', function () {

		var dataframe = new DataFrame({ index: [10, 20, 30, 40, 50], values: [0, 1, 2, 3, 4] });
		var windowed = dataframe
			.rollingWindow(2)
			.asPairs()
			.select((pair, index) => {
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

		var dataframe = new DataFrame({ index: [0, 1, 2, 3, 4], values: [0, 1, 2, 3, 4] });
		var windowed = dataframe
			.rollingWindow(3)
			.asPairs()
			.select((pair, index) => {
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

		var dataframe = new DataFrame({ index: [0, 1, 2, 3, 4, 5], values: [0, 1, 2, 3, 4, 5] });
		var windowed = dataframe
			.rollingWindow(2)
			.asPairs()
			.select((pair, index) => {
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

		var dataframe = new DataFrame({ index: [0, 1, 2, 3, 4, 5], values: [0, 1, 2, 3, 4, 5] });
		var windowed = dataframe
			.rollingWindow(3)
			.asPairs()
			.select((pair, index) => {
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

		var dataframe = new DataFrame({ index: [0, 1, 2, 3, 4, 5], values: [0, 1, 2, 3, 4, 5] });
		var windowed = dataframe
			.rollingWindow(3)
			.asPairs()
			.select((pair, index) => {
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

	it('variable window', function () {

		var dataframe = new DataFrame({ 
			index:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			values: [1, 1, 2, 1, 1, 2, 3, 4, 3, 3],
		});

		var aggregated = dataframe
			.variableWindow((a, b) => a === b)
			.asPairs()
			.select(pair => {
				var windowIndex = pair[0];
				var window = pair[1];
				return [window.getIndex().first(), window.count()];
			})
			.asValues()
			;

		expect(aggregated.toPairs()).to.eql([
			[0, 2],
			[2, 1],
			[3, 2],
			[5, 1],
			[6, 1],
			[7, 1],
			[8, 2]
		]);
	});
    
	it('can collapse sequential duplicates and take first index', function () {

		var dataframe = new DataFrame({ 
			index:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			values: [1, 1, 2, 3, 3, 3, 5, 6, 6, 7],
		});

		var collapsed = dataframe.sequentialDistinct();

		expect(collapsed.toPairs()).to.eql([
			[0, 1],
			[2, 2],
			[3, 3],
			[6, 5],
			[7, 6],
			[9, 7],
		]);
	});

	it('can collapse sequential duplicates with custom selector', function () {

		var dataframe = new DataFrame({ 
			index:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			values: [{ A: 1 }, { A: 1 }, { A: 2 }, { A: 3 }, { A: 3 }, { A: 3 }, { A: 5 }, { A: 6 }, { A: 6 }, { A: 7 }],
		});

		var collapsed = dataframe
			.sequentialDistinct(value => value.A)
			.select(value => value.A)
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
});