import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { Series } from '../lib/series';
import { DataFrame } from '../lib/dataframe';

describe('DataFrame parse', () => {

    it('can parse single columns', () => {

        var df = new DataFrame({
            columnNames: ["V1", "V2"],
            rows: [
                ['1', '2'],
                ['10', '11'],
            ],
        });

        var parsed = df.parseInts("V1");
        expect(parsed.toRows()).to.eql([
            [1, '2'],
            [10, '11'],
        ]);
    });

    it('can parse multiple columns', () => {

        var df = new DataFrame({
            columnNames: ["V1", "V2"],
            rows: [
                ['1', '2'],
                ['10', '11'],
            ],
        });

        var parsed = df.parseInts(["V1", "V2"]);
        expect(parsed.toRows()).to.eql([
            [1, 2],
            [10, 11],
        ]);
    });

    it('can convert single series to strings', () => {

        var df = new DataFrame({
            columnNames: ["V1", "V2"],
            rows: [
                [1, 2],
                [10, 11],
            ],
        });

        var converted = df.toStrings("V1");
        expect(converted.toRows()).to.eql([
            ['1', 2],
            ['10', 11],
        ]);

    });

    it('can convert multiple series to strings', () => {

        var df = new DataFrame({
            columnNames: ["V1", "V2"],
            rows: [
                [1, 2],
                [10, 11],
            ],
        });

        var converted = df.toStrings(["V1", "V2"]);
        expect(converted.toRows()).to.eql([
            ['1', '2'],
            ['10', '11'],
        ]);

    });

    it('can use format spec to convert columns to strings', () => {

        var df = new DataFrame({
            columnNames: ["V1", "V2"],
            rows: [
                [1, 2],
                [10, 11],
            ],
        });

        var converted = df.toStrings({ V1: "0.00", V2: "0.00" });
        expect(converted.toRows()).to.eql([
            ['1', '2'],
            ['10', '11'],
        ]);
    });

    it('when using a format spec to convert columns to strings - unspecified columns are ignored', () => {

        var df = new DataFrame({
            columnNames: ["V1", "V2"],
            rows: [
                [1, 2],
                [10, 11],
            ],
        });

        var converted = df.toStrings({ V2: "0.00" });
        expect(converted.toRows()).to.eql([
            [1, '2'],
            [10, '11'],
        ]);
    });
});