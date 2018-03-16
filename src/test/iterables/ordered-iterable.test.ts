import { assert, expect } from 'chai';
import 'mocha';
import { OrderedIterable, ISortSpec, Direction } from '../../lib/iterables/ordered-iterable';

describe('ordered iterable', function () {

    function flattenIterable (iterable: OrderedIterable): any[] {
        const output: any[] = [];
        for (const value of iterable) {
            output.push(value);
        }
        return output;
    }

	it('empty input is empty output', function () {

        var orderedIterable = new OrderedIterable([], [{ sortLevel: 0, selector: () => 0, direction: Direction.Ascending }]);
        expect(flattenIterable(orderedIterable)).to.eql([]);
    });

    it('sorted list is returned unchanged - ascending', function () {

        var orderedIterable = new OrderedIterable([1, 2, 3], [{ sortLevel: 0, selector: v => v, direction: Direction.Ascending }]);
        expect(flattenIterable(orderedIterable)).to.eql([1, 2, 3]);
    });

    it('sorted list is returned unchanged - descending', function () {

        var orderedIterable = new OrderedIterable([3, 2, 1], [{ sortLevel: 0, selector: v => v, direction: Direction.Descending }]);
        expect(flattenIterable(orderedIterable)).to.eql([3, 2, 1]);
    });

    it('out of order list is sorted - ascending', function () {

        var orderedIterable = new OrderedIterable([3, 1, 2], [{ sortLevel: 0, selector: v => v, direction: Direction.Ascending }]);
        expect(flattenIterable(orderedIterable)).to.eql([1, 2, 3]);
    });

    it('out of order list is sorted - descending', function () {

        var orderedIterable = new OrderedIterable([1, 3, 2], [{ sortLevel: 0, selector: v => v, direction: Direction.Descending }]);
        expect(flattenIterable(orderedIterable)).to.eql([3, 2, 1]);
    });

    it('can sort based on field', function () {

        var orderedIterable = new OrderedIterable([{ x: 3 }, { x: 1 }, { x: 2 }], [{ sortLevel: 0, selector: v => v.x, direction: Direction.Ascending }]);
        expect(flattenIterable(orderedIterable)).to.eql([{ x: 1 }, { x: 2 }, { x: 3 }]);
    });

    it('can do nested sort - ascending', function () {

        var orderedIterable = new OrderedIterable(
            [{ x: 3, y: 2 }, { x: 3, y: 5 }, { x: 2, y: 10 }], 
            [
                { sortLevel: 0, selector: v => v.x, direction: Direction.Ascending },
                { sortLevel: 1, selector: v => v.y, direction: Direction.Ascending },
            ]);
        expect(flattenIterable(orderedIterable)).to.eql([
            { x: 2, y: 10 }, 
            { x: 3, y: 2 }, 
            { x: 3, y: 5 }
        ]);
    });

    it('can do nested sort - descending', function () {

        var orderedIterable = new OrderedIterable(
            [{ x: 3, y: 2 }, { x: 3, y: 5 }, { x: 2, y: 10 }], 
            [
                { sortLevel: 0, selector: v => v.x, direction: Direction.Ascending },
                { sortLevel: 1, selector: v => v.y, direction: Direction.Descending },
            ]);
        expect(flattenIterable(orderedIterable)).to.eql([
            { x: 2, y: 10 }, 
            { x: 3, y: 5 }, 
            { x: 3, y: 2 }
        ]);
    });

});



