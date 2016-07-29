'use strict';

var gdal = require('gdal');
var path = require('path');

function kmlSplit(file, options, callback) {

  if (!callback && typeof options === 'function') {
    var callback = options;
  }

  var paths = file.split('/');
  var sourceName = path.basename(file, '.kml');
  var outDir = options.outDir || file.replace(paths[paths.length-1], '');
  var maxLayers = options.maxLayers || 15;

  var datasource;
  var wgs84;
  try  {
    wgs84 = gdal.SpatialReference.fromEPSG(4326);
    datasource = gdal.open(file);
  } catch (err) {
    return callback(err);
  }

  var layerCount = datasource.layers.count();
  if (layerCount < 1) {
    datasource.close();
    return callback(new Error('KML does not contain any layers.'));
  }
  if (layerCount <= maxLayers) {
    datasource.close();
    return callback(new Error('Maximum layers is larger than layer count. Nothing to do.'));
  }

  var files = [];
  var sinkCount = 1;
  var datasink = createSink(outDir, sourceName, sinkCount);
  files.push(sinkName(outDir, sourceName, sinkCount));
  var count = 1;
  datasource.layers.forEach(function(layer) {
    var name = layer.name;

    // write the layer to the current datasink
    var newLayer = datasink.layers.create(name, wgs84, layer.geomType);
    layer.features.forEach(function(feature) {
      var geom = feature.getGeometry();
      if (!geom) return;
      else {
        if (geom.isEmpty()) return;
        if (!geom.isValid()) return;

        newLayer.features.add(feature);
      }
    });
    newLayer.flush();

    if (count !== 1 && count % maxLayers === 0) {
      sinkCount++;
      files.push(sinkName(outDir, sourceName, sinkCount));
      datasink.flush();
      datasink.close();
      datasink = null;
      datasink = createSink(outDir, sourceName, sinkCount);
    }

    if (count === layerCount) {
      datasink.flush();
      datasink.close();
      datasink = null;
    }

    count++;
  });

  datasource.close();
  return callback(null, files);
}

function sinkName(out, name, count) {
  return path.join(out, name + '-' + count + '.kml');
}

function createSink(out, name, count) {
  return gdal.open(sinkName(out, name, count), 'w', 'KML');
}

module.exports = kmlSplit;