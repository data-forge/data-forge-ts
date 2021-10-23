import { expect } from 'chai';
import 'mocha';
import { Series } from '../lib/series';

describe.only('Series.frequency', () => {

	it('can create frequency table for small data set', () => {

		const series = new Series([ 1, 2, 3, 4 ]);
        const frequencyTable = series.frequency({ captureValues: true }).toArray();
        expect(frequencyTable).to.eql([
            { lower: 1, upper: 2, count: 1, proportion: 0.25, cumulative: 0.25, values: [ 1 ] },
            { lower: 2, upper: 3, count: 1, proportion: 0.25, cumulative: 0.5, values: [ 2 ] },
            { lower: 3, upper: 4, count: 1, proportion: 0.25, cumulative: 0.75, values: [ 3 ] },
            { lower: 4, upper: 5, count: 1, proportion: 0.25, cumulative: 1.0, values: [ 4 ] },
        ]);
	});

    it("can create frequency table for realistic data set", () => {
        // https://lo.unisa.edu.au/mod/book/tool/print/index.php?id=646432&chapterid=105910
        const series = new Series([
            37, 63, 56, 54, 39, 49, 55, 114, 59, 55,
            54, 30, 107, 38, 51, 31, 19, 95, 87, 82,
            65, 38, 110, 57, 64, 105, 58, 55, 85, 35,
            64, 96, 43, 56, 41, 55, 50, 99, 105, 28,
            63, 76, 65, 77, 68, 55, 89, 66, 66, 74,
        ]);
        const frequencyTable = series.frequency({ 
                lower: 40,
                upper: 90,
                interval: 10,
            })
            .toArray();

        expect(frequencyTable).to.eql([
            { upper: 40, count: 9, proportion: 0.18, cumulative: 0.18 },
            {
              lower: 40,
              upper: 50,
              count: 3,
              proportion: 0.06,
              cumulative: 0.24
            },
            {
              lower: 50,
              upper: 60,
              count: 14,
              proportion: 0.28,
              cumulative: 0.52
            },
            { lower: 60, upper: 70, count: 9, proportion: 0.18, cumulative: 0.7 },
            {
              lower: 70,
              upper: 80,
              count: 3,
              proportion: 0.06,
              cumulative: 0.76
            },
            {
              lower: 80,
              upper: 90,
              count: 4,
              proportion: 0.08,
              cumulative: 0.84
            },
            { lower: 90, count: 8, proportion: 0.16, cumulative: 1 }
        ]);
    });

    it("can create frequency table for realistic data set 2", () => {
        // https://www.mathsteacher.com.au/year8/ch17_stat/03_freq/freq.htm
        const series = new Series([
            28, 122, 217, 130, 120, 86, 80, 90, 120, 140,
            70, 40, 145, 187, 113, 90, 68, 174, 194, 170,
            100, 75, 104, 97, 75, 123, 100, 82, 109, 120,
            81,
        ]);
        const frequencyTable = series.frequency({ 
                lower: 0,
                interval: 40,
            })
            .toArray();

        expect(frequencyTable).to.eql([
            {
              lower: 0,
              upper: 40,
              count: 1,
              proportion: 0.03225806451612903,
              cumulative: 0.03225806451612903
            },
            {
              lower: 40,
              upper: 80,
              count: 5,
              proportion: 0.16129032258064516,
              cumulative: 0.1935483870967742
            },
            {
              lower: 80,
              upper: 120,
              count: 12,
              proportion: 0.3870967741935484,
              cumulative: 0.5806451612903225
            },
            {
              lower: 120,
              upper: 160,
              count: 8,
              proportion: 0.25806451612903225,
              cumulative: 0.8387096774193548
            },
            {
              lower: 160,
              upper: 200,
              count: 4,
              proportion: 0.12903225806451613,
              cumulative: 0.9677419354838709
            },
            {
              lower: 200,
              upper: 240,
              count: 1,
              proportion: 0.03225806451612903,
              cumulative: 0.9999999999999999
            }
        ]);
    });
  
});