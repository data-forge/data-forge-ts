import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { Series } from '../lib/series';
import { ArrayIterable } from '../lib/iterables/array-iterable';

describe('Series constructor', () => {

    it('create series from array of values', ()  => {
        expect(new Series([10, 20, 30]).toArray()).to.eql([10, 20, 30]);        
    });

    it('create series from empty array', ()  => {
        expect(new Series([]).toArray()).to.eql([]);
    });

    it('create empty series with no params', ()  => {        
        expect(new Series().toArray()).to.eql([]);
    });

    it('create empty series from empty config', ()  => {        
        expect(new Series({}).toArray()).to.eql([]);
    });

    it('create empty series from config with no values, although index is set.', ()  => {        
        expect(new Series({ index: [100, 200, 300] }).toArray()).to.eql([]);
    });

    it('create series from array of values in config', ()  => {
        expect(new Series({ values: [10, 20, 30] }).toArray()).to.eql([10, 20, 30]);
    });
    
    it('create series from empty array in config', ()  => {
        expect(new Series({ values: [] }).toArray()).to.eql([]);
    });

    it('create series with values iterable', () => {
        var series = new Series({ values: new ArrayIterable([10, 20, 30]) });
        expect(series.toArray()).to.eql([10, 20, 30]);        
    });

    it('passing something other than an array or iterable for values is an error', () => {
        // This isn't possible in TypeScript, but is in JavaScript.
        expect(() => new Series({ values: <any>3 })).to.throw();
    })

    it('index is set by default when values are passed in by array', () => {
        var series = new Series([10, 20, 30]);

        expect(series.toPairs()).to.eql([
            [0, 10],
            [1, 20],
            [2, 30],
        ]);
    });

    it('index is set by default when values are passed in by config', () => {
        var series = new Series({
            values: [10, 20, 30]
        });

        expect(series.toPairs()).to.eql([
            [0, 10],
            [1, 20],
            [2, 30],
        ]);
    });

    it('can set index via array passed to constructor', () => {
        var series = new Series({
            values: [10, 20, 30],
            index: [100, 200, 300]
        });

        expect(series.toPairs()).to.eql([
            [100, 10],
            [200, 20],
            [300, 30],
        ]);
    });

    it('can create series with values array and index iterable', () => {

        var series = new Series({
            values: [10, 20, 30],
            index: new ArrayIterable([100, 200, 300])
        });

        expect(series.toPairs()).to.eql([
            [100, 10],
            [200, 20],
            [300, 30],
        ]);

    });

    it('can create series with values iterable and index iterable', () => {
        var series = new Series({
            values: new ArrayIterable([10, 20, 30]),
            index: new ArrayIterable([100, 200, 300])
        });

        expect(series.toPairs()).to.eql([
            [100, 10],
            [200, 20],
            [300, 30],
        ]);

    });

    it('passing something other than an array or iterable for index is an error', () => {
        // This isn't possible in TypeScript, but is in JavaScript.
        expect(() => new Series({ values: [10, 20, 30], index: <any>3 })).to.throw();
    });

    it('can create series with index from another series', () => {
        var series = new Series({
            values: [10, 20, 30],
            index: new Series([100, 200, 300])
        });

        expect(series.toPairs()).to.eql([
            [100, 10],
            [200, 20],
            [300, 30],
        ]);
    });

    it ('can get index from series', () => {
        var series = new Series({
            values: [10, 20, 30],
            index: [100, 200, 300]
        });

        expect(series.getIndex().toArray()).to.eql([
            100,
            200,
            300,
        ]);
    });

    it('can create series with index from another index', () => {
        var series = new Series({
            values: [10, 20, 30],
            index: new Index([100, 200, 300])
        });

        expect(series.toPairs()).to.eql([
            [100, 10],
            [200, 20],
            [300, 30],
        ]);
    });

    it('can create series from pairs', () => {
        var series = new Series({ 
            pairs: [
                [100, 10],
                [200, 20],
                [300, 30],                
            ],
        });

        expect(series.getIndex().toArray()).to.eql([100, 200, 300]);
        expect(series.toArray()).to.eql([10, 20, 30]);
    });

    it('can create series from values and pairs', () => {
        var series = new Series({ 
            values: new ArrayIterable([
                5, 4, 6, // Bit of a trick here, using different values to the pairs.
            ]),
            pairs: new ArrayIterable([
                [100, 10],
                [200, 20],
                [300, 30],                
            ]),
        });

        expect(series.getIndex().toArray()).to.eql([100, 200, 300]);
        expect(series.toPairs()).to.eql([[100, 10], [200, 20], [300, 30]]);
        expect(series.toArray()).to.eql([5, 4, 6]); // Different values! A hack to test.
    });

    it('can create series from index and pairs', () => {

        var series = new Series({ 
            index: new ArrayIterable([
                15, 16, 17 // Trick. Separate index values.
            ]),
            pairs: new ArrayIterable([
                [100, 10],
                [200, 20],
                [300, 30],                
            ]),
        });

        expect(series.getIndex().toArray()).to.eql([15, 16, 17]); // Different values!
        expect(series.toPairs()).to.eql([[100, 10], [200, 20], [300, 30]]);
        expect(series.toArray()).to.eql([10, 20, 30]);
    });

    it('can create series from values, index and pairs', () => {
        var series = new Series({ 
            values: new ArrayIterable([
                5, 4, 6, // Bit of a trick here, using different values to the pairs.
            ]),
            index: new ArrayIterable([
                15, 16, 17 // Trick. Separate index values.
            ]),
            pairs: new ArrayIterable([
                [100, 10],
                [200, 20],
                [300, 30],                
            ]),
        });

        expect(series.getIndex().toArray()).to.eql([15, 16, 17]); // Different values!
        expect(series.toPairs()).to.eql([[100, 10], [200, 20], [300, 30]]);
        expect(series.toArray()).to.eql([5, 4, 6]); // Different values! A hack to test.
    });
});
