# Data-Forge

The JavaScript data transformation and analysis toolkit inspired by Pandas and LINQ.

*Implemented* in TypeScript.<br>
*Used* in JavaScript ES5+ or TypeScript.

<a target="_blank" href="https://www.data-forge-notebook.com/"><img align="right" src="images/support2.png"></a>

To learn more about Data-Forge [visit the home page](http://data-forge-js.com/).

Want to get in touch? Please see my contact details at the end.

[![Build Status](https://travis-ci.org/data-forge/data-forge-ts.svg?branch=master)](https://travis-ci.org/data-forge/data-forge-ts)
[![Coverage Status](https://coveralls.io/repos/github/data-forge/data-forge-ts/badge.svg?branch=master)](https://coveralls.io/github/data-forge/data-forge-ts?branch=master)
[![npm version](https://badge.fury.io/js/data-forge.svg)](https://badge.fury.io/js/data-forge)
[![License](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
[![Issues](http://img.shields.io/github/issues/data-forge/data-forge-ts.svg)](https://github.com/data-forge/data-forge-ts/blob/master/issues)


**Please note** that this TypeScript repository replaces the [previous JavaScript version of Data-Forge](https://github.com/data-forge/data-forge-js).

## BREAKING CHANGES

As of v1.6.9 the dependencies Sugar, Lodash and Moment have been factored out (or replaced with smaller dependencies). This more than halves the bundle size. Hopefully this won't cause any problems - but please log an issue if something changes that you weren't expecting.

<a target="_blank" href="http://bit.ly/2t2cJu2"><img align="right" src="images/support3.png"></a>

As of v1.3.0 file system support has been removed from the Data-Forge core API. This is after repeated issues from users trying to get Data-Forge working in the browser, especially under AngularJS 6.

Functions for reading and writing files have been moved to the separate code library [Data-Forge FS](https://github.com/data-forge/data-forge-fs).

If you are using the file read and write functions prior to 1.3.0 then your code will no longer work when you upgrade to 1.3.0. The fix is simple though, where usually you would just require in Data-Forge as follows:

```javascript
const dataForge = require('data-forge');
```

Now you must also require in the new library as well:

```javascript
const dataForge = require('data-forge');
require('data-forge-fs');
```

Data-Forge FS augments Data-Forge core so that you can use the readFile/writeFile functions as in previous versions and as is shown in this readme and the guide.

If you still have problems with AngularJS 6 please see this workaround:
https://github.com/data-forge/data-forge-ts/issues/3#issuecomment-438580174

## Install

To install for Node.js and the browser:

    npm install --save data-forge

If working in Node.js and you want the functions to read and write data files:

    npm install --save data-forge-fs

## Quick start

Data-Forge can load CSV, JSON or arbitrary data sets. 

Parse the data, filter it, transform it, aggregate it, sort it and much more.

Use the data however you want or export it to CSV or JSON.

Here's an example:

```JavaScript
const dataForge = require('data-forge');
require('data-forge-fs'); // For readFile/writeFile.

dataForge.readFileSync('./input-data-file.csv') // Read CSV file (or JSON!)
    .parseCSV()
    .parseDates(["Column B"]) // Parse date columns.
    .parseInts(["Column B", "Column C"]) // Parse integer columns.
    .parseFloats(["Column D", "Column E"]) // Parse float columns.
    .dropSeries(["Column F"]) // Drop certain columns.
    .where(row => predicate(row)) // Filter rows.
    .select(row => transform(row)) // Transform the data.
    .asCSV() 
    .writeFileSync("./output-data-file.csv"); // Write to output CSV file (or JSON!)
```

## From the browser

Data-Forge has been tested with Browserify and Webpack. Please see links to examples below.

If you aren't using Browserify or Webpack, the npm package includes a pre-packed browser distribution that you can install and included in your HTML as follows:

```html
<script language="javascript" type="text/javascript" src="node_modules/data-forge/dist/web/index.js"></script>
```

This gives you the data-forge package mounted under the global variable `dataForge`.

Please remember that you can't use data-forge-fs or the file system functions in the browser.

## Features

- Import and export CSV and JSON data and text files (when using [Data-Forge FS](https://github.com/data-forge/data-forge-fs)).
- Or work with arbitrary JavaScript data.
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

## Contributions

Want a bug fixed or maybe to improve performance?

Don't see your favourite feature?

Need to add your favourite Pandas or LINQ feature?

Please contribute and help improve this library for everyone!

Fork it, make a change, submit a pull request. Want to chat? See my contact details at the end or reach out on Gitter.



## Platforms

- Node.js (npm install --save data-forge data-forge-fs) ([see example here](https://github.com/data-forge/data-forge-examples-and-tests/tree/master/package-test/npm))
- Browser
    - Via bower (bower install --save data-forge) ([see example here](https://github.com/data-forge/data-forge-examples-and-tests/tree/master/package-test/bower))
    - Via Browserify ([see example here](https://github.com/data-forge/data-forge-examples-and-tests/tree/master/examples/2.%20plot%20-%20in%20browser))
    - Via Webpack ([see example here](https://github.com/data-forge/data-forge-examples-and-tests/tree/master/examples/3.%20plot%20-%20in%20browser%20-%20with%20dates))

## Documentation

- [Changes](docs/changes.md)
- [The guide](docs/guide.md)
- [Key concepts](docs/concepts.md)
- [API docs](https://data-forge.github.io/data-forge-ts/)
- [FS API docs](https://data-forge.github.io/data-forge-fs/index.html)
- [Data-Forge FS](https://github.com/data-forge/data-forge-fs/)
- [Data-Forge Plot](https://github.com/data-forge/data-forge-plot/)
- [Gitter](https://gitter.im/data-forge)

## Resources

- [The Data Wrangler](http://www.the-data-wrangler.com/)
- [Data Wrangling with JavaScript](http://bit.ly/2t2cJu2)
- [Data-Forge Notebook](http://www.data-forge-notebook.com/)

## Contact

Please reach and tell me what you are doing with Data-Forge or how you'd like to see it improved.

- Twitter: @ashleydavis75
- Email: ashley@codecapers.com.au
- Linkedin: www.linkedin.com/in/ashleydavis75
- Web: www.codecapers.com.au