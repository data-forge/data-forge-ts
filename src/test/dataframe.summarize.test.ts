import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { DataFrame } from '../lib/dataframe';
import { ArrayIterable } from '../lib/iterables/array-iterable';
import { Series } from '../lib/series';
// @ts-ignore
import moment from "dayjs";

describe('DataFrame summarize', () => {

    it('can summarize dataframe with no parameters', () => {

        const df = new DataFrame([
            {
                A: 1,
                B: 4,
            },
            {
                A: 2,
                B: 5,
            },
            {
                A: 3,
                B: 6,
            },
        ]);

        const summary = df.summarize();
        expect(summary).to.eql({
            A_sum: 6,
            A_average: 2,
            A_count: 3,
            B_sum: 15,
            B_average: 5,
            B_count: 3,
        });
    });
    
    it('can summarize single column', () => {

        const df = new DataFrame([
            {
                A: 1,
            },
            {
                A: 2,
            },
            {
                A: 3,
            },
        ]);

        const summary = df.summarize({ A: series => series.sum() });
        expect(summary).to.eql({
            A: 6,
        });
    });
    
    it('can summarize single column with named function', () => {

        const df = new DataFrame([
            {
                A: 1,
            },
            {
                A: 2,
            },
            {
                A: 3,
            },
        ]);

        const summary = df.summarize({ A: Series.sum });
        expect(summary).to.eql({
            A: 6,
        });
    });

    it('can summarize single input column to single output field', () => {

        const df = new DataFrame([
            {
                A: 4,
            },
            {
                A: 5,
            },
            {
                A: 6,
            },
        ]);

        const summary = df.summarize({ A: { B: series => series.sum() } } );
        expect(summary).to.eql({
            B: 15,
        });
    });

    it('can summarize single input column to multiple output fields', () => {

        const df = new DataFrame([
            {
                A: 4,
            },
            {
                A: 5,
            },
            {
                A: 6,
            },
        ]);

        const summary = df.summarize({ 
            A: { 
                sum: series => series.sum(),
                avg: series => series.mean(),
            },
        });
        expect(summary).to.eql({
            sum: 15,
            avg: 5,
        });
    });

    it('can summarize multiple input columns to multiple output fields', () => {

        const df = new DataFrame([
            {
                A: 1,
                B: 4,
            },
            {
                A: 2,
                B: 5,
            },
            {
                A: 3,
                B: 6,
            },
        ]);

        const summary = df.summarize({
            A: { 
                A_sum: series => series.sum(),
                A_avg: series => series.mean(),
            },
            B: { 
                B_sum: series => series.sum(),
                B_avg: series => series.mean(),
            },
        });
        expect(summary).to.eql({
            A_sum: 6,
            A_avg: 2,
            B_sum: 15,
            B_avg: 5,
        });
    });    

    it('can summarize multiple input columns to multiple output fields with named functions', () => {

        const df = new DataFrame([
            {
                A: 1,
                B: 4,
            },
            {
                A: 2,
                B: 5,
            },
            {
                A: 3,
                B: 6,
            },
        ]);

        const summary = df.summarize({
            A: { 
                A_sum: Series.sum,
                A_avg: Series.mean,
            },
            B: { 
                B_sum: Series.sum,
                B_avg: Series.mean,
            },
        });
        expect(summary).to.eql({
            A_sum: 6,
            A_avg: 2,
            B_sum: 15,
            B_avg: 5,
        });
    });        
});