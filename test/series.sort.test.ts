import * as dataForge from '../index';
import { assert, expect } from 'chai';
import 'mocha';
/*
import { Index } from '../lib/index';
import { Series } from '../lib/series';
import { DataFrame } from '../lib/dataframe';
*/

const Series = dataForge.Series;

describe('Series sort', () => {

	it('can sort nested objects using selector - ascending', function () {
		var series = new Series({
			index: [0, 1, 2, 3], 
			values: [
				{
					i: 1,
					v: 300,
				},
				{
					i: 2,
					v: 100,
				},
				{
					i: 0,
					v: 100,
				},
				{
					i: 3,
					v: 5
				}
			]
        });
		var sorted = series
			.orderBy(row => row.v)
			.thenBy(row => row.i);
		expect(sorted.getIndex().toArray()).to.eql([3, 2, 1, 0]);
		expect(sorted.toArray()).to.eql([
			{
				i: 3,
				v: 5
			},
			{
				i: 0,
				v: 100,
			},
			{
				i: 2,
				v: 100,
			},
			{
				i: 1,
				v: 300,
			},
		]);
    });
    
	it('can sort nested objects using selector - descending', function () {
		var series = new Series({
			index: [0, 1, 2, 3], 
			values: [
				{
					i: 1,
					v: 300,
				},
				{
					i: 2,
					v: 100,
				},
				{
					i: 0,
					v: 100,
				},
				{
					i: 3,
					v: 5
				}
			]
        });
		var sorted = series
			.orderByDescending(row => row.v)
			.thenByDescending(row => row.i);
		expect(sorted.getIndex().toArray()).to.eql([0, 1, 2, 3]);
		expect(sorted.toArray()).to.eql([
			{
				i: 1,
				v: 300,
			},
			{
				i: 2,
				v: 100,
			},
			{
				i: 0,
				v: 100,
			},
			{
				i: 3,
				v: 5
			},
		]);
	});

});