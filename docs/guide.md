# The Data-Forge Guide

This is guide to using Data-Forge.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Project Overview](#project-overview)
- [Installation](#installation)
- [Key Concepts](#key-concepts)
- [A note about JavaScript anonymous functions](#a-note-about-javascript-anonymous-functions)
- [Basic Usage](#basic-usage)
  - [Getting data in](#getting-data-in)
  - [Get data back out](#get-data-back-out)
  - [Setting an index](#setting-an-index)
  - [Working with CSV files](#working-with-csv-files)
  - [Working with JSON files](#working-with-json-files)
  - [Working with REST APIs](#working-with-rest-apis)
  - [Parsing column values](#parsing-column-values)
  - [Stringifying column values](#stringifying-column-values)
- [Immutability and Chained Functions](#immutability-and-chained-functions)
- [Lazy Evaluation](#lazy-evaluation)
- [Working with data](#working-with-data)
- [Data exploration and visualization](#data-exploration-and-visualization)
- [Sorting](#sorting)
- [Transformation](#transformation)
- [Filtering](#filtering)
- [Data subsets](#data-subsets)
- [Combining](#combining)
- [Collapsing unique values](#collapsing-unique-values)
- [Groups and windows](#groups-and-windows)
- [Summarization and Aggregation](#summarization-and-aggregation)
- [Filling gaps and missing data](#filling-gaps-and-missing-data)
- [Other Node.js examples](#other-nodejs-examples)
- [Browser examples](#browser-examples)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Project Overview

A short overview of the aims, principles and implementation methods for this project.

## Project Aims

The aims of this project:

- To combine the best aspects of [Pandas](https://en.wikipedia.org/wiki/Pandas_(software)) and [LINQ](https://en.wikipedia.org/wiki/Language_Integrated_Query) and make them available in JavaScript.
- To be able to load, transform and save data.
- To be able to prepare data for visualization. 
- To be able to work with massive data files (although it's not quite there yet).

## Driving Principles 

The principles that drive decision making and tradeoffs:

- The API should be simple, easy to learn and easy to use.
- Intellisense in Visual Studio Code (or other IDE) should make using the API a breeze.
- Minimize the magic, everything should be understandable, the API should be orthogonal.
- The library should have high performance.
- The TypeScript or JavaScript code you build during exploratory coding should be easily transplantable to a webapp, server or microservice (the main reason to use JavaScript for your data, rather than Python).

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

Require the module into your JavaScript code:

	var dataForge = require('data-forge');

Or import the entire module in TypeScript:

    import * as dataForge from 'data-forge';

Or just import classes and functions in TypeScript:

    import { readFile, Series, DataFrame } from 'data-forge';

## Browser installation and setup

Install via [Bower](https://en.wikipedia.org/wiki/Bower_(software)):

	bower install --save data-forge

Include the main script in your HTML file:

	<script src="bower_components/data-forge/data-forge.js"></script>

You can now use data-forge through the global `dataForge` variable.

## Getting the code

Install via NPM or Bower as described in previous sections or clone, fork or download the code from GitHub:

[https://github.com/data-forge/data-forge-ts](https://github.com/data-forge/data-forge-ts)


# Key Concepts

The concepts section has been moved to [a separate file](docs/concepts.md).

# A note about JavaScript anonymous functions

Use of Data-Forge benefits heavily on the use of JavaScript anonymous functions. For most of the examples in this guide I use the JavaScript [arrow syntax](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/Arrow_functions) that was introduced in [ES6](https://en.wikipedia.org/wiki/ECMAScript#ES6).

An example of an arrow syntax anonymous function:

	(param1, param2) => 1 + 1

However this can't be consisently used in the browser and in those cases so please make sure you use the traditional syntax where necessary:

	function (param1, param2) {
		return 1 + 1;
	}

# Basic Usage 

## Getting data in

### DataFrame

A *dataframe* represents a sequence of tabular data. That is to say that it contains multiple named *series*, or *columns* of data. You can think of it like a JavaScript array but with extra operations, support for columns and lazily evaluated.

The `DataFrame` constructor is passed a *config* object that specifies the initial contents of the dataframe and additional options. 

Create a data frame from column names and rows:

	var dataframe = new dataForge.DataFrame({
			columnNames: ["Col1", "Col2", "Col3"],
			rows: [
				[1, 'hello', new Date(...)],
				[5, 'computer', new Date(...)],
				[10, 'good day', new Date(...)]
			]
		});

A dataframe can also be created from an array of JavaScript objects and the column names are inferred from the fields in the first object that it sees:

	var dataframe = new dataForge.DataFrame({
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

If you don't need additional options, you can simply pass in an array of objects:

	var dataframe = new dataForge.DataFrame([
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

If you have irregular data you can enable *considerAllRows*, but be warned that this can be expensive as every value must be examined to determine column names:

	var dataframe = new dataForge.DataFrame({
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

A dataframe can also be constructed from separate columns as follows using arrays or Series objects:

	var dataframe = new dataForge.DataFrame({
        columns: {
            Col1: [1, 2, 3, 4],
            Col2: ['a', 'b', 'c', 'd'],
            Col3: new dataForge.Series(...),
        },
    });
	   
### Series

A series is a sequence of values, again a bit like a JavaScript array but with more options. `DataFrame` and `Series` are very similar and share many functions. A `DataFrame` is actually a collection of names series.

Very similar to creating a `DataFrame`, pass a *configuration* object to the `Series` constructor with the values and  additional options:

	var series = new dataForge.Series({
        values: [1, 2, 3]
    });

If you don't need additional options you can simply pass in an array of values:

	var series = new dataForge.Series([1, 2, 3]);

## Geting data out

### DataFrame

To get back the names of columns:

	var columnNames = dataframe.getColumnNames();

To get back an array of objects (with column names as field names):

	var objects = dataframe.toArray();

To get back an array of rows (arrays of values in column order):

	var rows = dataframe.toRows();

To get back index and value pairs:

	var pairs = dataframe.toPairs(); 

Because a dataframe is also an *iterable* you can iterate it using `for...of`:

    for (const value of dataframe) {
        // ... do something with value ...
    }

There's also a forEach function:

    dataframe.forEach(value => {
        // ... do something with value ...
    });

### Series

To retreive the data from Series as an array:

	var values = series.toArray();

To get back index and value pairs:

	var pairs = series.toPairs(); 

A series can also be iterated:

    for (const value of series) {
        // ... do something with value ...
    }

And of course, there's a forEach function:

    series.forEach(value => {
        // ... do something with value ...
    });

## Setting an index

So why is DataFrame and Series special? How they are different from a JavaScript array?

Well besides that they both have many useful functions for slicing and dicing your data, they can both be *indexed* by values other than numbers. They both support efficient lookup, merging and aggregation of your data based on the index.

In the previous examples of creating dataframes and series no index was specified, in those cases a default zero-based index was generated (just like with a normal JavaScript array).

An index can be set explicitly when creating a series or dataframe:

	var dataFrame = new dataForge.DataFrame({
			values: <initial-values>,
			index: [5, 10, 100, ...and so on...]
		});

	var series = new dataForge.Series({
			values: <initial-values>,
			index: [5, 10, 100, ...and so on...]
		});

An index can be any type that you want. For example time series data will index by `Date`:

	var timeSeries = new dataForge.Series({
			values: <initial-values>,
			index: [new Date(...), new Date(...), ...and so on...]
		});

A new index can easily be assigned to either Series or DataFrame using the `withIndex` function:

	var dataFrameWithNewIndex = dataFrame.withIndex([1, 2, 3, ...]);

Most likely when using a DataFrame you will want to promote an existing column to an index:
 
	var dataFrame = new dataForge.DataFrame(someConfig).setIndex("Col3");

Be aware that promoting a column to an index in Data-Forge doesn't remove the column (as it does in Pandas), however you can easily achieve this by calling `dropSeries`:

	var dataFrame = new dataForge.DataFrame(someConfig).setIndex("Col3").dropSeries("Col3");

An index is required for certain operations like `merge`.

## Working with CSV files

NOTE: Data-Forge us the NodeJS `fs` module, this doesn't work in the browser which has no access to the local file system.

### Reading CSV files

If your CSV has a header with column names:

	var dataFrame = dataForge
		.readFileSync('some-csv-file.csv')
		.parseCSV()
		;

If your CSV doesn't have a header:

	var csvOptions = { columnNames: ["some", "explicit", "column", "names"] };

	var dataFrame = dataForge
		.readFileSync('some-csv-file.csv')
		.parseCSV(csvOptions)
		;

### Writing CSV files

	dataFrame.asCSV().writeFileSync('some-other-csv-file.csv');

### Working with CSV data

If you already have CSV data (loaded into a string) you can parse it into a dataframe via `fromCSV`:

	var inputCsvData = ... some string with CSV data ...
	var dataFrame = dataForge.fromCSV(inputCsvData);

You can stringify a dataframe by calling `toCSV`:

	var outputCsvData = dataFrame.toCSV();

## Working with JSON files

NOTE: Data-Forge us the NodeJS `fs` module, this doesn't work in the browser which has no access to the local file system.

### Reading JSON files

	var dataFrame = dataForge
		.readFileSync('some-json-file.json')
		.parseJSON()
		;

### Writing JSON files

	dataFrame.asJSON().writeFileSync('some-json-file.json');

### Working with JSON data

If you already have JSON data (loaded into a string) you can parse it into a dataframe via `fromJSON`:

	var inputJsonData = ... some string with JSON data ...
	var dataFrame = dataForge.fromJSON(inputJsonData);

You can stringify a dataframe by calling `toJSON`:

	var outputJsonData = dataFrame.toJSON();

## Parsing column values

Often when you load data from a file you will need to parse string values in specific columns to particular types. This is especially true for CSV files which contain only string data once loaded. It is less true for JSON files which can store values as numbers, although the JSON format has no native date format, so when you load JSON files you will still need parse the dates.

Data-Forge has various helper functions for parsing string values: `parseInts`, `parseFloats` and `parseDates`.

You can call these on a `Series`, for example:

	var stringSeries = new dataForge.Series(["15", "16"]);
	assert.isString(stringSeries.first());

	var parsedSeries = stringSeries.parseInts();
	assert.isNumber(parsedSeries.first()); 

To call these functions on a `DataFrame` you must pass in the name of the column that is to be parsed, for example say you load from a CSV (which loads in string data) and want to parse a particuar column:

	var stringDataFrame = dataForge.fromCSV("Column1\n15\n16");
	assert.isString(stringDataFrame.first().Column1);

	var parsedDataFrame = stringDataFrame.parseInts("Column1");
	assert.isNumber(parsedDataFrame.first().Column1);

You can also specify an array of column names to be parsed:	 

	var parsedDataFrame = stringDataFrame.parseInts(["Column1", "Column2"]);
	assert.isNumber(parsedDataFrame.first().Column1);
	assert.isNumber(parsedDataFrame.first().Column2);

When parsing dates you specify an optional format string that specifies the format of the dates to be parsed:

	var stringDataFrame = dataForge.fromCSV("Column1\n2016-09-25\n2016-10-25");
	var parsedDataFrame = stringDataFrame.parseDates("Column1", "YYYY-MM-DD");

Data-Forge uses [Moment.js](http://momentjs.com/) under the hood, please see its docs for valid formatting syntax. 

## Stringifying column values 

When you are saving out data files or displaying data on screen you will often want to transform values in specific columns to particular types. For numbers this happens automatically, but this is essential when formatting dates for output, for example:

	var dataFrame = ...
	assert.instanceof(dataFrame.first().Column1, Date);
	
	var stringifiedDataFrame = dataFrame.toStrings("Column1", "YYYY-MM-DD");
	assert.isString(stringifiedDataFrame.first().Column1); 

Data-Forge uses [Moment.js](http://momentjs.com/) under the hood, please see its docs for valid formatting syntax. 

# Immutability and Chained Functions

You may have noticed in previous examples that multiple functions have been chained.

Data-Forge supports only [immutable](https://en.wikipedia.org/wiki/Immutable_object) operations. Each operation returns a new immutable dataframe or series. No *in place* operations are supported (one of the things I found confusing about *Pandas*). 

This is why, in the following example, the final dataframe is captured after all operations are applied:

	var df = new dataForge.DataFrame(config).setIndex("Col3").dropSeries("Col3");

Consider an alternate structure:

	var df1 = new dataForge.DataFrame(config);
	var df2 = df1.setIndex("Col3");
	var df3 = df2.dropSeries("Col3");

Here *df1*, *df2* and *df3* are separate dataframes with the results of the previous operations applied. These dataframes are all immutable and cannot be changed. Any function that transforms a dataframe returns a new and independent dataframe. If you are not used to this sort of thing, it may require some getting used to!

# Lazy Evaluation

Lazy evaluation in Data-Forge is implemented through *iterators*. 

An iterator is retrieved from a dataframe or series by calling `getIterator`. A new and distinct iterator is created each time `getIterator` is called.

For example:

	var iterator = dataFrame.getIterator();

Or

	var iterator = series.getIterator();

Or 

	var iterator = index.getIterator();

An iterator can be used to traverse a sequence and extract each index+value pair in turn.

	var iterator = something.getIterator();
	while (iterator.moveNext()) {
		var pair = iterator.getCurrent();
		// do something with the pair.
	}

# Working with data

## Extracting rows from a data-frame

Values can be extracted from a dataframe in several ways.

NOTE: the following functions cause lazy evaluation to complete (like the *toArray* function in LINQ). This can be performance intensive.

To extract rows as arrays of data (ordered by column): 

	var arrayOfArrays = dataFrame.toRows();

To extract rows as objects (with column names as fields):

	var arrayOfObjects = dataFrame.toArray();

To extracts index + row pairs:

	var arrayOfPairs = dataFrame.toPairs();

A new data-frame can also be created from a *between* of rows:

	var startIndex = ... // Starting row index to include in subset. 
	var endIndex = ... // Ending row index to include in subset.
	var rowSubset = dataFrame.between(startIndex, endIndex);

NOTE: To use `between` your index must already be sorted.

Invoke a callback for each row in a dataframe using `forEach`:

	dataFrame.forEach(function (row) {
		// Callback function invoked for each row.
	}); 

## Extracting columns and series from a data-frame

Get the names of the columns:

	var arrayOfColumnNames = dataFrame.getColumnNames();

Get a Series of all columns:

	var columns = dataFrame.getColumns();
	var arrayOfColumns = columns.toArray();

	for (var column in columns) {
		var name = column.name;
		var series = column.series;
		// ... do something with the column ...
	}

The advantage to having a Series of columns, rather than a normal JavaScript array is that you can access  all the tools that Series offers for slicing and dicing a sequence, for example:

	var sortedColumnsSubject = dataFrame.getColumns()
		.where(column => column.name !== "Date")
		.skip(2)
		.take(3)
		.orderBy(column => column.name)
		;

Get the series for a column by name:

	var series = dataFrame.getSeries('some-series'); 

Create a new data-frame from a subset of columns:

	var columnSubset = df.subset(["Some-Column", "Some-Other-Column"]);

## Extract values from a series

NOTE: the follow functions cause lazy evaluation to complete (like the *toArray* function in LINQ). This can be performance intensive.

Extract the values from the series as an array:   

	var arrayOfValues = someSeries.toArray();

Extract index + value pairs from the series as an array:

	var arrayOfPairs = someSeries.toPairs();

Invoke a callback for each value in the series using `forEach`:

	someSeries.forEach(function (value) {
		// Callback function invoked for each value.
	}); 

## Extract values from an index

Retrieve the index from a dataframe:

	var index = dataFrame.getIndex();

Retrieve the index from a series:

	var index = someSeries.getIndex();

An index is actually just another Series so you can call the `toArray` function or anything else that normally works for a Series:

	var arrayOfIndexValues = index.toArray();

## Adding a column

New columns can be added to a dataframe. This doesn't change the original dataframe, it generates a new one with the additional column.

	var newDf = df.withSeries("Some-New-Column", someNewSeries);

## Replacing a column

`withSeries` can also replace an existing column:

	var newDf = df.withSeries("Some-Existing-Column", someNewSeries);

Again note that it is only the new data frame that includes the modified column.

## Generating a column

`withSeries` can be used to generate a new column from an existing data frame by passing in a function: 

	var newDf = df.withSeries("Some-New-Column", 
		df => df.getSeries("Some-Existing-Column")
			.select(value => transformValue(value))
	);

There is a also a convenient `generateSeries` function:

	var newDf = df.generateSeries({
			"Some-New-Column": function (row) {
				return row["Some-Existing-Column"];
			},
		});


## Transforming a column

`withSeries` can be used to transform an existing column by passing in a function:

	var newDf = df.withSeries("Some-Existing-Column", 
		df => df.getSeries("Some-Existing-Column")
			.select(row => transformValue(row))
	);

There is also a convenient `transformSeries` function:

	var newDf = df.transformSeries({
		"Some-Existing-Column": row => transformValue(row), 
	);

## Adding, replacing, generating and transforming multiple columns 

Any of the previous examples of `withSeries` can work with multiple columns by passing in a *column spec*, the following example adds two new 

	var columnSpec = {
		Column1: df => computeColumn1(df),
		Column2: df => computeColumn2(df),
	};

	var newDf = df.withSeries(columnSpec);

This syntax can be used to add, generate and transform any number of colums at once.
	
## Removing columns

One or more columns can easily be removed:

	var newDf = df.dropSeries(['col1', 'col2']);

Also works for single columns:

	var newDf = df.dropSeries('Column-to-be-dropped');

Alternatively you can select the columns to keep and drop the rest:

	var newDf = df.subset(["Column-to-keep", "Some-other-column-to-keep"]);

## Getting a row or value by index

A particular value of a Series or a row of a DataFrame can be retrieved by specifying the index using the `at` function:

	var dataFrame = ...

	// Get a row at index 10.
	var row = dataFrame.at(10);

	// Also works when the index is a different type, eg a time-series index.
	var row = dataFrame.at(new Date(2016, 5, 22));

This works in the same way for a series. 

## Setting a row of value by index
 
A particular value of a Series or a row of DataFrame can be set by specifying the index using the `set` function:

	var dataFrame = ...
	var newRow = ...

	// Set the row and produce a new DataFrame.
	var newDataFrame = dataFrame.set(10, newRow);

Series and DataFrame are immutable, so the set operation does not modify in place, it returns a new Series or DataFrame with the original unchanged.

# Data exploration and visualization

In order to understand the data we are working with we must explore it, understand the data types involved and the composition of the values.

## Console output

DataFrame and Series provide a `toString` function that can be used to dump data to the console in a readable format.

Use the LINQ functions `skip` and `take` to preview a subset of the data (more on LINQ functions soon):

	// Skip 10 rows, then dump 20 rows.
	console.log(df.skip(10).take(20).toString()); 

Or more conveniently: 

	// Get a range of rows starting at row index 10 and ending at (but not including) row index 20.
	console.log(df.between(10, 20).toString()); 

As you explore a data set you may want to understand what data types you are working with. You can use the `detectTypes` function to produce a new data frame with information on the data types in the dataframe you are exploring:

	// Create a data frame with details of the types from the source data frame.
	var typesDf = df.detectTypes(); 
	console.log(typesDf.toString());

For example, here is the output with data from Yahoo:

	__index__  		  Type    Frequency  Column
	----------------  ------  ---------  ---------
	0                 date    100        Date
	1                 number  100        Open
	2                 number  100        High
	3                 number  100        Low
	4                 number  100        Close
	5                 number  100        Volume
	6                 number  100        Adj Close

You also probably want to understand the composition of values in the data frame. This can be done using `detectValues` that examines the values and reports on their frequency: 

	// Create a data frame with the information on the frequency of values from the source data frame.
	var valuesDf = df.detectValues(); 
	console.log(valuesDf.toString());

## HTML output

Use the `toHTML` function to output a Series or DataFrame as a HTML table. This is useful when using an exploratory coding tool like Jupyter or for quickly displaying a table in a web app.

## Visual output

The [Github repo](https://github.com/data-forge/data-forge-js) has [examples](https://github.com/data-forge/data-forge-js/tree/master/examples) showing how to use *data-forge* with [Flot](http://www.flotcharts.org/).

There is a [Code Project article](http://www.codeproject.com/Articles/1069489/Highstock-plus-Data-Forge-plus-Yahoo) on using Highstock with Data-Forge to chart Yahoo financial data.

# Sorting

Series and dataframes can be sorted using the LINQ-style functions: `orderBy` and `orderByDescending`.

	var sortedAscending = dataFrame.orderBy(row => row.SomeColumn);

	var sortedDescending = dataFrame.orderByDescending(row => row.SomeColumn);

Use `thenBy` and `thenByDescending` to specify additional sorting criteria:

	var sorted = dataFrame
		.orderBy(row => row.SomeColumn)
		.thenByDescending(row => row.AnotherColumn)
		.orderBy(row => row.SomeOtherColumn)
		;

# Transformation

## Data frame transformation

A dataframe can be transformed using the [LINQ](https://en.wikipedia.org/wiki/Language_Integrated_Query)-style [`select`](http://www.dotnetperls.com/select) function:

	var transformedDataFrame = sourceDataFrame
		.select(function (row) {
			return {
				NewColumn: row.OldColumn * 2,	// <-- Transform existing column to create a new column.
				AnotherNewColumn: rand(0, 100)	// <-- Create a new column (in this cause just use random data).
			};
		});

This produces an entirely new immutable dataframe. However the new dataframe has the same index as the source dataframe, so both can be merged back together, if required. 

Note that `select` only transforms the value. The index for each row is preserved in the new DataFrame. To completely transform a DataFrame, both value and index, you must use `asPairs`:

	var transformedDataFrame = sourceDataFrame
		.asPairs() // Transform to sequence of pairs.
		.select(function (pair) {
			return [ // Returns a new pair.
				... some new index ...,
				... some new row ...
			];
		})
		.asValues() // Transform back to a sequence of values.
		;

Note that `selectMany` and `selectManyPairs` functions are also available and work the same as LINQ SelectMany.

## Series transformation

Series can be transformed using `select`:

	var oldSeries = df.getSeries("Some-Column");
	var newSeries = oldSeries
		.select(function (value) {
			// Apply a transformation to each value in the column.
			return transform(value); 	
		});	

	// Plug the modified series back into the data-frame.
	var newDf = df.withSeries("Some-Column", newSeries);

The source index is preserved to the transformed series.

Use `selectPairs` to transform both value and index:  

	var newSeries = oldSeries
		.asPairs()
		.select(function (pair) {
			return [ // Returns a new pair.
				... some new index ...,
				... some new value ...
			];
		})
		.asValues()
		;	

The result of `select` and `selectPairs` is a completely new immutable Series.

## Transform a series in a dataframe

Data-Frame offers a convenience function `transformSeries` for when you need a simple convenient mechanism to extract, transform and plug back in one or more series at once. For example to simplify the previous code example:

	var newDf = df.transformSeries({
		Some-Column: function (value) {
			// Apply a transformation to each value in the series.
			return transform(value); 	
		},
	);

# Filtering

Dataframes and series can be filtered using the [LINQ](https://en.wikipedia.org/wiki/Language_Integrated_Query)-style [`where`](http://www.dotnetperls.com/where) function:

	var newDf = df.where(somePredicateFunction);

The predicate function must return *truthy* to keep the row, or *falsy* to filter it out, for example:

	var newDf = df
		.where(function (row) {
			return row.SomeColumn > 10l
		});

# Data subsets

There are multiple ways to extract a subset of data from a series or dataframe.

At the most basic `skip` and `take` allow a specified number of values to be skipped or taken.

	var newSubset = someSeries.skip(10).take(15); 

`head` and `tail` are handy functions that can extract X elements at the start or end of the sequence:

	var firstTenValues = someSeries.head(10);

	var lastFiveValues = someSeries.tail(5);

A bit more advanced are `skipWhile`, `takeWhile`, `skipUntil` and `takeUntil`. These all skip or take values according to the boolean result of a predicate function:

	var newSeries = someSeries.skipWhile(row => somePredicate(row));

More sophisticated again a `startAt`, `endAt`, `after`, `before` and `between`. These are functions intelligently filter values based on the index. Note that your index must already be sorted to use these functions. `startAt` retreives all values starting at a particular index. `endAt` retreives all values ending at a particular index (inclusive). `after` retreives all values after a particluar index (exclusive). `before` retreives all values before a particular index (exclusive). Finally `between` retreives all values between two indexes (inclusive).

# Combining

## Concatenation

Series and dataframes can be concatenated:

	var df1 = ... some dataframe ...
	var df2 = ... some other dataframe ...

	var concatenated = df1.concat(df2);

Multiple series or dataframes may be passed to concat:

	var concatenated = df1.concat(df2, df3, df4, etc);

Or an array may be used:

	var toConcat = [df2, df3, df4, etc];
	var concatenated = df1.concat(toConcat); 

You can also concatenate by passing an array of series or dataframes to the global data-forge functions `concatSeries` or `concatDataFrames`: 

	var toConcat = [df1, df2, df3, df4, etc];
	var concatenated = dataForge.concatDataFrames(toConcat);

## Join

Series and dataframes can be merged or joined using the `join` function as in LINQ.  This performs an inner join. Data-Forge also has additional functions for outer joins: `joinOuter`, `joinOuterLeft` and `joinOuterRight`. Thanks to [Ryan Hatch for the implementation](http://blogs.geniuscode.net/RyanDHatch/?p=116).

Following is [an example translated from Pandas code on Chris Albon's blog](http://chrisalbon.com/python/pandas_join_merge_dataframe.html). You can find more such examples of Data-Forge in *merge-dataframe.test.js*.

	var df_a = new dataForge.DataFrame({
		columnNames: [
			'subject_id',
			'first_name',
			'last_name',
		],
		values: [
			[1, 'Alex', 'Anderson'],
			[2, 'Amy', 'Ackerman'],
			// ... and more.
		],
	});

	var df_b = new dataForge.DataFrame({
		columnNames: [
			'subject_id',
			'first_name',
			'last_name',
		],
		values: [
			[4, 'Billy', 'Bonder'],
			[5, 'Brian', 'Black'],
			// ... and more.
		],
	});

	var df_n = new dataForge.DataFrame({
		columnNames: [
			"subject_id",
			"test_id",
		],
		values: [
			[1, 51],
			[2, 15],
			// .. and more.
		],
	});

	var df_new = df_a.concat(df_b);
	var df_merged = df_new.join(
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
		)
		;

## Zip

Series and dataframes can be *zipped* together in the same was in LINQ. 

One or more additional series or dataframes can be passed to the `zip` function. You must provide a selector that combines the values from each series or dataframe:

	var zipped = df1.zip(df2, df3, (df1_row, df2_row) => myRowMergeFunction(df1_row, df2_row));

# Collapsing unique values

## Distinct values  

The `distinct` function for `Series` and `DataFrame` works very much like [LINQ Distinct](http://www.dotnetperls.com/distinct).

The `DataFrame` version must be supplied a *selector* that selects which column to use for comparison:

	var distinctDataFrame = someDataFrame.distinct(function (row) {
			reutrn row.SomeColumn; // Compare 'SomeColumn' for unique values.
		});

The result is a `DataFrame` with duplicate rows removed. The first index for each group of duplicates is preserved. 

The `Series` version takes no parameters:

	var distinctSeries = someSeries.distinct();

The result is a `Series` with duplicate values removed. The first index for each group of duplicates is preserved.

## Sequential distinct values

The `sequentialDistinct` function for `Series` and `DataFrame` is similar to `distinct`, but only operates on sequentially distinct values.

The resulting `Series` or `DataFrame` has duplicate values or rows removed, but only where the duplicates where adjacent to each other in the data sequence. The first index for each group of sequential duplicates is preserved.

# Groups and windows

Data-Forge provides various methods for grouping data. All of these methods return a `Series` of *windows*. Each window is a `Series` or `DataFrame` containing grouped data. 

Use any of the [data transformation](#transformation) or [aggregation](#summarization-and-aggregation) functions to transform a `Series` of windows into something else.

## Group

The `groupBy` function groups `Series` or `DataFrame` based on the output of the user-defined *selector*. This works in very much the same way as [LINQ GroupBy](http://www.dotnetperls.com/groupby). 

For example, grouping a `DataFrame` with sales data by client:

	var salesByClient = salesData.groupBy(function (row) {
			return row.ClientName;
		});

This returns a `Series` of data windows. Each windows contains a separate `DataFrame` with only those rows that are part of the group as specified by the *selector*.

This can also be done with `Series`:

	var outputSeries = someSeries.groupBy(function (value) {
			return value; // Can potentially select a different value here.
		});

The output is still a `Series` of data windows. Each group contains a separate `Series` with only those values that are part of the group as specified by *selector*.

## Group Sequential

The `groupSequentialBy` function for `Series` and `DataFrame` is similar to `groupBy`, except that it only groups adjacent values or rows in the data sequence.

	var outputSeries = someSeriesOrDataFrame.groupSequentialBy(function (valueOrRow, index) {
			return ... grouping criteria ...
		});


## Window 

The `window` function groups a `Series` or `DataFrame` into equally sized batches. The *window* passes over the data-frame or series *batch-by-batch*, taking the first N rows for the first window, then the second N rows for the next window and so on. 

The output is a `Series` of windows. Each windows contains the values or rows for that group.  

	var windowSize = 5; // Looking at 5 rows at a times.
	var newSeries = seriesOrDataFrame.window(windowSize);

Use any of the [data transformation](#data-transformation) functions to transform the `Series` of *windows* into something else.

An example that summarizes weekly sales data:

	var salesData = ... series containing amount sales for each business day ...

	var weeklySales = salesData.window(7)
		.asPairs()
		.select(function (pair) { // Rewrite index and value.			
			var window = pair[1];
			return [
				window.lastIndex(), 	// Week ending.
				window.sum()			// Total the amount sold during the week.
			]; 
		})
		.asValues()
		;

## Rolling window

The `rollingWindow` function groups a `Series` or `DataFrame` into batches, this function however differs from `window` in that it *rolls* the *window* across the sequence *row-by-row* rather than batch-by-batch. 

The `percentChange` function that is included in Data-Forge is probably the simplest example use of `rollingWindow`. It computes a new series with the percentage increase of each subsquent value in the original series.

The implementation of `percentChange` looks a bit like this:
    
	var pctChangeSeries = sourceSeries.rollingWindow(2)
		.asPairs()
		.select(function (pair) {
			var window = pair[1];
			var values = window.toArray();
			var amountChange = values[1] - values[0]; // Compute amount of change.
			var pctChange = amountChange / values[0]; // Compute % change.

			// Return new index and value.
			return [
				window.lastIndex(), 
				pctChange
			]; 
		})
		.asValues()
		;
   
`percentChange` is simple because it only considers a window size of 2 (eg it considers each adjacent pair of values).

Now consider an example that requires a configurable window size. Here is some code that computes a *simple moving average* (derived from *[data-forge-indicators](https://github.com/data-forge/data-forge-indicators)*):

	var Enumerable = require('linq');

	var smaPeriod = ... configurable moving average period ...
 	var smSeries = someSeries.rollingWindow(smaPeriod)
	 	.asPairs()
		.select(function (pair) {
			var window = pair[1];
    		return [
				window.lastIndex(),
				window.sum() / smaPeriod,
    	})
		.asValues()
		;

## Variable window

The `variableWindow` function groups a `Series` or `DataFrame` into windows that have a variable amount of values per window. Adjacent values and rows are compared using a user-defined [*comparer*](#comparer). When the *comparer* returns `true` (or *truthy*) adjacent data items are combined into the same group.

An example:

	var outputSeries = someSeriesOrDataFrame.variableWindow(function (a, b) {
			return ... compare a and b for equality, return true if they are equal ...
		}; 

The [`sequentialDistinct` function](#sequential-distinct-values) is actually implemented using `variableWindow` so it is a good example:

	var sequentialDistinct = function (valueSelector) {

		var self = this;	
		return self.variableWindow(function (a, b) {
				return valueSelector(a) === valueSelector(b);
			});
	};

# Summarization and Aggregation

## Aggregate

[Aggregation, reduction or summarization](https://en.wikipedia.org/wiki/Fold_(higher-order_function)) works as in LINQ.

Here's an example of the `aggregate` function to sum a series:

	var sum = inputSeries.aggregate(0, (prevValue, nextValue) => prevValue + nextValue);

Fortunately (as with LINQ) there is actually a `sum` function (among other helper functions) that can do this for you, it is actually built on `aggregate` so it's a nice (and simple) example. Using the `sum` function we rewrite the previous example as:

	var sum = inputSeries.sum();

Another good example is averaging a series where the first element in the series is used as the *seed*:

	var average = inputSeries
		.skip(1)
		.average(
			inputSeries.first(), // The seed 
			(prevValue, nextValue) => (prevValue + nextValue) / 2
		);

This can be simplified by building on `sum`:

	var average = inputSeries.sum() / inputSeries.count();

Again though there is already an `average` helper function that do this for us:

	var average = inputSeries.average();

Also check out the functions for `min`, `max` and `median`. These all help to summarise values in a series.

A dataframe can be aggregated in the same way, for example summarizing sales data:

	var dataFrame = ... today's sales, including Price and Revenue ...
	var seed = {
		TotalSales: 0,
		AveragePrice: dataFrame.first().AveragePrice,
		TotalRevenue: dataFrame.first().Revenue,
	};
	var summary = dataFrame
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

I'm considering a new structure as well that will make `aggregate` more convenient for summarizing dataframes. Please let me know if this would be useful to you and I'll implement it:

	var dataFrame = ...
	var summary = dataFrame.aggregate({
			TotalSales: df => df.count(),
			AveragePrice: df => df.deflate(row => row.Price).average(),
			TotalRevenue: df => df.deflate(row => row.Revenue).sum(), 
		});

Or even better if I could make it work something like this:

	var dataFrame = ...
	var summary = dataFrame.aggregate({
			TotalSales: count,
			AveragePrice: average,
			TotalRevenue: sum, 
		});

## Group and Aggregate

This an example of using `groupBy` and `aggregate` to summarize a dataframe:

	// Group by client.
	var summarized = salesData
		.groupBy(row => row.ClientName)
		.select(group => ({
			ClientName: group.first().ClientName,

			// Sum sales per client.
			Amount: group.select(row => row.Sales).sum(),
		}))
		.inflate() // Series -> dataframe.
		.toArray(); // Convert to regular JS array.

Please see example 13 in the [Data-Forge examples repo](https://github.com/data-forge/data-forge-js-examples-and-tests) for a working version of this.

# Filling gaps and missing data

The function `fillGaps` works the same for both Series and DataFrame:

	var sequenceWithGaps = ...

	// Predicate that determines if there is a gap.
	var gapExists = function (pairA, pairB) {
		// Returns true if there is a gap.
		return true;
	};

	// Generator function that produces new rows to fill the game.
	var gapFiller = function (pairA, pairB) {
		return [
			newPair1,
			newPair2,
			newPair3,
		];
	}

	var sequenceWithoutGaps = sequenceWithGaps.fillGaps(gapExists, gapFiller);

For a more concrete example, let's fill gaps in daily share data (with some help from [Moment.js](http://momentjs.com/)):

	var moment = require('moment');

	var sequenceWithGaps = ...

	var gapExists = function (pairA, pairB) {
		// Return true if there is a gap longer than a day.
		var startDate = pairA[0];
		var endDate = pairB[0];
		var gapSize = moment(endDate).diff(moment(startDate), 'days');
		return gapSize > 1;
	};

	var gapFiller = function (pairA, pairB) {
		// Fill values forward.
		var startDate = pairA[0];
		var endDate = pairB[0];
		var gapSize = moment(endDate).diff(moment(startDate), 'days');
		var numEntries = gapSize - 1;

		var startValue = pairA[1];
		var newEntries = [];

		for (var entryIndex = 0; entryIndex < numEntries; ++entryIndex) {
			newEntries.push([
				moment(pairA[0]).add(entryIndex + 1, 'days').toDate(), // New index
				startValue // New value, copy the start value forward to fill the gaps. 
			]);
		}	

		return newEntries;
	}

	var sequenceWithoutGaps = sequenceWithGaps.fillGaps(gapExists, gapFiller);
	

# Other Node.js examples

## Working with a massive CSV file

WARNING: This section doesn't work yet. I'm look at performance with large files soon. 

When working with large text files use *FileReader* and *FileWriter*. *FileReader* is an iterator, it allows the specified file to be loaded piecemeal, in chunks, as required. *FileWriter* allows iterative output. These work in combination with lazy evaluation so to incrementally read, process and write massive files that are too large or too slow to work with in memory in their entirety.  

	var dataForge = require('data-forge');
	var FileReader = require('data-forge/file-reader');
	var FileWriter = require('data-forge/file-writer');

	var inputFilePath = "input-file.csv";
	var outputFilePath = "output-file.csv";

	// Read the file as it is processed.	
	var inputDataFrame = dataForge.from(new FileReader(inputFilePath));

	var outputDataFrame = inputDataFrame.select(... some transformation ...);

	dataForge.to(new FileWriter(outputDataFrame)); 
 

## Working with a MongoDB collection

	var pmongo = require('promised-mongo');
	var db = pmongo('localhost/some-database', ['someCollection', 'someOtherCollection']);

	db.someCollection.find().toArray()
		.then(function (documents) {
			var inputDataFrame = new dataForge.DataFrame({ rows: documents });

			var outputDataFrame = inputDataFrame.select(... some transformation ...);

			return db.someOtherCollection.insert(outputDataFrame.toArray());			
		})
		.then(function () {
			console.log('Done!');
		})
		.catch(function (err) {
			console.error(err);
		});

## Working with a massive MongoDB collection

Same as previous example, except use skip and take to only process a window of the collection.

	var pmongo = require('promised-mongo');
	var db = pmongo('localhost/some-database', ['someCollection', 'someOtherCollection']);

	db.someCollection.find()
		.skip(300)
		.limit(100)
		.toArray()		
		.then(function (documents) {
			var inputDataFrame = new dataForge.DataFrame({ rows: documents });

			var outputDataFrame = inputDataFrame.select(... some transformation ...);

			return db.someOtherCollection.insert(outputDataFrame.toArray());			
		})
		.then(function () {
			console.log('Done!');
		})
		.catch(function (err) {
			console.error(err);
		});

## Working with HTTP

	var request = require('request-promise');

	request({
			method: 'GET',
			uri: "http://some-host/a/rest/api',
			json: true,
		})
		.then(function (data) {
			var inputDataFrame = new DataFrame({ rows: data });

			var outputDataFrame = inputDataFrame.select(... some transformation ...);
			
			return request({
				method: 'POST',
				uri: "http://some-host/another/rest/api',
				body: { 
					data: outputDataFrame.toArray() 
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

# Browser examples

## Working with HTTP in the browser

This example depends on the [jQuery](http://jquery.com/) [get function](https://api.jquery.com/jquery.get/). 

Note the differences in the way plugins are referenced than in the NodeJS version.

**HTML**

	<script src="bower_components/jquery/dist/jquery.js"></script>
	<script src="bower_components/data-forge/data-forge.js"></script>

**Javascript for JSON**

	var url = "http://somewhere.com/rest/api";
	$.get(url, function (data) {
		var dataFrame = new dataForge.DataFrame({ rows: data });
		// ... work with the data frame ...
	});

	var someDataFrame = ...
	$.post(url, someDataFrame.toArray(), function (data) {
		// ...
	});
	
**Javascript for CSV**

	var url = "http://somewhere.com/rest/api";
	$.get(url, function (data) {
			var dataFrame = dataForge.fromCSV(data);
			// ... work with the data frame ...
	});

	var someDataFrame = ...
	$.post(url, someDataFrame.toCSV(), function (data) {
		// ...
	});


## Working with HTTP in AngularJS

**HTML**

	<script src="bower_components/angular/angular.js"></script>
	<script src="bower_components/data-forge/data-forge.js"></script>

**Javascript**

	// Assume [$http](https://docs.angularjs.org/api/ng/service/$http) is injected into your controller.

	var url = "http://somewhere.com/rest/api";
	$http.get(url)
		.then(function (data) {
			var dataFrame = new dataForge.DataFrame(data);
			// ... work with the data frame ...			
		})
		.catch(function (err) {
			// ... handle error ...
		});

	var someDataFrame = ...
	$http.post(url, someDataFrame.toArray())
		.then(function () {
			// ... handle success ...
		})
		.catch(function (err) {
			// ... handle error ...
		});
