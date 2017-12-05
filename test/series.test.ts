import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { Series } from '../lib/series';
import { ArrayIterable } from '../lib/iterables/array-iterable';

describe('Series', () => {

    it('can set new index for series from array', () => {

        var series = new Series([10, 20, 30]);
        var newSeries = series.withIndex([11, 22, 33]);
        expect(newSeries.getIndex().toArray()).to.eql([11, 22, 33]);
    });

    it('can set new index for series from series', () => {

        var series = new Series([10, 20, 30]);
        var newSeries = series.withIndex(new Series([11, 22, 33]));
        expect(newSeries.getIndex().toArray()).to.eql([11, 22, 33]);
    });

    it('can set new index for series from index', () => {

        var series = new Series([10, 20, 30]);
        var newSeries = series.withIndex(new Index([11, 22, 33]));
        expect(newSeries.getIndex().toArray()).to.eql([11, 22, 33]);
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
});