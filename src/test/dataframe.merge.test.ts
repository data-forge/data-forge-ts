import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { DataFrame } from '../lib/dataframe';
import { ArrayIterable } from '../lib/iterables/array-iterable';
import { Series } from '../lib/series';
// @ts-ignore
import moment from "dayjs";

describe('DataFrame merge', () => {

    it('can merge single dataframe - instance', () => {
		var dataFrame = new DataFrame({
            columnNames: ["A"],
            rows: [[1], [2], [3]],
        });

        const merged = dataFrame.merge();
        expect(merged.getColumnNames()).to.eql(["A"]);
        expect(merged.getIndex().head(3).toArray()).to.eql([0, 1, 2])
        expect(merged.toRows()).to.eql([
            [1],
            [2],
            [3],
        ]);
    });
    
    it('can merge single dataframe - static', () => {
		var dataFrame = new DataFrame({
            columnNames: ["A"],
            rows: [[1], [2], [3]],
        });

        const merged = DataFrame.merge([dataFrame]);
        expect(merged.getColumnNames()).to.eql(["A"]);
        expect(merged.getIndex().head(3).toArray()).to.eql([0, 1, 2])
        expect(merged.toRows()).to.eql([
            [1],
            [2],
            [3],
        ]);
    });

    it('can merge two dataframes - instance version', () => {
		var dataFrame1 = new DataFrame({
            columnNames: ["A"],
            rows: [[1], [2], [3]],
        });
		var dataFrame2 = new DataFrame({
            columnNames: ["B"],
            rows: [[4], [5], [6]],
        });

        const merged = dataFrame1.merge(dataFrame2);
        expect(merged.getColumnNames()).to.eql(["A", "B"]);
        expect(merged.getIndex().head(3).toArray()).to.eql([0, 1, 2])
        expect(merged.toRows()).to.eql([
            [1, 4],
            [2, 5],
            [3, 6],
        ]);
    });

    it('can merge three dataframes - instance version', () => {
		var dataFrame1 = new DataFrame({
            columnNames: ["A"],
            rows: [[1], [2], [3]],
        });
		var dataFrame2 = new DataFrame({
            columnNames: ["B"],
            rows: [[4], [5], [6]],
        });
		var dataFrame3 = new DataFrame({
            columnNames: ["C"],
            rows: [[7], [8], [9]],
        });

        const merged = dataFrame1.merge(dataFrame2, dataFrame3);
        expect(merged.getColumnNames()).to.eql(["A", "B", "C"]);
        expect(merged.getIndex().head(3).toArray()).to.eql([0, 1, 2])
        expect(merged.toRows()).to.eql([
            [1, 4, 7],
            [2, 5, 8],
            [3, 6, 9],
        ]);
    });
    
    it('can merge two dataframes - static version', () => {
		var dataFrame1 = new DataFrame({
            columnNames: ["A"],
            rows: [[1], [2], [3]],
        });
		var dataFrame2 = new DataFrame({
            columnNames: ["B"],
            rows: [[4], [5], [6]],
        });

        const merged = DataFrame.merge([dataFrame1, dataFrame2]);
        expect(merged.getColumnNames()).to.eql(["A", "B"]);
        expect(merged.getIndex().head(3).toArray()).to.eql([0, 1, 2])
        expect(merged.toRows()).to.eql([
            [1, 4],
            [2, 5],
            [3, 6],
        ]);
    });
    
    it('can merge three dataframes - static version', () => {
		var dataFrame1 = new DataFrame({
            columnNames: ["A"],
            rows: [[1], [2], [3]],
        });
		var dataFrame2 = new DataFrame({
            columnNames: ["B"],
            rows: [[4], [5], [6]],
        });
		var dataFrame3 = new DataFrame({
            columnNames: ["C"],
            rows: [[7], [8], [9]],
        });

        const merged = DataFrame.merge([dataFrame1, dataFrame2, dataFrame3]);
        expect(merged.getColumnNames()).to.eql(["A", "B", "C"]);
        expect(merged.getIndex().head(3).toArray()).to.eql([0, 1, 2])
        expect(merged.toRows()).to.eql([
            [1, 4, 7],
            [2, 5, 8],
            [3, 6, 9],
        ]);
    });

    it('can merge misaligned dataframes 1', () => {
		var dataFrame1 = new DataFrame({
            columnNames: ["A"],
            index: [0, 1, 2],
            rows: [[1], [2], [3]],
        });
		var dataFrame2 = new DataFrame({
            columnNames: ["B"],
            index: [1, 2, 3],
            rows: [[4], [5], [6]],
        });

        const merged = DataFrame.merge([dataFrame1, dataFrame2]);
        expect(merged.getColumnNames()).to.eql(["A", "B"]);
        expect(merged.getIndex().head(merged.count()).toArray()).to.eql([0, 1, 2, 3])
        expect(merged.toRows()).to.eql([
            [1, undefined],
            [2, 4],
            [3, 5],
            [undefined, 6],
        ]);
    });

    it('can merge misaligned dataframes 2', () => {
		var dataFrame1 = new DataFrame({
            columnNames: ["A"],
            index: [1, 2, 3],
            rows: [[1], [2], [3]],
        });
		var dataFrame2 = new DataFrame({
            columnNames: ["B"],
            index: [0, 1, 2],
            rows: [[4], [5], [6]],
        });

        const merged = DataFrame.merge([dataFrame1, dataFrame2]);
        expect(merged.getColumnNames()).to.eql(["A", "B"]);
        expect(merged.getIndex().head(merged.count()).toArray()).to.eql([0, 1, 2, 3])
        expect(merged.toRows()).to.eql([
            [undefined, 4],
            [1, 5],
            [2, 6],
            [3, undefined],
        ]);
    });

    it('same column in second dataframe overrides first', () => {
		var dataFrame1 = new DataFrame({
            columnNames: ["A"],
            index: [0, 1, 2],
            rows: [[1], [2], [3]],
        });
		var dataFrame2 = new DataFrame({
            columnNames: ["A"],
            index: [0, 1, 2],
            rows: [[4], [5], [6]],
        });

        const merged = DataFrame.merge([dataFrame1, dataFrame2]);
        expect(merged.getColumnNames()).to.eql(["A"]);
        expect(merged.getIndex().head(merged.count()).toArray()).to.eql([0, 1, 2])
        expect(merged.toRows()).to.eql([
            [4],
            [5],
            [6],
        ]);
    });

    it('merged indicies are sorted in ascending order - numbers', () => {
		var dataFrame1 = new DataFrame({
            columnNames: ["A"],
            index: [5, 1, 3],
            rows: [[5], [1], [3]],
        });
		var dataFrame2 = new DataFrame({
            columnNames: ["B"],
            index: [1, 5, 3],
            rows: [[1], [5], [3]],
        });

        const merged = DataFrame.merge([dataFrame1, dataFrame2]);
        expect(merged.getColumnNames()).to.eql(["A", "B"]);
        expect(merged.getIndex().head(merged.count()).toArray()).to.eql([1, 3, 5])
        expect(merged.toRows()).to.eql([
            [1, 1],
            [3, 3],
            [5, 5],
        ]);
    });

    it('merged indicies are sorted in ascending order - dates', () => {
        const d1 = moment("2018/01/02", "YYYY/MM/DD").toDate();
        const d2 = moment("2018/02/02", "YYYY/MM/DD").toDate();
        const d3 = moment("2018/03/02", "YYYY/MM/DD").toDate();

		var dataFrame1 = new DataFrame({
            columnNames: ["A"],
            index: [d3, d1, d2],
            rows: [[5], [1], [3]],
        });
		var dataFrame2 = new DataFrame({
            columnNames: ["B"],
            index: [d1, d3, d2],
            rows: [[1], [5], [3]],
        });

        const merged = DataFrame.merge([dataFrame1, dataFrame2]);
        expect(merged.getColumnNames()).to.eql(["A", "B"]);
        expect(merged.getIndex().head(merged.count()).toArray()).to.eql([d1, d2, d3]);
        expect(merged.toRows()).to.eql([
            [1, 1],
            [3, 3],
            [5, 5],
        ]);
    });
    
    it('can merge empty dataframes', () => {
		var dataFrame1 = new DataFrame();
		var dataFrame2 = new DataFrame();

        const merged = DataFrame.merge([dataFrame1, dataFrame2]);
        expect(merged.getColumnNames()).to.eql([]);
        expect(merged.getIndex().head(3).toArray()).to.eql([])
        expect(merged.toRows()).to.eql([]);
    });

    it('can merge dataframes when second is empty', () => {
		var dataFrame1 = new DataFrame({
            columnNames: ["A"],
            index: [1, 2, 3],
            rows: [[1], [2], [3]],
        });
		var dataFrame2 = new DataFrame();

        const merged = DataFrame.merge([dataFrame1, dataFrame2]);
        expect(merged.getColumnNames()).to.eql(["A"]);
        expect(merged.getIndex().head(3).toArray()).to.eql([1, 2, 3])
        expect(merged.toRows()).to.eql([
            [1],
            [2],
            [3],
        ]);
    });

    it('can merge dataframes when first is empty', () => {
		var dataFrame1 = new DataFrame();
		var dataFrame2 = new DataFrame({
            columnNames: ["B"],
            index: [0, 1, 2],
            rows: [[4], [5], [6]],
        });

        const merged = DataFrame.merge([dataFrame1, dataFrame2]);
        expect(merged.getColumnNames()).to.eql(["B"]);
        expect(merged.getIndex().head(3).toArray()).to.eql([0, 1, 2])
        expect(merged.toRows()).to.eql([
            [4],
            [5],
            [6],
        ]);
    });
    

});