import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { DataFrame } from '../lib/dataframe';
import { ArrayIterable } from '../lib/iterables/array-iterable';
import { Series } from '../lib/series';

//
// Replicate the following pandas examples:
//
// https://chrisalbon.com/python/data_wrangling/pandas_pivot_tables/
//

describe('DataFrame pivot examples', () => {

    var df: DataFrame<number, any>;

    beforeEach(() => {
        df = new DataFrame({
            columns: {
                'regiment': ['Nighthawks', 'Nighthawks', 'Nighthawks', 'Nighthawks', 'Dragoons', 'Dragoons', 'Dragoons', 'Dragoons', 'Scouts', 'Scouts', 'Scouts', 'Scouts'],
                'company': ['1st', '1st', '2nd', '2nd', '1st', '1st', '2nd', '2nd','1st', '1st', '2nd', '2nd'],
                'TestScore': [4, 24, 31, 2, 3, 4, 24, 31, 2, 3, 2, 3]
            }
        });
    })

	it('Create a pivot table of group means, by company and regiment', () => {

        const pivotted = df.pivot(["regiment", "company"], "TestScore", testScores => testScores.average());
                
        expect(pivotted.getColumnNames()).to.eql(["regiment", "company", "TestScore"]);
		expect(pivotted.toArray()).to.eql([
            {
                regiment: "Dragoons",
                company: "1st",
                TestScore: 3.5,
            },
            {
                regiment: "Dragoons",
                company: "2nd",
                TestScore: 27.5,
            },
            {
                regiment: "Nighthawks",
                company: "1st",
                TestScore: 14.0,
            },
            {
                regiment: "Nighthawks",
                company: "2nd",
                TestScore: 16.5,
            },
            {
                regiment: "Scouts",
                company: "1st",
                TestScore: 2.5,
            },
            {
                regiment: "Scouts",
                company: "2nd",
                TestScore: 2.5,
            },
        ]);
	});

	it('Create a pivot table of group score counts, by company and regiments', () => {

        const pivotted = df.pivot(["regiment", "company"], "TestScore", testScores => testScores.count());
        
        expect(pivotted.getColumnNames()).to.eql(["regiment", "company", "TestScore"]);
		expect(pivotted.toArray()).to.eql([
            {
                regiment: "Dragoons",
                company: "1st",
                TestScore: 2,
            },
            {
                regiment: "Dragoons",
                company: "2nd",
                TestScore: 2,
            },
            {
                regiment: "Nighthawks",
                company: "1st",
                TestScore: 2,
            },
            {
                regiment: "Nighthawks",
                company: "2nd",
                TestScore: 2,
            },
            {
                regiment: "Scouts",
                company: "1st",
                TestScore: 2,
            },
            {
                regiment: "Scouts",
                company: "2nd",
                TestScore: 2,
            },
        ]);
    });

    it('pivot can produce single output values', () => {

        const pivotted = df.pivot(["regiment", "company"], {
            TestScore: testScores => testScores.count(),
        });

        expect(pivotted.getColumnNames()).to.eql(["regiment", "company", "TestScore"]);
		expect(pivotted.toArray()).to.eql([
            {
                regiment: "Dragoons",
                company: "1st",
                TestScore: 2,
            },
            {
                regiment: "Dragoons",
                company: "2nd",
                TestScore: 2,
            },
            {
                regiment: "Nighthawks",
                company: "1st",
                TestScore: 2,
            },
            {
                regiment: "Nighthawks",
                company: "2nd",
                TestScore: 2,
            },
            {
                regiment: "Scouts",
                company: "1st",
                TestScore: 2,
            },
            {
                regiment: "Scouts",
                company: "2nd",
                TestScore: 2,
            },
        ]);
    });

    it('pivot can produce multiple output values', () => {

        const pivotted = df.pivot(["regiment", "company"], {
            TestScore: {
                count: testScores => testScores.count(),
                avg: testScores => testScores.average(),
                min: testScores => testScores.min(),
                max: testScores => testScores.max(),
            }
        });

        expect(pivotted.getColumnNames()).to.eql(["regiment", "company", "count", "avg", "min", "max"]);
		expect(pivotted.toArray()).to.eql([
            {
                regiment: "Dragoons",
                company: "1st",
                avg: 3.5,
                count: 2,
                min: 3,
                max: 4,
            },
            {
                regiment: "Dragoons",
                company: "2nd",
                avg: 27.5,
                count: 2,
                min: 24,
                max: 31,
            },
            {
                regiment: "Nighthawks",
                company: "1st",
                avg: 14.0,
                count: 2,
                min: 4,
                max: 24,
            },
            {
                regiment: "Nighthawks",
                company: "2nd",
                avg: 16.5,
                count: 2,
                min: 2,
                max: 31,
            },
            {
                regiment: "Scouts",
                company: "1st",
                avg: 2.5,
                count: 2,
                min: 2,
                max: 3,
            },
            {
                regiment: "Scouts",
                company: "2nd",
                avg: 2.5,
                count: 2,
                min: 2,
                max: 3,
            },
        ]);
    });

	it('Create a pivot table of group means, by company and regiment - manual pivot', () => {

        const pivotted = df.groupBy(row => row.regiment)
            .selectMany(regimentGroup => 
                regimentGroup.groupBy(row => row.company)
                    .inflate(companyGroup => ({
                        regiment: regimentGroup.first().regiment,
                        company: companyGroup.first().company,
                        TestScore: companyGroup.deflate(row => row.TestScore).average()
                    }))
            )
            .orderBy(row => row.regiment)
            .thenBy(row => row.company)
            .inflate();
                
        expect(pivotted.getColumnNames()).to.eql(["regiment", "company", "TestScore"]);
		expect(pivotted.toArray()).to.eql([
            {
                regiment: "Dragoons",
                company: "1st",
                TestScore: 3.5,
            },
            {
                regiment: "Dragoons",
                company: "2nd",
                TestScore: 27.5,
            },
            {
                regiment: "Nighthawks",
                company: "1st",
                TestScore: 14.0,
            },
            {
                regiment: "Nighthawks",
                company: "2nd",
                TestScore: 16.5,
            },
            {
                regiment: "Scouts",
                company: "1st",
                TestScore: 2.5,
            },
            {
                regiment: "Scouts",
                company: "2nd",
                TestScore: 2.5,
            },
        ])
	});

	it('Create a pivot table of group score counts, by company and regiments - manual pivot', () => {

        const pivotted = df.groupBy(row => row.regiment)
            .selectMany(regimentGroup => 
                regimentGroup.groupBy(row => row.company)
                    .inflate(companyGroup => ({
                        regiment: regimentGroup.first().regiment,
                        company: companyGroup.first().company,
                        TestScore: companyGroup.count()
                    }))
            )
            .orderBy(row => row.regiment)
            .thenBy(row => row.company)
            .inflate();

        expect(pivotted.getColumnNames()).to.eql(["regiment", "company", "TestScore"]);
		expect(pivotted.toArray()).to.eql([
            {
                regiment: "Dragoons",
                company: "1st",
                TestScore: 2,
            },
            {
                regiment: "Dragoons",
                company: "2nd",
                TestScore: 2,
            },
            {
                regiment: "Nighthawks",
                company: "1st",
                TestScore: 2,
            },
            {
                regiment: "Nighthawks",
                company: "2nd",
                TestScore: 2,
            },
            {
                regiment: "Scouts",
                company: "1st",
                TestScore: 2,
            },
            {
                regiment: "Scouts",
                company: "2nd",
                TestScore: 2,
            },
        ])
	});
});	

