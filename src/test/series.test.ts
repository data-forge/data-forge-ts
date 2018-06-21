import { assert, expect } from 'chai';
import 'mocha';
import { Series, Index, DataFrame } from '../index';
import { ArrayIterable } from '../lib/iterables/array-iterable';
import * as moment from 'moment';

describe('Series', () => {
    
	it('can bake series', () =>  {

		var series = new Series({
            values: [10, 20],
            index: [1, 2],
        });
		var baked = series.bake();

		expect(baked).not.to.equal(series);
	});

	it('baking a baked series returns same', () =>  {

		var series = new Series({
            values: [10, 20],
            index: [1, 2],
        });
        var baked = series.bake();
        var rebaked = baked.bake();

		expect(rebaked).to.equal(baked);
    });
    
    it('can inflate to dataframe', () => {

        var series = new Series({
            values: [10, 20],
            index: [100, 200]
        });
        var dataframe = series.select(v => ({ V: v })).inflate();
        expect(dataframe.toArray()).to.eql([
            {
                V: 10,
            },
            {
                V: 20,
            },
        ]);
        expect(dataframe.getIndex().toArray()).to.eql([100, 200]);
        expect(dataframe.toPairs()).to.eql([
            [ 100, { V: 10, }, ],
            [ 200, { V: 20, }, ],
        ]);
    });

	it('can inflate series to dataframe using selector', () => {

		var series = new Series({ index: [0, 1, 2], values: ['A', 'B', 'C'] });
		var dataFrame = series.inflate(value => {
				return {
					Col1: value,
					Col2: value + value,
				};
			});

		expect(dataFrame.getColumnNames()).to.eql(["Col1", "Col2"]);
		expect(dataFrame.toRows()).to.eql([
			['A', 'AA'],
			['B', 'BB'],
			['C', 'CC'],
		]);

	});

    it('Series.toArray strips undefined values', () => {

        var series = new Series([10, undefined, 20, undefined]);
        expect(series.toArray()).to.eql([10, 20]);
    });

    it('Series.toPairs strips undefined values', () => {

        var series = new Series([10, undefined, 20, undefined]);
        expect(series.toPairs()).to.eql([
            [0, 10], 
            [2, 20]
        ]);
    });

    it('can skip values in a series', ()  => {

        var series = new Series({
            values: [1, 2, 3, 4, 5],
            index: [0, 1, 2, 3, 4],
        });
        var result = series.skip(2);

        expect(result.toArray()).to.eql([3, 4, 5]);
        expect(result.getIndex().toArray()).to.eql([2, 3, 4]);
        expect(result.toPairs()).to.eql([[2, 3], [3, 4], [4, 5]]);
    });

	it('can take', () =>  {
		var series = new Series({ 
            index: [0, 1, 2, 3], 
            values: [100, 300, 200, 5] 
        });
        
        var skipped = series.take(2);		
		expect(skipped.getIndex().toArray()).to.eql([0, 1]);
		expect(skipped.toArray()).to.eql([100, 300]);		
	});

	it('can filter', () =>  {
		var series = new Series({ 
            index: [0, 1, 2, 3], 
            values: [100, 300, 200, 5] 
        });
        
        var filtered = series.where(value => {
				return value >= 100 && value < 300;
			});
		expect(filtered.getIndex().toArray()).to.eql([0, 2]);
		expect(filtered.toArray()).to.eql([100, 200]);		
    });

	it('can skip while', () =>  {

		var series = new Series({ index: [0, 1, 2, 3], values: [true, true, false, true] });
        var skipped = series.skipWhile(value => value);
		expect(skipped.toPairs()).to.eql([
			[2, false],
			[3, true],
		]);
	});

	it('can skip until', () =>  {

		var series = new Series({ index: [0, 1, 2, 3], values: [false, false, true, false] });
		var skipped = series.skipUntil(value => value);
		expect(skipped.toPairs()).to.eql([
			[2, true],
			[3, false],
		]);
	});

	it('can take while', () =>  {

		var series = new Series({ index: [0, 1, 2, 3], values: [true, true, false, true] });
		var skipped = series.takeWhile(value => value);
		expect(skipped.toPairs()).to.eql([
			[0, true],
			[1, true],
		]);
	});

	it('can take until', () =>  {

		var series = new Series({ index: [0, 1, 2, 3], values: [false, false, true, false] });
		var skipped = series.takeUntil(value => value);
		expect(skipped.toPairs()).to.eql([
			[0, false],
			[1, false],
		]);
    });
    
    it('can count number of elements', () => {

        var series = new Series([10, 20, 30]);
        expect(series.count()).to.eql(3);
    });

	it('can get first and last values', () => {

		var series = new Series(['A', 'B', 'C']);
		expect(series.first()).to.eql('A');
		expect(series.last()).to.eql('C');
	});

	it('getting first of empty series throws exception', () => {

		var series = new Series();

		expect(() => {
			series.first();
		}).to.throw();
    });
    
	it('getting last of empty series throws exception', () => {

		var series = new Series();

		expect(() => {
			series.last();
		}).to.throw();
    });

	it('can get value by index', () => {

		var series = new Series({ 
			index:  [100, 200, 300],
			values: [10, 20, 30],
		});

		expect(series.at(200)).to.eql(20);
	});

	it('getting by index returns undefined when the requested index does not exist', () => {

		var series = new Series({ 
			index:  [100, 300],
			values: [10, 30],
		});

		expect(series.at(200)).to.eql(undefined);
	});

	it('getting by index returns undefined when the series is empty', () => {

		var series = new Series();
		expect(series.at(200)).to.eql(undefined);
	});
    
    it('can get value by date index', () => {

        var testDate = moment("2014-04-05").toDate();

        var serires = new Series({
            index: [moment("2013-03-04").toDate(), testDate, moment("2015-06-06").toDate()],
            values: [1, 2, 3],
        });
        expect(serires.at(testDate)).to.eql(2);
    })
    
    it('can get head', () =>  {

		var series = new Series(['A', 'B', 'C']);
		var head = series.head(2);
		expect(head.toArray()).to.eql(['A', 'B']);
	});

    it('can use negative with head to get all but the last X values', () =>  {

		var series = new Series(['A', 'B', 'C']);
		var head = series.head(-1);
		expect(head.toArray()).to.eql(['A', 'B']);
	});

    it('can get tail', () =>  {

		var series = new Series(['A', 'B', 'C']);
		var tail = series.tail(2);
		expect(tail.toArray()).to.eql(['B', 'C']);
    });

    it('can use negative with tail to get all but the first X values', () =>  {

		var series = new Series(['A', 'B', 'C']);
        var tail = series.tail(-1);
		expect(tail.toArray()).to.eql(['B', 'C']);
    });

	it('for each', () => {

		var series = new Series([0, 1, 2]);
		var count = 0;
		series.forEach(function (v) {
			expect(v).to.eql(count);
			++count;
		});

		expect(count).to.eql(3);
	});

	it('all - zero elements', () => {

		var series = new Series({ values: [] });

		expect(series.all(function (value) { 
				return value === 200; 
			})).to.eql(false);
	});

	it('all - no elements match', () => {

		var series = new Series({ values: [1, 2, 3, 4] });

		expect(series.all(function (value) { 
				return value === 200; 
			})).to.eql(false);
	});

	it('all - some elements match', () => {

		var series = new Series({ values: [1, 3, 3, 4] });

		expect(series.all(function (value) { 
				return value === 3; 
			})).to.eql(false);
	});

	it('all - all elements match', () => {

		var series = new Series({ values: [5, 5, 5, 5] });

		expect(series.all(function (value) { 
				return value === 5; 
			})).to.eql(true);
	});

	it('any - zero elements', () => {

		var series = new Series({ values: [] });

		expect(series.any(function (value) { 
				return value === 200; 
			})).to.eql(false);
	});

	it('any - no elements match', () => {

		var series = new Series({ values: [1, 2, 3, 4] });

		expect(series.any(function (value) { 
				return value === 200; 
			})).to.eql(false);
	});

	it('any - some elements match', () => {

		var series = new Series({ values: [1, 3, 3, 4] });

		expect(series.any(function (value) { 
				return value === 3; 
			})).to.eql(true);
	});

	it('any - all elements match', () => {

		var series = new Series({ values: [5, 5, 5, 5] });

		expect(series.any(function (value) { 
				return value === 5; 
			})).to.eql(true);
	});	

	it('any - with no predicate - no elements', () => {

		var series = new Series({ values: [] });

		expect(series.any()).to.eql(false);
	});

	it('any - with no predicate - has falsy elements', () => {

		var series = new Series({ values: [ false, false, false ] });

		expect(series.any()).to.eql(true);
    });
    
	it('any - with no predicate - elements exist', () => {

		var series = new Series({ values: [5, 5, 5, 5] });

		expect(series.any()).to.eql(true);
	});	

	it('none - zero elements', () => {

		var series = new Series({ values: [] });

		expect(series.none(function (value) { 
				return value === 200; 
			})).to.eql(true);
	});

	it('none - no elements match', () => {

		var series = new Series({ values: [1, 2, 3, 4] });

		expect(series.none(function (value) { 
				return value === 200; 
			})).to.eql(true);
	});

	it('none - some elements match', () => {

		var series = new Series({ values: [1, 3, 3, 4] });

		expect(series.none(function (value) { 
				return value === 3; 
			})).to.eql(false);
	});

	it('none - all elements match', () => {

		var series = new Series({ values: [5, 5, 5, 5] });

		expect(series.none(function (value) { 
				return value === 5; 
			})).to.eql(false);
	});	

	it('none - with no predicate - zero elements', () => {

		var series = new Series({ values: [] });
		expect(series.none()).to.eql(true);
	});

	it('none - with no predicate - has falsy elements', () => {

		var series = new Series({ values: [false, false, false] });
		expect(series.none()).to.eql(false);
    });
    
	it('none - with no predicate - has existing elements', () => {

		var series = new Series({ values: [5, 5, 5, 5] });
		expect(series.none()).to.eql(false);
	});	

	it('can get series starting at particular index - with integer index', () => {

		var series = new Series({
			index: [10, 20, 30],
			values: [1, 2, 3],
		});
		
		var reduced = series.startAt(20);
		expect(reduced.toPairs()).to.eql([
			[20, 2],
			[30, 3],
		]); 	
	});

	it('can get series starting before a particular index - with integer index', () => {

		var series = new Series({
			index: [10, 20, 30],
			values: [1, 2, 3],
		});
		
		var reduced = series.startAt(15);
		expect(reduced.toPairs()).to.eql([
			[20, 2],
			[30, 3],
		]); 	
	});

	it('can get series starting at particular index - with date index', () => {

		var series = new Series({
			index: [
				new Date(2016, 5, 1), 
				new Date(2016, 5, 5), 
				new Date(2016, 5, 10),
			],
			values: [1, 2, 3],
		});
		
		var reduced = series.startAt(new Date(2016, 5, 5));
		expect(reduced.toPairs()).to.eql([
			[new Date(2016, 5, 5), 2],
			[new Date(2016, 5, 10), 3],
		]); 	
	});

	it('can get series starting before a particular index - with date index', () => {

		var series = new Series({
			index: [
				new Date(2016, 5, 1), 
				new Date(2016, 5, 5), 
				new Date(2016, 5, 10),
			],
			values: [1, 2, 3],
		});
		
		var reduced = series.startAt(new Date(2016, 5, 4));
		expect(reduced.toPairs()).to.eql([
			[new Date(2016, 5, 5), 2],
			[new Date(2016, 5, 10), 3],
		]); 	
	});

	it('can get series ending at particular index - with integer index', () => {

		var series = new Series({
			index: [10, 20, 30],
			values: [1, 2, 3],
		});
		
		var reduced = series.endAt(20);
		expect(reduced.toPairs()).to.eql([
			[10, 1],
			[20, 2],
		]); 	
	});

	it('can get series ending before a particular index - with integer index', () => {

		var series = new Series({
			index: [10, 20, 30],
			values: [1, 2, 3],
		});
		
		var reduced = series.endAt(25);
		expect(reduced.toPairs()).to.eql([
			[10, 1],
			[20, 2],
		]); 	
	});

	it('can get series ending at particular index - with date index', () => {

		var series = new Series({
			index: [
				new Date(2016, 5, 1), 
				new Date(2016, 5, 5), 
				new Date(2016, 5, 10),
			],
			values: [1, 2, 3],
		});
		
		var reduced = series.endAt(new Date(2016, 5, 5));
		expect(reduced.toPairs()).to.eql([
			[new Date(2016, 5, 1), 1],
			[new Date(2016, 5, 5), 2],
		]); 	
	});

	it('can get series ending before a particular index - with date index', () => {

		var series = new Series({
			index: [
				new Date(2016, 5, 1), 
				new Date(2016, 5, 5), 
				new Date(2016, 5, 10),
			],
			values: [1, 2, 3],
		});
		
		var reduced = series.endAt(new Date(2016, 5, 6));
		expect(reduced.toPairs()).to.eql([
			[new Date(2016, 5, 1), 1],
			[new Date(2016, 5, 5), 2],
		]); 	
	});

	it('can get series before a particular index - with integer index', () => {

		var series = new Series({
			index: [10, 20, 30],
			values: [1, 2, 3],
		});
		
		var reduced = series.before(25);
		expect(reduced.toPairs()).to.eql([
			[10, 1],
			[20, 2],
		]); 	
	});

	it('can get series before a particular index - with date index', () => {

		var series = new Series({
			index: [
				new Date(2016, 5, 1), 
				new Date(2016, 5, 5), 
				new Date(2016, 5, 10),
			],
			values: [1, 2, 3],
		});
		
		var reduced = series.before(new Date(2016, 5, 6));
		expect(reduced.toPairs()).to.eql([
			[new Date(2016, 5, 1), 1],
			[new Date(2016, 5, 5), 2],
		]); 	
	});

	it('can get series after a particular index - with integer index', () => {

		var series = new Series({
			index: [10, 20, 30],
			values: [1, 2, 3],
		});
		
		var reduced = series.after(15);
		expect(reduced.toPairs()).to.eql([
			[20, 2],
			[30, 3],
		]); 	
	});

	it('can get series after a particular index - with date index', () => {

		var series = new Series({
			index: [
				new Date(2016, 5, 1), 
				new Date(2016, 5, 5), 
				new Date(2016, 5, 10),
			],
			values: [1, 2, 3],
		});
		
		var reduced = series.after(new Date(2016, 5, 2));
		expect(reduced.toPairs()).to.eql([
			[new Date(2016, 5, 5), 2],
			[new Date(2016, 5, 10), 3],
		]); 	
	});

	it('can get series between particular indices - with integer index', () => {

		var series = new Series({
			index: [10, 20, 30],
			values: [1, 2, 3],
		});
		
		var reduced = series.between(11, 25);
		expect(reduced.toPairs()).to.eql([
			[20, 2],
		]); 	
	});

	it('can get slice of rows - with string indices', () => {

		var series = new Series({
			index: ["a", "b", "c", "d", "e"], 
			values: [100, 300, 200, 5, 30],
		});
		var slice = series.between("b", "e");
		expect(slice.toPairs()).to.eql([
			["b", 300],
			["c", 200],
			["d", 5],
			["e", 30],
		]);
    });
        
	it('can get series between particular indices - with date index', () => {

		var series = new Series({
			index: [
				new Date(2016, 5, 1), 
				new Date(2016, 5, 5), 
				new Date(2016, 5, 10),
			],
			values: [1, 2, 3],
		});
		
		var reduced = series.between(new Date(2016, 5, 2), new Date(2016, 5, 8));
		expect(reduced.toPairs()).to.eql([
			[new Date(2016, 5, 5), 2],
		]); 	
    });
        
	it('can aggregate series with no seed', () => {

		var series = new Series({ index: [0, 1, 2], values: [4, 8, 16] });

		var agg = series.aggregate((prevValue, value) => {
				return prevValue + value;
			});

		expect(agg).to.eql(28);
	});

	it('can aggregate series with seed', () => {

		var series = new Series({ index: [0, 1, 2], values: [4, 8, 16] });

		var agg = series.aggregate(2, (prevValue, value) => {
				return prevValue + value;
			});

		expect(agg).to.eql(30);
	});

	it('can aggregate series with a function as the seed', () => {

		var series = new Series({ index: [0, 1, 2], values: [4, 8, 16] });

		var agg = series.aggregate<Function>(
			() => {
				return 2;
			},
			(prevValue, value) => {
				return () => {
					return prevValue() + value;
				};
			});

		expect(agg()).to.eql(30);
	});
        
	it('can convert to javascript object', () => {

		var series = new Series({
            index: [0, 1], 
            values: [
                {
                    Key: 'A',
                    Value: 100,
                },
                {
                    Key: 'B',
                    Value: 200,
                },
            ]
        });

		var obj = series.toObject(row => row.Key, row => row.Value);
		expect(obj).to.eql({
			A: 100,
			B: 200,
		});
	});

	it('can convert to javascript object - with duplicate keys', () => {

        var series = new Series({
            index: [0, 1, 2], 
            values: [
                {
                    Key: 'A',
                    Value: 100,
                },
                {
                    Key: 'B',
                    Value: 200,
                },
                {
                    Key: 'A',
                    Value: 3,
                },
            ]
        });

		var obj = series.toObject(row => row.Key, row => row.Value);
		expect(obj).to.eql({
			A: 3,
			B: 200,
		});
	});

	it('can reverse', () => {

		var series = new Series({ index: [0, 1, 2], values: ['A', 'B', 'C'] });
		var reversed = series.reverse();
		expect(series.toArray()).to.eql(['A', 'B', 'C']);
		expect(series.getIndex().toArray()).to.eql([0, 1, 2]);
		expect(reversed.toArray()).to.eql(['C', 'B', 'A']);
		expect(reversed.getIndex().toArray()).to.eql([2, 1, 0]);
    });
    
	it('can distinct items', () => {

		var series = new Series({ 
			index:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			values: [1, 1, 2, 1, 1, 2, 3, 4, 3, 3],
		});

        var collapsed = series.distinct();
        expect(collapsed.toArray()).to.eql([1, 2, 3, 4]);
        expect(collapsed.getIndex().toArray()).to.eql([0, 2, 6, 7]);
		expect(collapsed.toPairs()).to.eql([
			[0, 1],
			[2, 2],
			[6, 3],
			[7, 4],
        ]);
	});

	it('can distinct items with custom selector', () => {

		var series = new Series({ 
			index:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			values: [{ A: 1 }, { A: 1 }, { A: 2 }, { A: 1 }, { A: 1 }, { A: 2 }, { A: 3 }, { A: 4 }, { A: 3 }, { A: 3 }],
		});

		var collapsed = series
			.distinct(value => value.A)
			.select(value => value.A)
			;

		expect(collapsed.toPairs()).to.eql([
			[0, 1],
			[2, 2],
			[6, 3],
			[7, 4],
		]);
    });

	it('can truncate string values', () => {

		var series = new Series({ index: [1, 2], values: ['foo', 'bar'] });
		var truncated = series.truncateStrings(2);

		expect(truncated.getIndex().toArray()).to.eql([1, 2]);
		expect(truncated.toArray()).to.eql(['fo', 'ba']);
	});

	it('truncation ignores strings that are already short enough', () => {

		var series = new Series({ index: [1, 2], values: ['foo', 'bar'] });
		var truncated = series.truncateStrings(20);

		expect(truncated.toArray()).to.eql(['foo', 'bar']);
	});

	it('truncation passes through other values', () => {

		var series = new Series({ index: [1, 2, 3, 4], values: [null, undefined, 1, new Date(2015, 1, 1)] });
		var truncated = series.truncateStrings(20);

		expect(truncated.toArray()).to.eql([null, 1, new Date(2015, 1, 1)]);
    });
    
	it('can insert pair at start of empty series', () => {

		var series = new Series();
		var modified = series.insertPair([10, 100]);
		expect(modified.toPairs()).to.eql([
			[10, 100]
		]);
	});

	it('can insert pair at start of series with existing items', () => {

		var series = new Series({
			index:  [1,  2],
			values: [10, 11],
		});
		var modified = series.insertPair([20, 100]);
		expect(modified.toPairs()).to.eql([
			[20, 100],
			[1, 10],
			[2, 11],
		]);
	});


	it('can append pair to empty series', () => {

		var series = new Series();
		var appended = series.appendPair([10, 100]);
		expect(appended.toPairs()).to.eql([
			[10, 100]
		]);
	});

	it('can append pair to series with existing items', () => {

		var series = new Series({
			index:  [1,  2],
			values: [10, 11],
		});
		var appended = series.appendPair([20, 100]);
		expect(appended.toPairs()).to.eql([
			[1, 10],
			[2, 11],
			[20, 100],
		]);
	});

	it('can fill gaps in series - fill forward', () => {

		var seriesWithGaps = new Series({
			index:  [1,  2,  6,  7,  10, 11],
			values: [10, 11, 12, 13, 14, 15],
		});

		var seriesWithoutGaps = seriesWithGaps.fillGaps(
			(pairA: [number, number], pairB: [number, number]) => pairB[0] - pairA[0] > 1,
			(pairA: [number, number], pairB: [number, number]) => {
				var gapSize = pairB[0] - pairA[0];
                var numEntries = gapSize - 1;
                var output: [number, number][] = [];
                for (var i = 0; i < numEntries; ++i) {
                    output.push([
                        pairA[0] + i + 1, 
                        pairA[1]
                    ]);
                }
				return output;
			}
		);

		expect(seriesWithoutGaps.toPairs()).to.eql([
			[1, 10],
			[2, 11],
			[3, 11],
			[4, 11],
			[5, 11],
			[6, 12],
			[7, 13],
			[8, 13],
			[9, 13],
			[10, 14],
			[11, 15],
		]);
	});

	it('can select default instead of empty series - array', () => {

		var series = new Series();
		var defaulted = series.defaultIfEmpty([1, 2]);
		expect(defaulted.toArray()).to.eql([1, 2]);
	});

	it('can select default instead of empty series - series', () => {

		var series = new Series();
		var defaulted = series.defaultIfEmpty(new Series({ values: [1, 2] }));
		expect(defaulted.toArray()).to.eql([1, 2]);
	});

	it('default is ignored for non-empty series', () => {

		var series = new Series({ values: [5, 6] });
		var defaulted = series.defaultIfEmpty([1, 2]);
		expect(defaulted.toArray()).to.eql([5, 6]);
	});
    
});