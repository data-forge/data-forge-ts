import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { DataFrame } from '../lib/dataframe';
import { ArrayIterable } from '../lib/iterables/array-iterable';

describe('DataFrame csv', () => {

	it('can save empty data frame to csv', function () {

		var df = new DataFrame();
		var csvData = df.toCSV();
		assert.isString(csvData);
		expect(csvData.length).to.eql(0);
	});

	it('can save data frame to csv', function () {

        var df = new DataFrame([
            {
                Column1: 'A',
                Column2: 1,
            },
            {
                Column1: 'B',
                Column2: 2,
            },
        ]);

		var csvData = df.toCSV();
		assert.isString(csvData);
		expect(csvData).to.eql(
			"Column1,Column2\r\n" +
			"A,1\r\n" +
			"B,2"
		);
	});
    
	it('can save dataframe to csv with no header', function () {

        var df = new DataFrame([
            {
                Column1: 'A',
                Column2: 1,
            },
            {
                Column1: 'B',
                Column2: 2,
            },
        ]);

		var csvData = df.toCSV({ header: false });
		assert.isString(csvData);
		expect(csvData).to.eql(
			"A,1\r\n" +
			"B,2"
		);
	});
});