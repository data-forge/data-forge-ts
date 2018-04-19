import { assert, expect } from 'chai';
import 'mocha';
import * as dataForge from '../index';

const Stopwatch = require('statman-stopwatch');

describe('performance', () => {

	it('calling last on an expensive Series should have good performance', () => {

		const stopwatch = new Stopwatch();
        stopwatch.start();

        let i = 0;

        const expensiveIterator: Iterator<number> = {
            next: (value?: any): IteratorResult<number> => {
                if (++i < 100) {
                    // Expensive operation!!
                    var y = 10;
                    var total = 0;
                    for (var x = 0; x < 1000; ++x) {
                        total += (() => 3 + y)();
                    }

                    return {
                        value: total,
                        done: false,
                    };
                }
                else {
                    return {
                        value: 0,
                        done: true,
                    };
                }
            },
        };
        
        const expensiveIterable: Iterable<number> = {
            [Symbol.iterator]: (): Iterator<number> => {
                return expensiveIterator;
            },
        };

		var series = new dataForge.Series(expensiveIterable);

		//console.log(series.last());

		stopwatch.stop();
		var time = stopwatch.read();
		//console.log('t ' + time);
		expect(time).to.be.at.most(3);
	});

	it('calling last on an expensive DataFrame should have good performance', () => {

		var stopwatch = new Stopwatch();
        stopwatch.start();
        
        let i = 0;

        const expensiveIterator: Iterator<number> = {
            next: (value?: any): IteratorResult<number> => {
                if (++i < 100) {
                    // Expensive operation!!
                    var y = 10;
                    var total = 0;
                    for (var x = 0; x < 1000; ++x) {
                        total += (() => 3 + y)();
                    }

                    return {
                        value: total,
                        done: false,
                    };
                }
                else {
                    return {
                        value: 0,
                        done: true,
                    };
                }
            },
        };
        
        const expensiveIterable: Iterable<number> = {
            [Symbol.iterator]: (): Iterator<number> => {
                return expensiveIterator;
            },
        };        

		var df = new dataForge.DataFrame(expensiveIterable);

		var lastValue = df.last();

		stopwatch.stop();
		var time = stopwatch.read();
		//console.log('t ' + time);
		expect(time).to.be.at.most(3);
	});
});