import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { DataFrame } from '../lib/dataframe';
import { ArrayIterable } from '../lib/iterables/array-iterable';

describe('DataFrame constructor', () => {

    it('create dataframe from array of values', ()  => {
        
        expect(new DataFrame([10, 20, 30]).toArray()).to.eql([10, 20, 30]);        

    });

    it('create dataframe from empty array', ()  => {
        
        expect(new DataFrame([]).toArray()).to.eql([]);

    });

    it('create empty dataframe using no params', ()  => {
        
        expect(new DataFrame().toArray()).to.eql([]);
    });

    it('create empty dataframe from empty config', ()  => {
        
        expect(new DataFrame({}).toArray()).to.eql([]);
    });

    it('create empty dataframe from config with no values, although index is set.', ()  => {
        
        expect(new DataFrame({ index: [100, 200, 300] }).toArray()).to.eql([]);
    });

    it('create dataframe from array of values in config', ()  => {

        expect(new DataFrame({ values: [10, 20, 30] }).toArray()).to.eql([10, 20, 30]);        

    });
    
    it('create dataframe from empty array in config', ()  => {

        expect(new DataFrame({ values: [] }).toArray()).to.eql([]);

    });

    it('create dataframe with values iterable', () => {
        var dataframe = new DataFrame({ values: new ArrayIterable([10, 20, 30]) });
        expect(dataframe.toArray()).to.eql([10, 20, 30]);        
    });

    it('passing something other than an array or iterable for values is an error', () => {

        // This isn't possible in TypeScript, but is in JavaScript.
        expect(() => new DataFrame({ values: <any>3 })).to.throw();
    })

    //todo: create dataframe with values iterable in config
    //todo create dataframe from values array and index iterable
    // create dataframe from values iterable and index iterable
    //tod: 

    it('index is set by default when values are passed in by array', () => {
        var dataframe = new DataFrame([10, 20, 30]);

        expect(dataframe.toPairs()).to.eql([
            [0, 10],
            [1, 20],
            [2, 30],
        ]);
    });

    it('index is set by default when values are passed in by config', () => {
        var dataframe = new DataFrame({
            values: [10, 20, 30]
        });

        expect(dataframe.toPairs()).to.eql([
            [0, 10],
            [1, 20],
            [2, 30],
        ]);
    });

    it('can set index via array passed to constructor', () => {

        var dataframe = new DataFrame({
            values: [10, 20, 30],
            index: [100, 200, 300]
        });

        expect(dataframe.toPairs()).to.eql([
            [100, 10],
            [200, 20],
            [300, 30],
        ]);
    });

    it('can create dataframe with values array and index iterable', () => {

        var dataframe = new DataFrame({
            values: [10, 20, 30],
            index: new ArrayIterable([100, 200, 300])
        });

        expect(dataframe.toPairs()).to.eql([
            [100, 10],
            [200, 20],
            [300, 30],
        ]);

    });

    it('can create dataframe with values iterable and index iterable', () => {

        var dataframe = new DataFrame({
            values: new ArrayIterable([10, 20, 30]),
            index: new ArrayIterable([100, 200, 300])
        });

        expect(dataframe.toPairs()).to.eql([
            [100, 10],
            [200, 20],
            [300, 30],
        ]);

    });

    it('passing something other than an array or iterable for index is an error', () => {

        // This isn't possible in TypeScript, but is in JavaScript.
        expect(() => new DataFrame({ values: [10, 20, 30], index: <any>3 })).to.throw();

    });

    it('can create dataframe with index from another dataframe', () => {

        var dataframe = new DataFrame({
            values: [10, 20, 30],
            index: new DataFrame([100, 200, 300])
        });

        expect(dataframe.toPairs()).to.eql([
            [100, 10],
            [200, 20],
            [300, 30],
        ]);
        
    });

    it ('can get index from dataframe', () => {

        var dataframe = new DataFrame({
            values: [10, 20, 30],
            index: [100, 200, 300]
        });

        expect(dataframe.getIndex().toArray()).to.eql([
            100,
            200,
            300,
        ]);

    });

    it('can create dataframe with index from another index', () => {

        var dataframe = new DataFrame({
            values: [10, 20, 30],
            index: new Index([100, 200, 300])
        });

        expect(dataframe.toPairs()).to.eql([
            [100, 10],
            [200, 20],
            [300, 30],
        ]);
        
    });

    it('can create dataframe from pairs', () => {

        var dataframe = new DataFrame({ 
            pairs: new ArrayIterable([
                [100, 10],
                [200, 20],
                [300, 30],                
            ]),
        });

        expect(dataframe.getIndex().toArray()).to.eql([100, 200, 300]);
        expect(dataframe.toArray()).to.eql([10, 20, 30]);
    });

    it('can create dataframe from values and pairs', () => {

        var dataframe = new DataFrame({ 
            values: new ArrayIterable([
                5, 4, 6, // Bit of a trick here, using different values to the pairs.
            ]),
            pairs: new ArrayIterable([
                [100, 10],
                [200, 20],
                [300, 30],                
            ]),
        });

        expect(dataframe.getIndex().toArray()).to.eql([100, 200, 300]);
        expect(dataframe.toPairs()).to.eql([[100, 10], [200, 20], [300, 30]]);
        expect(dataframe.toArray()).to.eql([5, 4, 6]); // Different values! A hack to test.
    });

    it('can create dataframe from index and pairs', () => {

        var dataframe = new DataFrame({ 
            index: new ArrayIterable([
                15, 16, 17 // Trick. Separate index values.
            ]),
            pairs: new ArrayIterable([
                [100, 10],
                [200, 20],
                [300, 30],                
            ]),
        });

        expect(dataframe.getIndex().toArray()).to.eql([15, 16, 17]); // Different values!
        expect(dataframe.toPairs()).to.eql([[100, 10], [200, 20], [300, 30]]);
        expect(dataframe.toArray()).to.eql([10, 20, 30]);
    });

    it('can create dataframe from values, index and pairs', () => {

        var dataframe = new DataFrame({ 
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

        expect(dataframe.getIndex().toArray()).to.eql([15, 16, 17]); // Different values!
        expect(dataframe.toPairs()).to.eql([[100, 10], [200, 20], [300, 30]]);
        expect(dataframe.toArray()).to.eql([5, 4, 6]); // Different values! A hack to test.
    });
});
