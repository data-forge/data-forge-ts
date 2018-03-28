import { assert, expect } from 'chai';
import 'mocha';
import * as dataForge from '../index';

describe('data-forge', () => {
    
	it('can load from array of empty objects', () => {

		var jsData = "[{}, {}]";
		var dataFrame = dataForge.fromJSON(jsData);

		expect(dataFrame.getColumnNames().length).to.eql(0);
		expect(dataFrame.toRows()).to.eql([
			[],
			[],
		]);
	});

	it('error loading from empty json string', () => {

		var jsData = "";
		expect(() => dataForge.fromJSON(jsData)).to.throw();
	});

	it('can load from json with json array', () => {

		var jsData = "[]";
		var dataFrame = dataForge.fromJSON(jsData);

		expect(dataFrame.getColumnNames().length).to.eql(0);
		expect(dataFrame.toRows().length).to.eql(0);
	});

	it('can load from json array', () => {

		var jsData = 
			'[' +
				'{' +
					'"Column1": "A",' +
					'"Column2": 1' +
				'},' +
				'{' +
					'"Column1": "B",' +
					'"Column2": 2' +
				'}' +
			']';
		var dataFrame = dataForge.fromJSON(jsData);

		expect(dataFrame.getColumnNames()).to.eql(['Column1', 'Column2']);
		expect(dataFrame.toRows()).to.eql([
			['A', 1],
			['B', 2],
		]);
	});

	it('uneven columns loaded from json result in undefined values', () => {

		var jsData = 
			'[' +
				'{' +
					'"Column1": "A"' +
				'},' +
				'{' +
					'"Column2": 2' +
				'}' +
			']';
		var dataFrame = dataForge.fromJSON(jsData);

		expect(dataFrame.getColumnNames()).to.eql(['Column1']); // 2nd column is ignored because it is not part of the first object.
		expect(dataFrame.toRows()).to.eql([
			['A'],
			[undefined],
		]);
	});	

	it('can generate series from range', () => {

		var series = dataForge.range(10, 5);
		expect(series.toPairs()).to.eql([
			[0, 10],
			[1, 11],
			[2, 12],
			[3, 13],
			[4, 14],
		]);

	});

	it('can generate data-frame from matrix', () => {

		var dataFrame = dataForge.matrix(3, 4, 2, 3);
		expect(dataFrame.getColumnNames()).to.eql([
			"1",
			"2",
			"3",
		]);
		expect(dataFrame.toPairs()).to.eql([
			[0, { "1": 2, 	"2": 5, 	"3": 8}],
			[1, { "1": 11, 	"2": 14,	"3": 17}],
			[2, { "1": 20, 	"2": 23, 	"3": 26}],
			[3, { "1": 29, 	"2": 32, 	"3": 35}],
		]);
    });

});
