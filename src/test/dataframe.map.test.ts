import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { Series } from '../lib/series';
import { DataFrame } from '../lib/dataframe';

describe('DataFrame map', () => {

    it('can rewrite series with select', () => {

        const  dataframe = new DataFrame([10, 20, 30]);
        const  modified = dataframe.map(v => v * 2);
        expect(modified.toArray()).to.eql([20, 40, 60]);
    });

    it('map ignores index', () => {

        const  dataframe = new DataFrame({
            values: [10, 20, 30],
            index: [100, 200, 300],
        });
        const  modified = dataframe.map(v => v * 2);
        expect(modified.toPairs()).to.eql([[100, 20], [200, 40], [300, 60]]);
        expect(modified.getIndex().toArray()).to.eql([100, 200, 300]);
    });
    
	it('can map', function () {
		const  dataframe = new DataFrame({ index: [0, 1, 2, 3], values: [100, 300, 200, 5] });
		const  modified = dataframe.map((value, index) => value + 10);
		expect(modified.getIndex().toArray()).to.eql([0, 1, 2, 3]);
		expect(modified.toArray()).to.eql([110, 310, 210, 15]);		
	});

	it('can flat map - with array', function () {
		const  dataframe = new DataFrame({ index: [0, 1], values: [10, 20] });
		const  modified = dataframe.flatMap(value => [100, 200]);
		expect(modified.getIndex().toArray()).to.eql([0, 0, 1, 1]);
		expect(modified.toArray()).to.eql([100, 200, 100, 200]);
	});

	it('can flat map - with series', function () {
		const  dataframe = new DataFrame({ index: [0, 1], values: [100, 300] });
		const  modified = dataframe.flatMap(value => new DataFrame([0, 1]));
		expect(modified.getIndex().toArray()).to.eql([0, 0, 1, 1]);
		expect(modified.toArray()).to.eql([0, 1, 0, 1]);
	});

	it('can flat map - with data-frame', function () {
		const  dataframe = new DataFrame({ index: [0, 1], values: [100, 300] });
		const  modified = dataframe.flatMap(value => new DataFrame([{ Value: 0 }, { Value: 1 }]));
		expect(modified.getIndex().toArray()).to.eql([0, 0, 1, 1]);
		expect(modified.toArray()).to.eql([{ Value: 0 }, { Value: 1 }, { Value: 0 }, { Value: 1 }]);
	});
});