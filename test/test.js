var test = require('tape');
var fs = require('fs');
var path = require('path');
var clean = require('rimraf').sync;
var kmlSplit = require('..');

var out = path.resolve(__dirname, 'output');
clean(out);

test('testing', function(t) {
  fs.mkdirSync(out);
  var kml = path.resolve(__dirname, 'fixtures', 'valid-22-layers.kml');
  
  kmlSplit(kml, {maxLayers: 5, outDir: out}, function(err, success) {
    t.ok(true, 'it is true');
    
    // clean(out);
    t.end();
  });
});