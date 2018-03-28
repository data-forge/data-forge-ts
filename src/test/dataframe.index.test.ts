import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { DataFrame } from '../lib/dataframe';
import { ArrayIterable } from '../lib/iterables/array-iterable';

describe('DataFrame', () => {

	it('default index is generated', function () {
		
		var column = new DataFrame([100, 200]);
		expect(column.toPairs()).to.eql([			
			[0, 100],
			[1, 200]			
		]);		
    });
    
    it('can set new index for dataframe from array', () => {
        var dataframe = new DataFrame([10, 20, 30]);
        var newDataFrame = dataframe.withIndex([11, 22, 33]);
        expect(newDataFrame.getIndex().toArray()).to.eql([11, 22, 33]);
    });

    it('can set new index for dataframe from dataframe', () => {
        var dataframe = new DataFrame([10, 20, 30]);
        var newDataFrame = dataframe.withIndex(new DataFrame([11, 22, 33]));
        expect(newDataFrame.getIndex().toArray()).to.eql([11, 22, 33]);
    });

    it('can set new index for dataframe from index', () => {
        var dataframe = new DataFrame([10, 20, 30]);
        var newDataFrame = dataframe.withIndex(new Index([11, 22, 33]));
        expect(newDataFrame.getIndex().toArray()).to.eql([11, 22, 33]);
    });

    it('can reset index', () => {
        var dataframe = new DataFrame({
            values:  [10, 20, 30],
            index: [11, 22, 33],
        });
        var newDataFrame = dataframe.resetIndex();
        expect(newDataFrame.toPairs()).to.eql([[0, 10], [1, 20], [2, 30]]);
    });
});