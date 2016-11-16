# kml-split

Split KML files with many layers into separate files. Go from `1 KML file with 20 layers` to `4 KML files with 5 layers`. Uses Node GDAL to read KML sources and create KML sinks.

# Usage

### Install

```
# package.json
npm install @mapbox/kml-split --save

# globally
npm install @mapbox/kml-split -g
```

### `kmlSplit(file, options, callback)`

Example

```javascript
var kmlSplit = require('@mapbox/kml-split');

kmlSplit('./path/to/file.kml', {maxLayers: 5}, function(err, res) {
  if (err) throw err;
  console.log(res); // => array of file paths for newly created files
});
```

Options

* `maxLayers`: the maximum number of layers per file (default: `15`)
* `outDir`: output directory for the newly created files (defaults to the current directory)

### CLI

```
kml-split <file> -l/--layers -o/--output
```

Example

```
kml-split my-awesome.kml -l 15 -o ../../output/files
```

# Test

```
npm test
```
