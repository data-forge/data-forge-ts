import { assert, expect } from 'chai';
import 'mocha';
import * as dataForge from '../index';

const Stopwatch = require('statman-stopwatch');

describe('rolling window performance', () => {

	it('rolling window - series', () => {

		var numItems = 100;
		var windowSize = 5;

        var series = dataForge.range(0, numItems);

        var stopwatch1 = new Stopwatch();
		stopwatch1.start();

		var newSeries = series
			.rollingWindow(windowSize)
			.asPairs()
			.select((windowIndex, window) => [windowIndex, windowIndex])
			.asValues();

		stopwatch1.stop();
		var time1 = stopwatch1.read();
		//console.log('t1: ' + time1);
		expect(time1).to.be.at.most(1);

		var stopwatch2 = new Stopwatch();
		stopwatch2.start();

		expect(newSeries.count()).to.eql(numItems - (windowSize - 1));

		stopwatch2.stop();
		var time2 = stopwatch2.read();
		//console.log('t2: ' + time2);
		expect(time2).to.be.at.most(100);
	});

	it('rolling window - data-frame', () => {

		var numItems = 100;
		var windowSize = 5;

		var dataFrame = new dataForge.DataFrame({
			columnNames: ["c1"],
			rows: dataForge.range(0, numItems).select(v => [v]).toArray(),
		});

		var stopwatch1 = new Stopwatch();
		stopwatch1.start();

		var newSeries = dataFrame
			.rollingWindow(windowSize)
			.select((window, windowIndex) => [windowIndex, windowIndex]);

		stopwatch1.stop();
		var time1 = stopwatch1.read();
		//console.log('t1: ' + time1);
		expect(time1).to.be.at.most(1);

		var stopwatch2 = new Stopwatch();
		stopwatch2.start();

		expect(newSeries.count()).to.eql(numItems - (windowSize - 1));

		stopwatch2.stop();
		var time2 = stopwatch2.read();
		//console.log('t2: ' + time2);
		expect(time2).to.be.at.most(100);
	});
});