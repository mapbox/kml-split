#!/usr/bin/env node

var argv = require('yargs').argv;
var fs = require('fs');
var kmlSplit = require('..');

console.log(argv);

var inFile = argv._[0];
if (!inFile) {
  console.log('No input file received.');
  process.exit(1);
}

try {
  fs.statSync(inFile);
} catch(err) {
  console.log('Cannot read the input file. Please make sure your path is correct.');
  process.exit(1);
}

var options = {};
if (argv.l || argv.layers) options.maxLayers = argv.l || argv.layers;
if (argv.o || argv.output) options.outDir = argv.o || argv.output;

kmlSplit(inFile, options, function(err, res) {
  if (err) throw err;
  console.log('Successfully split KML files!\n');
  res.forEach(function(f) {
    console.log(f);
  });
  process.exit(0);
});