import { assert, expect } from 'chai';
import 'mocha';
import * as dataForge from '../index';

const Stopwatch = require('statman-stopwatch');

describe('window performance', () => {

	it('window - series', () => {

		var numItems = 100;
		var windowSize = 5;

		var series = dataForge.range(0, numItems);

		var stopwatch1 = new Stopwatch();
		stopwatch1.start();

		var newSeries = series
			.window(windowSize)
			.asPairs()
			.select((windowIndex, window) => [windowIndex, windowIndex])
			.asValues()
			;

		stopwatch1.stop();
		var time1 = stopwatch1.read();
		//console.log('t1: ' + time1);
		expect(time1).to.be.at.most(1);

		var stopwatch2 = new Stopwatch();
		stopwatch2.start();

		expect(newSeries.count()).to.eql(numItems / windowSize);

		stopwatch2.stop();
		var time2 = stopwatch2.read();
		//console.log('t2: ' + time2);
		expect(time2).to.be.at.most(100);
	});

	it('window - data-frame', () => {

		var numItems = 100;
		var windowSize = 5;

		var dataFrame = new dataForge.DataFrame({
			columnNames: ["c1"],
			values: dataForge.range(0, numItems).select(v => [v]).toArray(),
		});

		var stopwatch1 = new Stopwatch();
		stopwatch1.start();

		var newSeries = dataFrame
			.window(windowSize)
			.asPairs()
			.select((windowIndex, window) => [windowIndex, windowIndex])
			.asValues()
			;

		stopwatch1.stop();
		var time1 = stopwatch1.read();
		//console.log('t1: ' + time1);
		expect(time1).to.be.at.most(1);

		var stopwatch2 = new Stopwatch();
		stopwatch2.start();

		expect(newSeries.count()).to.eql(numItems / windowSize);

		stopwatch2.stop();
		var time2 = stopwatch2.read();
		//console.log('t2: ' + time2);
		expect(time2).to.be.at.most(100);
	});
});