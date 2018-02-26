Work in progress.

A TypeScript implementation of [Data-Forge](https://github.com/data-forge/data-forge-js).


**Breaking changes**

Removed HTTP and MongoDB support.
These have been moved to a separate plugin.

Config object to fromJSON fn is no longer used.

Config object to fromCSV is now only passed to Babyparse, it is no longer passed to DataFrame constructor.

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