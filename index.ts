
export { Index, IIndex } from './lib/index';
export { Series, ISeries, SelectorFn } from './lib/series';
export { DataFrame, IDataFrame } from './lib/dataframe';

import { DataFrame, IDataFrame } from './lib/dataframe';

var dr = new DataFrame([
    {
        A: 1,
        B: 2,
    },
    {
        A: 10,
        B: 20,
    }
]);

console.log(dr.toString());
