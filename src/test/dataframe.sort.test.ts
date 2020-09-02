import * as dataForge from '../index';
import { assert, expect } from 'chai';
import 'mocha';

const DataFrame = dataForge.DataFrame;

describe('DataFrame sort', () => {

	it('can sort nested objects using selector - ascending', function () {
		var dataframe = new DataFrame({
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
		var sorted = dataframe
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
		var dataframe = new DataFrame({
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
		var sorted = dataframe
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

    it("orderby preserves column order - ascending - 1", () => {

        const df = new DataFrame({
            columnNames: ["A", "B"],
            values: [
                {
                    A: 10,
                    B: 20,
                },
                {
                    A: 5,
                    B: 30,
                },
            ],
        });

        const ordered = df.orderBy(row => row.A);
        expect(ordered.getColumnNames()).to.eql(["A", "B"]);
    });

    it("orderby preserves column order - ascending - 1", () => {

        const df = new DataFrame({
            columnNames: ["B", "A"],
            values: [
                {
                    A: 10,
                    B: 20,
                },
                {
                    A: 5,
                    B: 30,
                },
            ],
        });

        const ordered = df.orderBy(row => row.A);
        expect(ordered.getColumnNames()).to.eql(["B", "A"]);
    });

    it("orderby preserves column order - descending - 1", () => {

        const df = new DataFrame({
            columnNames: ["A", "B"],
            values: [
                {
                    A: 10,
                    B: 20,
                },
                {
                    A: 5,
                    B: 30,
                },
            ],
        });

        const ordered = df.orderByDescending(row => row.A);
        expect(ordered.getColumnNames()).to.eql(["A", "B"]);
    });

    it("orderby preserves column order - descending - 1", () => {

        const df = new DataFrame({
            columnNames: ["B", "A"],
            values: [
                {
                    A: 10,
                    B: 20,
                },
                {
                    A: 5,
                    B: 30,
                },
            ],
        });

        const ordered = df.orderByDescending(row => row.A);
        expect(ordered.getColumnNames()).to.eql(["B", "A"]);
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

        const df = new DataFrame({ values: data, considerAllRows: true })
            .orderBy((r) => r['account.name'])
            .thenBy((r) => r.date)
            .thenBy((r) => r.memo);
        expect(df.toArray()).to.eql([
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