import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { Series } from '../lib/series';
import { ArrayIterable } from '../lib/iterables/array-iterable';

describe('Series', () => {
    
	it('can bake series', function () {

		var series = new Series({
            values: [10, 20],
            index: [1, 2],
        });
		var baked = series.bake();

		expect(baked).not.to.equal(series);
	});

	it('baking a baked series returns same', function () {

		var series = new Series({
            values: [10, 20],
            index: [1, 2],
        });
        var baked = series.bake();
        var rebaked = baked.bake();

		expect(rebaked).to.equal(baked);
    });
    
    it('can rewrite series with select', () => {

        var series = new Series([10, 20, 30]);
        var modified = series.select(v => v * 2);
        expect(modified.toArray()).to.eql([20, 40, 60]);
    });

    it('select ignores index', () => {

        var series = new Series({
            values: [10, 20, 30],
            index: [100, 200, 300],
        });
        var modified = series.select(v => v * 2);
        expect(modified.toPairs()).to.eql([[100, 20], [200, 40], [300, 60]]);
        expect(modified.getIndex().toArray()).to.eql([100, 200, 300]);
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

	it('can take', function () {
		var series = new Series({ 
            index: [0, 1, 2, 3], 
            values: [100, 300, 200, 5] 
        });
        
        var skipped = series.take(2);		
		expect(skipped.getIndex().toArray()).to.eql([0, 1]);
		expect(skipped.toArray()).to.eql([100, 300]);		
	});

	it('can filter', function () {
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

	it('can skip while', function () {

		var series = new Series({ index: [0, 1, 2, 3], values: [true, true, false, true] });
        var skipped = series.skipWhile(value => value);
		expect(skipped.toPairs()).to.eql([
			[2, false],
			[3, true],
		]);
	});

	it('can skip until', function () {

		var series = new Series({ index: [0, 1, 2, 3], values: [false, false, true, false] });
		var skipped = series.skipUntil(value => value);
		expect(skipped.toPairs()).to.eql([
			[2, true],
			[3, false],
		]);
	});

	it('can take while', function () {

		var series = new Series({ index: [0, 1, 2, 3], values: [true, true, false, true] });
		var skipped = series.takeWhile(value => value);
		expect(skipped.toPairs()).to.eql([
			[0, true],
			[1, true],
		]);
	});

	it('can take until', function () {

		var series = new Series({ index: [0, 1, 2, 3], values: [false, false, true, false] });
		var skipped = series.takeUntil(value => value);
		expect(skipped.toPairs()).to.eql([
			[0, false],
			[1, false],
		]);
	});
});