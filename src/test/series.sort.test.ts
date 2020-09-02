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

    it("sorting with uneven columns", () => {

        const data = [
            { 'account.name': 'Cash' },
            { 'account.name': 'Investments/IRA' },
            { 'account.name': 'Cash', date: '2020-01-01' },
            { 'account.name': 'Cash', date: '2020-01-01', memo: 'orange' },
            { 'account.name': 'Investments', date: '2020-01-01' },
            { 'account.name': 'Investments' },
            { 'account.name': 'Cash', date: '2020-01-01', memo: 'apple' },
            { 'account.name': 'Investments', date: '2020-01-01', memo: 'apple' },
            { 'account.name': 'Investments', date: '2020-01-01', memo: 'orange' },
            { 'account.name': 'Investments/IRA', date: '2020-01-01', memo: 'apple' },
            { 'account.name': 'Investments/IRA', date: '2020-01-01' },
            { 'account.name': 'Investments/IRA', date: '2020-01-01', memo: 'orange' },
            { 'account.name': 'Cash', date: '2020-02-01', memo: 'apple' },
            { 'account.name': 'Cash', date: '2020-02-01' },
            { 'account.name': 'Cash', date: '2020-02-01', memo: 'orange' },
            { 'account.name': 'Investments', date: '2020-02-01', memo: 'apple' },
            { 'account.name': 'Investments', date: '2020-02-01', memo: 'orange' },
            { 'account.name': 'Investments', date: '2020-02-01' },
            { 'account.name': 'Investments/IRA', date: '2020-02-01' },
            { 'account.name': 'Investments/IRA', date: '2020-02-01', memo: 'apple' },
            { 'account.name': 'Investments/IRA', date: '2020-02-01', memo: 'orange' },
        ];

        const series = new Series(data)
            .orderBy((r) => r['account.name'])
            .thenBy((r) => r.date)
            .thenBy((r) => r.memo);
        expect(series.toArray()).to.eql([
            {
                "account.name": "Cash",
                "date": "2020-01-01",
                "memo": "apple"
            },
            {
                "account.name": "Cash",
                "date": "2020-01-01",
                "memo": "orange"
            },
            {
                "account.name": "Cash",
                "date": "2020-01-01"
            },
            {
                "account.name": "Cash",
                "date": "2020-02-01",
                "memo": "orange"
            },
            {
                "account.name": "Cash",
                "date": "2020-02-01"
            },
            {
                "account.name": "Cash",
                "date": "2020-02-01",
                "memo": "apple"
            },
            {
                "account.name": "Cash"
            },
            {
                "account.name": "Investments",
                "date": "2020-01-01",
                "memo": "apple"
            },
            {
                "account.name": "Investments",
                "date": "2020-01-01",
                "memo": "orange"
            },
            {
                "account.name": "Investments",
                "date": "2020-02-01"
            },
            {
                "account.name": "Investments",
                "date": "2020-02-01",
                "memo": "apple"
            },
            {
                "account.name": "Investments",
                "date": "2020-02-01",
                "memo": "orange"
            },
            {
                "account.name": "Investments"
            },
            {
                "account.name": "Investments",
                "date": "2020-01-01"
            },
            {
                "account.name": "Investments/IRA",
                "date": "2020-01-01",
                "memo": "orange"
            },
            {
                "account.name": "Investments/IRA",
                "date": "2020-01-01"
            },
            {
                "account.name": "Investments/IRA",
                "date": "2020-01-01",
                "memo": "apple"
            },
            {
                "account.name": "Investments/IRA",
                "date": "2020-02-01",
                "memo": "apple"
            },
            {
                "account.name": "Investments/IRA",
                "date": "2020-02-01",
                "memo": "orange"
            },
            {
                "account.name": "Investments/IRA",
                "date": "2020-02-01"
            },
            {
                "account.name": "Investments/IRA"
            }
        ]);        
    });
});