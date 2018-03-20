import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { Series } from '../lib/series';
import { DataFrame } from '../lib/dataframe';

describe('Series join', () => {

	it('can get union of 2 series with unique values', () => {

		var series1 = new Series({ values: [5, 6] })
		var series2 = new Series({ values: [7, 8] })
		var result = series1.union(series2);

		expect(result.toArray()).to.eql([5, 6, 7, 8]);
	});

	it('can get union of 2 series with overlapping values', () => {

		var series1 = new Series({ values: [5, 6] })
		var series2 = new Series({ values: [6, 7] })
		var result = series1.union(series2);

		expect(result.toArray()).to.eql([5, 6, 7]);
	});

	it('union can work with selector', () => {

		var series1 = new Series({ values: [{ X: 5 }, { X: 6 }] })
		var series2 = new Series({ values: [{ X: 6 }, { X: 7 }] })
		var result = series1.union(series2, row=> row.X);

		expect(result.toArray()).to.eql([ { X: 5 }, { X: 6 }, { X: 7 }]);
	});

	it('can get intersection of 2 series with overlapping values', () => {
		
		var series1 = new Series({ values: [5, 6] })
		var series2 = new Series({ values: [6, 7] })
		var result = series1.intersection(series2);
		expect(result.toArray()).to.eql([6]);
	});

	it('intersection result is empty for 2 series that have no overlapping values', () => {

		var series1 = new Series({ values: [5, 6] })
		var series2 = new Series({ values: [7, 8] })
		var result = series1.intersection(series2);
		expect(result.toArray()).to.eql([]);
	});

	it('intersection can work with selector', () => {

		var series1 = new Series({ values: [{ X: 5 }, { X: 6 }] })
		var series2 = new Series({ values: [{ X: 6 }, { X: 7 }] })
		var result = series1.intersection(series2, left => left.X, right => right.X);
		expect(result.toArray()).to.eql([ { X: 6 }, ]);
	});

	it('can get exception of 2 series with overlapping values', () => {
		
		var series1 = new Series({ values: [5, 6] })
		var series2 = new Series({ values: [6, 7] })
		var result = series1.except(series2);
		expect(result.toArray()).to.eql([5]);
	});

	it('exception result is empty for 2 series that have fully overlapping values', () => {

		var series1 = new Series({ values: [5, 6] })
		var series2 = new Series({ values: [5, 6] })
		var result = series1.except(series2);
		expect(result.toArray()).to.eql([]);
	});

	it('except can work with selector', () => {

		var series1 = new Series({ values: [{ X: 5 }, { X: 6 }] })
		var series2 = new Series({ values: [{ X: 6 }, { X: 7 }] })
		var result = series1.except(series2, left => left.X, right => right.X);
		expect(result.toArray()).to.eql([ { X: 5 }, ]);
	});    
   
    it('can merge on column', () => {

        var left = new Series([
            {
                mergeKey: 'foo',
                leftVal: 1,
            },
            {
                mergeKey: 'foo',
                leftVal: 2,
            },
        ]);

        var right = new Series([
            {
                mergeKey: 'foo',
                rightVal: 4,
                otherRightVal: 100,
            },
            {
                mergeKey: 'foo',
                rightVal: 5,
                otherRightVal: 200,
            },
        ]);

        var merged = left.join(
                right,
                leftRow => leftRow.mergeKey,
                rightRow => rightRow.mergeKey,
                (leftRow, rightRow) => {
                    return {
                        mergeKey: leftRow.mergeKey,
                        leftVal: leftRow.leftVal,
                        rightVal: rightRow.rightVal,
                        otherRightVal: rightRow.otherRightVal,
                    };
                }
            );

        expect(merged.toArray()).to.eql([
            {
                mergeKey: "foo",
                leftVal: 1,
                rightVal: 4,
                otherRightVal: 100,
            },
            {
                mergeKey: "foo",
                leftVal: 1,
                rightVal: 5,
                otherRightVal: 200,
            },
            {
                mergeKey: "foo",
                leftVal: 2,
                rightVal: 4,
                otherRightVal: 100,
            },
            {
                mergeKey: "foo",
                leftVal: 2,
                rightVal: 5,
                otherRightVal: 200,
            },
        ]);
    });

    // http://blogs.geniuscode.net/RyanDHatch/?p=116
    it('outer join', () => {

        var ryan = { Name: "Ryan" };
        var jer = { Name: "Jer" };
        var people = new Series([ ryan, jer ]);

        var camp = { Name: "Camp", Owner: "Ryan" };
        var brody = { Name: "Brody", Owner: "Ryan", };
        var homeless = { Name: "Homeless" };
        var dogs = new Series([ camp, brody, homeless ]);

        var join = people.joinOuter(
                dogs,
                person => person.Name,
                dog => dog.Owner,
                (person, dog) => {
                    var output: any = {};
                    if (person) {
                        output.Person = person.Name;
                    }
                    if (dog) {
                        output.Dog = dog.Name;
                    }
                    return output;
                }
            )
            ;

        expect(join.toArray()).to.eql([
            { 
                Person: "Jer", 
            },
            {
                Person: "Ryan", 
                Dog: "Camp",
            },
            {
                Person: "Ryan", 
                Dog: "Brody",
            },
            {
                Dog: "Homeless",
            },
        ]);
    });

    /*TODO:


//
// These tests based on these examples:
//
//  http://chrisalbon.com/python/pandas_join_merge_dataframe.html
//
describe('pandas-examples', () => {

    var df_a;
    var df_b;
    var df_n;

    beforeEach(() => {
        df_a = new DataFrame({
            columnNames: [
                'subject_id',
                'first_name',
                'last_name',
            ],
            values: [
                [1, 'Alex', 'Anderson'],
                [2, 'Amy', 'Ackerman'],
                [3, 'Allen', 'Ali'],
                [4, 'Alice', 'Aoni'],
                [5, 'Ayoung', 'Aitches'],
            ],
        });

        df_b = new DataFrame({
            columnNames: [
                'subject_id',
                'first_name',
                'last_name',
            ],
            values: [
                [4, 'Billy', 'Bonder'],
                [5, 'Brian', 'Black'],
                [6, 'Bran', 'Balwner'],
                [7, 'Bryce', 'Brice'],
                [8, 'Betty', 'Btisan'],
            ],
        });

        df_n = new DataFrame({
            columnNames: [
                "subject_id",
                "test_id",
            ],
            values: [
                [1, 51],
                [2, 15],
                [3, 15],
                [4, 61],
                [5, 16],
                [7, 14],
                [8, 15],
                [9, 1],
                [10, 61],
                [11, 16],
            ],
        });
    });

    it('Join the two dataframes along rows', () => {

        var df_new = concatDataFrames([df_a, df_b]);

        expect(df_new.getIndex().toArray()).to.eql([
            0, 1, 2, 3, 4,
            0, 1, 2, 3, 4,
        ]);

        expect(df_new.toRows()).to.eql([
            [1, 'Alex', 'Anderson'],
            [2, 'Amy', 'Ackerman'],
            [3, 'Allen', 'Ali'],
            [4, 'Alice', 'Aoni'],
            [5, 'Ayoung', 'Aitches'],
            [4, 'Billy', 'Bonder'],
            [5, 'Brian', 'Black'],
            [6, 'Bran', 'Balwner'],
            [7, 'Bryce', 'Brice'],
            [8, 'Betty', 'Btisan'],
        ]);

    });

    it('Join the two dataframes along columns', () => {

        var df_new = concatDataFrames([df_a, df_b], { axis: 1 });

        expect(df_new.getIndex().take(5).toArray()).to.eql([
            0, 1, 2, 3, 4,
        ]);

        expect(df_new.getColumnNames()).to.eql([
            'subject_id.1',
            'first_name.1',
            'last_name.1',
            'subject_id.2',
            'first_name.2',
            'last_name.2',
        ]);

        expect(df_new.toRows()).to.eql([
            [1, 'Alex', 'Anderson', 4, 'Billy', 'Bonder'],
            [2, 'Amy', 'Ackerman', 5, 'Brian', 'Black'],
            [3, 'Allen', 'Ali', 6, 'Bran', 'Balwner'],
            [4, 'Alice', 'Aoni', 7, 'Bryce', 'Brice'],
            [5, 'Ayoung', 'Aitches', 8, 'Betty', 'Btisan'],          
        ]);
    });

    it('Merge two dataframes along the subject_id value', () => {

        var df_new = concatDataFrames([df_a, df_b]);
        var df_merged = df_new
            .join(
                df_n,
                function (rowA) {
                    return rowA.subject_id;
                },
                function (rowB) {
                    return rowB.subject_id;
                },
                function (rowA, rowB) {
                    return {
                        subject_id: rowA.subject_id,
                        first_name: rowA.first_name,
                        last_name: rowA.last_name,
                        test_id: rowB.test_id,
                    };
                }
            )
            ;

        expect(df_merged.getIndex().take(9).toArray()).to.eql([
            0, 1, 2, 3, 4, 5, 6, 7, 8,
        ]);

        expect(df_merged.getColumnNames()).to.eql([
            'subject_id',
            'first_name',
            'last_name',
            "test_id",
        ]);

        expect(df_merged.toRows()).to.eql([
            [1, 'Alex', 'Anderson', 51],
            [2, 'Amy', 'Ackerman', 15],
            [3, 'Allen', 'Ali', 15],
            [4, 'Alice', 'Aoni', 61],
            [5, 'Ayoung', 'Aitches', 16],
            [4, 'Billy', 'Bonder', 61], // Note this is slighly different to the ordering from Pandas.
            [5, 'Brian', 'Black', 16],
            [7, 'Bryce', 'Brice', 14],
            [8, 'Betty', 'Btisan', 15],
        ]);
    });

    it('Merge two dataframes along the subject_id value', () => {

        var df_new = concatDataFrames([df_a, df_b]);
        var df_merged = df_new.join(
                df_n,
                left => left.subject_id,
                right => right.subject_id,
                (left, right) => {
                    return {
                        subject_id: left.subject_id,
                        first_name: left.first_name,
                        last_name: left.last_name,
                        test_id: right.test_id,
                    };
                }
            )
            ;

        expect(df_merged.getIndex().take(9).toArray()).to.eql([
            0, 1, 2, 3, 4, 5, 6, 7, 8,
        ]);

        expect(df_merged.getColumnNames()).to.eql([
            'subject_id',
            'first_name',
            'last_name',
            "test_id",
        ]);

        expect(df_merged.toRows()).to.eql([
            [1, 'Alex', 'Anderson', 51],
            [2, 'Amy', 'Ackerman', 15],
            [3, 'Allen', 'Ali', 15],
            [4, 'Alice', 'Aoni', 61],
            [5, 'Ayoung', 'Aitches', 16],
            [4, 'Billy', 'Bonder', 61],  // Note this is slighly different to the ordering from Pandas.
            [5, 'Brian', 'Black', 16],
            [7, 'Bryce', 'Brice', 14],
            [8, 'Betty', 'Btisan', 15],
        ]);

    });

    // Exactly the same as the previous example.
    it('Merge two dataframes with both the left and right dataframes using the subject_id key', () => {

        var df_new = concatDataFrames([df_a, df_b]);
        var df_merged = df_new.join(
                df_n,
                left => left.subject_id,
                right => right.subject_id,
                (left, right) => {
                    return {
                        subject_id: left.subject_id,
                        first_name: left.first_name,
                        last_name: left.last_name,
                        test_id: right.test_id,
                    };
                }
            )
            ;

        expect(df_merged.getIndex().take(9).toArray()).to.eql([
            0, 1, 2, 3, 4, 5, 6, 7, 8,
        ]);

        expect(df_merged.getColumnNames()).to.eql([
            'subject_id',
            'first_name',
            'last_name',
            "test_id",
        ]);

        expect(df_merged.toRows()).to.eql([
            [1, 'Alex', 'Anderson', 51],
            [2, 'Amy', 'Ackerman', 15],
            [3, 'Allen', 'Ali', 15],
            [4, 'Alice', 'Aoni', 61],
            [5, 'Ayoung', 'Aitches', 16],
            [4, 'Billy', 'Bonder', 61],   // Note this is slighly different to the ordering from Pandas.
            [5, 'Brian', 'Black', 16],
            [7, 'Bryce', 'Brice', 14],
            [8, 'Betty', 'Btisan', 15],
        ]);
    });

    it('Merge with outer join', () => {

        var df_merged = df_a.joinOuter(
                df_b,
                left => left.subject_id,
                right => right.subject_id,
                (left, right) => {
                    var output = {};
                    if (left) {
                        output.subject_id = left.subject_id;
                        output.first_name_x = left.first_name;
                        output.last_name_x = left.last_name;                            
                    }
                    if (right) {
                        output.subject_id = right.subject_id;
                        output.first_name_y = right.first_name;
                        output.last_name_y = right.last_name;                            
                    }
                    return output;
                }
            )
            ;

        expect(df_merged.getIndex().take(8).toArray()).to.eql([
            0, 1, 2, 3, 4, 5, 6, 7
        ]);

        expect(df_merged.getColumnNames()).to.eql([
            'subject_id',
            'first_name_x',
            'last_name_x',
            'first_name_y',
            'last_name_y',
        ]);

        expect(df_merged.toRows()).to.eql([
            [1, 'Alex', 'Anderson', undefined, undefined],
            [2, 'Amy', 'Ackerman', undefined, undefined],
            [3, 'Allen', 'Ali', undefined, undefined],
            [4, 'Alice', 'Aoni', 'Billy', 'Bonder'],
            [5, 'Ayoung', 'Aitches', 'Brian', 'Black'],
            [6, undefined, undefined, 'Bran', 'Balwner'],
            [7, undefined, undefined, 'Bryce', 'Brice'],
            [8, undefined, undefined, 'Betty', 'Btisan'],
        ]);
    });

    it('Merge with inner join', () => {

        var df_merged = df_a.join(
                df_b,
                left => left.subject_id,
                right => right.subject_id,
                (left, right) => {
                    return {
                        subject_id: left.subject_id,
                        first_name_x: left.first_name,
                        last_name_x: left.last_name,
                        first_name_y: right.first_name,
                        last_name_y: right.last_name,
                    };
                }
            )
            ;

        expect(df_merged.getIndex().take(2).toArray()).to.eql([
            0, 1,
        ]);

        expect(df_merged.getColumnNames()).to.eql([
            'subject_id',
            'first_name_x',
            'last_name_x',
            'first_name_y',
            'last_name_y',
        ]);

        expect(df_merged.toRows()).to.eql([
            [4, 'Alice', 'Aoni', 'Billy', 'Bonder'],
            [5, 'Ayoung', 'Aitches', 'Brian', 'Black'],
        ]);
    });

    it('Merge with right join', () => {

        var df_merged = df_a.joinOuterRight(
                df_b,
                left => left.subject_id,
                right => right.subject_id,
                (left, right) => {
                    var output = {};
                    if (left) {
                        output.subject_id = left.subject_id;
                        output.first_name_x = left.first_name;
                        output.last_name_x = left.last_name;                            
                    }
                    if (right) {
                        output.subject_id = right.subject_id;
                        output.first_name_y = right.first_name;
                        output.last_name_y = right.last_name;                            
                    }
                    return output;
                }
            )
            ;

        expect(df_merged.getIndex().take(5).toArray()).to.eql([
            0, 1, 2, 3, 4,
        ]);

        expect(df_merged.getColumnNames()).to.eql([
            'subject_id',
            'first_name_x',
            'last_name_x',
            'first_name_y',
            'last_name_y',
        ]);

        expect(df_merged.toRows()).to.eql([
            [4, 'Alice', 'Aoni', 'Billy', 'Bonder'],
            [5, 'Ayoung', 'Aitches', 'Brian', 'Black'],
            [6, undefined, undefined, 'Bran', 'Balwner'],
            [7, undefined, undefined, 'Bryce', 'Brice'],
            [8, undefined, undefined, 'Betty', 'Btisan'],
        ]);
    });

    it('Merge with left join', () => {

        var df_merged = df_a.joinOuterLeft(
                df_b,
                left => left.subject_id,
                right => right.subject_id,
                (left, right) => {
                    var output = {};
                    if (left) {
                        output.subject_id = left.subject_id;
                        output.first_name_x = left.first_name;
                        output.last_name_x = left.last_name;                            
                    }
                    if (right) {
                        output.subject_id = right.subject_id;
                        output.first_name_y = right.first_name;
                        output.last_name_y = right.last_name;                            
                    }
                    return output;
                }
            )
            ;

        expect(df_merged.getIndex().take(5).toArray()).to.eql([
            0, 1, 2, 3, 4,
        ]);

        expect(df_merged.getColumnNames()).to.eql([
            'subject_id',
            'first_name_x',
            'last_name_x',
            'first_name_y',
            'last_name_y',
        ]);

        expect(df_merged.toRows()).to.eql([
            [1, 'Alex', 'Anderson', undefined, undefined],
            [2, 'Amy', 'Ackerman', undefined, undefined],
            [3, 'Allen', 'Ali', undefined, undefined],
            [4, 'Alice', 'Aoni', 'Billy', 'Bonder'],
            [5, 'Ayoung', 'Aitches', 'Brian', 'Black'],
        ]);
    });
    
    it('Merge while adding a suffix to duplicate column names', () => {

        var df_merged = df_a.joinOuterLeft(
                df_b,
                left => left.subject_id,
                right => right.subject_id,
                (left, right) => {
                    var output = {};
                    if (left) {
                        output.subject_id = left.subject_id;
                        output.first_name_left = left.first_name;
                        output.last_name_left = left.last_name;                            
                    }
                    if (right) {
                        output.subject_id = right.subject_id;
                        output.first_name_right = right.first_name;
                        output.last_name_right = right.last_name;                            
                    }
                    return output;
                }
            )
            ;

        expect(df_merged.getIndex().take(5).toArray()).to.eql([
            0, 1, 2, 3, 4,
        ]);

        expect(df_merged.getColumnNames()).to.eql([
            'subject_id',
            'first_name_left',
            'last_name_left',
            'first_name_right',
            'last_name_right',
        ]);

        expect(df_merged.toRows()).to.eql([
            [1, 'Alex', 'Anderson', undefined, undefined],
            [2, 'Amy', 'Ackerman', undefined, undefined],
            [3, 'Allen', 'Ali', undefined, undefined],
            [4, 'Alice', 'Aoni', 'Billy', 'Bonder'],
            [5, 'Ayoung', 'Aitches', 'Brian', 'Black'],
        ]);
    });

    it('Merge based on indexes', () => {

           var df_merged = df_a.join(
                df_b,
                (left, index) => index,
                (right, index) => index,
                (left, right) => {
                    return {
                        subject_id_x: left.subject_id,
                        first_name_x: left.first_name,
                        last_name_x: left.last_name,
                        subject_id_y: right.subject_id,
                        first_name_y: right.first_name,
                        last_name_y: right.last_name,
                    };
                }
            )
            ;

        expect(df_merged.getIndex().take(5).toArray()).to.eql([
            0, 1, 2, 3, 4,
        ]);

        expect(df_merged.getColumnNames()).to.eql([
            'subject_id_x',
            'first_name_x',
            'last_name_x',
            'subject_id_y',
            'first_name_y',
            'last_name_y',
        ]);

        expect(df_merged.toRows()).to.eql([
            [1, 'Alex', 'Anderson', 4, 'Billy', 'Bonder'],
            [2, 'Amy', 'Ackerman', 5, 'Brian', 'Black'],
            [3, 'Allen', 'Ali', 6, 'Bran', 'Balwner'],
            [4, 'Alice', 'Aoni', 7, 'Bryce', 'Brice'],
            [5, 'Ayoung', 'Aitches', 8, 'Betty', 'Btisan'],
        ]);
    });
    */

});