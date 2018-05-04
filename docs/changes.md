# Change Log

Data-Forge v1 is much the same as previous versions, although has it been rewritten in TypeScript. There are some breaking changes. Please read on for more infomration.

If something changed that broke your code, [please log an issue](https://github.com/data-forge/data-forge-ts/issues/new) and I'll help you figure out a way around it.

## New features and improvements

- Rebuilt entirely in Typescript for enhanced type-safety and also intelisense which is really useful in Visual Studio Code.
- Supports JavaScript Iterators and Iterables at it's core.
- Performance optimized: While there's still work to be done here, Data-Forge v1 is more performant than every before.
- More lazy: It was always an aim for Data-Forge to be lazy, this is not almost entirely the case the majority of the code supporting lazy evaluation. There's still work to be done but it's come a long way.

## Breaking changes

This is a non-exhaused list of breaking changes.

For the most part when you upgrade to Data-Forge v1 your code should still work with few changes required. But please let me know if you hit problems.

- `DataFrame` no longer derives from `Series`, so a few of the `Series` functions that you used to be able to call through `DataFrame` are no longer available (eg `min`, `max` and `average`).
- Removed HTTP and MongoDB support. It wasn't a good idea to make Data-Forge dependent on such specific 3rd party libraries.
- `fromJSON` function on longer takes a config object, the config object was never used so I removed it.
- The config object passed to `fromCSV` (and other CSV functions) is now passed on to Babyparse, so you can use it specify CSV parsing options.
- The `Series.join` function always used to return a `DataFrame`. This was wrong. It now returns a `Series`.
- The functions `union`, `intersection` and `except` have been simplified. Please check the docs to see how these should be called now.
- I have removed the column wise concatenation of dataframes, this resulted in a huge simplification to the code and it can easily be replicated with `zip`.
- Rows must now be passed into a dataframe via the `rows` field of the dataframe config.
- `dataForge.use` and support plugins have been removed. I never really made proper use of this. It might come back in the future if plugins seem like a good idea.
- `renameSeries` no longer takes an array of strings for column names, just a column name map.
- Removed `getColumnIndex` and `getColumnName`.
- The functions `asPairs` and `asValues` have been removed. These always felt like a dirty rotten hack. They were mainly used to deal with the results of `window` and `rollingWindow` and there are better ways to do this. Please see docs for `window` and `rollingWindow` for recommend use.
- The sorting functions (`orderBy`, `orderByDescending`, `thenBy` and`thenByDescending`) now preserve the index.
- The following functions have been replaced:
    - dataForge.concatSeries by Series.concat;
    - dataForge.concatDataFrames by DataFrame.concat;
    - dataForge.zipSeries by Series.zip and
    - dataForge.zipDataFrames by DataFrame.zip.
- The dependencies on linqjs has been removed. This probably won't affect anyone.
