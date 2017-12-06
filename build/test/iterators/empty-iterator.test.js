'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var empty_iterator_1 = require("../../lib/iterators/empty-iterator");
describe('array iterator', function () {
    it('iterator for empty array', function () {
        var it = new empty_iterator_1.EmptyIterator();
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
    });
});
//# sourceMappingURL=empty-iterator.test.js.map