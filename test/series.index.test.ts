import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { Series } from '../lib/series';
import { ArrayIterable } from '../lib/iterables/array-iterable';

describe('Series', () => {

    it('can set new index for series from array', () => {

        var series = new Series([10, 20, 30]);
        var newSeries = series.withIndex([11, 22, 33]);
        expect(newSeries.getIndex().toArray()).to.eql([11, 22, 33]);
    });

    it('can set new index for series from series', () => {

        var series = new Series([10, 20, 30]);
        var newSeries = series.withIndex(new Series([11, 22, 33]));
        expect(newSeries.getIndex().toArray()).to.eql([11, 22, 33]);
    });

    it('can set new index for series from index', () => {

        var series = new Series([10, 20, 30]);
        var newSeries = series.withIndex(new Index([11, 22, 33]));
        expect(newSeries.getIndex().toArray()).to.eql([11, 22, 33]);
    });

});