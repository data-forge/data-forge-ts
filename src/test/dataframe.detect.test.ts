import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { DataFrame } from '../lib/DataFrame';

describe('DataFrame detect', () => {

	it('can detect actual types', function () {

		var df = new DataFrame({
			columnNames: [ "Date", "Value1" ],
			rows: [
				[new Date(1975, 24, 2), 'foo'],
				[new Date(2015, 24, 2), 200],
			],
			index: [5, 6]
        });

		var detectedTypes = df.detectTypes();
		expect(detectedTypes.getColumnNames()).to.eql(["Type", "Frequency", "Column"]);
		expect(detectedTypes.getIndex().take(3).toArray()).to.eql([0, 1, 2]);
		expect(detectedTypes.take(3).toRows()).to.eql([
			['date', 100, "Date"],
			['string', 50, "Value1"],
			['number', 50, "Value1"],
		]);
    });

	it('can detect values', function () {

		var df = new DataFrame({
			columnNames: [ "Date", "Value1" ],
			rows: [
				[new Date(1975, 24, 2), 'foo'],
				[new Date(2015, 24, 2), 'foo'],
			],
			index: [5, 6]
        });

		var detectedValues = df.detectValues();
		expect(detectedValues.getColumnNames()).to.eql(["Value", "Frequency", "Column"]);
		expect(detectedValues.getIndex().take(3).toArray()).to.eql([0, 1, 2]);
		expect(detectedValues.toRows()).to.eql([
			[new Date(1975, 24, 2), 50, "Date"],
			[new Date(2015, 24, 2), 50, "Date"],
			['foo', 100, "Value1"],
		]);
	});
});