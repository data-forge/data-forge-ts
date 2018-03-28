import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { Series } from '../lib/series';
import { DataFrame } from '../lib/dataframe';

describe('DataFrame concat', () => {

    const concat = DataFrame.concat;

    it('concatenating zero dataframe results in an empty dataframe', function () {

        var df = concat([]);
        expect(df.count()).to.eql(0);           
    });

    it('concatenating two empty dataframe results in an empty data frame', function () {

        var df = concat([ new DataFrame(), new DataFrame() ]);
        expect(df.count()).to.eql(0);           
    });

    it('can concatenate three dataframe', function () {

        var concatenated = concat([
            new DataFrame({ values: [1, 2] }),
            new DataFrame({ values: [3, 4] }),
            new DataFrame({ values: [5, 6] }),
        ]);

        expect(concatenated.toArray()).to.eql([
            1,
            2,
            3,
            4,
            5,
            6,
        ]);
    });

    it('can concatenate empty dataframe with non empty dataframe', function () {

        var concatenated = concat([
            new DataFrame(),
            new DataFrame({ values: [3, 4] }),
        ]);

        expect(concatenated.toArray()).to.eql([
            3,
            4,
        ]);
    });

    it('can concatenate non-empty dataframe with empty dataframe', function () {

        var concatenated = concat([
            new DataFrame({ values: [1, 2] }),
            new DataFrame(),
        ]);

        expect(concatenated.toArray()).to.eql([
            1,
            2,
        ]);
    });

    it('can concatenate to a dataframe with multiple parameters', function () {

        var df = new DataFrame({ values: [1, 2] });
        var concatenated = df
            .concat(
                new DataFrame({ values: [3, 4] }),
                new DataFrame({ values: [5, 6] })
            );

        expect(concatenated.toArray()).to.eql([
            1,
            2,
            3,
            4,
            5,
            6,
        ]);
    });

    it('can concatenate to a dataframe with array', function () {

        var df = new DataFrame({ values: [1, 2] });
        var concatenated = df
            .concat([
                new DataFrame({ values: [3, 4] }),
                new DataFrame({ values: [5, 6] })
            ]);

        expect(concatenated.toArray()).to.eql([
            1,
            2,
            3,
            4,
            5,
            6,
        ]);
    });

    it('can concatenate to a dataframe with array and extra parameter', function () {

        var df = new DataFrame({ values: [1, 2] });
        var concatenated = df
            .concat(
                [new DataFrame({ values: [3, 4] })],
                new DataFrame({ values: [5, 6] })
            );

        expect(concatenated.toArray()).to.eql([
            1,
            2,
            3,
            4,
            5,
            6,
        ]);
    });

    it('can concatenate to a dataframe with parameter and array', function () {

        var df = new DataFrame({ values: [1, 2] });
        var concatenated = df
            .concat(
                new DataFrame({ values: [3, 4] }),
                [new DataFrame({ values: [5, 6] })]
            );

        expect(concatenated.toArray()).to.eql([
            1,
            2,
            3,
            4,
            5,
            6,
        ]);
    });

});