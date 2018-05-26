import { assert, expect } from 'chai';
import 'mocha';
import { DataFrame, Index } from '../index';
import { ArrayIterable } from '../lib/iterables/array-iterable';

describe('DataFrame group', () => {
    
	it('can group by value', function () {
		var df = new DataFrame({
			index:  [0, 1, 2, 3, 4, 5, 6],
			values: [1, 2, 2, 3, 2, 3, 5],
		});

        var grouped = df.groupBy((value, index) => value);
		expect(grouped.count()).to.eql(4);

		var group1 = grouped.skip(0).first();
		expect(group1.toPairs()).to.eql([
			[0, 1],
		]);

		var group2 = grouped.skip(1).first();
		expect(group2.toPairs()).to.eql([
			[1, 2],
			[2, 2],
			[4, 2],
		]);

		var group3 = grouped.skip(2).first();
		expect(group3.toPairs()).to.eql([
			[3, 3],
			[5, 3],
		]);

		var group4 = grouped.skip(3).first();
		expect(group4.toPairs()).to.eql([
			[6, 5],
		]);
    });
    
	it('can group by single column', function () {
		var df = new DataFrame([
            {
                id: 0,
                A: 1,
            },
            {
                id: 10,
                A: 2,
            },
            {
                id: 20,
                A: 3,
            },
            {
                id: 30,
                A: 2,
            },
            {
                id: 40,
                A: 2,
            },
            {
                id: 50,
                A: 1,
            },            
        ]);

        var grouped = df.groupBy(row => row.A);
		expect(grouped.count()).to.eql(3);

		var group1 = grouped.skip(0).first();
		expect(group1.toArray()).to.eql([
            { id: 0, A: 1 },
            { id: 50, A: 1 },
		]);

		var group2 = grouped.skip(1).first();
		expect(group2.toArray()).to.eql([
            { id: 10, A: 2 },
            { id: 30, A: 2 },
            { id: 40, A: 2 },
		]);

		var group3 = grouped.skip(2).first();
		expect(group3.toArray()).to.eql([
            { id: 20, A: 3 },
		]);
    });

	it('can group by multiple column', function () {
		var df = new DataFrame([
            {
                id: 0,
                A: 1,
                B: 100,
            },
            {
                id: 10,
                A: 2,
                B: 200,
            },
            {
                id: 20,
                A: 3,
                B: 300,
            },
            {
                id: 30,
                A: 2,
                B: 200,
            },
            {
                id: 40,
                A: 2,
                B: 400,
            },
            {
                id: 50,
                A: 1,
                B: 100,
            },
        ]);

        var grouped = df.groupBy(row => [row.A, row.B]);
		expect(grouped.count()).to.eql(4);

		var group1 = grouped.skip(0).first();
		expect(group1.toArray()).to.eql([
            { id: 0, A: 1, B: 100 },
            { id: 50, A: 1, B: 100 },
		]);

		var group2 = grouped.skip(1).first();
		expect(group2.toArray()).to.eql([
            { id: 10, A: 2, B: 200 },
            { id: 30, A: 2, B: 200 },
		]);

		var group3 = grouped.skip(2).first();
		expect(group3.toArray()).to.eql([
            { id: 20, A: 3, B: 300 },
        ]);

		var group4 = grouped.skip(3).first();
		expect(group4.toArray()).to.eql([
            { id: 40, A: 2, B: 400 },
        ]);
    });
    
	it('can group sequential duplicates and take first index', function () {
		var df = new DataFrame({ 
			index:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			values: [1, 1, 2, 3, 3, 3, 5, 6, 6, 7],
		});

		var collapsed = df.groupSequentialBy()
			.select(window => [window.getIndex().first(), window.first()])
            .withIndex(pair => pair[0])
            .inflate(pair => pair[1]);

		expect(collapsed.toPairs()).to.eql([
			[0, 1],
			[2, 2],
			[3, 3],
			[6, 5],
			[7, 6],
			[9, 7],
		]);
	});

	it('can group sequential duplicates and take last index', function () {
		var df = new DataFrame({ 
			index:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			values: [1, 1, 2, 3, 3, 3, 5, 6, 6, 7],
		});

		var collapsed = df.groupSequentialBy()
            .select(window => [window.getIndex().last(), window.last()])
            .withIndex(pair => pair[0])
            .inflate(pair => pair[1]);

		expect(collapsed.toPairs()).to.eql([
			[1, 1],
			[2, 2],
			[5, 3],
			[6, 5],
			[8, 6],
			[9, 7],
		]);
	});

	it('can group sequential with custom selector', function () {

		var df = new DataFrame({ 
			index:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			values: [{ A: 1 }, { A: 1 }, { A: 2 }, { A: 3 }, { A: 3 }, { A: 3 }, { A: 5 }, { A: 6 }, { A: 6 }, { A: 7 }],
		});

		var collapsed = df.groupSequentialBy(value => value.A)
			.select(window => [window.getIndex().last(), window.last().A])
            .withIndex(pair => pair[0])
            .inflate(pair => pair[1]);

		expect(collapsed.toPairs()).to.eql([
			[1, 1],
			[2, 2],
			[5, 3],
			[6, 5],
			[8, 6],
			[9, 7],
		]);
	});    
});