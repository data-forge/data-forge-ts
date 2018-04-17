import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { Series } from '../lib/Series';

describe('DataFrame detect', () => {

	it('can detect actual series type', function () {

		var series = new Series({ index: [1], values: [1] });
		var types = series.detectTypes();
		expect(types.getColumnNames()).to.eql(['Type', 'Frequency']);
		expect(types.getIndex().take(1).toArray()).to.eql([0]);
		expect(types.toRows()).to.eql([
			['number', 100]
		]);
	});

	it('can detect date series type', function () {

		var series = new Series({ index: [1], values: [new Date(2015, 1, 1)] });
		var types = series.detectTypes();
		expect(types.getColumnNames()).to.eql(['Type', 'Frequency']);
		expect(types.getIndex().take(1).toArray()).to.eql([0]);
		expect(types.toRows()).to.eql([
			['date', 100]
		]);
	});

	it('can detect multiple series types', function () {

		var series = new Series({ index: [1, 2], values: [1, 'foo'] });
		var types = series.detectTypes();
		expect(types.getColumnNames()).to.eql(['Type', 'Frequency']);
		expect(types.getIndex().take(2).toArray()).to.eql([0, 1]);
		expect(types.toRows()).to.eql([
			['number', 50],
			['string', 50],
		]);
	});

	it('can detect values', function () {
		var series = new Series({ index: [1, 2], values: [1, 'foo'] });
		var values = series.detectValues();
		expect(values.getColumnNames()).to.eql(['Value', 'Frequency']);
		expect(values.getIndex().take(2).toArray()).to.eql([0, 1]);
		expect(values.toRows()).to.eql([
			[1, 50],
			['foo', 50],
		]);
	});
  
});