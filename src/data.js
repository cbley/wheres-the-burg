var fs = require('fs');
var path = require('path');

var points = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'burg.geojson'), 'utf-8'));
var range = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'range.geojson'), 'utf-8'));

module.exports = { burgPoints: points, burgRange: range };
