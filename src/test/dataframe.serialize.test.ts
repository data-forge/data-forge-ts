import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { DataFrame, IDataFrame, ISerializedDataFrame } from '../lib/dataframe';
import * as moment from 'moment';

describe('DataFrame serialization', () => {

    it('can serialize empty dataframe', ()  => {

        const df = new DataFrame();
        expect(df.serialize()).to.eql({
            columnOrder: [],
            columns: {},
            values: [],
        });
    });

    it('can serialize dataframe with various types', ()  => {
        const df = new DataFrame({ 
            index: [10, 20, 30],
            columnNames: ["A", "B", "C"],
            rows: [
                [100, "a", true],
                [200, "b", false],
                [300, "c", false],
            ]
        });

        expect(df.serialize()).to.eql({
            columnOrder: ["A", "B", "C"],
            columns: {
                A: "number",
                B: "string",
                C: "boolean",
                __index__: "number",
            },
            values: [
                { A: 100, B: "a", C: true,  __index__: 10 },
                { A: 200, B: "b", C: false, __index__: 20 },
                { A: 300, B: "c", C: false, __index__: 30 },
            ]
        });
    });

    it('can serialize dataframe with dates', ()  => {
        const df = new DataFrame({ 
            index: [10],
            columnNames: ["A"],
            rows: [
                [moment("2018/05/15", "YYYY/MM/DD").toDate()],
            ]
        });

        expect(df.serialize()).to.eql({
            columnOrder: ["A"],
            columns: {
                A: "date",
                __index__: "number",
            },
            values: [
                { A: moment("2018/05/15", "YYYY/MM/DD").toISOString(true),  __index__: 10 },
            ]
        });
    });

    it ('can deserialize empty dataframe', () => {

        const df = DataFrame.deserialize({ columnOrder: [], columns: {}, values: [] });
        expect(df.count()).to.eql(0);
    });

    it ('can deserialize empty dataframe 2', () => {

        const df = DataFrame.deserialize({} as ISerializedDataFrame);
        expect(df.count()).to.eql(0);
    });
    
    it ('can deserialize dataframe with various types', () => {

        const df = DataFrame.deserialize({
            columnOrder: ["A", "B", "C"],
            columns: {
                A: "number",
                B: "string",
                C: "boolean",
                __index__: "number",
            },
            values: [
                { A: 100, B: "a", C: true,  __index__: 10 },
                { A: 200, B: "b", C: false, __index__: 20 },
                { A: 300, B: "c", C: false, __index__: 30 },
            ]
        });
        
        expect(df.count()).to.eql(3);
        expect(df.getColumnNames()).to.eql(["A", "B", "C"]);
        expect(df.getIndex().toArray()).to.eql([10, 20, 30]);
        expect(df.toRows()).to.eql([
            [100, "a",  true],
            [200, "b", false],
            [300, "c", false],
        ]);
    });
   
    it ('can deserialize dataframe with dates', () => {

        const df = DataFrame.deserialize({
            columnOrder: ["A"],
            columns: {
                A: "date",
                __index__: "number",
            },
            values: [
                { A: moment("2018/05/15", "YYYY/MM/DD").toISOString(true),  __index__: 10 },
            ]
        });
        
        expect(df.count()).to.eql(1);
        expect(df.getColumnNames()).to.eql(["A"]);
        expect(df.getIndex().toArray()).to.eql([10]);
        expect(df.toRows()).to.eql([
            [moment("2018/05/15", "YYYY/MM/DD").toDate()],
        ]);
    });
});