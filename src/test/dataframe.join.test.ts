import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { Series } from '../lib/series';
import { DataFrame } from '../lib/dataframe';

describe('DataFrame join', () => {

	it('can get union of 2 dataframes with unique values', () => {
		var df1 = new DataFrame({ values: [5, 6] })
		var df2 = new DataFrame({ values: [7, 8] })
		var result = df1.union(df2);

		expect(result.toArray()).to.eql([5, 6, 7, 8]);
	});

	it('can get union of 2 dataframes with overlapping values', () => {
		var df1 = new DataFrame({ values: [5, 6] })
		var df2 = new DataFrame({ values: [6, 7] })
		var result = df1.union(df2);

		expect(result.toArray()).to.eql([5, 6, 7]);
	});

	it('union can work with selector', () => {
		var df1 = new DataFrame({ values: [{ X: 5 }, { X: 6 }] })
		var df2 = new DataFrame({ values: [{ X: 6 }, { X: 7 }] })
		var result = df1.union(df2, row=> row.X);

		expect(result.toArray()).to.eql([ { X: 5 }, { X: 6 }, { X: 7 }]);
	});

	it('can get intersection of 2 dataframes with overlapping values', () => {
		var df1 = new DataFrame({ values: [5, 6] })
		var df2 = new DataFrame({ values: [6, 7] })
		var result = df1.intersection(df2);
		expect(result.toArray()).to.eql([6]);
	});

	it('intersection result is empty for 2 dataframes that have no overlapping values', () => {
		var df1 = new DataFrame({ values: [5, 6] })
		var df2 = new DataFrame({ values: [7, 8] })
		var result = df1.intersection(df2);
		expect(result.toArray()).to.eql([]);
	});

	it('intersection can work with selector', () => {
		var df1 = new DataFrame({ values: [{ X: 5 }, { X: 6 }] })
		var df2 = new DataFrame({ values: [{ X: 6 }, { X: 7 }] })
		var result = df1.intersection(df2, left => left.X, right => right.X);
		expect(result.toArray()).to.eql([ { X: 6 }, ]);
	});

	it('can get exception of 2 dataframes with overlapping values', () => {
		var df1 = new DataFrame({ values: [5, 6] })
		var df2 = new DataFrame({ values: [6, 7] })
		var result = df1.except(df2);
		expect(result.toArray()).to.eql([5]);
	});

	it('exception result is empty for 2 dataframes that have fully overlapping values', () => {
		var df1 = new DataFrame({ values: [5, 6] })
		var df2 = new DataFrame({ values: [5, 6] })
		var result = df1.except(df2);
		expect(result.toArray()).to.eql([]);
	});

	it('except can work with selector', () => {
		var df1 = new DataFrame({ values: [{ X: 5 }, { X: 6 }] })
		var df2 = new DataFrame({ values: [{ X: 6 }, { X: 7 }] })
		var result = df1.except(df2, left => left.X, right => right.X);
		expect(result.toArray()).to.eql([ { X: 5 }, ]);
	});    
   
    it('can merge on column', () => {
        var left = new DataFrame([
            {
                mergeKey: 'foo',
                leftVal: 1,
            },
            {
                mergeKey: 'foo',
                leftVal: 2,
            },
        ]);

        var right = new DataFrame([
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
        var people = new DataFrame([ ryan, jer ]);

        var camp = { Name: "Camp", Owner: "Ryan" };
        var brody = { Name: "Brody", Owner: "Ryan", };
        var homeless = { Name: "Homeless" };
        var dogs = new DataFrame([ camp, brody, homeless ]);

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

});