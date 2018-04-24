Work in progress.

A TypeScript implementation of [Data-Forge](https://github.com/data-forge/data-forge-js).


**Breaking changes**

Removed HTTP and MongoDB support.
These have been moved to a separate plugin.

Config object to fromJSON fn is no longer used.

Config object to fromCSV is now only passed to Babyparse, it is no longer passed to DataFrame constructor.

The Series.join function always used to return a DataFrame. This was wrong. It now returns a Series.

Union/intersection/except have been simplified.
Series.intersection/except now takes two selectors rather than a comparer.
Series.intersection/except, etc, Join functions selector no longer takes an index.

To simplify things intersection/except/join, etc selector fn no longer accepts the index.

Removed the column wise concatenation of dataframes, this can be done with zip.

Rows must now be passed into a dataframe via the 'rows' field of the dataframe config.

dataForge.use and plugins have been removed. I never really made proper use of this.

renameSeries no longer takes an array of strings for column names, just a column name map.

Removed getColumnIndex, getColumnName

DataFrame no longer derives from Serires, so min/max/average/etc are not allowed.

No config object is passed to fromJSON.


**New feature**

Typescript
Use of Iterables and Iterators.
Can use for of with DataFrame, Series and Index.
The additon of AsyncDataFrame and AsyncSeries.


**Changes**

Removed dependencies on linqjs.
Replaced babyparse with papaparse.
Proper laziness all the way through!

**Deprecated functions**

asPairs/asValues
dataForge.concatSeries (use static fn dataForge.Series.concat instead)
dataForge.concatDataFrames (use static fn dataForge.DataFrame.concat instead)
dataForge.zipSeries (use static fn dataForge.Series.zip instead)
dataForge.zipDataFrames (use static fn dataForge.DataFrame.zip instead)