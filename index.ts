
import * as moment from 'moment';
import { Series } from './lib/series';

var series = new Series([10, 20, 30]);

for (let x of series) {
    console.log(x);
}