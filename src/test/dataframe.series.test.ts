import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { DataFrame } from '../lib/dataframe';
import { ArrayIterable } from '../lib/iterables/array-iterable';
import { Series } from '../lib/series';

describe('DataFrame', () => {

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

	it('when a series is extracted from a dataframe, undefined values are stripped out.', function () {
		
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

	it('retreive a non-existing column results in an empty series', function () {

		var dataFrame = new DataFrame({
			columnNames: ["C1"],
			rows: [
				[1]
			],
		});

		var series = dataFrame.getSeries("non-existing-column");
		expect(series.toPairs()).to.eql([]);
	});

	it('can ensure series that doesnt exist', function () {

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

	it('can ensure series that already exists', function () {

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

    it('can set new series', function () {
		
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

	it('can set existing series', function () {
		
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

	it('can set series from another dataframe', function () {
		
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
    
	it('can ensure that series exists - with series generator function', function () {

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

	it('can ensure that series already exists - with series generator function', function () {

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

	it('can ensure that series exists - with column spec', function () {

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

	it('can ensure that series already exists - with column spec', function () {

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

	it('can ensure that series exists - with column spec and series generator fn', function () {

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

	it('can ensure that series already exists - with column spec and series generator fn', function () {

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

	it('can drop column', function () {
		
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

	it('can drop multiple columns', function () {
		
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

	it('dropping non-existing column has no effect', function () {
		
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
	
	it('can keep column', function () {
		
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

	it('can keep multiple columns', function () {
		
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

	it('can retreive columns', function () {
		
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

	it('column being merged is reindexed', function () {

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
    
	it('can set series on empty dataframe', function () {

		var dataFrame = new DataFrame();
        var withSeries = dataFrame.withSeries("NewSeries", new Series({ values: [1, 2, 3] }))
        
		expect(withSeries.getColumnNames()).to.eql(["NewSeries"]);
		expect(withSeries.toRows()).to.eql([
			[1],
			[2],
			[3],
		]);
	});
    
});