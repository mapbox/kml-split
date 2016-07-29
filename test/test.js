var test = require('tape');
var fs = require('fs');
var path = require('path');
var clean = require('rimraf').sync;
var kmlSplit = require('..');
var gdal = require('gdal');

var wgs84;
var out = path.resolve(__dirname, 'output');
clean(out);

test('successfully splits layers', function(t) {
  fs.mkdirSync(out);
  var kml = path.resolve(__dirname, 'fixtures', 'valid-22-layers.kml');
  
  kmlSplit(kml, {maxLayers: 5, outDir: out}, function(err, response) {

    t.equal(response.length, 5, 'callback array is proper length');

    response.forEach(function(f) {
      t.ok(fs.statSync(f), 'file written successfully')
    });

    var datasource;
    try  {
      wgs84 = gdal.SpatialReference.fromEPSG(4326);
      datasource = gdal.open(path.resolve(__dirname, 'output', 'valid-22-layers-1.kml'));
    } catch (err) {
      throw err;
    }

    t.equal(datasource.layers.count(), 5, 'has proper number of layers');
    var count = 1;
    datasource.layers.forEach(function(layer) {
      t.equal(layer.name, 'Layer_'+count, 'layer name is correct yay');
      count++;
    });

    datasource.close();

    clean(out);
    t.end();
  });
});

test('works fine without passing options', function(t) {
  fs.mkdirSync(out);
  var kml = path.resolve(__dirname, 'fixtures', 'valid-22-layers.kml');
  
  kmlSplit(kml, function(err, response) {
    t.notOk(err, 'no error');
    t.ok(response, 'successfull response');
    clean(out);
    t.end();
  });
});

test('errors with invalid kml file (broken tags)', function(t) {
  fs.mkdirSync(out);
  var kml = path.resolve(__dirname, 'fixtures', 'invalid.kml');
  
  kmlSplit(kml, {maxLayers: 5, outDir: out}, function(err, success) {
    t.ok(err);
    t.ok(err.message.indexOf('Error opening dataset') > -1, 'proper error message');
    clean(out);
    t.end();
  });
});

test('does not split if maxLayers is larger than total layers', function(t) {
  fs.mkdirSync(out);
  var kml = path.resolve(__dirname, 'fixtures', 'valid-22-layers.kml');
  
  kmlSplit(kml, {maxLayers: 25, outDir: out}, function(err, success) {
    t.ok(err);
    t.ok(err.message.indexOf('Maximum layers is larger than layer count.') > -1, 'proper error message');
    clean(out);
    t.end();
  });
});

test('kml contains no layers', function(t) {
  fs.mkdirSync(out);
  var kml = path.resolve(__dirname, 'fixtures', 'no-layers.kml');
  
  kmlSplit(kml, function(err, success) {
    t.ok(err);
    t.ok(err.message.indexOf('KML does not contain any layers.') > -1, 'proper error message');
    clean(out);
    t.end();
  });
});