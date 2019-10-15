/* eslint-disable max-len */
var fs = require('fs');
var os = require('os');
var path = require('path');
var env = process.env;

function is(it) {
  return !!it && it !== '0' && it !== 'false';
}

var ADBLOCK = is(env.ADBLOCK);
var CI = is(env.CI);
var COLOR = is(env.npm_config_color);
var DISABLE_OPENCOLLECTIVE = is(env.DISABLE_OPENCOLLECTIVE);
var SILENT = ['silent', 'error', 'warn'].indexOf(env.npm_config_loglevel) !== -1;
var MINUTE = 60 * 1000;

var BANNER = '\u001B[96mThanks for using Data-Forge! See the home page for help and to support the developer: \u001B[94m http://data-forge-js.com/ \u001B[96m\u001B[0m\n\n';

function isBannerRequired() {
  if (ADBLOCK || CI || DISABLE_OPENCOLLECTIVE || SILENT) return false;
  var file = path.join(os.tmpdir(), 'df-banners');
  var banners = [];
  try {
    var DELTA = Date.now() - fs.statSync(file).mtime;
    if (DELTA >= 0 && DELTA < MINUTE * 3) {
      banners = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (banners.indexOf(BANNER) !== -1) return false;
    }
  } catch (error) {
    banners = [];
  }
  try {
    banners.push(BANNER);
    fs.writeFileSync(file, JSON.stringify(banners), 'utf8');
  } catch (error) { /* empty */ }
  return true;
}

function showBanner() {
  console.log(COLOR ? BANNER : BANNER.replace(/\u001B\[\d+m/g, ''));
}

if (isBannerRequired()) showBanner();