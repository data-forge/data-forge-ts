import { assert, expect } from 'chai';
import 'mocha';
import { Series, Index } from '../index';
import { ArrayIterable } from '../lib/iterables/array-iterable';

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

    it('can inflate to dataframe with no selector', () => {
        
        var series = new Series({
            values: [{ V: 10 }, { V: 20 }],
            index: [100, 200]
        });
        var dataframe = series.inflate();
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

	it('can get first and last values', function () {

		var series = new Series(['A', 'B', 'C']);
		expect(series.first()).to.eql('A');
		expect(series.last()).to.eql('C');
	});

	it('getting first of empty series throws exception', function () {

		var series = new Series();

		expect(function () {
			series.first();
		}).to.throw();
    });
    
	it('getting last of empty series throws exception', function () {

		var series = new Series();

		expect(function () {
			series.last();
		}).to.throw();
    });

    it('can get head of series', () =>  {

		var series = new Series({ index: [0, 1, 2], values: ['A', 'B', 'C'] });
		var head = series.head(2);
		expect(head.toArray()).to.eql(['A', 'B']);
	});

	it('can get tail of series', () =>  {

		var series = new Series({ index: [0, 1, 2], values: ['A', 'B', 'C'] });
		var head = series.tail(2);
		expect(head.toArray()).to.eql(['B', 'C']);
    });

	it('for each', function () {

		var series = new Series([0, 1, 2]);
		var count = 0;
		series.forEach(function (v) {
			expect(v).to.eql(count);
			++count;
		});

		expect(count).to.eql(3);
	});

	it('all - zero elements', function () {

		var series = new Series({ values: [] });

		expect(series.all(function (value) { 
				return value === 200; 
			})).to.eql(false);
	});

	it('all - no elements match', function () {

		var series = new Series({ values: [1, 2, 3, 4] });

		expect(series.all(function (value) { 
				return value === 200; 
			})).to.eql(false);
	});

	it('all - some elements match', function () {

		var series = new Series({ values: [1, 3, 3, 4] });

		expect(series.all(function (value) { 
				return value === 3; 
			})).to.eql(false);
	});

	it('all - all elements match', function () {

		var series = new Series({ values: [5, 5, 5, 5] });

		expect(series.all(function (value) { 
				return value === 5; 
			})).to.eql(true);
	});

	it('any - zero elements', function () {

		var series = new Series({ values: [] });

		expect(series.any(function (value) { 
				return value === 200; 
			})).to.eql(false);
	});

	it('any - no elements match', function () {

		var series = new Series({ values: [1, 2, 3, 4] });

		expect(series.any(function (value) { 
				return value === 200; 
			})).to.eql(false);
	});

	it('any - some elements match', function () {

		var series = new Series({ values: [1, 3, 3, 4] });

		expect(series.any(function (value) { 
				return value === 3; 
			})).to.eql(true);
	});

	it('any - all elements match', function () {

		var series = new Series({ values: [5, 5, 5, 5] });

		expect(series.any(function (value) { 
				return value === 5; 
			})).to.eql(true);
	});	

	it('any - with no predicate - no elements', function () {

		var series = new Series({ values: [] });

		expect(series.any()).to.eql(false);
	});

	it('any - with no predicate - elements exist', function () {

		var series = new Series({ values: [5, 5, 5, 5] });

		expect(series.any()).to.eql(true);
	});	

	it('none - zero elements', function () {

		var series = new Series({ values: [] });

		expect(series.none(function (value) { 
				return value === 200; 
			})).to.eql(true);
	});

	it('none - no elements match', function () {

		var series = new Series({ values: [1, 2, 3, 4] });

		expect(series.none(function (value) { 
				return value === 200; 
			})).to.eql(true);
	});

	it('none - some elements match', function () {

		var series = new Series({ values: [1, 3, 3, 4] });

		expect(series.none(function (value) { 
				return value === 3; 
			})).to.eql(false);
	});

	it('none - all elements match', function () {

		var series = new Series({ values: [5, 5, 5, 5] });

		expect(series.none(function (value) { 
				return value === 5; 
			})).to.eql(false);
	});	

	it('none - with no predicate - zero elements', function () {

		var series = new Series({ values: [] });
		expect(series.none()).to.eql(true);
	});

	it('none - with no predicate - has existing elements', function () {

		var series = new Series({ values: [5, 5, 5, 5] });
		expect(series.none()).to.eql(false);
	});	

	it('can get series starting at particular index - with integer index', function () {

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

	it('can get series starting before a particular index - with integer index', function () {

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

	it('can get series starting at particular index - with date index', function () {

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

	it('can get series starting before a particular index - with date index', function () {

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

	it('can get series ending at particular index - with integer index', function () {

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

	it('can get series ending before a particular index - with integer index', function () {

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

	it('can get series ending at particular index - with date index', function () {

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

	it('can get series ending before a particular index - with date index', function () {

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

	it('can get series before a particular index - with integer index', function () {

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

	it('can get series before a particular index - with date index', function () {

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

	it('can get series after a particular index - with integer index', function () {

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

	it('can get series after a particular index - with date index', function () {

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

	it('can get series between particular indices - with integer index', function () {

		var series = new Series({
			index: [10, 20, 30],
			values: [1, 2, 3],
		});
		
		var reduced = series.between(11, 25);
		expect(reduced.toPairs()).to.eql([
			[20, 2],
		]); 	
	});

	it('can get slice of rows - with string indices', function () {

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
        
	it('can get series between particular indices - with date index', function () {

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
        
	it('can transform a series to a series of pairs', function () {

		var series = new Series({
			index: [10, 20, 30],
			values: [1, 2, 3],
		});

		var pairs = series.asPairs().toArray();
		expect(pairs).to.eql([
			[10, 1],
			[20, 2],
			[30, 3],
		]);
	});

	it('can transform series of pairs to series of values', function () {

		var series = new Series({
			index: [10, 20, 30],
			values: [1, 2, 3],
		});

		var values = series.asPairs().asValues();
		expect(values.toPairs()).to.eql([
			[10, 1],
			[20, 2],
			[30, 3],
		]);
    });
});