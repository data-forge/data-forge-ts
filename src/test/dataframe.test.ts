import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { DataFrame } from '../lib/dataframe';
import { ArrayIterable } from '../lib/iterables/array-iterable';

describe('DataFrame', () => {

	it('can bake dataframe', () => {

		var dataframe = new DataFrame({
            values: [10, 20],
            index: [1, 2],
        });
		var baked = dataframe.bake();

		expect(baked).not.to.equal(dataframe);
	});

	it('baking a baked dataframe returns same', () => {

		var dataframe = new DataFrame({
            values: [10, 20],
            index: [1, 2],
        });
        var baked = dataframe.bake();
        var rebaked = baked.bake();

		expect(rebaked).to.equal(baked);
    });
    
    it('can rewrite dataframe with select', () => {

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

        var modified = dataFrame.select(v => ({ A: v.A * 2, B: v.B * 2 }));
        expect(modified.toArray()).to.eql([
            {
                A: 2,
                B: 20,
            },
            {
                A: 4,
                B: 40,
            }
        ]);
    });

	it('using select on a dataframe redefines the columns', () => {

		var df = new DataFrame([
            { A: 1, B: 10 },
            { A: 2, B: 20 },
        ]);

		var modified = df.select(row => ({ X: row.A, Y: row.B }));
		expect(df.getColumnNames()).to.eql(["A", "B"]);
		expect(modified.getColumnNames()).to.eql(["X", "Y"]);
    });
        
    it('select ignores index', () => {

        var dataframe = new DataFrame({
            values: [10, 20, 30],
            index: [100, 200, 300],
        });
        var modified = dataframe.select(v => v * 2);
        expect(modified.toPairs()).to.eql([[100, 20], [200, 40], [300, 60]]);
        expect(modified.getIndex().toArray()).to.eql([100, 200, 300]);
    });

    it('toArray strips undefined values', () => {

        var dataframe = new DataFrame([10, undefined, 20, undefined]);
        expect(dataframe.toArray()).to.eql([10, 20]);
    });

    it('toPairs strips undefined values', () => {

        var dataframe = new DataFrame([10, undefined, 20, undefined]);
        expect(dataframe.toPairs()).to.eql([
            [0, 10], 
            [2, 20]
        ]);
    });

    it('can skip values', ()  => {

        var dataframe = new DataFrame({
            values: [1, 2, 3, 4, 5],
            index: [0, 1, 2, 3, 4],
        });
        var result = dataframe.skip(2);

        expect(result.toArray()).to.eql([3, 4, 5]);
        expect(result.getIndex().toArray()).to.eql([2, 3, 4]);
        expect(result.toPairs()).to.eql([[2, 3], [3, 4], [4, 5]]);
    });

	it('can take', () =>  {
		var dataframe = new DataFrame({ 
            index: [0, 1, 2, 3], 
            values: [100, 300, 200, 5] 
        });
        
        var skipped = dataframe.take(2);		
		expect(skipped.getIndex().toArray()).to.eql([0, 1]);
		expect(skipped.toArray()).to.eql([100, 300]);		
	});

	it('can filter', () =>  {
		var dataframe = new DataFrame({ 
            index: [0, 1, 2, 3], 
            values: [100, 300, 200, 5] 
        });
        
        var filtered = dataframe.where(value => {
				return value >= 100 && value < 300;
			});
		expect(filtered.getIndex().toArray()).to.eql([0, 2]);
		expect(filtered.toArray()).to.eql([100, 200]);		
    });

	it('can skip while', () =>  {

		var dataframe = new DataFrame({ index: [0, 1, 2, 3], values: [true, true, false, true] });
        var skipped = dataframe.skipWhile(value => value);
		expect(skipped.toPairs()).to.eql([
			[2, false],
			[3, true],
		]);
	});

	it('can skip until', () =>  {

		var dataframe = new DataFrame({ index: [0, 1, 2, 3], values: [false, false, true, false] });
		var skipped = dataframe.skipUntil(value => value);
		expect(skipped.toPairs()).to.eql([
			[2, true],
			[3, false],
		]);
	});

	it('can take while', () =>  {

		var dataframe = new DataFrame({ index: [0, 1, 2, 3], values: [true, true, false, true] });
		var skipped = dataframe.takeWhile(value => value);
		expect(skipped.toPairs()).to.eql([
			[0, true],
			[1, true],
		]);
	});

	it('can take until', () =>  {

		var dataframe = new DataFrame({ index: [0, 1, 2, 3], values: [false, false, true, false] });
		var skipped = dataframe.takeUntil(value => value);
		expect(skipped.toPairs()).to.eql([
			[0, false],
			[1, false],
		]);
    });
    
    it('can count number of elements', () => {

        var dataframe = new DataFrame([10, 20, 30]);
        expect(dataframe.count()).to.eql(3);
    });

	it('can get first and last values', () => {

		var dataframe = new DataFrame(['A', 'B', 'C']);
		expect(dataframe.first()).to.eql('A');
		expect(dataframe.last()).to.eql('C');
	});

	it('getting first of empty dataframe throws exception', () => {

		var dataframe = new DataFrame();

		expect(() => {
			dataframe.first();
		}).to.throw();
    });
    
	it('getting last of empty dataframe throws exception', () => {

		var dataframe = new DataFrame();

		expect(() => {
			dataframe.last();
		}).to.throw();
    });

	it('can get value by index', () => {

		var dataframe = new DataFrame({ 
			index:  [100, 200, 300],
			values: [10, 20, 30],
		});

		expect(dataframe.at(200)).to.eql(20);
	});

	it('getting by index returns undefined when the requested index does not exist', () => {

		var dataframe = new DataFrame({ 
			index:  [100, 300],
			values: [10, 30],
		});

		expect(dataframe.at(200)).to.eql(undefined);
	});

	it('getting by index returns undefined when the dataframe is empty', () => {

		var dataframe = new DataFrame();
		expect(dataframe.at(200)).to.eql(undefined);
	});
    
    it('can get head of dataframe', () =>  {

		var dataframe = new DataFrame({ index: [0, 1, 2], values: ['A', 'B', 'C'] });
		var head = dataframe.head(2);
		expect(head.toArray()).to.eql(['A', 'B']);
	});

	it('can get tail of dataframe', () =>  {

		var dataframe = new DataFrame({ index: [0, 1, 2], values: ['A', 'B', 'C'] });
		var head = dataframe.tail(2);
		expect(head.toArray()).to.eql(['B', 'C']);
    });

	it('for each', () => {

		var dataframe = new DataFrame([0, 1, 2]);
		var count = 0;
		dataframe.forEach(v => {
			expect(v).to.eql(count);
			++count;
		});

		expect(count).to.eql(3);
	});

	it('all - zero elements', () => {

		var dataframe = new DataFrame({ values: [] });

		expect(dataframe.all(value => { 
				return value === 200; 
			})).to.eql(false);
	});

	it('all - no elements match', () => {

		var dataframe = new DataFrame({ values: [1, 2, 3, 4] });

		expect(dataframe.all(value => { 
				return value === 200; 
			})).to.eql(false);
	});

	it('all - some elements match', () => {

		var dataframe = new DataFrame({ values: [1, 3, 3, 4] });

		expect(dataframe.all(value => { 
				return value === 3; 
			})).to.eql(false);
	});

	it('all - all elements match', () => {

		var dataframe = new DataFrame({ values: [5, 5, 5, 5] });

		expect(dataframe.all(value => { 
				return value === 5; 
			})).to.eql(true);
	});

	it('any - zero elements', () => {

		var dataframe = new DataFrame({ values: [] });

		expect(dataframe.any(value => { 
				return value === 200; 
			})).to.eql(false);
	});

	it('any - no elements match', () => {

		var dataframe = new DataFrame({ values: [1, 2, 3, 4] });

		expect(dataframe.any(value => { 
				return value === 200; 
			})).to.eql(false);
	});

	it('any - some elements match', () => {

		var dataframe = new DataFrame({ values: [1, 3, 3, 4] });

		expect(dataframe.any(value => { 
				return value === 3; 
			})).to.eql(true);
	});

	it('any - all elements match', () => {

		var dataframe = new DataFrame({ values: [5, 5, 5, 5] });

		expect(dataframe.any(value => { 
				return value === 5; 
			})).to.eql(true);
	});	

	it('any - with no predicate - no elements', () => {

		var dataframe = new DataFrame({ values: [] });

		expect(dataframe.any()).to.eql(false);
	});

	it('any - with no predicate - elements exist', () => {

		var dataframe = new DataFrame({ values: [5, 5, 5, 5] });

		expect(dataframe.any()).to.eql(true);
	});	

	it('none - zero elements', () => {

		var dataframe = new DataFrame({ values: [] });

		expect(dataframe.none(value => { 
				return value === 200; 
			})).to.eql(true);
	});

	it('none - no elements match', () => {

		var dataframe = new DataFrame({ values: [1, 2, 3, 4] });

		expect(dataframe.none(value => { 
				return value === 200; 
			})).to.eql(true);
	});

	it('none - some elements match', () => {

		var dataframe = new DataFrame({ values: [1, 3, 3, 4] });

		expect(dataframe.none(value => { 
				return value === 3; 
			})).to.eql(false);
	});

	it('none - all elements match', () => {

		var dataframe = new DataFrame({ values: [5, 5, 5, 5] });

		expect(dataframe.none(value => { 
				return value === 5; 
			})).to.eql(false);
	});	

	it('none - with no predicate - zero elements', () => {

		var dataframe = new DataFrame({ values: [] });
		expect(dataframe.none()).to.eql(true);
	});

	it('none - with no predicate - has existing elements', () => {

		var dataframe = new DataFrame({ values: [5, 5, 5, 5] });
		expect(dataframe.none()).to.eql(false);
	});	

	it('can get dataframe starting at particular index - with integer index', () => {

		var dataframe = new DataFrame({
			index: [10, 20, 30],
			values: [1, 2, 3],
		});
		
		var reduced = dataframe.startAt(20);
		expect(reduced.toPairs()).to.eql([
			[20, 2],
			[30, 3],
		]); 	
	});

	it('can get dataframe starting before a particular index - with integer index', () => {

		var dataframe = new DataFrame({
			index: [10, 20, 30],
			values: [1, 2, 3],
		});
		
		var reduced = dataframe.startAt(15);
		expect(reduced.toPairs()).to.eql([
			[20, 2],
			[30, 3],
		]); 	
	});

	it('can get dataframe starting at particular index - with date index', () => {

		var dataframe = new DataFrame({
			index: [
				new Date(2016, 5, 1), 
				new Date(2016, 5, 5), 
				new Date(2016, 5, 10),
			],
			values: [1, 2, 3],
		});
		
		var reduced = dataframe.startAt(new Date(2016, 5, 5));
		expect(reduced.toPairs()).to.eql([
			[new Date(2016, 5, 5), 2],
			[new Date(2016, 5, 10), 3],
		]); 	
	});

	it('can get dataframe starting before a particular index - with date index', () => {

		var dataframe = new DataFrame({
			index: [
				new Date(2016, 5, 1), 
				new Date(2016, 5, 5), 
				new Date(2016, 5, 10),
			],
			values: [1, 2, 3],
		});
		
		var reduced = dataframe.startAt(new Date(2016, 5, 4));
		expect(reduced.toPairs()).to.eql([
			[new Date(2016, 5, 5), 2],
			[new Date(2016, 5, 10), 3],
		]); 	
	});

	it('can get dataframe ending at particular index - with integer index', () => {

		var dataframe = new DataFrame({
			index: [10, 20, 30],
			values: [1, 2, 3],
		});
		
		var reduced = dataframe.endAt(20);
		expect(reduced.toPairs()).to.eql([
			[10, 1],
			[20, 2],
		]); 	
	});

	it('can get dataframe ending before a particular index - with integer index', () => {

		var dataframe = new DataFrame({
			index: [10, 20, 30],
			values: [1, 2, 3],
		});
		
		var reduced = dataframe.endAt(25);
		expect(reduced.toPairs()).to.eql([
			[10, 1],
			[20, 2],
		]); 	
	});

	it('can get dataframe ending at particular index - with date index', () => {

		var dataframe = new DataFrame({
			index: [
				new Date(2016, 5, 1), 
				new Date(2016, 5, 5), 
				new Date(2016, 5, 10),
			],
			values: [1, 2, 3],
		});
		
		var reduced = dataframe.endAt(new Date(2016, 5, 5));
		expect(reduced.toPairs()).to.eql([
			[new Date(2016, 5, 1), 1],
			[new Date(2016, 5, 5), 2],
		]); 	
	});

	it('can get dataframe ending before a particular index - with date index', () => {

		var dataframe = new DataFrame({
			index: [
				new Date(2016, 5, 1), 
				new Date(2016, 5, 5), 
				new Date(2016, 5, 10),
			],
			values: [1, 2, 3],
		});
		
		var reduced = dataframe.endAt(new Date(2016, 5, 6));
		expect(reduced.toPairs()).to.eql([
			[new Date(2016, 5, 1), 1],
			[new Date(2016, 5, 5), 2],
		]); 	
	});

	it('can get dataframe before a particular index - with integer index', () => {

		var dataframe = new DataFrame({
			index: [10, 20, 30],
			values: [1, 2, 3],
		});
		
		var reduced = dataframe.before(25);
		expect(reduced.toPairs()).to.eql([
			[10, 1],
			[20, 2],
		]); 	
	});

	it('can get dataframe before a particular index - with date index', () => {

		var dataframe = new DataFrame({
			index: [
				new Date(2016, 5, 1), 
				new Date(2016, 5, 5), 
				new Date(2016, 5, 10),
			],
			values: [1, 2, 3],
		});
		
		var reduced = dataframe.before(new Date(2016, 5, 6));
		expect(reduced.toPairs()).to.eql([
			[new Date(2016, 5, 1), 1],
			[new Date(2016, 5, 5), 2],
		]); 	
	});

	it('can get dataframe after a particular index - with integer index', () => {

		var dataframe = new DataFrame({
			index: [10, 20, 30],
			values: [1, 2, 3],
		});
		
		var reduced = dataframe.after(15);
		expect(reduced.toPairs()).to.eql([
			[20, 2],
			[30, 3],
		]); 	
	});

	it('can get dataframe after a particular index - with date index', () => {

		var dataframe = new DataFrame({
			index: [
				new Date(2016, 5, 1), 
				new Date(2016, 5, 5), 
				new Date(2016, 5, 10),
			],
			values: [1, 2, 3],
		});
		
		var reduced = dataframe.after(new Date(2016, 5, 2));
		expect(reduced.toPairs()).to.eql([
			[new Date(2016, 5, 5), 2],
			[new Date(2016, 5, 10), 3],
		]); 	
	});

	it('can get dataframe between particular indices - with integer index', () => {

		var dataframe = new DataFrame({
			index: [10, 20, 30],
			values: [1, 2, 3],
		});
		
		var reduced = dataframe.between(11, 25);
		expect(reduced.toPairs()).to.eql([
			[20, 2],
		]); 	
	});

	it('can get slice of rows - with string indices', () => {

		var dataframe = new DataFrame({
			index: ["a", "b", "c", "d", "e"], 
			values: [100, 300, 200, 5, 30],
		});
		var slice = dataframe.between("b", "e");
		expect(slice.toPairs()).to.eql([
			["b", 300],
			["c", 200],
			["d", 5],
			["e", 30],
		]);
    });
        
	it('can get dataframe between particular indices - with date index', () => {

		var dataframe = new DataFrame({
			index: [
				new Date(2016, 5, 1), 
				new Date(2016, 5, 5), 
				new Date(2016, 5, 10),
			],
			values: [1, 2, 3],
		});
		
		var reduced = dataframe.between(new Date(2016, 5, 2), new Date(2016, 5, 8));
		expect(reduced.toPairs()).to.eql([
			[new Date(2016, 5, 5), 2],
		]); 	
    });
        
	it('can transform a dataframe to a dataframe of pairs', () => {

		var dataframe = new DataFrame({
			index: [10, 20, 30],
			values: [1, 2, 3],
		});

		var pairs = dataframe.asPairs().toArray();
		expect(pairs).to.eql([
			[10, 1],
			[20, 2],
			[30, 3],
		]);
	});

	it('can transform dataframe of pairs to dataframe of values', () => {

		var dataframe = new DataFrame({
			index: [10, 20, 30],
			values: [1, 2, 3],
		});

		var values = dataframe.asPairs().asValues();
		expect(values.toPairs()).to.eql([
			[10, 1],
			[20, 2],
			[30, 3],
		]);
    });

	it('can aggregate dataframe', () => {

		var df = new DataFrame({
				columnNames: ["Column1", "Column2"], 
				rows: [
					[1, 10],
					[2, 20],
					[3, 30],
				],
				index: [10, 11, 12]
        });

		var agg = df.aggregate({ Column1: 0, Column2: 1 }, function (prev, value) {
				return {
					Column1: prev.Column1 + value.Column1,
					Column2: prev.Column2 * value.Column2,
				};
			});

		expect(agg.Column1).to.eql(6);
		expect(agg.Column2).to.eql(6000);
	});
    
	it('can aggregate dataframe with no seed', () => {

		var dataframe = new DataFrame({ index: [0, 1, 2], values: [4, 8, 16] });

		var agg = dataframe.aggregate((prevValue, value) => {
				return prevValue + value;
			});

		expect(agg).to.eql(28);
	});

	it('can aggregate dataframe with seed', () => {

		var dataframe = new DataFrame({ index: [0, 1, 2], values: [4, 8, 16] });

		var agg = dataframe.aggregate(2, (prevValue, value) => {
				return prevValue + value;
			});

		expect(agg).to.eql(30);
	});

	it('can aggregate dataframe with a function as the seed', () => {

		var dataframe = new DataFrame({ index: [0, 1, 2], values: [4, 8, 16] });

		var agg = dataframe.aggregate<Function>(
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
    
	it('can aggregate dataframe with separate functions per column', () => {

		var df = new DataFrame({
		    columnNames: ["Column1", "Column2"], 
			rows: [
                [1, 10],
                [2, 20],
                [3, 30],
            ],
            index: [10, 11, 12]
        });

		var agg = df.aggregate({ 
            Column1: (prev: number, value: number) => prev + value,
            Column2: (prev: number, value: number) => prev * value,
        });

		expect(agg.Column1).to.eql(6);
		expect(agg.Column2).to.eql(6000);
	});
    
	it('can convert to javascript object', () => {

		var dataframe = new DataFrame({
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

		var obj = dataframe.toObject(row => row.Key, row => row.Value);
		expect(obj).to.eql({
			A: 100,
			B: 200,
		});
	});

	it('can convert to javascript object - with duplicate keys', () => {

        var dataframe = new DataFrame({
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

		var obj = dataframe.toObject(row => row.Key, row => row.Value);
		expect(obj).to.eql({
			A: 3,
			B: 200,
		});
	});

	it('can reverse', () => {

		var dataframe = new DataFrame({ index: [0, 1, 2], values: ['A', 'B', 'C'] });
		var reversed = dataframe.reverse();
		expect(dataframe.toArray()).to.eql(['A', 'B', 'C']);
		expect(dataframe.getIndex().toArray()).to.eql([0, 1, 2]);
		expect(reversed.toArray()).to.eql(['C', 'B', 'A']);
		expect(reversed.getIndex().toArray()).to.eql([2, 1, 0]);
    });
    
	it('can distinct items', () => {

		var dataframe = new DataFrame({ 
			index:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			values: [1, 1, 2, 1, 1, 2, 3, 4, 3, 3],
		});

        var collapsed = dataframe.distinct();
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

		var dataframe = new DataFrame({ 
			index:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			values: [{ A: 1 }, { A: 1 }, { A: 2 }, { A: 1 }, { A: 1 }, { A: 2 }, { A: 3 }, { A: 4 }, { A: 3 }, { A: 3 }],
		});

		var collapsed = dataframe
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

		var df = new DataFrame({
			columnNames: ["Col1", "Col2"],
			rows: [
				["Long string", "Short"],
				["Small", "Even longer string"],
			]
        });

		var truncated = df.truncateStrings(10);
		expect(truncated.toRows()).to.eql([
			["Long strin", "Short"],
			["Small", "Even longe"],
		]);
	});

	it('truncation ignores strings that are already short enough', () => {

		var df = new DataFrame({
			columnNames: ["Col1", "Col2"],
			rows: [
				["Long string", "Short"],
				["Small", "Even longer string"],
			]
        });

		var truncated = df.truncateStrings(20);
		expect(truncated.toRows()).to.eql([
			["Long string", "Short"],
			["Small", "Even longer string"],
		]);
	});

	it('truncation passes through other values', () => {

		var df = new DataFrame({
			columnNames: ["Col1", "Col2", "Col3"],
			rows: [
				["Long string", 5, "Short"],
				["Small", "Even longer string", new Date(1, 2, 3)],
			]
        });

        var truncated = df.truncateStrings(10);
		expect(truncated.toRows()).to.eql([
			["Long strin", 5, "Short"],
			["Small", "Even longe", new Date(1, 2, 3)],
		]);
    });

	it('can insert pair at start of empty dataframe', () => {

		var dataframe = new DataFrame();
		var modified = dataframe.insertPair([10, 100]);
		expect(modified.toPairs()).to.eql([
			[10, 100]
		]);
	});

	it('can insert pair at start of dataframe with existing items', () => {

		var dataframe = new DataFrame({
			index:  [1,  2],
			values: [10, 11],
		});
		var modified = dataframe.insertPair([20, 100]);
		expect(modified.toPairs()).to.eql([
			[20, 100],
			[1, 10],
			[2, 11],
		]);
	});


	it('can append pair to empty dataframe', () => {

		var dataframe = new DataFrame();
		var appended = dataframe.appendPair([10, 100]);
		expect(appended.toPairs()).to.eql([
			[10, 100]
		]);
	});

	it('can append pair to dataframe with existing items', () => {

		var dataframe = new DataFrame({
			index:  [1,  2],
			values: [10, 11],
		});
		var appended = dataframe.appendPair([20, 100]);
		expect(appended.toPairs()).to.eql([
			[1, 10],
			[2, 11],
			[20, 100],
		]);
	});

	it('can fill gaps in dataframe - fill forward', () => {

		var dfWithGaps = new DataFrame({
			index:  [1,  2,  6,  7,  10, 11],
			values: [10, 11, 12, 13, 14, 15],
		});

		var dfWithoutGaps = dfWithGaps.fillGaps(
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

		expect(dfWithoutGaps.toPairs()).to.eql([
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

	it('can select default instead of empty dataframe - array', () => {

		var dataframe = new DataFrame();
		var defaulted = dataframe.defaultIfEmpty([1, 2]);
		expect(defaulted.toArray()).to.eql([1, 2]);
	});

	it('can select default instead of empty dataframe - dataframe', () => {

		var dataframe = new DataFrame();
		var defaulted = dataframe.defaultIfEmpty(new DataFrame({ values: [1, 2] }));
		expect(defaulted.toArray()).to.eql([1, 2]);
	});

	it('default is ignored for non-empty dataframe', () => {

		var dataframe = new DataFrame({ values: [5, 6] });
		var defaulted = dataframe.defaultIfEmpty([1, 2]);
		expect(defaulted.toArray()).to.eql([5, 6]);
	});
       
});