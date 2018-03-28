import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { Series } from '../lib/series';
import { DataFrame } from '../lib/dataframe';

describe('DataFrame concat', () => {

    it('concatenating zero dataframe results in an empty dataframe', () => {

        var df = DataFrame.concat([]);
        expect(df.count()).to.eql(0);           
    });

    it('concatenating two empty dataframe results in an empty data frame', () => {

        var df = DataFrame.concat([ new DataFrame(), new DataFrame() ]);
        expect(df.count()).to.eql(0);           
    });

    it('can concatenate three dataframe', () => {

        var concatenated = DataFrame.concat([
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

    it('can concatenate empty dataframe with non empty dataframe', () => {

        var concatenated = DataFrame.concat([
            new DataFrame(),
            new DataFrame({ values: [3, 4] }),
        ]);

        expect(concatenated.toArray()).to.eql([
            3,
            4,
        ]);
    });

    it('can concatenate non-empty dataframe with empty dataframe', () => {

        var concatenated = DataFrame.concat([
            new DataFrame({ values: [1, 2] }),
            new DataFrame(),
        ]);

        expect(concatenated.toArray()).to.eql([
            1,
            2,
        ]);
    });

    it('can concatenate to a dataframe with multiple parameters', () => {

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

    it('can concatenate to a dataframe with array', () => {

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

    it('can concatenate to a dataframe with array and extra parameter', () => {

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

    it('can concatenate to a dataframe with parameter and array', () => {

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

   it('concat can handle uneven columns', () => {

        var df1 = new DataFrame({ columnNames: ["1", "2"], rows: [[1, 2], [3, 4]] });
        var df2 = new DataFrame({ columnNames: ["2", "3"], rows: [[6, 5], [8, 7]] });

        var result = DataFrame.concat([df1, df2]);

        expect(result.getColumnNames()).to.eql(["1", "2", "3"]);
        expect(result.getIndex().toArray()).to.eql([0, 1, 0, 1]);
        expect(result.toRows()).to.eql([
            [1, 2, undefined],
            [3, 4, undefined],
            [undefined, 6, 5],
            [undefined, 8, 7],
        ]);
   });

   it('can concatenate dataframes with irregular columns', () => {

        var concatenated = DataFrame.concat([
            new DataFrame({ columnNames: ["C1"], rows: [[1], [2]] }),
            new DataFrame({ columnNames: ["C2"], rows: [[3], [4]] }),
            new DataFrame({ columnNames: ["C3"], rows: [[5], [6]] }),
        ]);

        expect(concatenated.getColumnNames()).to.eql(["C1", "C2", "C3"]);
        expect(concatenated.toRows()).to.eql([
            [1, undefined, undefined],
            [2, undefined, undefined],
            [undefined, 3, undefined],
            [undefined, 4, undefined],
            [undefined, undefined, 5],
            [undefined, undefined, 6],
        ]);
    });
});