import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { DataFrame } from '../lib/dataframe';
import { Series } from '../lib/series';
import { ArrayIterable } from '../lib/iterables/array-iterable';

describe('DataFrame columns', () => {

    it('can get column name from empty dataframe - no params', ()  => {

        var dataFrame = new DataFrame();

        expect(dataFrame.getColumnNames()).to.eql([]);
    });
    
    it('can get column name from empty dataframe - array', ()  => {

        var dataFrame = new DataFrame([]);

        expect(dataFrame.getColumnNames()).to.eql([]);
    });

    it('can get column name from empty dataframe - config', ()  => {

        var dataFrame = new DataFrame({});

        expect(dataFrame.getColumnNames()).to.eql([]);
    });

    it('can get column name from first object in array', ()  => {

        var dataFrame = new DataFrame([
            {
                A: 1,
                B: 10,
            },
            {
                C: 2,
                D: 20,
            }
        ]);

        expect(dataFrame.getColumnNames()).to.eql(["A", "B"]);
    });

    it('can get column name from first object in config values iterable', ()  => {

        var dataFrame = new DataFrame({
            values: new ArrayIterable([
                {
                    A: 1,
                    B: 10,
                },
                {
                    C: 2,
                    D: 20,
                }
            ])
        });

        expect(dataFrame.getColumnNames()).to.eql(["A", "B"]);
    });

    it('can get column name from first item in pairs iterable', ()  => {

        var dataFrame = new DataFrame({
            pairs: new ArrayIterable([
                [
                    100, 
                    {
                        A: 1,
                        B: 10,
                    },
                ],
                [
                    200,
                    {
                        C: 2,
                        D: 20,
                    }
                ]
            ])
        });

        expect(dataFrame.getColumnNames()).to.eql(["A", "B"]);
    });

    it('select can rewrite column names', () => {

        var dataFrame = new DataFrame([
            {
                A: 1,
                B: 10,
            },
            {
                A: 2,
                B: 20,
            }
        ]);

        var modified = dataFrame.select(v => ({ X: v.A, Y: v.B }));
        expect(modified.getColumnNames()).to.eql(["X", "Y"]);
        expect(modified.toArray()).to.eql([
            {
                X: 1,
                Y: 10,
            },
            {
                X: 2,
                Y: 20,
            }
        ]);
    });

    it('can create dataframe with array of column names', () => {

        var dataFrame = new DataFrame({
            columnNames: ["A", "B"],
        });

        expect(dataFrame.getColumnNames()).to.eql(["A", "B"]);
    });

    it('can create dataframe with array of column names that override the content', () => {

        var dataFrame = new DataFrame({
            values: [
                {
                    A: 1,
                    B: 10,
                },
            ],
            columnNames: ["X", "Y"],
        });

        expect(dataFrame.getColumnNames()).to.eql(["X", "Y"]);
    });

    it('can create dataframe with iterable of column names that override input values', () => {

        var dataFrame = new DataFrame({
            values: [
                {
                    A: 1,
                    B: 10,
                },
            ],
            columnNames: new ArrayIterable(["X", "Y"]),
        });

        expect(dataFrame.getColumnNames()).to.eql(["X", "Y"]);
    });

    it('can create dataframe with iterable of column names that override input pairs', () => {

        var dataFrame = new DataFrame({
            pairs: [
                [
                    10, 
                    {
                        A: 1,
                        B: 10,
                    },
                ],
            ],
            columnNames: new ArrayIterable(["X", "Y"]),
        });

        expect(dataFrame.getColumnNames()).to.eql(["X", "Y"]);
    });

	it('creating from objects with variable fields - by default just uses first row to determine column names', function () {
		
		var dataFrame = new DataFrame({
			values: [
				{ c1: 1, c2: 2 },
				{ c3: 3, c4: 4 },
			],
		});

		var columnNames = ["c1", "c2"];
		expect(dataFrame.getColumnNames()).to.eql(columnNames);
		expect(dataFrame.toArray()).to.eql([
			{ c1: 1, c2: 2 },
			{ c3: 3, c4: 4 },
		]);
	});

	it('creating from objects with variable fields - can force all rows to be considered to determine column names', function () {
		
		var dataFrame = new DataFrame({
			values: [
				{ c1: 1, c2: 2 },
				{ c3: 3, c4: 4 },
			],
			considerAllRows: true,
		});

		var columnNames = ["c1", "c2", "c3", "c4"];
		expect(dataFrame.getColumnNames()).to.eql(columnNames);
		expect(dataFrame.toPairs()).to.eql([
			[0, { c1: 1, c2: 2 }],
			[1, { c3: 3, c4: 4 }],
		]);
	});

	it('can create data frame from column arrays with index', function () {

		var df = new DataFrame({
			columns: {
				A: [1, 2, 3, 4],
				B: ['a', 'b', 'c', 'd'],
			},

			index: [10, 20, 30, 40],
        });
        
        expect(df.getColumnNames()).to.eql(["A", "B"]);
		expect(df.toPairs()).to.eql([
			[10, { A: 1, B: 'a' }],
			[20, { A: 2, B: 'b' }],
			[30, { A: 3, B: 'c' }],
			[40, { A: 4, B: 'd' }],
		]);
	});

	it('can create data frame from column arrays - array', function () {

		var df = new DataFrame({
			columns: {
				A: [1, 2, 3, 4],
				B: ['a', 'b', 'c', 'd'],
			},

			index: [11, 12, 13, 14],
        });
        
        expect(df.getColumnNames()).to.eql(["A", "B"]);
		expect(df.toPairs()).to.eql([
			[11, { A: 1, B: 'a' }],
			[12, { A: 2, B: 'b' }],
			[13, { A: 3, B: 'c' }],
			[14, { A: 4, B: 'd' }],
		]);
	});

	it('can create dataframe from columns - with series', function () {

		var df = new DataFrame({
			columns: {
				A: new Series([1, 2, 3, 4]),
				B: new Series(['a', 'b', 'c', 'd']),
			},
		});

        expect(df.getColumnNames()).to.eql(["A", "B"]);
		expect(df.toArray()).to.eql([
			{ A: 1, B: 'a' },
			{ A: 2, B: 'b' },
			{ A: 3, B: 'c' },
			{ A: 4, B: 'd' },
		]);
	});

	it('can create data frame from column arrays - default index', function () {

		var df = new DataFrame({
			columns: {
				A: [1, 2, 3, 4],
				B: ['a', 'b', 'c', 'd'],
			},
		});

        expect(df.getColumnNames()).to.eql(["A", "B"]);
		expect(df.toPairs()).to.eql([
			[0, { A: 1, B: 'a' }],
			[1, { A: 2, B: 'b' }],
			[2, { A: 3, B: 'c' }],
			[3, { A: 4, B: 'd' }],
		]);
	});

	it('duplicates columns are renamed to be unique - rows', function () {

		var df = new DataFrame({
			columnNames: [
				"some-column",
				"some-Column",
			],
			values: [
				[1, 2],
				[3, 4],
			],
		});

		expect(df.getColumnNames()).to.eql(["some-column.1", "some-Column.2"]);
		expect(df.toArray()).to.eql([
			{
				"some-column.1": 1,
				"some-Column.2": 2,
			},
			{
				"some-column.1": 3,
				"some-Column.2": 4,
			},
		]);
	});
});