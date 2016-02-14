var fs = require('fs'),
    fsTools = require('fs-tools'),
    _ = require('lodash')

var EXPECTED = ['cartodb_id', 'created_at', 'name', 'updated_at'];


function getExpectedKeys(geoJsonFilePath){
  var metaDataPath = geoJsonFilePath.replace('geojson', 'metadata.json');
  var data = JSON.parse(fs.readFileSync(metaDataPath, 'utf8'));
  var languages = _.values(data.languages);
  return _.uniq(EXPECTED.concat(languages)).sort();
}

function validateFile(filePath){
  var expectedKeys = getExpectedKeys(filePath);

  var data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  var oldKeys = [];
  var keys;
  data.features.forEach(function(feature){
    keys = Object.keys(feature.properties);
    if (_.difference(keys, oldKeys).length){
      if (!oldKeys.length){ // this is the first time
        oldKeys = keys;
      }
      else {
        console.warn('>>>', filePath, ' properties are not all the same');
      }
    }
  });
  return _.difference(oldKeys, expectedKeys);
}


fsTools.findSorted('public/data', /[^.]+\.geojson/, function(err, files) {
  var fullPath;
  files.forEach(function(filename){
    if (_.includes(filename, '_work-in-progress')){
      return;
    }
    fullPath =  __dirname + '/' + filename
    var difference = validateFile(fullPath);
    if (difference.length){
      console.log(filename, 'contains additional fields: ', difference);
    }
  });
});
