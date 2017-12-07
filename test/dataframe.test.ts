import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { DataFrame } from '../lib/dataframe';
import { ArrayIterable } from '../lib/iterables/array-iterable';

describe('DataFrame', () => {

    it('can skip values in a dataframe', ()  => {

        var dataframe = new DataFrame({
            values: [1, 2, 3, 4, 5],
            index: [0, 1, 2, 3, 4],
        });
        var result = dataframe.skip(2);

        expect(result.toArray()).to.eql([3, 4, 5]);
        expect(result.getIndex().toArray()).to.eql([2, 3, 4]);
        expect(result.toPairs()).to.eql([[2, 3], [3, 4], [4, 5]]);
    });
    
	it('can bake dataframe', function () {

		var dataframe = new DataFrame({
            values: [10, 20],
            index: [1, 2],
        });
		var baked = dataframe.bake();

		expect(baked).not.to.equal(dataframe);
	});

	it('baking a baked dataframe returns same', function () {

		var dataframe = new DataFrame({
            values: [10, 20],
            index: [1, 2],
        });
        var baked = dataframe.bake();
        var rebaked = baked.bake();

		expect(rebaked).to.equal(baked);
    });
    
    it('can rewrite dataframe with select', () => {

        var dataframe = new DataFrame([10, 20, 30]);
        var modified = dataframe.select(v => v * 2);
        expect(modified.toArray()).to.eql([20, 40, 60]);
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
    
});