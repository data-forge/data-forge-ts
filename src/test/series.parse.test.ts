import * as dataForge from '../index';
import { assert, expect } from 'chai';
import 'mocha';
import * as moment from "dayjs";

const Series = dataForge.Series;

describe('Series parse', () => {

	it('can parse string series to int', () => {

		var series = new Series({ index: [10, 5, 2], values: ['1', '100', '5']});
		var parsed = series.parseInts();

		expect(parsed.getIndex().toArray()).to.eql([10, 5, 2]);
		expect(parsed.toArray()).to.eql([1, 100, 5]);
	});

	it('can parse string series to int - with empty string', () => {

		var series = new Series({ index: [10], values: ['']});
		var parsed = series.parseInts();

		expect(parsed.getIndex().toArray()).to.eql([10]);
		expect(parsed.toArray()).to.eql([]);
	});

	it('can parse string series to int - with undefined', () => {

		var series = new Series({ index: [10], values: [undefined]});
		var parsed = series.parseInts();

		expect(parsed.getIndex().toArray()).to.eql([10]);
		expect(parsed.toArray()).to.eql([]);
	});

	it('can parse string series to int - throws when source value is not a string', () => {

		var series = new Series({ index: [10], values: [5]});
		var parsed = series.parseInts();

		expect(() => { 
			parsed.toArray();
		}).to.throw();
	});

	it('can parse string series to float', () => {

		var series = new Series({ index: [10, 5, 2], values: ['1', '100.2020', '5.5']});
		var parsed = series.parseFloats();

		expect(parsed.getIndex().toArray()).to.eql([10, 5, 2]);
		expect(parsed.toArray()).to.eql([1, 100.2020, 5.5]);
	});

	it('can parse string series to float - with empty string', () => {

		var series = new Series({ index: [10], values: ['']});
		var parsed = series.parseFloats();

		expect(parsed.getIndex().toArray()).to.eql([10]);
		expect(parsed.toArray()).to.eql([]);
	});

	it('can parse string series to float - with undefined', () => {

		var series = new Series({ index: [10], values: [undefined]});
		var parsed = series.parseFloats();

		expect(parsed.getIndex().toArray()).to.eql([10]);
		expect(parsed.toArray()).to.eql([]);
	});

	it('can parse string series to float - throws when source value is not a string', () => {

		var series = new Series({ index: [10], values: [5]});
		var parsed = series.parseFloats();

		expect(() => { 
			parsed.toArray();
		}).to.throw();
	});

	it('can parse string series to date', () => {

		var series = new Series({ index: [10, 5], values: ['1975-2-24', '2015-2-24']});
		var parsed = series.parseDates();

		expect(parsed.getIndex().toArray()).to.eql([10, 5]);
		expect(parsed.toArray()).to.eql([new Date(1975, 1, 24), new Date(2015, 1, 24)]); // Note months are 0-based here.
	});

	it('can parse string series to date - with empty string', () => {

		var series = new Series({ index: [10], values: ['']});
		var parsed = series.parseDates();

		expect(parsed.getIndex().toArray()).to.eql([10]);
		expect(parsed.toArray()).to.eql([]);
	});

	it('can parse string series to date - with undefined', () => {

		var series = new Series({ index: [10], values: [undefined]});
		var parsed = series.parseDates();

		expect(parsed.getIndex().toArray()).to.eql([10]);
		expect(parsed.toArray()).to.eql([]);
	});

	it('can parse string series to date - throws when source value is not a string', () => {

		var series = new Series({ index: [10], values: [5] });
		var parsed = series.parseDates();

		expect(() => { 
			parsed.toArray();
		}).to.throw();
	});

	it('can parse string series to date - with format string', () => {

		var series = new Series({ index: [10, 5], values: ['24-02-75', '24-02-15']});
		var parsed = series.parseDates('DD-MM-YY');

		expect(parsed.getIndex().toArray()).to.eql([10, 5]);
		expect(parsed.toArray()).to.eql([new Date(1975, 1, 24), new Date(2015, 1, 24)]); // Note months are 0-based here.
	});

	it('can parse values to strings', () => {

		var series = new Series({ index: [1, 2, 3, 4, 5, 6], values: [1, null, undefined, "foo", 5.5, new Date(2015, 1, 1)]});
		var converted = series.toStrings();

		expect(converted.getIndex().toArray()).to.eql([1, 2, 3, 4, 5, 6]);
		const row = converted.toArray();
        expect(row.length).to.eql(5);
        expect(row[0]).to.eql("1");
        expect(row[1]).to.eql(null);
        expect(row[2]).to.eql("foo");
        expect(row[3]).to.eql("5.5");
        expect(row[4]).to.satisfy((value: string) => {
        	return value.startsWith("Sun Feb 01 2015 00:00:00 GMT"); // Don't care about timezone part of string.
        });
	});

	it('can specify format string for date series', () => {

		var series = new Series({ index: [1], values: [new Date(2015, 1, 3)]});
		var converted = series.toStrings('YYYY-DD-MM');

		expect(converted.getIndex().toArray()).to.eql([1]);
		expect(converted.toArray()).to.eql([
			'2015-03-02',
		]);
	});

    it('can specify format string for number series', () => {

        var series = new Series({ index: [10], values: [1000.1234] });
        var converted = series.toStrings("0,000.00");

        expect(converted.getIndex().toArray()).to.eql([10]);
        expect(converted.toArray()).to.eql(["1,000.12"]);
    });
    
});