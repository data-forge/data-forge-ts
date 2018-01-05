import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { DataFrame } from '../lib/dataframe';
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
});