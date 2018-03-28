import * as dataForge from '../index';
import { assert, expect } from 'chai';
import 'mocha';

const DataFrame = dataForge.DataFrame;

describe('DataFrame sort', () => {

	it('can sort nested objects using selector - ascending', function () {
		var dataframe = new DataFrame({
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
		var sorted = dataframe
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
		var dataframe = new DataFrame({
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
		var sorted = dataframe
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