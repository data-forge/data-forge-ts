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
			index: [10, 11, 12, 13], 
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
        expect(sorted.getIndex().toArray()).to.eql([13, 12, 11, 10]);
    });
    
	it('can sort nested objects using selector - descending', function () {
		var series = new Series({
			index: [10, 11, 12, 13], 
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
        expect(sorted.getIndex().toArray()).to.eql([10, 11, 12, 13]);
	});

});