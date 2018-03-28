import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { Series } from '../lib/series';
import { DataFrame } from '../lib/dataframe';

describe('DataFrame select', () => {

    it('can rewrite series with select', () => {

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
    
	it('can select', function () {
		var dataframe = new DataFrame({ index: [0, 1, 2, 3], values: [100, 300, 200, 5] });
		var modified = dataframe.select((value, index) => value + 10);
		expect(modified.getIndex().toArray()).to.eql([0, 1, 2, 3]);
		expect(modified.toArray()).to.eql([110, 310, 210, 15]);		
	});

	it('can select many - with array', function () {
		var dataframe = new DataFrame({ index: [0, 1], values: [10, 20] });
		var modified = dataframe.selectMany(value => [100, 200]);
		expect(modified.getIndex().toArray()).to.eql([0, 0, 1, 1]);
		expect(modified.toArray()).to.eql([100, 200, 100, 200]);
	});

	it('can select many - with series', function () {
		var dataframe = new DataFrame({ index: [0, 1], values: [100, 300] });
		var modified = dataframe.selectMany(value => new DataFrame([0, 1]));
		expect(modified.getIndex().toArray()).to.eql([0, 0, 1, 1]);
		expect(modified.toArray()).to.eql([0, 1, 0, 1]);
	});

	it('can select many - with data-frame', function () {
		var dataframe = new DataFrame({ index: [0, 1], values: [100, 300] });
		var modified = dataframe.selectMany(value => new DataFrame([{ Value: 0 }, { Value: 1 }]));
		expect(modified.getIndex().toArray()).to.eql([0, 0, 1, 1]);
		expect(modified.toArray()).to.eql([{ Value: 0 }, { Value: 1 }, { Value: 0 }, { Value: 1 }]);
	});
});