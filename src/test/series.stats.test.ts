import { assert, expect } from 'chai';
import 'mocha';
import { range, Series, Index } from '../index';
import { ArrayIterable } from '../lib/iterables/array-iterable';

describe('Series stats', () => {
    
	it('sum of empty series is zero', () => {

		var series = new Series();
		expect(series.sum()).to.eql(0);
	});

	it('can sum series', () => {

		var series = new Series({ index: [0, 1, 2], values: [1, 2, 3] });
		expect(series.sum()).to.eql(6);
	});

    it('sum filters out nulls', () => {

		var series = new Series({ index: [0, 1, 2, 3], values: [1, 2, 3, null] });
		expect(series.sum()).to.eql(6);
	});

    it('sum filters out undefineds', () => {

		var series = new Series({ index: [0, 1, 2, 3], values: [1, 2, 3, undefined] });
		expect(series.sum()).to.eql(6);
	});

	it('can average series', () => {

		var series = new Series({ index: [0, 1, 2], values: [1, 2, 3] });
		expect(series.mean()).to.eql(2);
	});

	it('average of an empty series is zero', () => {

		var series = new Series({ index: [], values: [] });
		expect(series.mean()).to.eql(0);
	});

    it('average filters out nulls', () => {

		var series = new Series({ index: [0, 1, 2, 3], values: [1, 2, 3, null] });
		expect(series.mean()).to.eql(2);
	});

    it('average filters out undefineds', () => {

		var series = new Series({ index: [0, 1, 2, 3], values: [1, 2, 3, undefined] });
		expect(series.mean()).to.eql(2);
	});

    it('can get median of even series', () => {

		var series = new Series({ index: [0, 1, 2, 3], values: [1, 2, 3, 4] });
		expect(series.median()).to.eql(2.5);
	});

	it('can get median of odd series', () => {

		var series = new Series({ index: [0, 1, 2], values: [1, 2, 3] });
		expect(series.median()).to.eql(2);
	});

	it('median of an empty series is zero', () => {

		var series = new Series({ index: [], values: [] });
		expect(series.median()).to.eql(0);
	});

    it('median filters out nulls', () => {

		var series = new Series({ index: [0, 1, 2, 3, 4], values: [1, null, 2, 3, 4] });
		expect(series.median()).to.eql(2.5);
	});

    it('median filters out undefineds', () => {

		var series = new Series({ index: [0, 1, 2, 3, 4], values: [1, 2, undefined, 3, 4] });
		expect(series.median()).to.eql(2.5);
	});

    it('can get mode', () => {

        const series = new Series([1, 1, 2, 2, 2, 3, 4, 4, 5]);
        const mode = series.mode();
        expect(mode).to.eql(2);
    });

    it('mode gets first set when there are two most frequent', () => {

        const series = new Series([1, 1, 2, 2]);
        const mode = series.mode();
        expect(mode).to.eql(1);
    });

    it('mode can handle different types', () => {

        const series = new Series([1, 2, "hello", 3, "hello"]);
        const mode = series.mode();
        expect(mode).to.eql("hello");
    });

    it('mode returns undefined for empty data set', () => {

        const series = new Series();
        const mode = series.mode();
        expect(mode).to.eql(undefined);

    });

    it('can get series minimum', () => {

		var series = new Series({ index: [0, 1, 2], values: [5, 2.5, 3] });
		expect(series.min()).to.eql(2.5);
	});

    it('min filters out nulls', () => {

		var series = new Series({ index: [0, 1, 2, 3], values: [5, null, 2.5, 3] });
		expect(series.min()).to.eql(2.5);
	});

    it('min filters out undefineds', () => {

		var series = new Series({ index: [0, 1, 2, 3], values: [5, 2.5, undefined, 3] });
		expect(series.min()).to.eql(2.5);
	});

    it('can get series maximum', () => {

		var series = new Series({ index: [0, 1, 2], values: [5, 6, 3] });
		expect(series.max()).to.eql(6);
	});

    it('max filters out nulls', () => {

		var series = new Series({ index: [0, 1, 2, 3], values: [5, null, 6, 3] });
		expect(series.max()).to.eql(6);
	});

    it('max filters out undefineds', () => {

		var series = new Series({ index: [0, 1, 2, 3], values: [5, 6, undefined, 3] });
		expect(series.max()).to.eql(6);
	});

    it('can get series range', () => {

        const series = new Series([ 4, 5, 6 ]);
        expect(series.range()).to.equal(2);
    });

    it ('range of empty series is zero', () => {

        const series = new Series();
        expect(series.range()).to.equal(0);
    });

    it ('range of series handles negative numbers', () => {

        const series = new Series([4, -2]);
        expect(series.range()).to.equal(6);
    });

    it('can invert series', () => {

		var series = new Series([5, -1, 2, -10, 3, 0]);
		expect(series.invert().toArray()).to.eql([-5, 1, -2, 10, -3, -0]);
    });

    it('invert ignores nulls', () => {

        var series = new Series([5, null, -1]);
		expect(Array.from(series.invert())).to.eql([-5, null, 1]); // Using Array.from because toArray strips nulls and undefines!
    });

    it('invert ignores undefineds', () => {

		var series = new Series([5, undefined, -1]);
		expect(Array.from(series.invert())).to.eql([-5, undefined, 1]); // Using Array.from because toArray strips nulls and undefines!
    });

    it('can count up positive values', () => {

        var series = new Series({
            values: [5, 6, -1, 2, -10, 3, 10, 8, 0, 0, -5, -3, 1],
            index: range(10, 13),
        });

        var counted = series.counter(value => value > 0);
        expect(counted.toArray()).to.eql([1, 2, 0, 1, 0, 1, 2, 3, 0, 0, 0, 0, 1]);
        expect(counted.getIndex().toArray()).to.eql(range(10, 13).toArray());
    });

    it('population variance of empty series is zero', ()=> {
        
        const series = new Series<number, number>();
        expect(series.variance()).to.eql(0);
    });

    it('can compute variance', () => {
        
        const series = new Series<number, number>([2, 4, 4, 4, 5, 5, 7, 9]);
        expect(series.variance()).to.eql(4);
    }); 

    it('variance ignores nulls', () => {
        
        const series = new Series<number, any>([2, 4, 4, null, 4, 5, 5, 7, 9]);
        expect(series.variance()).to.eql(4);
    }); 

    it('variance ignores undefineds', () => {
        
        const series = new Series<number, any>([2, 4, 4, undefined, 4, 5, 5, 7, 9]);
        expect(series.variance()).to.eql(4);
    }); 

    it('population standard deviation of empty series is zero', ()=> {
        
        const series = new Series<number, number>([]);
        expect(series.std()).to.eql(0);
    });

    it('can compute standard deviation', () => {
        
        const series = new Series<number, number>([2, 4, 4, 4, 5, 5, 7, 9]);
        expect(series.mean()).to.eql(5);
        expect(series.std()).to.eql(2);
    }); 

    it('standard deviation ignores nulls', () => {
        
        const series = new Series<number, any>([2, 4, 4, null, 4, 5, 5, 7, 9]);
        expect(series.mean()).to.eql(5);
        expect(series.std()).to.eql(2);
    }); 

    it('standard deviation ignores undefineds', () => {
        
        const series = new Series<number, any>([2, 4, 4, undefined, 4, 5, 5, 7, 9]);
        expect(series.mean()).to.eql(5);
        expect(series.std()).to.eql(2);
    }); 

    //
    // Derived from Statistics (9th Edition) by Witte & Witte. P 83. Chapter 4.
    //
    it('realistic test for population standard deviation', () => {
        const x = [13, 10, 11, 7, 9, 11, 9];
        expect(new Series(x).std()).to.be.closeTo(1.77, 0.01);
    });

    it('sample variance of empty series is zero', ()=> {
        
        const series = new Series<number, number>();
        expect(series.sampleVariance()).to.eql(0);
    });

    it('sample standard deviation of empty series is zero', ()=> {
        
        const series = new Series<number, number>([]);
        expect(series.sampleStd()).to.eql(0);
    });

    //
    // Derived from Statistics (9th Edition) by Witte & Witte. P 83. Chapter 4.
    //
    it('realistic test for sample standard deviation', () => {
        const x = [7, 3, 1, 0, 4];
        expect(new Series(x).sampleStd()).to.be.closeTo(2.74, 0.01);
    });

    it("can compute z scores", () => {
        const series = new Series([1, 2, 3]);
        expect(series.standardize().toArray()).to.eql([ -1.224744871391589, 0, 1.224744871391589 ]);
    });

    it("standardizing an empty series produces an empty series", () => {
        expect(new Series().standardize().toArray()).to.eql([]);    
    });

    it('standardize throws for series with no variability', () => {
        const series = new Series([2, 2, 2]);
        expect(() => series.standardize()).to.throw();
    });

    it("can compute z scores - sample", () => {
        const series = new Series([1, 2, 3]);
        expect(series.sampleStandardize().toArray()).to.eql([ -1, 0, 1 ]);
    });

    it("standardizing an empty series produces an empty series - sample", () => {
        expect(new Series().sampleStandardize().toArray()).to.eql([]);    
    });

    it('standardize throws for series with no variability - sample', () => {
        const series = new Series([2, 2, 2]);
        expect(() => series.sampleStandardize()).to.throw();
    });
});