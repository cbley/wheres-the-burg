var corslite = require('corslite');
var R = require('ramda');

var accessToken = require('../mapboxAccessToken');
var formatPoints = require('./formatPoints');

var baseUrl = 'https://api.mapbox.com/v4/directions/mapbox.walking/';

module.exports = getDirections;

function getDirections(points, cb) {
  var url = baseUrl +
    formatPoints(points) + '.json' +
    '?access_token=' + accessToken +
    '&alternatives=false' +
    '&instructions=html';

  corslite(url, function callback(err, resp) {
    if (err) {
      cb(new Error(err));
    }

    var directions = JSON.parse(resp.response);
    var result = {
      origin: points.features[0],
      destination: R.last(points.features),
      directions: directions
    };
    cb(null, result);
  });
}
