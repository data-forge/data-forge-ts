import { assert, expect } from 'chai';
import 'mocha';
import { Series } from '../lib/series';

describe('Series', () => {

    it('create series from array of values', ()  => {
        
        expect(new Series([10, 20, 30]).toArray()).to.eql([10, 20, 30]);        

    });

    it('create series from empty array', ()  => {
        
        expect(new Series([]).toArray()).to.eql([]);

    });

    it('create empty values', ()  => {
        
        expect(new Series().toArray()).to.eql([]);
    });

    it('create series from array of values in config', ()  => {

        expect(new Series({ values: [10, 20, 30] }).toArray()).to.eql([10, 20, 30]);        

    });
    
    it('create series from empty array in config', ()  => {

        expect(new Series({ values: [] }).toArray()).to.eql([]);

    });

    //todo: get default index next
});
