'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var count_iterator_1 = require("../../lib/iterators/count-iterator");
describe('count iterator', function () {
    it('counter iterator generates an infinite sequence starting at zero', function () {
        var it = new count_iterator_1.CountIterator();
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 0,
        });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 1,
        });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 2,
        });
    });
});
//# sourceMappingURL=count-iterator.test.js.map