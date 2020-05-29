import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { DataFrame } from '../lib/dataframe';
import { ArrayIterable } from '../lib/iterables/array-iterable';
import { DeflateRaw } from 'zlib';

describe('DataFrame melt', () => {
    var df: DataFrame;

    beforeEach(()=> {
        df = new DataFrame([
            {'A': 'a', 'B': 1, 'C': 2, 'D': 5},
            {'A': 'b', 'B': 3, 'C': 4, 'D': 6},
            {'A': 'c', 'B': 5, 'C': 6, 'D': 7},
        ]);
    });

    it('can melt a dataframe with a single id column and 2 value columns passed as input', () => {
        expect(df.melt('A', ['B', 'C']).toArray()).to.eql([
            {'A': 'a', 'variable': 'B', 'value': 1},
            {'A': 'b', 'variable': 'B', 'value': 3},
            {'A': 'c', 'variable': 'B', 'value': 5},
            {'A': 'a', 'variable': 'C', 'value': 2},
            {'A': 'b', 'variable': 'C', 'value': 4},
            {'A': 'c', 'variable': 'C', 'value': 6}
        ]);
    });

    it('can melt a dataframe with single id columns and single value column passed as input', () => {
        expect(df.melt('A', 'B').toArray()).to.eql([
            {'A': 'a', 'variable': 'B', 'value': 1},
            {'A': 'b', 'variable': 'B', 'value': 3},
            {'A': 'c', 'variable': 'B', 'value': 5}
        ]);
    });

    it('can melt a dataframe with multiple id columns and single value column passed as input', () => {
        expect(df.melt(['A', 'B'], 'C').toArray()).to.eql([
            {'A': 'a', 'B': 1, 'variable': 'C', 'value': 2},
            {'A': 'b', 'B': 3, 'variable': 'C', 'value': 4},
            {'A': 'c', 'B': 5, 'variable': 'C', 'value': 6},
        ]);
    });

    it('can melt a dataframe with multiple id columns and multiple value columns passed as input', () => {
        expect(df.melt(['A', 'B'], ['C', 'D']).toArray()).to.eql([
            {'A': 'a', 'B': 1, 'variable': 'C', 'value': 2},
            {'A': 'b', 'B': 3, 'variable': 'C', 'value': 4},
            {'A': 'c', 'B': 5, 'variable': 'C', 'value': 6},
            {'A': 'a', 'B': 1, 'variable': 'D', 'value': 5},
            {'A': 'b', 'B': 3, 'variable': 'D', 'value': 6},
            {'A': 'c', 'B': 5, 'variable': 'D', 'value': 7},
        ]);
    });

    it('can melt an empty dataframe', () => {
        df = new DataFrame([]);
        
        expect(df.melt('A', ['B', 'C']).toArray()).to.eql([]);
    });

    it('should return an empty dataframe if no value columns are passed', () => {
        expect(df.melt('A', []).toArray()).to.eql([]);
    });

    it('can melt a dataframe if no id columns are passed', () => {
        expect(df.melt([], ['B', 'C']).toArray()).to.eql([
            {'variable': 'B', 'value': 1},
            {'variable': 'B', 'value': 3},
            {'variable': 'B', 'value': 5},
            {'variable': 'C', 'value': 2},
            {'variable': 'C', 'value': 4},
            {'variable': 'C', 'value': 6}
        ]);
    });

    it('should return an empty dataframe if no id columns and no value columns are passed', () => {
        expect(df.melt([], []).toArray()).to.eql([]);
    });
});
