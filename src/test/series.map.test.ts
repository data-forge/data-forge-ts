import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { Series } from '../lib/series';
import { DataFrame } from '../lib/dataframe';

describe('Series.map', () => {

    it('can rewrite series with map', () => {

        const series = new Series([10, 20, 30]);
        const modified = series.map(v => v * 2);
        expect(modified.toArray()).to.eql([20, 40, 60]);
    });

    it('map ignores index', () => {

        const series = new Series({
            values: [10, 20, 30],
            index: [100, 200, 300],
        });
        const modified = series.map(v => v * 2);
        expect(modified.toPairs()).to.eql([[100, 20], [200, 40], [300, 60]]);
        expect(modified.getIndex().toArray()).to.eql([100, 200, 300]);
    });
    
	it('can map', function () {
		const series = new Series({ index: [0, 1, 2, 3], values: [100, 300, 200, 5] });
		const modified = series.map((value, index) => value + 10);
		expect(modified.getIndex().toArray()).to.eql([0, 1, 2, 3]);
		expect(modified.toArray()).to.eql([110, 310, 210, 15]);		
	});

	it('can can map - with array', function () {
		const series = new Series({ index: [0, 1], values: [10, 20] });
		const modified = series.flatMap(value => [100, 200]);
		expect(modified.getIndex().toArray()).to.eql([0, 0, 1, 1]);
		expect(modified.toArray()).to.eql([100, 200, 100, 200]);
	});

	it('can flat map - with series', function () {
		const series = new Series({ index: [0, 1], values: [100, 300] });
		const modified = series.flatMap(value => new Series([0, 1]));
		expect(modified.getIndex().toArray()).to.eql([0, 0, 1, 1]);
		expect(modified.toArray()).to.eql([0, 1, 0, 1]);
	});

	it('can flat map - with data-frame', function () {
		const series = new Series({ index: [0, 1], values: [100, 300] });
		const modified = series.flatMap(value => new DataFrame([{ Value: 0 }, { Value: 1 }]));
		expect(modified.getIndex().toArray()).to.eql([0, 0, 1, 1]);
		expect(modified.toArray()).to.eql([{ Value: 0 }, { Value: 1 }, { Value: 0 }, { Value: 1 }]);
	});
});