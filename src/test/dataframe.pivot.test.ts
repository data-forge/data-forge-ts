import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { DataFrame } from '../lib/dataframe';
import { ArrayIterable } from '../lib/iterables/array-iterable';
import { Series } from '../lib/series';

describe('DataFrame pivot', () => {

	it('exception is thrown when pivoting table on non-existing columns column', () => {

		var df = new DataFrame({
			columnNames: ["Date", "Ticker", "Close"],
			values: [
				["2016-06-01", "1PG", 5.2],
				["2016-06-02", "1PG", 5.3],
				["2016-06-03", "1PG", 5.4],
			],
		});

		expect(() => {
			df.parseDates("Date")
				.setIndex("Date")
				.pivot("some-column-that-doesnt-exist", "Close")
				;
			})
			.to.throw();
	});

	it('exception is thrown when pivoting table on non-existing values column', () => {

		var df = new DataFrame({
			columnNames: ["Date", "Ticker", "Close"],
			values: [
				["2016-06-01", "1PG", 5.2],
				["2016-06-02", "1PG", 5.3],
				["2016-06-03", "1PG", 5.4],
			],
		});

		expect(() => {
			df.parseDates("Date")
				.setIndex("Date")
				.pivot("Ticker", "some-column-that-doesnt-exist")
				;
			})
			.to.throw();
	});

	it('can pivot table', () => {

		var df = new DataFrame({
			columnNames: ["Date", "Ticker", "Close"],
			rows: [
				["2016-06-02", "1PG", 5.2],
				["2016-06-02", "ABC", 5.2],
				["2016-06-02", "MPL", 1.2],

				["2016-06-03", "1PG", 5.3],
				["2016-06-03", "ABC", 4.2],
				["2016-06-03", "MPL", 2.2],

				["2016-06-04", "1PG", 5.4],
				["2016-06-04", "ABC", 3.2],
				["2016-06-04", "MPL", 3.2],
			],
		});

		var pivoted = df //todo: .parseDates("Date") -- Want to get this working with proper dates.
			.setIndex("Date")
			.pivot("Ticker", "Close")
			;

		expect(pivoted.getColumnNames()).to.eql(["1PG", "ABC", "MPL"]);
		expect(pivoted.toRows()).to.eql([
			[5.2, 5.2, 1.2],
			[5.3, 4.2, 2.2],
			[5.4, 3.2, 3.2],
		]);
	});

});