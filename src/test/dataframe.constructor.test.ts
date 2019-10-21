import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { DataFrame } from '../lib/dataframe';
import { ArrayIterable } from '../lib/iterables/array-iterable';

describe('DataFrame constructor', () => {

    it('create dataframe from array of values', ()  => {
        const df = new DataFrame([
            { A: 10 }, 
            { A: 20 }, 
            { A: 30 }, 
        ]);
        expect(df.toArray()).to.eql([
            { A: 10 }, 
            { A: 20 }, 
            { A: 30 }, 
        ]);
    });

    it('dataframe automatically determines column names from objects', ()  => {
        const df = new DataFrame([
            { A: 10, B: 100 }, 
            { A: 20, B: 200 }, 
            { A: 30, B: 300 }, 
        ]);
        expect(df.getColumnNames()).to.eql(["A", "B"]);
    });
    
    it('create dataframe from empty array', ()  => {        
        expect(new DataFrame([]).toArray()).to.eql([]);
    });

    it('empty dataframe from empty array has no columns', ()  => {        
        expect(new DataFrame([]).getColumnNames()).to.eql([]);
    });
    
    it('create empty dataframe with no params', ()  => {
        expect(new DataFrame().toArray()).to.eql([]);
    });

    it('empty dataframe with no params has no columns', ()  => {        
        expect(new DataFrame().getColumnNames()).to.eql([]);
    });

    it('create empty dataframe from empty config', ()  => {        
        expect(new DataFrame({}).toArray()).to.eql([]);
    });

    it('empty dataframe with emptu config has no columns', ()  => {        
        expect(new DataFrame({}).getColumnNames()).to.eql([]);
    });

    it('create empty dataframe from config with no values, although index is set.', ()  => {        
        expect(new DataFrame({ index: [100, 200, 300] }).toArray()).to.eql([]);
    });

    it('create dataframe from array of values in config', ()  => {
        const dataFrame = new DataFrame({
            values: [
                { A: 10 }, 
                { A: 20 }, 
                { A: 30 }, 
            ],
        });
        expect(dataFrame.toArray()).to.eql([
            { A: 10 }, 
            { A: 20 }, 
            { A: 30 }, 
        ]);
    });
    
    it('create dataframe from empty array in config', ()  => {
        expect(new DataFrame({ values: [] }).toArray()).to.eql([]);
    });

    it('create dataframe with values iterable', () => {
        var dataframe = new DataFrame({ 
            values: new ArrayIterable([
                { A: 10 }, 
                { A: 20 }, 
                { A: 30 }, 
            ]) 
        });
        expect(dataframe.toArray()).to.eql([
            { A: 10 }, 
            { A: 20 }, 
            { A: 30 }, 
        ]);
    });

    it('passing something other than an array or iterable for values is an error', () => {
        // This isn't possible in TypeScript, but is in JavaScript.
        expect(() => new DataFrame({ values: <any>3 })).to.throw();
    })

    it('index is set by default when values are passed in by array', () => {
        const dataFrame = new DataFrame([
            { A: 10 }, 
            { A: 20 }, 
            { A: 30 }, 
        ]);

        expect(dataFrame.toPairs()).to.eql([
            [0, { A: 10 }],
            [1, { A: 20 }],
            [2, { A: 30 }],
        ]);
    });

    it('index is set by default when values are passed in by config', () => {
        var dataframe = new DataFrame({
            values: [
                { A: 10 }, 
                { A: 20 }, 
                { A: 30 }, 
            ]
        });

        expect(dataframe.toPairs()).to.eql([
            [0, { A: 10 }],
            [1, { A: 20 }],
            [2, { A: 30 }],
        ]);
    });

    it('can set index via array passed to constructor', () => {
        var dataframe = new DataFrame({
            values: [
                { A: 10 }, 
                { A: 20 }, 
                { A: 30 }, 
            ],
            index: [100, 200, 300]
        });

        expect(dataframe.toPairs()).to.eql([
            [100, { A: 10 }],
            [200, { A: 20 }],
            [300, { A: 30 }],
        ]);
    });

    it('can create dataframe with values array and index iterable', () => {
        var dataframe = new DataFrame({
            values: [
                { A: 10 }, 
                { A: 20 }, 
                { A: 30 }, 
            ],
            index: new ArrayIterable([100, 200, 300])
        });

        expect(dataframe.toPairs()).to.eql([
            [100, { A: 10 }],
            [200, { A: 20 }],
            [300, { A: 30 }],
        ]);

    });

    it('can create dataframe with values iterable and index iterable', () => {
        var dataframe = new DataFrame({
            values: new ArrayIterable([
                { A: 10 }, 
                { A: 20 }, 
                { A: 30 }, 
            ]),
            index: new ArrayIterable([100, 200, 300])
        });

        expect(dataframe.toPairs()).to.eql([
            [100, { A: 10 }],
            [200, { A: 20 }],
            [300, { A: 30 }],
        ]);

    });

    it('passing something other than an array or iterable for index is an error', () => {
        // This isn't possible in TypeScript, but is in JavaScript.
        expect(() => new DataFrame({ values: [10, 20, 30], index: <any>3 })).to.throw();
    });

    it('can create dataframe with index from another dataframe', () => {
        var dataframe = new DataFrame({
            values: [
                { A: 10 }, 
                { A: 20 }, 
                { A: 30 }, 
            ],
            index: new DataFrame([100, 200, 300])
        });

        expect(dataframe.toPairs()).to.eql([
            [100, { A: 10 }],
            [200, { A: 20 }],
            [300, { A: 30 }],
        ]);
    });

    it ('can get index from dataframe', () => {
        var dataframe = new DataFrame({
            values: [
                { A: 10 }, 
                { A: 20 }, 
                { A: 30 }, 
            ],
            index: [100, 200, 300]
        });

        expect(dataframe.getIndex().toArray()).to.eql([
            100,
            200,
            300,
        ]);
    });

    it('can create dataframe with index from another index', () => {
        var dataframe = new DataFrame({
            values: [
                { A: 10 }, 
                { A: 20 }, 
                { A: 30 }, 
            ],
            index: new Index([100, 200, 300])
        });

        expect(dataframe.toPairs()).to.eql([
            [100, { A: 10 }],
            [200, { A: 20 }],
            [300, { A: 30 }],
        ]);
    });

    it('can create dataframe from pairs', () => {
        var dataframe = new DataFrame({ 
            pairs: [
                [100, 10],
                [200, 20],
                [300, 30],                
            ],
        });

        expect(dataframe.getIndex().toArray()).to.eql([100, 200, 300]);
        expect(dataframe.toArray()).to.eql([10, 20, 30]);
    });

    it('can create dataframe from values and pairs', () => {
        var dataframe = new DataFrame({ 
            values: new ArrayIterable([
                5, 4, 6, // Bit of a trick here, using different values to the pairs.
            ]),
            pairs: new ArrayIterable([
                [100, 10],
                [200, 20],
                [300, 30],                
            ]),
        });

        expect(dataframe.getIndex().toArray()).to.eql([100, 200, 300]);
        expect(dataframe.toPairs()).to.eql([[100, 10], [200, 20], [300, 30]]);
        expect(dataframe.toArray()).to.eql([5, 4, 6]); // Different values! A hack to test.
    });

    it('can create dataframe from index and pairs', () => {
        var dataframe = new DataFrame({ 
            index: new ArrayIterable([
                15, 16, 17 // Trick. Separate index values.
            ]),
            pairs: new ArrayIterable([
                [100, 10],
                [200, 20],
                [300, 30],                
            ]),
        });

        expect(dataframe.getIndex().toArray()).to.eql([15, 16, 17]); // Different values!
        expect(dataframe.toPairs()).to.eql([[100, 10], [200, 20], [300, 30]]);
        expect(dataframe.toArray()).to.eql([10, 20, 30]);
    });

    it('can create dataframe from values, index and pairs', () => {
        var dataframe = new DataFrame({ 
            values: new ArrayIterable([
                5, 4, 6, // Bit of a trick here, using different values to the pairs.
            ]),
            index: new ArrayIterable([
                15, 16, 17 // Trick. Separate index values.
            ]),
            pairs: new ArrayIterable([
                [100, 10],
                [200, 20],
                [300, 30],                
            ]),
        });

        expect(dataframe.getIndex().toArray()).to.eql([15, 16, 17]); // Different values!
        expect(dataframe.toPairs()).to.eql([[100, 10], [200, 20], [300, 30]]);
        expect(dataframe.toArray()).to.eql([5, 4, 6]); // Different values! A hack to test.
    });

	it('can create from rows', function () {
		var columnNames = ["c1", "c2"];
		var dataFrame = new DataFrame({
			columnNames: columnNames,
			rows: [
				[1, 2],
				[3, 4],
			],
		});

		expect(dataFrame.getColumnNames()).to.eql(columnNames);
		expect(dataFrame.toArray()).to.eql([
			{ c1: 1, c2: 2 },
			{ c1: 3, c2: 4 },
		]);
    });
    
	it('can create from rows with index', function () {
		var columnNames = ["c1", "c2"];
		var dataFrame = new DataFrame({
			columnNames: columnNames,
			rows: [
				[1, 2],
				[3, 4],
			],
			index: [10, 11],
		});

		expect(dataFrame.getColumnNames()).to.eql(columnNames);
		expect(dataFrame.toPairs()).to.eql([
			[10, { c1: 1, c2: 2 }],
			[11, { c1: 3, c2: 4 }],
		]);
	});
    
	it("can handle undefined row", function () {
		var d = new DataFrame({
			columnNames: ["c1", "c2"],
			rows: <any[][]> [ // Cast is here to allow this in TypeScript. Normally this is not allowed, but it can be done in JavaScript so I want to handle it.
				[1, 2],
				undefined,
				[5, 2]
			],
		});

		expect(function () {
			d.toArray();
		}).to.throw();
	});

	it("can handle null row", function () {
		var d = new DataFrame({
			columnNames: ["c1", "c2"],
			rows: <any[][]> [ // Cast is here to allow this in TypeScript. Normally this is not allowed, but it can be done in JavaScript so I want to handle it.
				[1, 2],
				null,
				[5, 2]
			],
		});

		expect(function () {
			d.toArray();
		}).to.throw();
	});

    it('can get rows from dataframe', () => {
        const dataFrame = new DataFrame([
            { A: 10, B: 100 }, 
            { A: 20, B: 200 }, 
            { A: 30, B: 300 }, 
        ]);
        expect(dataFrame.toRows()).to.eql([
            [10, 100],
            [20, 200],
            [30, 300],
        ]);
    });

	it('can initialize from array of objects with different fields', () => {

		var dataFrame = new DataFrame({
				values: [
					{
						Col1: 1,
						Col2: 'hello',
					},
					{
						Col3: 10,
						Col4: 'computer',
					}
                ],
                considerAllRows: true,
			});

		expect(dataFrame.getColumnNames()).to.eql(["Col1", "Col2", "Col3", "Col4"]);

		expect(dataFrame.toRows()).to.eql([
			[1, 'hello', undefined, undefined],
			[undefined, undefined, 10, 'computer'],
		]);
		
		var columns = dataFrame.getColumns();
		expect(columns.count()).to.eql(4);

		expect(columns.at(0)!.name).to.eql("Col1");
		expect(columns.at(0)!.series.toArray()).to.eql([1]);

		expect(columns.at(1)!.name).to.eql("Col2");
		expect(columns.at(1)!.series.toArray()).to.eql(["hello"]);

		expect(columns.at(2)!.name).to.eql("Col3");
		expect(columns.at(2)!.series.toArray()).to.eql([10]);

		expect(columns.at(3)!.name).to.eql("Col4");
		expect(columns.at(3)!.series.toArray()).to.eql(["computer"]);
	});

	it('can initialize from array of objects with zero fields', () => {

		var dataFrame = new DataFrame({
				values: [
					{},
					{}
				]
			});

		expect(dataFrame.getColumnNames()).to.eql([]);
		expect(dataFrame.getColumns().count()).to.eql(0);
		expect(dataFrame.toRows()).to.eql([[], []]);
    });	
    

});
