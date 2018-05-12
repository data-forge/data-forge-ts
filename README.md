# Data-Forge

The JavaScript data transformation and analysis toolkit inspired by Pandas and LINQ.

Implemented in TypeScript, used in JavaScript ES5+ or TypeScript.

Why not do your data wrangling, analysis and visualization entirely in JavaScript? To support my effort please buy or help promote my book 
[Data Wrangling with JavaScript](http://bit.ly/2t2cJu2).

Or check out my blog: [The Data Wrangler](http://www.the-data-wrangler.com/).

[![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/data-forge/data-forge-ts/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/Naereen/StrapDown.js.svg)](https://GitHub.com/data-forge/data-forge-ts/issues/)

<!--todo:
!! Made with TypeScript.
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Linux Build][travis-image]][travis-url]
[![Windows Build][appveyor-image]][appveyor-url]
[![Test Coverage][coveralls-image]][coveralls-url]
-->

## Install

    npm install --save data-forge

## Quick start

Data-Forge can load CSV, JSON or arbitrary data sets. 

Parse the data, filter it, transform it, aggregate it, sort it and much more.

Use the data however you want or export it to CSV or JSON.

Here's an example:

```JavaScript
const dataForge = require('data-forge');
dataForge.readFile('./input-data-file.csv') // Read CSV file (or JSON!)
    .parseCSV()
    .parseDates(["Column B"]) // Parse date columns.
    .parseInts(["Column B", "Column C"]) // Parse integer columsn.
    .parseFloats(["Column D", "Column E"]) // Parse float columns.
    .dropSeries(["Column F"]) // Drop certain columns.
    .where(row => predicate(row)) // Filter rows.
    .select(row => transform(row)) // Transform the data.
    .asCSV() 
    .writeFile("./output-data-file.csv") // Write to output CSV file (or JSON!)
    .then(() => {
        console.log("Done!");
    })
    .catch(err => {
        console.log("An error occurred!");
    });
```

## Features

- Import and export CSV and JSON data and text files.
- Also work with arbitrary JavaScript data.
- Many options for working with your data:
    - Filtering
    - Transformation
    - Extracting subsets
    - Grouping, aggregation and summarization
    - Sorting
    - And much more
- Great for slicing and dicing tabular data:
    - Add, remove, transform and generate named columns (series) of data.
- Great for working with time series data.
- Your data is indexed so you have the ability to merge and aggregate.
- Your data is immutable! Transformations and modifications produce a new dataset.
- Build data pipeline that are evaluated lazily.
- Inspired by Pandas and LINQ, so it might feel familiar!


## Documentation

- [Changes](docs/changes.md)
- [The guide](docs/guide.md)
- [Key concepts](docs/concepts.md)
- [API docs](https://data-forge.github.io/data-forge-ts/)

## Resources

- [The Data Wrangler](http://www.the-data-wrangler.com/)
- [Data Wrangling with JavaScript](http://bit.ly/2t2cJu2)


<!--todo:
[npm-image]: https://img.shields.io/npm/v/express.svg
[npm-url]: https://www.npmjs.com/package/data-forge
[downloads-image]: https://img.shields.io/npm/dm/express.svg
[downloads-url]: https://npmjs.org/package/express
[travis-image]: https://img.shields.io/travis/expressjs/express/master.svg?label=linux
[travis-url]: https://travis-ci.org/expressjs/express
[appveyor-image]: https://img.shields.io/appveyor/ci/dougwilson/express/master.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/dougwilson/express
[coveralls-image]: https://img.shields.io/coveralls/expressjs/express/master.svg
[coveralls-url]: https://coveralls.io/r/expressjs/express?branch=master
--->