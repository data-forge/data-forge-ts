import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { DataFrame } from '../lib/dataframe';
import { ArrayIterable } from '../lib/iterables/array-iterable';
import { Series } from '../lib/series';

describe('DataFrame series', () => {

    it('can get series from dataframe', () => {

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

        expect(dataFrame.getSeries("B").toArray()).to.eql([10, 20]);
    });

    it('can get index from series from dataframe', () => {

        var dataFrame = new DataFrame({
            pairs: [
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
                        A: 2,
                        B: 20,
                    },
                ],
            ]
        });

        expect(dataFrame.getSeries("B").getIndex().toArray()).to.eql([100, 200]);
    });

	it('when a series is extracted from a dataframe, undefined values are stripped out.', () => {
		
		var dataFrame = new DataFrame({
			columnNames: [ "S" ],
			rows: [
				[undefined],
				[11],
				[undefined],
				[12],
				[undefined],
			]
        });
		
		var series = dataFrame.getSeries('S');
		expect(series.toPairs()).to.eql([
			[1, 11],
			[3, 12],
		]);
    });

	it('retreive a non-existing column results in an empty series', () => {

		var dataFrame = new DataFrame({
			columnNames: ["C1"],
			rows: [
				[1]
			],
		});

		var series = dataFrame.getSeries("non-existing-column");
		expect(series.toPairs()).to.eql([]);
	});

	it('can ensure series that doesnt exist', () => {

		var dataFrame = new DataFrame({
			columnNames: ["C1"],
			rows: [
				[1],
				[2],
			],
		});

		console.log(dataFrame.toArray());

		var modified = dataFrame.ensureSeries("C2", new Series({ values: [10, 20] }));

		expect(modified.getColumnNames()).to.eql(["C1", "C2"]);
		expect(modified.toRows()).to.eql([
			[1, 10],
			[2, 20],
		]);
	});

	it('can ensure series that already exists', () => {

		var dataFrame = new DataFrame({
			columnNames: ["C1", "C2"],
			rows: [
				[1, 52],
				[2, 53],
			],
		});

		var modified = dataFrame.ensureSeries("C2", new Series({ values: [100, 200] }));

		expect(modified.getColumnNames()).to.eql(["C1", "C2"]);
		expect(modified.toRows()).to.eql([
			[1, 52],
			[2, 53],
		]);
	});

    it('can set new series', () => {
		
		var dataFrame = new DataFrame({
			columnNames: [ "Date", "Value1", "Value2", "Value3" ],
			rows: [
				[new Date(2011, 24, 2), 300, 'c', 3],
				[new Date(1975, 24, 2), 200, 'b', 1],
				[new Date(2013, 24, 2), 20, 'c', 22],
				[new Date(2015, 24, 2), 100, 'd', 4],
			],
			index: [5, 6, 7, 8]
        });
    
        var series = new Series({ index: [5, 6, 7, 8], values: [1, 2, 3, 4] });
		var modified = dataFrame.withSeries('Value4', series);
		expect(modified.getIndex().toArray()).to.eql([5, 6, 7, 8]);
		expect(modified.getColumnNames()).to.eql([
			"Date",
			"Value1",
			"Value2",
			"Value3",
			"Value4",
		]);
		expect(modified.toRows()).to.eql([
			[new Date(2011, 24, 2), 300, 'c', 3, 1],
			[new Date(1975, 24, 2), 200, 'b', 1, 2],
			[new Date(2013, 24, 2), 20, 'c', 22, 3],
			[new Date(2015, 24, 2), 100, 'd', 4, 4],
		]);
	});

	it('can set existing series', () => {
		
		var dataFrame = new DataFrame({
			columnNames: [ "Date", "Value1", "Value2", "Value3" ],
			rows: [
				[new Date(2011, 24, 2), 300, 'c', 3],
				[new Date(1975, 24, 2), 200, 'b', 1],
				[new Date(2013, 24, 2), 20, 'c', 22],
				[new Date(2015, 24, 2), 100, 'd', 4],
			],
			index: [5, 6, 7, 8]
        });
		var series = new Series({ index: [5, 6, 7, 8], values: [1, 2, 3, 4] });
		var modified = dataFrame.withSeries('Value1', series);
		expect(modified.getIndex().toArray()).to.eql([5, 6, 7, 8]);
		expect(modified.toRows()).to.eql([
			[new Date(2011, 24, 2), 1, 'c', 3],
			[new Date(1975, 24, 2), 2, 'b', 1],
			[new Date(2013, 24, 2), 3, 'c', 22],
			[new Date(2015, 24, 2), 4, 'd', 4],		
		]);
	});

	it('can set series from another dataframe', () => {
		
		var dataFrame1 = new DataFrame({
			columnNames: [ "Date", "Value1", "Value2", "Value3" ],
			rows: [
				[new Date(1975, 24, 2), 100, 'foo', 11],
				[new Date(2015, 24, 2), 200, 'bar', 22],
			],
			index: [5, 6]
        });
		var dataFrame2 = new DataFrame({
			columnNames: [ "Date", "Value1", "Value2", "Value3" ],
            rows: [
				[new Date(2011, 24, 2), 300, 'c', 3],
				[new Date(1975, 24, 2), 200, 'b', 1],
				[new Date(2013, 24, 2), 20, 'c', 22],
				[new Date(2015, 24, 2), 100, 'd', 4],
			],
			index: [5, 6, 7, 8]
        });
		var modified = dataFrame2.withSeries('Value4', dataFrame1.getSeries('Value2'));
		expect(modified.getColumnNames()).to.eql([
			"Date",
			"Value1",
			"Value2",
			"Value3",
			"Value4",
		]);
		expect(modified.toRows()).to.eql([
			[new Date(2011, 24, 2), 300, 'c', 3, 'foo'],
			[new Date(1975, 24, 2), 200, 'b', 1, 'bar'],
			[new Date(2013, 24, 2), 20, 'c', 22, undefined],
			[new Date(2015, 24, 2), 100, 'd', 4, undefined],
		]);
    });
    
	it('can ensure that series exists - with series generator function', () => {

		var dataFrame = new DataFrame({
			columnNames: ["C1"],
			rows: [
				[1],
				[2],
			],
		});

		console.log(dataFrame.toArray());

		var modified = dataFrame.ensureSeries("C2", df => new Series({ values: [10, 20] }));

		expect(modified.getColumnNames()).to.eql(["C1", "C2"]);
		expect(modified.toRows()).to.eql([
			[1, 10],
			[2, 20],
		]);
	});

	it('can ensure that series already exists - with series generator function', () => {

		var dataFrame = new DataFrame({
			columnNames: ["C1", "C2"],
			rows: [
				[1, 52],
				[2, 53],
			],
		});

		var modified = dataFrame.ensureSeries("C2", df => new Series({ values: [100, 200] }));

		expect(modified.getColumnNames()).to.eql(["C1", "C2"]);
		expect(modified.toRows()).to.eql([
			[1, 52],
			[2, 53],
		]);
	});

	it('can ensure that series exists - with column spec', () => {

		var dataFrame = new DataFrame({
			columnNames: ["C1"],
			rows: [
				[1],
				[2],
			],
		});

		console.log(dataFrame.toArray());

		var modified = dataFrame.ensureSeries({ C2: new Series({ values: [10, 20] }) });

		expect(modified.getColumnNames()).to.eql(["C1", "C2"]);
		expect(modified.toRows()).to.eql([
			[1, 10],
			[2, 20],
		]);
	});

	it('can ensure that series already exists - with column spec', () => {

		var dataFrame = new DataFrame({
			columnNames: ["C1", "C2"],
			rows: [
				[1, 52],
				[2, 53],
			],
		});

		var modified = dataFrame.ensureSeries({ C2: new Series({ values: [100, 200] }) });

		expect(modified.getColumnNames()).to.eql(["C1", "C2"]);
		expect(modified.toRows()).to.eql([
			[1, 52],
			[2, 53],
		]);
	});

	it('can ensure that series exists - with column spec and series generator fn', () => {

		var dataFrame = new DataFrame({
			columnNames: ["C1"],
			rows: [
				[1],
				[2],
			],
		});

		console.log(dataFrame.toArray());

		var modified = dataFrame.ensureSeries({ C2: (df: any) => new Series({ values: [10, 20] }) });

		expect(modified.getColumnNames()).to.eql(["C1", "C2"]);
		expect(modified.toRows()).to.eql([
			[1, 10],
			[2, 20],
		]);
	});

	it('can ensure that series already exists - with column spec and series generator fn', () => {

		var dataFrame = new DataFrame({
			columnNames: ["C1", "C2"],
			rows: [
				[1, 52],
				[2, 53],
			],
		});

		var modified = dataFrame.ensureSeries({ C2: (df: any) => new Series({ values: [100, 200] }) });

		expect(modified.getColumnNames()).to.eql(["C1", "C2"]);
		expect(modified.toRows()).to.eql([
			[1, 52],
			[2, 53],
		]);
	});

	it('can drop column', () => {
		
		var dataFrame = new DataFrame({
			columnNames: [ "Date", "Value1", "Value2", "Value3" ],
			rows: [
				[new Date(2011, 24, 2), 300, 'c', 3],
				[new Date(1975, 24, 2), 200, 'b', 1],
				[new Date(2013, 24, 2), 20, 'c', 22],
				[new Date(2015, 24, 2), 100, 'd', 4],
			],
			index: [5, 6, 7, 8]
        });
		var modified = dataFrame.dropSeries('Date');
		expect(modified.getIndex().toArray()).to.eql([5, 6, 7, 8]);
		expect(modified.toRows()).to.eql([
			[300, 'c', 3],
			[200, 'b', 1],
			[20, 'c', 22],
			[100, 'd', 4],
		]);
	});

	it('can drop multiple columns', () => {
		
		var dataFrame = new DataFrame({
			columnNames: [ "Date", "Value1", "Value2", "Value3" ],
			rows: [
				[new Date(2011, 24, 2), 300, 'c', 3],
				[new Date(1975, 24, 2), 200, 'b', 1],
				[new Date(2013, 24, 2), 20, 'c', 22],
				[new Date(2015, 24, 2), 100, 'd', 4],
			],
			index: [5, 6, 7, 8]
		});
        var modified = dataFrame.dropSeries(['Date', 'Value2'])
		expect(modified.getIndex().toArray()).to.eql([5, 6, 7, 8]);
		expect(modified.toRows()).to.eql([
			[300, 3],
			[200, 1],
			[20, 22],
			[100, 4],
        ]);
		expect(modified.toArray()).to.eql([
            {
                Value1: 300,
                Value3: 3,
            },
            {
                Value1: 200,
                Value3: 1,
            },
            {
                Value1: 20,
                Value3: 22,
            },
            {
                Value1: 100,
                Value3: 4,
            },
		]);
    });

	it('dropping non-existing column has no effect', () => {
		
		var columnNames = [ "Date", "Value1", "Value2", "Value3" ];
		var dataFrame = new DataFrame({
			columnNames: columnNames,
			rows: [
				[new Date(2011, 24, 2), 300, 'c', 3],
				[new Date(1975, 24, 2), 200, 'b', 1],
				[new Date(2013, 24, 2), 20, 'c', 22],
				[new Date(2015, 24, 2), 100, 'd', 4],
			],
			index: [5, 6, 7, 8]
		});
		var modified = dataFrame.dropSeries('non-existing-column');
		expect(modified.getIndex().toArray()).to.eql([5, 6, 7, 8]);
		expect(modified.getColumnNames()).to.eql(columnNames);
		expect(modified.toRows()).to.eql([
				[new Date(2011, 24, 2), 300, 'c', 3],
				[new Date(1975, 24, 2), 200, 'b', 1],
				[new Date(2013, 24, 2), 20, 'c', 22],
				[new Date(2015, 24, 2), 100, 'd', 4],
		]);
	});
    
	it('can retreive column subset as new dataframe', function () 
	{
		var dataFrame = new DataFrame({
			columnNames: [ "Date", "Value1", "Value2", "Value3" ],
			rows: [
				[new Date(1975, 24, 2), 100, 'foo', 11],
				[new Date(2015, 24, 2), 200, 'bar', 22],
			],
			index: [5, 6]
		});
		var subset = dataFrame.subset(['Value3', 'Value1']);
		expect(dataFrame).not.to.equal(subset); 
		expect(subset.getIndex().toArray()).to.eql([5, 6]);
		expect(subset.toRows()).to.eql([
			[11, 100],
			[22, 200],
		]);
	});
	
	it('can keep column', () => {
		
		var dataFrame = new DataFrame({
			columnNames: [ "Value1", "Value2", "Value3" ],
			rows: [
				[300, 'c', 3],
				[200, 'b', 1],
				[20, 'c', 22],
				[100, 'd', 4],
			],
			index: [5, 6, 7, 8]
		});
		var modified = dataFrame.subset(['Value1']);
		expect(modified.getColumnNames()).to.eql(['Value1']);
		expect(modified.getIndex().toArray()).to.eql([5, 6, 7, 8]);
		expect(modified.toRows()).to.eql([
			[300],
			[200],
			[20],
			[100],
		]);
	});

	it('can keep multiple columns', () => {
		
		var dataFrame = new DataFrame({
			columnNames: [ "Value1", "Value2", "Value3" ],
			rows: [
				[300, 'c', 3],
				[200, 'b', 1],
				[20, 'c', 22],
				[100, 'd', 4],
			],
			index: [5, 6, 7, 8]
        });

		var modified = dataFrame.subset(['Value1', 'Value3']);
		expect(modified.getColumnNames()).to.eql(['Value1', 'Value3']);
		expect(modified.getIndex().toArray()).to.eql([5, 6, 7, 8]);
		expect(modified.toRows()).to.eql([
			[300, 3],
			[200, 1],
			[20, 22],
			[100, 4],
        ]);
		expect(modified.toArray()).to.eql([
            {
                Value1: 300,
                Value3: 3,
            },
            {
                Value1: 200,
                Value3: 1,
            },
            {
                Value1: 20,
                Value3: 22,
            },
            {
                Value1: 100,
                Value3: 4,
            },
		]);
	});

	it('can retreive columns', () => {
		
		var dataFrame = new DataFrame({
			columnNames: [ "Date", "Value1", "Value2", "Value3" ],
			rows: [
				[new Date(1975, 24, 2), 100, 'foo', 11],
				[new Date(2015, 24, 2), 200, 'bar', 22],
			],
			index: [5, 6]
        });
		var columns = dataFrame.getColumns();
		expect(columns.count()).to.eql(4);

		expect(columns.at(0)!.name).to.eql('Date');
		expect(columns.at(0)!.series.toArray()).to.eql([new Date(1975, 24, 2), new Date(2015, 24, 2)]);

		expect(columns.at(2)!.name).to.eql('Value2');
		expect(columns.at(2)!.series.toArray()).to.eql(['foo', 'bar']);
    });

	it('column being merged is reindexed', () => {

		var dataFrame = new DataFrame({
			columnNames: [ "Date", "Value1", "Value2", "Value3" ],
			rows: [
				[new Date(2011, 24, 2), 300, 'c', 3],
				[new Date(1975, 24, 2), 200, 'b', 1],
				[new Date(2013, 24, 2), 20, 'c', 22],
				[new Date(2015, 24, 2), 100, 'd', 4],
			],
			index: [5, 6, 7, 8]
        });
		
		var newColumnName = "new column";
		var newIndex = [0, 5, 2, 7];
		var newSeries = new Series({ values: [4, 3, 2, 1], index: newIndex });
		var modified = dataFrame.withSeries(newColumnName, newSeries);
		var mergedSeries = modified.getSeries(newColumnName);

		expect(modified.getIndex().take(4).toArray()).to.eql([5, 6, 7, 8]);
		expect(modified.getColumnNames()).to.eql([
			"Date",
			"Value1",
			"Value2",
			"Value3",
			newColumnName,
		]);
		expect(modified.toRows()).to.eql([
			[new Date(2011, 24, 2), 300, 'c', 3, 3],
			[new Date(1975, 24, 2), 200, 'b', 1, undefined],
			[new Date(2013, 24, 2), 20, 'c', 22, 1],
			[new Date(2015, 24, 2), 100, 'd', 4, undefined],
		]);

		expect(mergedSeries.getIndex().take(4).toArray()).to.eql([5, 6, 7, 8]);
		expect(mergedSeries.toArray()).to.eql([3, 1]);
    });
    
	it('can set series on empty dataframe', () => {

		var dataFrame = new DataFrame();
        var withSeries = dataFrame.withSeries("NewSeries", new Series({ values: [1, 2, 3] }))
        
		expect(withSeries.getColumnNames()).to.eql(["NewSeries"]);
		expect(withSeries.toRows()).to.eql([
			[1],
			[2],
			[3],
		]);
	});
    
	it('can generate new series', () => {

		var dataFrame = new DataFrame({
				columnNames: ["A"],
				rows: [[1], [2], [3]],
			});
		var withSeries = dataFrame
			.withSeries("B", df => {
				return new Series({ values: [10, 20, 30]});				
			});

		expect(withSeries.getColumnNames()).to.eql(["A", "B"]);
		expect(withSeries.toRows()).to.eql([
			[1, 10],
			[2, 20],
			[3, 30],
		]);
    });

	it('can transform existing series', () => {

		var dataFrame = new DataFrame({
				columnNames: ["A"],
				rows: [[1], [2], [3]],
			});
		var modified = dataFrame
			.withSeries("B", df => {
				return df.getSeries<number>("A").select(v => v * 10); 
			});

		expect(modified.getColumnNames()).to.eql(["A", "B"]);
		expect(modified.toRows()).to.eql([
			[1, 10],
			[2, 20],
			[3, 30],
		]);
	});

	it('can set new series - using column spec', () => {

		var dataFrame = new DataFrame({
				columnNames: ["A"],
				rows: [[1], [2], [3]],
			});
		var modified = dataFrame
			.withSeries({ 
				B: new Series({ values: [10, 20, 30] }), 
			});

		expect(modified.getColumnNames()).to.eql(["A", "B"]);
		expect(modified.toRows()).to.eql([
			[1, 10],
			[2, 20],
			[3, 30],
		]);
	});

	it('can set multiple series - using column spec', () => {

		var dataFrame = new DataFrame({
				columnNames: ["A"],
				rows: [[1], [2], [3]],
			});
		var modified = dataFrame
			.withSeries({ 
                B: new Series({ values: [10, 20, 30] }), 
                C: new Series({ values: [100, 200, 300] }), 
			});

		expect(modified.getColumnNames()).to.eql(["A", "B", "C"]);
		expect(modified.toRows()).to.eql([
			[1, 10, 100],
			[2, 20, 200],
			[3, 30, 300],
		]);
    });
    
	it('can generate new series - using column spec', () => {

		var dataFrame = new DataFrame({
				columnNames: ["A"],
				rows: [[1], [2], [3]],
			});
		var modified = dataFrame
			.withSeries({
				B: df => new Series({ values: [10, 20, 30]})
			});

		expect(modified.getColumnNames()).to.eql(["A", "B"]);
		expect(modified.toRows()).to.eql([
			[1, 10],
			[2, 20],
			[3, 30],
		]);
	});

	it('can transform existing series - using column spec', () => {

		var dataFrame = new DataFrame({
				columnNames: ["A"],
				rows: [[1], [2], [3]],
			});
		var modified = dataFrame
			.withSeries({
				B: df => df.getSeries<number>("A").select(v => v * 10) ,
			});

		expect(modified.getColumnNames()).to.eql(["A", "B"]);
		expect(modified.toRows()).to.eql([
			[1, 10],
			[2, 20],
			[3, 30],
		]);
	});

	it('can reorder existing columns', () => {

		var df = new DataFrame({
			columnNames: [ "Col1", "Col2" ],
			rows: [
				['foo', 11],
				['bar', 22],
			],
			index: [5, 6]
        });

		var remapped = df.reorderSeries(["Col2", "Col1"]);

		expect(remapped.getColumnNames()).to.eql([ "Col2", "Col1" ]);
		expect(remapped.toRows()).to.eql([
			[11, 'foo'],
			[22, 'bar'],
		]);
	});

	it('columns not in remap table are dropped', () => {

		var df = new DataFrame({
			columnNames: [ "Col1", "Col2" ],
			rows: [
				['foo', 11],
				['bar', 22],
			],
			index: [5, 6]
        });

		var remapped = df.reorderSeries(["Col2"]);

		expect(remapped.getColumnNames()).to.eql([ "Col2" ]);
		expect(remapped.toRows()).to.eql([
			[11],
			[22],
		]);
	});

	it('new columns in remap table are initialised to a column of empty values', () => {

		var df = new DataFrame({
			columnNames: [ "Col1", "Col2" ],
			rows: [
				['foo', 11],
				['bar', 22],
			],
			index: [5, 6]
        });

		var remapped = df.reorderSeries(["New Column", "Col2"]);

		expect(remapped.getColumnNames()).to.eql([ "New Column", "Col2" ]);
		expect(remapped.toRows()).to.eql([
			[undefined, 11],
			[undefined, 22],
		]);
    });

	it('can rename single column', () => {

		var df = new DataFrame({
            columnNames: ["Column1", "Column2", "Column3"], 
			rows: [
                ['A', 1],
                ['B', 2],
            ],
            index: [10, 11]
        });

		var columnDef = {
            "Column2": "NewColumnName"
        };
		var renamed = df.renameSeries(columnDef);

		expect(df.getColumnNames()[1]).to.eql("Column2");

		expect(renamed.getColumnNames()[1]).to.eql("NewColumnName");
		expect(renamed.getSeries("NewColumnName")).to.be.ok;
	});

	it('renaming non-existing column has no effect', () => {

		var columnNames = ["Column1", "Column2"];
		var df = new DataFrame({
            columnNames: columnNames, 
            rows: [
                ['A', 1],
                ['B', 2],
            ],
            index: [10, 11]
        });

		var columnDef = {
            "some-column-that-doesnt-exist": "new-column-name"
        };
		var renamed = df.renameSeries(columnDef);

		expect(df.getColumnNames()).to.eql(columnNames);
		expect(df.getIndex().toArray()).to.eql([10, 11]);
		expect(df.toRows()).to.eql([
			['A', 1],
			['B', 2],
		]);
    });	
        
	it('can rename all columns', () => {

		var df = new DataFrame({
			columnNames: [ "Col1", "Col2", "Col3" ],
			rows: [
				[300, 'c', 3],
				[200, 'b', 1],
			],
			index: [5, 6]
        });

		var newColumnNames = {
            "Col1": "Val1", 
            "Col2": "Val2", 
            "Col3": "Val3"
        };
		var renamed = df.renameSeries(newColumnNames);
		expect(renamed.getColumnNames()).to.eql(["Val1", "Val2", "Val3"]);
    });

	it('can deflate dataframe to series', () => {

		var df = new DataFrame({
                columnNames: ["Column1", "Column2"], 
                rows: [
                    [1, 10],
                    [2, 20],
                    [3, 30],
                ],
                index: [10, 11, 12]
            });

		var series = df.deflate(row => row.Column1 + row.Column2);
		expect(series.toArray()).to.eql([11, 22, 33]);
    });

	it('can deflate dataframe to series with no selector', () => {

		var df = new DataFrame({
                columnNames: ["Column1"], 
                values: [33, 44, 55],
            });

		var series = df.deflate();
		expect(series.toArray()).to.eql([33, 44, 55]);
    });
    
	it('can transform column', () => {

		var df = new DataFrame({
				columnNames: ["Column1", "Column2"], 
				rows: [
					['A', 1],
					['B', 2],
				],
				index: [10, 11]
            });

		var modified = df.transformSeries({
				Column2: value => value + 100,
            });
            
		expect(df.getSeries("Column2").toArray()).to.eql([1, 2]);
		expect(modified.getSeries("Column2").toArray()).to.eql([101, 102]);
	});

	it('can transform multiple columns', () => {

		var df = new DataFrame({
		        columnNames: ["Column1", "Column2"], 
				rows: [
					['A', 1],
					['B', 2],
				],
				index: [10, 11]
            });

		var modified = df.transformSeries({
				Column2: value => value + 100,
				Column1: value => value + value
            });
            
		expect(df.getSeries("Column1").toArray()).to.eql(['A', 'B']);
		expect(df.getSeries("Column2").toArray()).to.eql([1, 2]);
		expect(modified.getSeries("Column1").toArray()).to.eql(['AA', 'BB']);
		expect(modified.getSeries("Column2").toArray()).to.eql([101, 102]);
	});

	it('transforming non-existing column has no effect', () => {

		var df = new DataFrame({
				columnNames: ["Column1", "Column2"], 
				rows: [
					['A', 1],
					['B', 2],
				],
				index: [10, 11]
            });

		var modified = df.transformSeries({
				"non-existing-column": value => value + 100,
            });
            
		expect(df).to.equal(modified);
        expect(df.getColumnNames()).to.eql(["Column1", "Column2"]);
        expect(df.toArray()).to.eql([
                {
                    Column1: 'A',
                    Column2: 1,
                },
                {
                    Column1: 'B',
                    Column2: 2,
                },
            ]);
	});

	it('transforming a normal column and a non-existing column has no additional effect', () => {

		var df = new DataFrame({
				columnNames: ["Column1", "Column2"], 
				rows: [
					['A', 1],
					['B', 2],
				],
				index: [10, 11]
            });

		var modified = df.transformSeries({
                Column2: v => v + 5,
				"non-existing-column": value => value + 100,
			});

        expect(modified.toArray()).to.eql([
                {
                    Column1: 'A',
                    Column2: 6,
                },
                {
                    Column1: 'B',
                    Column2: 7,
                },
            ]);
        });
    
	it('can generate series - function version', () => {

		var df = new DataFrame({
                columnNames: ["Column1", "Column2"], 
                rows: [
					[1, 10],
					[2, 20],
					[3, 30],
				],
				index: [10, 11, 12]
            });

		var modified = df.generateSeries(row => ({
                NewColumn: row.Column1 + row.Column2,
			}));

		expect(df.getColumnNames()).to.eql(["Column1", "Column2"]);
		expect(modified.getColumnNames()).to.eql(["Column1", "Column2", "NewColumn"]);
		expect(modified.getSeries("NewColumn").toArray()).to.eql([11, 22, 33]);
	});

	it('can generate series - object version', () => {

		var df = new DataFrame({
                columnNames: ["Column1", "Column2"], 
                rows: [
                    [1, 10],
                    [2, 20],
                    [3, 30],
                ],
                index:[10, 11, 12]
            });

		var modified = df.generateSeries({
				NewColumn: row => row.Column1 + row.Column2
			});
			
		expect(df.getColumnNames()).to.eql(["Column1", "Column2"]);
		expect(modified.getColumnNames()).to.eql(["Column1", "Column2", "NewColumn"]);
		expect(modified.getSeries("NewColumn").toArray()).to.eql([11, 22, 33]);
	});    

	it('can inflate column to new columns', function () {

		var df = new DataFrame({
			columnNames: ["a", "b"], 
			rows: [
				[1, { X: 2, Y: 3 }], 
				[4, { X: 5, Y: 6 }],
			]
        });

		var inflated = df.inflateSeries("b");
		expect(inflated.getColumnNames()).to.eql(["a", "b", "X", "Y"]);
		expect(inflated.toRows()).to.eql([
			[1, { X: 2, Y: 3 }, 2, 3],
			[4, { X: 5, Y: 6 }, 5, 6],
		]);
	});

	it('can bring column to front', function () {

		var dataFrame = new DataFrame({ 
            columnNames: ["a", "b", "c"], 
            rows: [[1, 2, 3], [4, 5, 6]]
        });

		expect(dataFrame.getColumnNames()).to.eql(["a", "b", "c"]);

		var modified = dataFrame.bringToFront("b");

		expect(modified.getColumnNames()).to.eql(["b", "a", "c"]);
		expect(modified.toRows()).to.eql([
			[2, 1, 3],
			[5, 4, 6],
		]);
	});

	it('can bring multiple columns to front', function () {

		var dataFrame = new DataFrame({ 
            columnNames: ["a", "b", "c"], 
            rows: [[1, 2, 3], [4, 5, 6]]
        });

		expect(dataFrame.getColumnNames()).to.eql(["a", "b", "c"]);

		var modified = dataFrame.bringToFront(["b", "c"]);

		expect(modified.getColumnNames()).to.eql(["b", "c", "a"]);
		expect(modified.toRows()).to.eql([
			[2, 3, 1],
			[5, 6, 4],
		]);
	});

	it('bringing non-existing column to front has no effect', function () {

		var dataFrame = new DataFrame({ 
            columnNames: ["a", "b", "c"], 
            rows: [[1, 2, 3], [4, 5, 6]]
        });

		expect(dataFrame.getColumnNames()).to.eql(["a", "b", "c"]);

		var modified = dataFrame.bringToFront("non-existing-column");

		expect(modified.getColumnNames()).to.eql(["a", "b", "c"]);
		expect(modified.toRows()).to.eql([
			[1, 2, 3],
			[4, 5, 6],
		]);
	});

	it('can bring column to back', function () {

		var dataFrame = new DataFrame({ 
            columnNames: ["a", "b", "c"], 
            rows: [[1, 2, 3], [4, 5, 6]]
        });

		expect(dataFrame.getColumnNames()).to.eql(["a", "b", "c"]);

		var modified = dataFrame.bringToBack("b");

		expect(modified.getColumnNames()).to.eql(["a", "c", "b"]);
		expect(modified.toRows()).to.eql([
			[1, 3, 2],
			[4, 6, 5],
		]);
	});

	it('can bring multiple columns to back', function () {

		var dataFrame = new DataFrame({ 
            columnNames: ["a", "b", "c"], 
            rows: [[1, 2, 3], [4, 5, 6]]
        });

		expect(dataFrame.getColumnNames()).to.eql(["a", "b", "c"]);

		var modified = dataFrame.bringToBack(["b", "a"]);

		expect(modified.getColumnNames()).to.eql(["c", "b", "a"]);
		expect(modified.toRows()).to.eql([
			[3, 2, 1],
			[6, 5, 4],
		]);
	});

	it('bringing non-existing-column to back has no effect', function () {

		var dataFrame = new DataFrame({ 
            columnNames: ["a", "b", "c"], 
            rows: [[1, 2, 3], [4, 5, 6]]
        });

		expect(dataFrame.getColumnNames()).to.eql(["a", "b", "c"]);

		var modified = dataFrame.bringToBack("non-existing-column");

		expect(modified.getColumnNames()).to.eql(["a", "b", "c"]);
		expect(modified.toRows()).to.eql([
			[1, 2, 3],
			[4, 5, 6],
		]);
	});
});