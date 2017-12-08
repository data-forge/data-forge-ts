import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { Series } from '../lib/series';
import { ArrayIterable } from '../lib/iterables/array-iterable';

describe('Series', () => {

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


    //todo: inflate preserves index - both cases, test pairs
});