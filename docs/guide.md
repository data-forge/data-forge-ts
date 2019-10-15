# The Data-Forge Guide

This is the guide to using Data-Forge.

<a target="_blank" href="https://www.data-forge-notebook.com/"><img align="right" src="../images/support2.png"></a>

Data-Forge is a open-source toolkit for data transformation and analysis in JavaScript and TypeScript. This guide will help you dive deeper into Data-Forge and equip you with skills to build more complex data processing pipelines.

This document is a constant work in progress. If you notice any problems [please log an issue](https://github.com/data-forge/data-forge-ts/issues/new). 

Please also consider forking this repo, then add or update this document based on your own experimentation or experience with Data-Forge and then submit a pull-request. I'm happy to accept contributions to both code and documentation! 

For other resources and documentation please [visit the home page](http://data-forge-js.com/) or view [the repo's main README](https://github.com/data-forge/data-forge-ts).

Happy data wrangling!

<a target="_blank" href="http://bit.ly/2t2cJu2"><img align="right" src="../images/support3.png"></a>


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Project Overview](#project-overview)
  - [Project Aims](#project-aims)
  - [Driving Principles](#driving-principles)
  - [Implementation](#implementation)
- [Installation](#installation)
  - [NodeJS installation and setup](#nodejs-installation-and-setup)
  - [Browser installation and setup](#browser-installation-and-setup)
  - [Getting the code](#getting-the-code)
- [Key Concepts](#key-concepts)
- [A note about JavaScript anonymous functions](#a-note-about-javascript-anonymous-functions)
- [Immutability and Chained Functions](#immutability-and-chained-functions)
- [Lazy evaluation through iterators](#lazy-evaluation-through-iterators)
- [Basic Usage](#basic-usage)
  - [Getting data in](#getting-data-in)
    - [DataFrame](#dataframe)
    - [Series](#series)
  - [Geting data out](#geting-data-out)
    - [DataFrame](#dataframe-1)
    - [Series](#series-1)
  - [Setting an index](#setting-an-index)
  - [Working with CSV files](#working-with-csv-files)
    - [Reading CSV files](#reading-csv-files)
      - [Synchronous version](#synchronous-version)
      - [Asynchronous version](#asynchronous-version)
      - [Async/await version](#asyncawait-version)
    - [Writing CSV files](#writing-csv-files)
      - [Synchronous version](#synchronous-version-1)
      - [Asynchronous version](#asynchronous-version-1)
      - [Async/await version](#asyncawait-version-1)
    - [Working with CSV data](#working-with-csv-data)
  - [Working with JSON files](#working-with-json-files)
    - [Reading JSON files](#reading-json-files)
      - [Synchronous version](#synchronous-version-2)
      - [Asynchronous version](#asynchronous-version-2)
      - [Async/await version](#asyncawait-version-2)
    - [Writing JSON files](#writing-json-files)
      - [Synchronous version](#synchronous-version-3)
      - [Asynchronous version](#asynchronous-version-3)
    - [Async/await version](#asyncawait-version-3)
    - [Working with JSON data](#working-with-json-data)
  - [Parsing column values](#parsing-column-values)
  - [Automatic column parsing](#automatic-column-parsing)
  - [Stringifying column values](#stringifying-column-values)
- [Working with data](#working-with-data)
  - [Extracting rows from a dataframe](#extracting-rows-from-a-dataframe)
  - [Extracting columns and series from a dataframe](#extracting-columns-and-series-from-a-dataframe)
  - [Extract values from a series](#extract-values-from-a-series)
  - [Extract values from an index](#extract-values-from-an-index)
  - [Adding a column](#adding-a-column)
  - [Replacing a column](#replacing-a-column)
  - [Generating a column](#generating-a-column)
  - [Transforming a column](#transforming-a-column)
  - [Removing columns](#removing-columns)
  - [Getting a row or value by index](#getting-a-row-or-value-by-index)
- [Data exploration and visualization](#data-exploration-and-visualization)
  - [Console output](#console-output)
- [Sorting](#sorting)
- [Transformation](#transformation)
  - [Dataframe transformation](#dataframe-transformation)
  - [Series transformation](#series-transformation)
  - [Transform a series in a dataframe](#transform-a-series-in-a-dataframe)
- [Filtering](#filtering)
- [Data subsets](#data-subsets)
- [Combining](#combining)
  - [Concatenation](#concatenation)
  - [Merge](#merge)
  - [Join](#join)
  - [Zip](#zip)
- [Collapsing unique values](#collapsing-unique-values)
  - [Distinct values](#distinct-values)
  - [Sequential distinct values](#sequential-distinct-values)
- [Groups and windows](#groups-and-windows)
  - [Group](#group)
  - [Group Sequential](#group-sequential)
  - [Window](#window)
  - [Rolling window](#rolling-window)
  - [Variable window](#variable-window)
- [Summarization and Aggregation](#summarization-and-aggregation)
  - [Aggregate](#aggregate)
  - [Summarize](#summarize)
  - [Group and Aggregate](#group-and-aggregate)
  - [Pivot](#pivot)
- [Filling gaps and missing data](#filling-gaps-and-missing-data)
- [Node.js examples](#nodejs-examples)
  - [Install](#install)
  - [Working with a MongoDB collection](#working-with-a-mongodb-collection)
  - [Working with HTTP](#working-with-http)
- [Browser examples](#browser-examples)
  - [Install](#install-1)
  - [Working with HTTP in the browser](#working-with-http-in-the-browser)
  - [Working with HTTP in AngularJS](#working-with-http-in-angularjs)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Project Overview

This section is a short overview of the aims, principles and implementation methods for this project.

## Project Aims

The aims of this project:

- To combine the best aspects of [Pandas](https://en.wikipedia.org/wiki/Pandas_(software)) and [LINQ](https://en.wikipedia.org/wiki/Language_Integrated_Query) and make them available in JavaScript.
- To be able to load, transform and save data.
- To be able to visualize data (see [Data-Forge Plot](https://www.npmjs.com/package/data-forge-plot))
- To be able to work with massive data files (although it's not quite there yet - want to add streaming in the future).

## Driving Principles 

The principles that drive decision making and tradeoffs:

- The API should be simple, easy to learn and easy to use.
- Simple tools should be composable to build solutions to complex data problems.
- Intellisense in Visual Studio Code (or other IDE) should make using the API a breeze.
- Minimize the magic: everything should be understandable, the API should be orthogonal.
- The library should have high performance.
- The TypeScript or JavaScript code you build during exploratory coding should be easily transplantable to a webapp, server or microservice.

## Implementation

General implementation goals:

- Immutable: every operation generates a new immutable data set.
- Lazy evaluation, to make the performance of immutability acceptable.
- Should be easily extensible.
- Core code is created through test driven development.

# Installation

## NodeJS installation and setup

Install via [NPM](https://en.wikipedia.org/wiki/Npm_(software)): 

	npm install --save data-forge

If you are on Node.js and want the file system functions please also install the file system module [Data-Forge FS](https://github.com/data-forge/data-forge-fs):

    npm install --save data-forge-fs

Require the module into your JavaScript code:

```javascript
const dataForge = require('data-forge');
```

Or import the entire module in TypeScript:

```typescript
import * as dataForge from 'data-forge';
```

Or just import classes and functions in TypeScript:

```typescript
import { readFile, Series, DataFrame } from 'data-forge';
```

To use the file system functions also import the fs module in JavaScript:

```javascript
require('data-forge-fs');
```

Or in TypeScript:

```typescript
import 'data-forge-fs';
```

The file system module auguments the core Data-Forge API and adds readFile and writeFile function to support access to data files under Node.js. 

To visualize data, also install [Data-Forge Plot](https://www.npmjs.com/package/data-forge-plot):

    npm install --save data-forge-plot

And require it in JavaScript:

```javascript
require('data-forge-plot');
```

Or in TypeScript:

```typescript
import 'data-forge-plot';
```

## Browser installation and setup

Data-Forge can be used from the browser and has been tested with  Browserify and Webpack.

Please see links to examples on [the main page](https://www.npmjs.com/package/data-forge).

If you aren't using Browserify or Webpack, the npm package includes a pre-packed browser distribution that you can install and included in your HTML as follows:

```html
<script language="javascript" type="text/javascript" src="node_modules/data-forge/dist/web/index.js"></script>
```

This gives you the data-forge package mounted under the global variable `dataForge`.

Please remember that you can't use data-forge-fs or data-forge-plot from the browser.

## Getting the code

Install via NPM as described in previous sections or clone, fork or download the code from GitHub:

- [https://github.com/data-forge/data-forge-ts](https://github.com/data-forge/data-forge-ts)
- [https://github.com/data-forge/data-forge-fs](https://github.com/data-forge/data-forge-fs)
- [https://github.com/data-forge/data-forge-plot](https://github.com/data-forge/data-forge-plot)

# Key Concepts

The concepts section has been moved to [a separate file](docs/concepts.md).

# A note about JavaScript anonymous functions

Use of Data-Forge benefits heavily on the use of JavaScript anonymous functions. For most of the examples in this guide I use the JavaScript [arrow syntax](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/Arrow_functions) that was introduced in [ES6](https://en.wikipedia.org/wiki/ECMAScript#ES6).

An example of an arrow syntax anonymous function:

```javascript
(param1, param2) => 1 + 1
```

However this can't be consisently used in the browser or in older versions of node, so please substitute the traditional syntax where necessary:

```javascript
function (param1, param2) {
    return 1 + 1;
}
```

# Immutability and Chained Functions

You will notice in all examples here that multiple functions are often chained together using the Data-Forge fluent API.

Data-Forge supports only [immutable](https://en.wikipedia.org/wiki/Immutable_object) operations. Each operation returns a new immutable dataframe or series. No *in place* operations are supported (one of the things I found confusing about *Pandas*). 

This is why, in the following example, the final dataframe is always captured after all operations have been applied:

```javascript
const df = new dataForge.DataFrame(config).setIndex("Col3").dropSeries("Col3");
```

Consider an alternate structure:

```javascript
const df1 = new dataForge.DataFrame(config);
const df2 = df1.setIndex("Col3");
const df3 = df2.dropSeries("Col3");
```

Here *df1*, *df2* and *df3* are separate dataframes with the results of the previous operations applied. These dataframes are all immutable and cannot be changed. Any function that transforms a dataframe returns a new and independent dataframe. If you are not used to this sort of thing, it may require some getting used to!

# Lazy evaluation through iterators

Most operations in Data-Forge happen only through lazy evaluation with results computed just in time when they are needed.

For example in the following example you might think that the index has been set and Col3 has been dropped:

```javascript
const df = new dataForge.DataFrame(config).setIndex("Col3").dropSeries("Col3");
```

But that's not the case due to lazy evaluation which ensures that the work to modify the series or dataframe is only done when it needs to be. For example converting the dataframe to a JavaScript array will force lazy evaluation and bake all our changes into the resulting array:

```javascript
const array = df.toArray();
```

Lazy evaluation in Data-Forge is implemented through JavaScript iterators. This means you can use `for..of` on any series or dataframe to iterate its values. Series and dataframes can be passed to any JavaScript function that expects an iterator.

You can force a dataframe or series to be evaluated using the `bake` function, this can sometimes help improve performance:

```javascript
const df = new dataForge.DataFrame(config)
    .setIndex("Col3")
    .dropSeries("Col3")
    .bake();
```

# Basic Usage 

## Getting data in

### DataFrame

A *dataframe* represents a sequence of tabular data. That is to say that it contains multiple named *series*, or *columns* of data. You can think of it like a JavaScript array but with extra operations and support for columns. I like to think of a dataframe as a *spreadsheet in memory*.

The `DataFrame` constructor is passed a *config* object that specifies the initial contents of the dataframe and additional options. 

Create a data frame from column names and rows:

```javascript
const df = new dataForge.DataFrame({
    columnNames: ["Col1", "Col2", "Col3"],
    rows: [
        [1, 'hello', new Date(...)],
        [5, 'computer', new Date(...)],
        [10, 'good day', new Date(...)]
    ]
});
```

A dataframe can also be created from an array of JavaScript objects and the column names are inferred from the fields in the first object that it sees:

```javascript
const df = new dataForge.DataFrame({
    values: [
        {
            Col1: 1,
            Col2: 'hello',
            Col3: new Date(....)
        },
        {
            Col1: 5,
            Col2: 'computer',
            Col3: new Date(....)
        },
        {
            Col1: 10,
            Col2: 'good day',
            Col3: new Date(....)
        }
    ]
});
```

If you don't need additional options, you can simply pass in an array of objects:

```javascript
const df = new dataForge.DataFrame([
    {
        Col1: 1,
        Col2: 'hello',
        Col3: new Date(....)
    },
    {
        Col1: 5,
        Col2: 'computer',
        Col3: new Date(....)
    },
    {
        Col1: 10,
        Col2: 'good day',
        Col3: new Date(....)
    }
]);
```

If you have irregular data you can enable *considerAllRows*, but be warned that this can be expensive as every row must be examined to determine column names:

```javascript
const df = new dataForge.DataFrame({
    values: [
        {
            Col1: 1,
            Col2: 'hello',
            Col3: new Date(....)
        },
        {
            Col1: 5,
            Col5: 'these are irregular columns',
            Col6: new Date(....)
        },
        {
            Col5: 10,
            Col7: 'another irregular column',
            Col10: new Date(....)
        }
    ],
    considerAllRows: true, // Examine all rows to determine column names.
});
```

A dataframe can also be constructed from separate columns as follows using arrays or Series objects:

```javascript
const df = new dataForge.DataFrame({
    columns: {
        Col1: [1, 2, 3, 4],
        Col2: ['a', 'b', 'c', 'd'],
        Col3: new dataForge.Series(...),
    },
});
```

### Series

A series is a sequence of values, again a bit like a JavaScript array but with more options. `DataFrame` and `Series` are very similar and share many functions. A `DataFrame` can be actually be thought of as a collection of named series.

Very similar to creating a `DataFrame`, pass a *configuration* object to the `Series` constructor with values and  additional options:

```javascript
	const series = new dataForge.Series({
        values: [1, 2, 3]
    });
```

If you don't need additional options you can simply pass in an array of values:

```javascript
const series = new dataForge.Series([1, 2, 3]);
```

## Geting data out

### DataFrame

To get back the names of columns:

```javascript
const columnNames = df.getColumnNames();
```

To get back an array of objects (with column names as field names):

```javascript
const objects = df.toArray();
```

To get back an array of rows (arrays of values in column order):

```javascript
const rows = df.toRows();
```

To get back index and value pairs:

```javascript
const pairs = df.toPairs(); 
```

Because a dataframe is also an *iterable* you can iterate it using `for...of`:

```javascript
for (const value of df) {
    // ... do something with value ...
}
```

There's also a forEach function:

```javascript
df.forEach(value => {
    // ... do something with value ...
});
```

### Series

To retreive the data from Series as an array:

```javascript
const values = series.toArray();
```

To get back index and value pairs:

```javascript
const pairs = series.toPairs(); 
```

A series can also be iterated:

```javascript
for (const value of series) {
    // ... do something with value ...
}
```

And of course, there's a forEach function:

```javascript
series.forEach(value => {
    // ... do something with value ...
});
```

## Setting an index

So why is DataFrame and Series special? How they are different from a JavaScript array?

Well besides both having many useful functions for slicing and dicing your data, they can both be *indexed* by values other than numbers. Indexes support efficient lookup, merging and aggregation of your data.

In the previous examples of creating dataframes and series no index was specified, in those cases a default zero-based index was generated (just like with a normal JavaScript array).

An index can be set explicitly when creating a series or dataframe:

```javascript
const df = new dataForge.DataFrame({
    values: [ ... ] ,
    index: [5, 10, 100, ...and so on...]
});

const series = new dataForge.Series({
    values: [ ... ],
    index: [5, 10, 100, ...and so on...]
});
```

An index can be any type that you want. For example time-series data will be indexed by `Date`:

```javascript
const timeSeries = new dataForge.Series({
    values: [ ... ],
    index: [new Date(...), new Date(...), ...and so on...]
});
```

A new index can easily be assigned to either series or dataframe using the `withIndex` function:

```javascript
const dataFrameWithNewIndex = df.withIndex([1, 2, 3, ...]);
```

Most likely when using a dataframe you will want to promote an existing column to an index:

```javascript 
const df = new dataForge.DataFrame(someConfig).setIndex("Column3");
```

You can also use `withIndex` to assign or compute an index for each data value:

```javascript
const indexedDf = df.withIndex(row => row.Column3);
```

Be aware that promoting a column to an index doesn't remove the column (as it does in Pandas), however you can easily achieve this by calling `dropSeries`:

```javascript
const df = new dataForge.DataFrame(someConfig).setIndex("Column3").dropSeries("Column3");
```

Note an index is required for certain operations like `join` and `withSeries`.

## Working with CSV files

**WARNING:** You must have [Data-Forge FS](https://github.com/data-forge/data-forge-fs) installed to use the file system functions. This uses the NodeJS `fs` module, so reading and writing files can't work in the browser which has no access to the local file system. Only try this under Node.js!

### Reading CSV files

#### Synchronous version

If your CSV has a header with column names:

```javascript
const df = dataForge.readFileSync('some-csv-file.csv')
    .parseCSV();
```

If your CSV doesn't have a header you must specify the column names:

```javascript
const df = dataForge.readFileSync('some-csv-file.csv')
    .parseCSV({ columnNames: ["some", "explicit", "column", "names"] });
```

#### Asynchronous version

```javascript
dataForge.readFile('some-csv-file.csv')
    .parseCSV()
    .then(df => {
        // Use your dataframe after the promise resolves.
    })
    .catch(err => {
        // Some error occurred.
    });
```

#### Async/await version

```javascript
async function myAsyncFunction() {
    const df = await dataForge.readFile('some-csv-file.csv')
        .parseCSV();
    // Use your dataframe.
}
```

### Writing CSV files

#### Synchronous version

```javascript
df.asCSV().writeFileSync('some-other-csv-file.csv');
```

#### Asynchronous version

```javascript
df.asCSV().writeFile('some-other-csv-file.csv')
    .then(() => {
        // File has been written.
    })
    .catch(err => {
        // Some error occurred.
    });
```

#### Async/await version

```javascript
async function myAsyncFunction(df) {
    await df.asCSV().writeFile('some-other-csv-file.csv');
}
```

### Working with CSV data

**NOTE:** The `fromCSV`  and `toCSV` functions **do** work in the browser, because they are in-memory operations and don't deal directly with any files.

If you already have CSV data (loaded into a string) you can parse it into a dataframe via `fromCSV`:

```javascript
const inputCsvData = // ... some string with CSV data ...
const df = dataForge.fromCSV(inputCsvData);
```

And if you need to specify column names:

```javascript
const inputCsvData = // ... some string with CSV data ...
const df = dataForge.fromCSV(inputCsvData, { columnNames: ["some", "explicit", "column", "names"] });
```

You can stringify a dataframe to CSV by calling `toCSV`:

```javascript
const outputCsvData = df.toCSV();
```

## Working with JSON files 

**WARNING:** You must have [Data-Forge FS](https://github.com/data-forge/data-forge-fs) installed to use the file system functions. This uses the NodeJS `fs` module, so reading and writing files can't work in the browser which has no access to the local file system. Only try this under Node.js!

### Reading JSON files

#### Synchronous version

```javascript
const df = dataForge.readFileSync('some-json-file.json')
    .parseJSON();
```

#### Asynchronous version

```javascript
dataForge.readFile('some-json-file.json')
    .parseJSON()
    .then(df => {
        // Use your dataframe after the promise resolves.
    })
    .catch(err => {
        // Some error occurred.
    });
```

#### Async/await version

```javascript
async function myAsyncFunction() {
    const df = await dataForge.readFile('some-json-file.json')
        .parseJSON();
    // Use your
}
```

### Writing JSON files 

#### Synchronous version

```javascript
df.asJSON().writeFileSync('some-json-file.json');
```

#### Asynchronous version

```javascript
df.asJSON().writeFile('some-other-json-file.json')
    .then(() => {
        // File has been written.
    })
    .catch(err => {
        // Some error occurred.
    });
```

### Async/await version

```javascript
async function myAsyncFunction(df) {
    await df.asJSON().writeFile('some-other-json-file.json');
}
```

### Working with JSON data

**NOTE:** The `fromJSON`  and `toJSON` functions **do** work in the browser, because they are in-memory operations and don't deal directly with any files.

If you already have JSON data (loaded into a string) you can parse it into a dataframe via `fromJSON`:

```javascript
const inputJsonData = // ... some string with JSON data ...
const df = dataForge.fromJSON(inputJsonData);
```

You can stringify a dataframe to jSON by calling `toJSON`:

```javascript
const outputJsonData = df.toJSON();
```

## Parsing column values

Often when you parse a data set from a text format you will need to parse string values in specific columns to particular types. This is especially true for CSV data which contain only string data once loaded. It is less true for JSON data which can store values as numbers, although the JSON format has no native date format, so when you load JSON files you will still need to parse the dates.

Data-Forge has various helper functions for parsing string values: `parseInts`, `parseFloats` and `parseDates`.

You can call these on a series, for example:

```javascript
const stringSeries = new dataForge.Series(["15", "16"]);
assert.isString(stringSeries.first());

const parsedSeries = stringSeries.parseInts();
assert.isNumber(parsedSeries.first()); 
```

To call these functions on a dataframe you must pass in the name of the column that is to be parsed, for example say you load from a CSV (which loads in string data) and want to parse a particular column:

```javascript
const stringDataFrame = dataForge.readFileSync("some-csv-file.csv").parseCSV();
assert.isString(stringDataFrame.first().Column1);

const parsedDataFrame = stringDataFrame.parseInts("Column1");
assert.isNumber(parsedDataFrame.first().Column1);
```

For each of these functions you can also specify an array of column names to be parsed:	 

```javascript
const parsedDataFrame = stringDataFrame.parseInts(["Column1", "Column2"]);
assert.isNumber(parsedDataFrame.first().Column1);
assert.isNumber(parsedDataFrame.first().Column2);
```

When parsing dates you can specify an optional format string that specifies the format of the dates to be parsed:

```javascript
const stringDataFrame = dataForge.fromCSV("Column1\n2016-09-25\n2016-10-25");
const parsedDataFrame = stringDataFrame.parseDates("Column1", "YYYY-MM-DD");
```

Data-Forge uses [Moment.js](http://momentjs.com/) under the hood, please see its docs for valid formatting syntax. 

## Automatic column parsing

When parsing columns using CSV we can have values parsed automatically depending on what type they appear to be. 

```javascript
const df = dataForge.readFileSync("some-csv-file.csv").parseCSV({ dynamicTyping: true });
assert.isNumber(df.first().SomeNumberColumn);
```

Please note that this will parse numbers and booleans, but it won't parse dates.

## Stringifying column values 

When you are saving out data in a text format or displaying data on screen you will often want to transform values in specific columns to particular types. For numbers this happens automatically, but this is essential when formatting dates for output, for example:

```javascript
const df = ...
assert.instanceof(df.first().Column1, Date);

const stringifiedDataFrame = df.toStrings("Column1", "YYYY-MM-DD");
assert.isString(stringifiedDataFrame.first().Column1); 
```

Data-Forge uses [Moment.js](http://momentjs.com/) under the hood, please see its docs for valid formatting syntax. 

# Working with data

## Extracting rows from a dataframe

Values can be extracted from a dataframe in several ways.

NOTE: the following functions cause lazy evaluation to complete (like the *toArray* function in LINQ). This can be performance intensive.

To extract rows as arrays of data (ordered by column): 

```javascript
const arrayOfArrays = df.toRows();
```

To extract rows as objects (with column names as fields):

```javascript
const arrayOfObjects = df.toArray();
```

To extracts index + row pairs:

```javascript
const arrayOfPairs = df.toPairs();
```

A new dataframe can also be created from the values *between* a pair of indicies:

```javascript
const startIndex = // ... starting row index to include in subset. 
const endIndex = // ... ending row index to include in subset.
const subset = df.between(startIndex, endIndex);
```

NOTE: To use `between` and similar functions your index must already be in sorted order.

Invoke a callback for each row in a dataframe using `forEach`:

```javascript
df.forEach(row => {
    // Callback function invoked for each row.
}); 
```

Because dataframe is implemented as an *iterable* we can also use `for..of`:

```javascript
for (const row of df) {
    // Do something with row.
}
```

## Extracting columns and series from a dataframe

Get the names of the columns:

```javascript
const arrayOfColumnNames = df.getColumnNames();
```

Iterate a series of all columns:

```javascript
    for (const column of df.getColumns()) {
        const name = column.name;
        const series = column.series;

        // ... do something with the series ...
    }
```

The advantage to having a series of columns, rather than a normal JavaScript array is that you can access all the tools that series offers for slicing and dicing a sequence, for example:

```javascript
const sortedColumnsSubject = df.getColumns()
    .where(column => column.name !== "Date")
    .skip(2)
    .take(3)
    .orderBy(column => column.name);
```

Extract a named series from the dataframe:

```javascript
const series = df.getSeries('MyColumn'); 
```

Or to avoid magic strings:

```javascript
const series = df.deflate(row => row.MyColumn); 
```

Extract a series and compute a new series from it:

```javascript
const computedSeries = df.deflate(row => row.MyColumn * 10);
```

Create a new dataframe from a subset of columns:

```javascript
const subset = df.subset(["Some-Column", "Some-Other-Column"]);
```

## Extract values from a series

NOTE: the follow functions cause lazy evaluation to complete (like the *toArray* function in LINQ). This can be performance intensive.

Extract the values from the series as an array:   

```javascript
const arrayOfValues = series.toArray();
```

Extract index + value pairs from the series as an array:

```javascript
const arrayOfPairs = series.toPairs();
```

Invoke a callback for each value in the series using `forEach`:

```javascript
series.forEach(value => {
    // Callback function invoked for each value.
}); 
```

Series is also implemented as an *iterable* so we can use `for..of`:

```javascript
for (const value of series) {
    // Do something with value.
}
```

## Extract values from an index

Retrieve the index from a dataframe:

```javascript
const index = dataFrame.getIndex();
```

Retrieve the index from a series:

```javascript
const index = series.getIndex();
```

An index is actually basically just a series so you can call the `toArray` function or anything else that normally works for a series:

```javascript
const arrayOfIndexValues = index.toArray();
```

## Adding a column

New columns can be added to a dataframe. This doesn't change the original dataframe, it generates a new one with the additional column.

```javascript
const newDf = df.withSeries("Some-New-Column", someNewSeries);
```

You can also use the column spec format to avoid magic strings and also to add multiple columns at once:

```javascript
const newDf = df.withSeries({
    NewColumn1: seriesA,
    NewColumn2: seriesB
});
```

## Replacing a column

`withSeries` can also replace an existing column:

```javascript
const newDf = df.withSeries({
    SomeExistingColumn: someNewSeries
});
```

Again note that it is only the new dataframe that includes the modified column.

## Generating a column

`withSeries` can be used to generate a new column from existing columns as follows:

```javascript
const newDf = df.withSeries({
    SomeNewColumn: df => df.select(row => row.InputColumn1 + row.InputColumn2)
);
```

This same thing can be done more slighlty conveniently with the `generateSeries` function:

```javascript
const newDf = df.generateSeries({
    SomeNewColumn: row => row.InputColumn1 + row.InputColumn2
});
```

## Transforming a column

`withSeries` can be used to transform an existing column by passing in a function:

```javascript
const newDf = df.withSeries({
    SomeExistingColumn: 
        df => df.deflate(row => row.SomeExistingColumn)
            .select(value => transformValue(value)
});
```

But this operation can be done more conveniently with the `transformSeries` function:

```javascript
const newDf = df.transformSeries({
    SomeExistingColumn: value => transformValue(value)
});
```

This syntax can be used to add, generate and transform any number of colums at once.

## Removing columns

One or more columns can easily be removed:

```javascript
const newDf = df.dropSeries(['col1', 'col2']);
```

Also works for single columns:

```javascript
const newDf = df.dropSeries('Column-to-be-dropped');
```

Alternatively you can select the columns to keep and drop the rest:

```javascript
const newDf = df.subset(["Column-to-keep", "Some-other-column-to-keep"]);
```

## Getting a row or value by index

A particular value of a series or a row of a dataframe can be retrieved by specifying the index using the `at` function:

```javascript
const df = // ...
const row = df.at(10); // Get a row at index 10.
```

This also works when the index is a different type, eg a time-series index:

```javascript
const row = df.at(new Date(2016, 5, 22)); 
```

The `at` function also works for a series. 

# Data exploration and visualization

In order to understand the data we are working with we must explore it, understand the data types involved and the composition of the values.

## Console output

`DataFrame` and `Series` both provide a `toString` function that can be used to dump data to the console in a readable format.

Use the LINQ functions `skip` and `take` to preview a subset of the data (more on LINQ functions soon):

```javascript
// Skip 10 rows, take 20 rows, print the result.
console.log(df.skip(10).take(20).toString()); 
```

Or more conveniently: 

```javascript
// Get a range of rows starting at row index 10 and ending at (but not including) row index 20.
console.log(df.between(10, 20).toString()); 
```

Use the `head` function to view the rows at the start of a series or dataframe:

```javascript
console.log(df.head(5).toString());
```

Use the `tail` function to view the rows at the end of a series or dataframe:

```javascript
console.log(df.tail(5).toString());
```

As you explore a data set you may want to understand what data types you are working with. You can use the `detectTypes` function to produce a new dataframe with information on the data types in the dataframe you are exploring:

```javascript
// Create a data frame with details of the types from the source data frame.
const typesDf = df.detectTypes(); 
console.log(typesDf.toString());
```

For example, here is the output with some stock market data:

    __index__  		  Type    Frequency  Column
    ----------------  ------  ---------  ---------
    0                 date    100        Date
    1                 number  100        Open
    2                 number  100        High
    3                 number  100        Low
    4                 number  100        Close
    5                 number  100        Volume
    6                 number  100        Adj Close

You also probably want to understand the composition of values in the dataframe. This can be done using `detectValues` that examines the values and reports on their frequency: 

```javascript
// Create a data frame with the information on the frequency of values from the source data frame.
const valuesDf = df.detectValues(); 
console.log(valuesDf.toString());
```

# Sorting

Series and dataframes can be sorted using the LINQ-style functions: `orderBy` and `orderByDescending`.

```javascript
const sortedAscending = df.orderBy(row => row.SomeColumn);

const sortedDescending = df.orderByDescending(row => row.SomeColumn);
```

Use `thenBy` and `thenByDescending` to specify additional sorting criteria:

```javascript
const sorted = df.orderBy(row => row.SomeColumn)
    .thenByDescending(row => row.AnotherColumn)
    .thenBy(row => row.SomeOtherColumn);
```

# Transformation

## Dataframe transformation

A dataframe can be transformed using the [LINQ](https://en.wikipedia.org/wiki/Language_Integrated_Query)-style [`select`](http://www.dotnetperls.com/select) function:

```javascript
const transformedDataFrame = df.select(row => {
    return {
        NewColumn: row.OldColumn * 2,	// <-- Transform existing column to create a new column.
        AnotherNewColumn: rand(0, 100)	// <-- Create a new column (in this cause just use random data).
    };
});
```

This produces an entirely new immutable dataframe. However the new dataframe has the same index as the source dataframe, so both can be merged back together, if required. 

Note that the powerful `selectMany` function is also available and works the same as LINQ's SelectMany.

## Series transformation

A series can be transformed using `select`:

```javascript
const series = df.deflate(row => row.SomeColumn);
const newSeries = series.select(value => transform(value)); // Apply a transformation to each value in the column.
const newDf = df.withSeries({ SomeColumn: newSeries }); // Plug the modified series back into the dataframe.
```

The source index is preserved to the transformed series which is what allows the resulting series to be merged back into the dataframe.

The result of `select` is a completely new immutable series.

The `selectMany` function is also available for series.

## Transform a series in a dataframe

Data-Frame offers a convenience function `transformSeries` for when you need a simple convenient mechanism to extract, transform and plug back in one or more series at once. For example to simplify the previous code example:

```javascript
const newDf = df.transformSeries({
    SomeColumn: value => transform(value), // Apply a transformation to each value in the series.
});
```

# Filtering

Dataframes and series can be filtered using the [LINQ](https://en.wikipedia.org/wiki/Language_Integrated_Query)-style [`where`](http://www.dotnetperls.com/where) function:

```javascript
const filteredDf = df.where(somePredicateFunction);
```

The predicate function must return *truthy* to keep the row, or *falsy* to filter it out, for example:

```javascript
const filteredDf = df.where(row => row.SomeColumn > 10);
```

# Data subsets

There are multiple ways to extract a subset of data from a series or dataframe.

At the most basic `skip` and `take` allow a specified number of values to be skipped or taken.

```javascript
const subset = series.skip(10).take(15); 
```

`head` and `tail` are handy functions that can extract X elements at the start or end of the sequence:

```javascript
const head = series.head(10);

const tail = series.tail(5);
```

A bit more advanced are `skipWhile`, `takeWhile`, `skipUntil` and `takeUntil`. These all skip or take values according to the boolean result of a predicate function:

```javascript
const subset = series.skipWhile(row => somePredicate(row));
```

More sophisticated again are `startAt`, `endAt`, `after`, `before` and `between`. These functions intelligently filter values based on the index. Note that your index must already be sorted to use these functions. 

`startAt` retreives all values starting at a particular index. 

`endAt` retreives all values ending at a particular index (inclusive). 

`after` retreives all values after a particluar index (exclusive). 

`before` retreives all values before a particular index (exclusive). 

Finally `between` retreives all values between two indicies (inclusive).

# Combining

## Concatenation

Series and dataframes can be concatenated:

```javascript
const df1 = // ... some dataframe ...
const df2 = // ... some other dataframe ...

const concatenated = df1.concat(df2);
```

Multiple series or dataframes may be passed to concat:

```javascript
const concatenated = df1.concat(df2, df3, df4, etc);
```

Or an array may be used:

```javascript
const toConcat = [df2, df3, df4, etc];
const concatenated = df1.concat(toConcat); 
```

You can also concatenate by passing an array of series or dataframes to the global data-forge functions `Series.concat` or `DataFrame.concat`: 

```javascript
const concatenated = dataForge.DataFrame.concat([df1, df2, df3, df4, etc]);
```

## Merge

A simple merge of series or dataframes by index can be done using the `merge` function:

```javascript
const mergedSeries = Series.merge([series1, series2, etc]);
```

The merged series that is output is a series of arrays. Each array contains the values, aligned by index, across each of the input series.

You can also use the instance version of `merge` to merge 1 or more series into another series:

```javascript
const mergedSeries = series1.merge(series2, series3, etc);
```

The `merge` function can also be applied to dataframes:

```javascript
const mergedDf = DataFrame.merge([df1, df2, etc]);
```

Each row in the merged dataframe contains, aligned by index, the merged fields of each of the input dataframes. When dataframes have overlapping column names, values for those columns are overwritten by later dataframes in the list.

You can also use the instance version of `merge` for dataframes:

```javascript
const mergedDf = df1.merge(df2, df3, etc);
```

The output of a merge is always sorted ascending by index values.

## Join

Series and dataframes can be joined using the `join` function as in LINQ.  This performs an inner join. Data-Forge also has additional functions for outer joins: `joinOuter`, `joinOuterLeft` and `joinOuterRight`. Thanks to [Ryan Hatch for the implementation](http://blogs.geniuscode.net/RyanDHatch/?p=116).

Following is [an example translated from Pandas code on Chris Albon's blog](http://chrisalbon.com/python/pandas_join_merge_dataframe.html):

```javascript
const df_a = new dataForge.DataFrame({
    columnNames: [
        'subject_id',
        'first_name',
        'last_name',
    ],
    rows: [
        [1, 'Alex', 'Anderson'],
        [2, 'Amy', 'Ackerman'],
        // ... and more.
    ],
});

const df_b = new dataForge.DataFrame({
    columnNames: [
        'subject_id',
        'first_name',
        'last_name',
    ],
    rows: [
        [4, 'Billy', 'Bonder'],
        [5, 'Brian', 'Black'],
        // ... and more.
    ],
});

const df_n = new dataForge.DataFrame({
    columnNames: [
        "subject_id",
        "test_id",
    ],
    rows: [
        [1, 51],
        [2, 15],
        // .. and more.
    ],
});

const df_new = df_a.concat(df_b);
const df_merged = df_new.join(
    df_n,
    left => left.subject_id,
    right => right.subject_id,
    (left, right) => {
        return {
            subject_id: left.subject_id,
            first_name: left.first_name,
            last_name: left.last_name,
            test_id: right.test_id,
        };
    }
);
```

## Zip

Series and dataframes can be *zipped* together in the same was in LINQ. 

One or more additional series or dataframes can be passed to the `zip` function. You must provide a selector that combines the values from each series or dataframe:

```javascript
const zipped = df1.zip(df2, df3, (df1_row, df2_row) => mergeRows(df1_row, df2_row));
```

# Collapsing unique values

## Distinct values  

The `distinct` function for `Series` and `DataFrame` works very much like [LINQ Distinct](http://www.dotnetperls.com/distinct).

The dataframe version of this function must be supplied a *selector* that selects which column to use for comparison:

```javascript
const distinctDf = df.distinct(row => row.SomeColumn); // Compare 'SomeColumn' for distinct values.
```

The result is a `DataFrame` with duplicate rows removed. The first index for each group of duplicates is preserved. 

The series version of this function takes no parameters:

```javascript
const distinctSeries = series.distinct(); // Return only distinct values in the series.
```

The result is a series with duplicate values removed. The first index for each group of duplicates is preserved.

## Sequential distinct values

The `sequentialDistinct` function for `Series` and `DataFrame` is similar to `distinct`, but only operates on sequentially distinct values.

The resulting series or dataFrame has duplicate values or rows removed, but only where the duplicates where adjacent to each other in the data sequence. The first index for each group of sequential duplicates is preserved.

# Groups and windows

Data-Forge provides various methods for grouping data. All of these methods return a series of *windows*. Each window is a series or dataFrame containing grouped data. 

Use any of the [data transformation](#transformation) or [aggregation](#summarization-and-aggregation) functions to transform a series of windows into something else.

## Group

The `groupBy` function groups series or dataFrame based on the output of the user-defined *selector*. This works in the same way as [LINQ GroupBy](http://www.dotnetperls.com/groupby). 

For example, grouping a dataframe with sales data by client:

```javascript
const salesByClient = salesData.groupBy(row => row.ClientName);
```

This returns a series of data windows. Each window contains one group, each of which is a separate dataframe with only those rows that are part of the group as specified by the *selector*.

This can also be done with series:

```javascript
const outputSeries = series.groupBy(value => value); // Can potentially select a different value here.
```

The output is still a series of data windows. Each group contains a separate series with only those values that are part of the group as specified by *selector*.

## Group Sequential

The `groupSequentialBy` function for `Series` and `DataFrame` is similar to `groupBy`, except that it only groups adjacent values or rows in the data sequence.

```javascript
const outputSeries = series.groupSequentialBy(value => {
    return // ... your grouping criteria ...
});
```

## Window 

The `window` function groups a `Series` or `DataFrame` into equally sized batches. The *window* passes over the series or dataframe *batch-by-batch*, taking the first N rows for the first window, then the second N rows for the next window and so on. 

The output is a series of data windows. Each window contains the values or rows for that group.  

```javascript
const windowSize = 5; // Looking at 5 rows at a times.
const newSeries = series.window(windowSize); // Series that chunks the input series into groups of 5.
```

Use any of the [data transformation](#data-transformation) functions to transform the series of *windows* into something else.

An example that summarizes weekly sales data:

```javascript
const salesData = // ... series containing amount of sales for each day ...

const weeklySales = salesData.window(7) // Group into lots of 7 (for 7 days).
    .select(window => {
        return [                    // Return index and value.
            window.lastIndex(),     // Week ending.
            window.sum()            // Total the amount sold during the week.
        ]; 
    })
    .withIndex(pair => pair[0]) // Promote index.
    .select(pair => pair[1]); // Restore values.
```

Note that it's only necessary to 'promote the index' when we need to merge the resulting series with another series or dataframe that has the same index.

If you don't need to merge your data, the previous code snippet can be simplified drastically:

```javascript
const weeklySales = salesData.window(7).select(window => window.sum());
```

## Rolling window

The `rollingWindow` function groups a `Series` or `DataFrame` into batches, this function differs from `window` in that it *rolls* the *window* across the sequence *value-by-value* rather than batch-by-batch. 

The `percentChange` function that is included in Data-Forge is probably the simplest example use of `rollingWindow`. It computes a new series with the percentage increase of each subsquent value in the original series.

The implementation of `percentChange` looks a bit like this:

```javascript
function computePctChange (window) {
    const amountChange = window.last() - window.first(); // Compute amount of change.
    const pctChange = (amountChange / window.first()) * 100; // Compute % change.
    return pctChange;
}

const pctChangeSeries = series.rollingWindow(2).select(computePctChange);
```

`percentChange` is simple because it only considers a window size of 2 (eg it considers each adjacent pair of values).

Now consider an example that requires a configurable window size. Here is some code that computes a *simple moving average*:

```javascript
const smaPeriod = // ... configurable moving average period ...
const smaSeries = series.rollingWindow(smaPeriod).select(window => window.sum() / smaPeriod);
```

Who would have thought that computing a rolling average in JavaScript was so simple?

## Variable window

The `variableWindow` function groups a `Series` or `DataFrame` into windows that have a variable amount of values per window. Adjacent values and rows are compared using a user-defined [*comparer*](#comparer). When the *comparer* returns `true` (or *truthy*) adjacent data items are combined into the same group.

An example:

```javascript
const outputSeries = series.variableWindow((a, b) => {
    return // ... compare a and b for equality, return true if they are equal ...
}; 
```

# Summarization and Aggregation

## Aggregate

[Aggregation, reduction or summarization](https://en.wikipedia.org/wiki/Fold_(higher-order_function)) works as in LINQ.

Here's an example of the `aggregate` function to sum a series:

```javascript
const sum = series.aggregate(0, (prevValue, nextValue) => prevValue + nextValue);
```

Fortunately (as with LINQ) there is actually a `sum` function (among other helper functions) that can do this for you, it is actually built on `aggregate` so it's a nice (and simple) example. Using the `sum` function we rewrite the previous example as:

```javascript
const sum = series.sum();
```

Another good example is averaging a series where the first element in the series is used as the *seed*:

```javascript
const average = series
    .skip(1)
    .average(
        series.first(), // The seed 
        (prevValue, nextValue) => (prevValue + nextValue) / 2
    );
```

This can be simplified by building on `sum`:

```javascript
const average = series.sum() / series.count();
```

Again though there is already an `average` helper function that do this for us:

 ```javascript
const average = series.average();
```

Also check out the functions for `min`, `max` and `median`. These all help to summarise values in a series.

A dataframe can be aggregated in the same way, for example summarizing sales data:

```javascript
const salesData = // ... today's sales, including Price and Revenue ...
const seed = {
    TotalSales: 0,
    AveragePrice: salesData.first().AveragePrice,
    TotalRevenue: salesData.first().Revenue,
};
const summary = salesData
    .skip(1)
    .aggregate(seed, 
        (agg, row) => {
            return {
                TotalSales: agg.TotalSales + 1,
                AveragePrice: (agg.AveragePrice + row.Price) / 2,
                TotalRevenue: agg.TotalRevenue + row.Revenue,
            };
        }
    );
```

## Summarize

If you are looking to summarize the data in a dataframe you can use the `summarize` function which is a bit like the `aggregate` function but much simpler.

Summarization takes an input dataframe and produces a single object that is a summary of all the values in the dataframe.

To summarize all values in a dataframe, simply call `summarize` with no arguments:

```javascript
const summary = df.summarize();
console.log(summary);
```

We can add parameters to restrict which columns are summarized and how their values are aggregated. 

Summarize a single column as follows:

```javascript
const summary = df.summarize({
    ColumnToBeSummed: series => series.sum(),
});
console.log(summary);
```

But you probably want to summarize multiple columns:

```javascript
const summary = df.summarize({
    ColumnToBeSummed: series => series.sum(),
    ColumnToBeAveraged: series => series.average(),
});
```

We can simplify our code substantially by specifying the aggregation method as a named function:

```javascript
const summary = df.summarize({
    ColumnToBeSummed: Series.sum,
    ColumnToBeAveraged: Series.average,
    ColumnToBeCounted: Series.count,
});
```

By the way, you aren't limited to Data-Forge's pre-defined functions, you can easily create your own:

```javascript
function myAggregationFunction(someSeries) {
    return // ... your own summary of the series ...
}

const summary = df.summarize({
    SomeColumn: myAggregationFunction,
});
```

We can generalize the structure so far to the following pattern:

```javascript
const summary = df.summarize({
    Column1: functionThatAggregatesSeries,
    Column2: functionThatAggregatesSeries,
    ColumnN: ...,
});
```

We can take this further and produce multiple output columns from each input column:

```javascript
const summary = df.summarize({
    Column1: {
        Column1_Sum: series => series.sum(),
        Colum1_Avg: series => series.average(),
        Column1_Count: series => series.count(),
    },
    Column2: {
        Column2_Sum: series => series.sum(),
        Colum2_Avg: series => series.average(),
    },
});
```

Again we can simply provide references to functions that do the series aggregation for us:

```javascript
const summary = df.summarize({
    Column1: {
        Column1_Sum: Series.sum,
        Colum1_Avg: Series.average,
        Column1_Count: Series.count,
    },
    Column2: {
        Column2_Sum: Series.sum,
        Colum2_Avg: Series.average,
    },
});
```

Let's generalize a full pattern as follows:

```javascript
const summary = df.summarize({
    InputColumn1: {
        OutputField1: functionThatAggregatesSeries,
        OutputField2: functionThatAggregatesSeries,
        ...
    },
    InputColumn2: {
        OutputField3: functionThatAggregatesSeries,
        OutputField4: functionThatAggregatesSeries,
        ...
    },
    InputColumnN: ...
});
```

Now go forth and summarize your dataframes!

## Group and Aggregate

This an example of using `groupBy` and `aggregate` to summarize a dataframe:

```javascript
// Group by client.
const summarized = salesData
    .groupBy(row => row.ClientName)
    .select(group => ({
        ClientName: group.first().ClientName,
        Amount: group.deflate(row => row.Sales).sum(), // Sum sales per client.
    }))
    .inflate() // Series -> dataframe.
    .toArray(); // Convert to regular JS array.
```

Please see example 12 in the [Data-Forge examples repo](https://github.com/data-forge/data-forge-js-examples-and-tests) for a working version of this.

## Pivot

You can use the `pivot` function for advanced reshaping and transformation of a dataframe.

Pivoting combines grouping, aggregation and sorting operations into one simple function call.

Before you try and understand how to pivot a dataframe make sure you understand how to summarize a dataframe by reading the earlier Summarize section.

Here is the simplest example of a pivot that sums groups of values:

```javascript
const pivotted = df.pivot("ColumnToGroupBy", "ColumnToSum", series => series.sum());
```

This groups the dataframe by "ColumnToGroupBy" then for each group it aggregates the column "ColumnToSum" using the function `series => series.sum()`.

As with the `summarize` function we can simplify our code and specify the aggregation method using named functions, for example:

```javascript
const pivotted = df.pivot("ColumnToGroupBy", "ColumnToSum", Series.sum);
```

We can generalize this pattern of usage as follows:

```javascript
function functionThatAggregatesSeries(someSeries) {
    return // ... your own summary of the series ...
}

const pivotted = df.pivot("ColumnToGroupBy", "ColumnToAggregate", functionThatAggregatesSeries);
```

Perhaps the best way to understand what is happening is to expand out the `pivot` function, so we can see the underlying group, aggregation and sorting that `pivot` is doing for you:

```javascript
const pivottedDf = df.groupBy(row => row.PivotColumn)
    .select(group => ({
        PivotColumn: group.first().PivotColumn,
        ValueColumn: group.deflate(row => row.ValueColumn).average()
    }))
    .orderBy(row  => row.PivotColumn);
```

Just remember that we are still only looking at the simplest example of pivotting. We are about to go deeper. I won't show you further expanded examples of pivot, but just remember that all it's doing under the hood is *group, aggregate and sort*.

Now let's up the ante and use pivot to produce multiple output columns:

```javascript
const pivotted = df.pivot("ColumnToGroupBy", {
    ColumnToSum: series => series.sum(),
    ColumnToAverage: series => series.average(),
});
```

We can also use named functions to specify the aggregation method for each output:

```javascript
const pivotted = df.pivot("ColumnToGroupBy", {
    ColumnToSum: Series.sum,
    ColumnToAverage: Series.average,
});
```

The general pattern now look like this:

```javascript
const pivotted = df.pivot("ColumnToGroupBy", {
    Column1: functionThatAggregatesSeries,
    Column2: functionThatAggregatesSeries,
    ColumnN: ...
});
```

We can take this further still and produce multiple output columns for each input column:

```javascript
const pivotted = df.pivot("ColumnToGroupBy", {
    InputColumn1: {
        OutputColumn1: series => series.sum(),
        OutputColumn2: series => series.average(),
        ...
    },
    InputColumn1: {
        OutputColumn3: series => series.count(),
        ...
    },
    ...
});
```

Pivot also supports nested multi-level grouping by passing in an array of column names:

```javascript
const columnsToGroupBy = ["Column1", "Column2", "etc"];
const pivotted = df.pivot(columnsToGroupBy, {
    ... pivot spec ...
});
```

# Filling gaps and missing data

The function `fillGaps` works the same for both series and dataframes:

```javascript
const sequenceWithGaps = // ...

// Predicate that determines if there is a gap.
const gapExists = (pairA, pairB) => {
    // Returns true if there is a gap.
    return true;
};

// Generator function that produces new rows to fill the game.
const gapFiller = (pairA, pairB) => {
    // Create an array of index, value pairs that fill the gaps between pairA and pairB.        
    return [
        newPair1,
        newPair2,
        newPair3,
    ];
};

const sequenceWithoutGaps = sequenceWithGaps.fillGaps(gapExists, gapFiller);
```

For a more concrete example, let's fill gaps in daily stock-market data (with some help from [Moment.js](http://momentjs.com/)):

```javascript
const moment = require('moment');

const sequenceWithGaps = // ...

const gapExists = (pairA, pairB) => {
    // Return true if there is a gap longer than a day.
    const startDate = pairA[0];
    const endDate = pairB[0];
    const gapSize = moment(endDate).diff(moment(startDate), 'days');
    return gapSize > 1;
};

const gapFiller = (pairA, pairB) => {
    // Fill values forward.
    const startDate = pairA[0];
    const endDate = pairB[0];
    const gapSize = moment(endDate).diff(moment(startDate), 'days');
    const numEntries = gapSize - 1;

    const startValue = pairA[1];
    const newEntries = [];

    for (let entryIndex = 0; entryIndex < numEntries; ++entryIndex) {
        newEntries.push([
            moment(pairA[0]).add(entryIndex + 1, 'days').toDate(), // New index
            startValue // New value, copy the start value forward to fill the gaps. 
        ]);
    }	

    return newEntries;
}

const sequenceWithoutGaps = sequenceWithGaps.fillGaps(gapExists, gapFiller);
```

# Node.js examples

## Install

    npm install --save data-forge

## Working with a MongoDB collection

```javascript
const mongodb = require('mongodb');
const dataForge = require('data-forge');

mongodb.MongoClient.connect("mongodb://localhost")
    .then(client => {
        const db = client.db("some-db");
        const inputCollection = db.collection("some-collection");
        const outputCollection = db.collection("some-other-collection");

        return inputCollection.find()
            .toArray()
            .then(documents => {
                const input = new dataForge.DataFrame(documents);
                const output = input.select(row => transform(row));
                return outputCollection.insert(output.toArray());
            })
            .then(() => client.close());
    })
    .then(() => {
        console.log("Done");
    })
    .catch(err => {
        console.error(err);
    });
```

## Working with HTTP

```javascript
const request = require('request-promise');
const dataForge = require('data-forge');

request({
        method: 'GET',
        uri: "http://some-host/a/rest/api",
        json: true,
    })
    .then(data {
        const input = new dataForge.DataFrame(data);
        const output = input.select(row => transform(row));

        return request({
            method: 'POST',
            uri: "http://some-host/another/rest/api",
            body: { 
                data: output.toArray() 
            },
            json: true,
        });
    })
    .then(function () {
        console.log('Done!');
    })
    .catch(function (err) {
        console.error(err);
    });
```

# Browser examples

## Install

    bower install --save data-forge

## Working with HTTP in the browser

This example depends on the [jQuery](http://jquery.com/) [get function](https://api.jquery.com/jquery.get/). 

**Include in HTML**

```html
<script src="bower_components/jquery/dist/jquery.js"></script>
<script src="bower_components/data-forge/data-forge.js"></script>
```

**Javascript for JSON**

```javascript
const url = "http://somewhere.com/rest/api";
$.get(url, function (data) {
    const df = new dataForge.DataFrame(data);
    // ... work with the data frame ...
});

const df = ...
$.post(url, df.toArray(), function (data) {
    // ...
});
```

**Javascript for CSV**

```javascript
const url = "http://somewhere.com/rest/api";
$.get(url, function (data) {
    const df = dataForge.fromCSV(data);
    // ... work with the data frame ...
});

const df = ...
$.post(url, df.toCSV(), function (data) {
    // ...
});
```

## Working with HTTP in AngularJS

**Install**

    bower install --save data-forge

**Include in HTML**

```html
<script src="bower_components/angular/angular.js"></script>
<script src="bower_components/data-forge/data-forge.js"></script>
```

**Javascript**

```javascript
// Assume [$http](https://docs.angularjs.org/api/ng/service/$http) is injected into your controller.

const url = "http://somewhere.com/rest/api";
$http.get(url)
    .then(function (data) {
        const df = new dataForge.DataFrame(data);
        // ... work with the data frame ...			
    })
    .catch(function (err) {
        // ... handle error ...
    });

const df = ...
$http.post(url, df.toArray())
    .then(function () {
        // ... handle success ...
    })
    .catch(function (err) {
        // ... handle error ...
    });
```