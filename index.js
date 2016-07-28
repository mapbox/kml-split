'use strict';

var gdal = require('gdal');

function kmlSplit(file, options, callback) {
  var paths = file.split('/');
  var sourceName = paths[paths.length-1].replace('.kml', '');
  var outDir = options.outDir || file.replace(paths[paths.length-1], '');
  var options = options || {};
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
    return callback('KML does not contain any layers.');
  }
  if (layerCount <= maxLayers) {
    datasource.close();
    return callback('Maximum layers is larger than layer count. Nothing to do.');
  }

  var sinkCount = 1;
  var datasink = createSink(outDir, sourceName, sinkCount);
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
  return callback(null, layerCount);
}

function createSink(out, name, count) {
  return gdal.open(out+'/'+name+'-'+count+'.kml', 'w', 'KML');
}

module.exports = kmlSplit;