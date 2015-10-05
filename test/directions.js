var tape = require('tape');
var fs = require('fs');
var formatPoints = require('../src/directions/formatPoints');
var getDirections = require('../src/directions/getDirections');

var points = JSON.parse(fs.readFileSync('./test/points.geojson'));

tape('format points', function test(t) {
  var formattedPoints = formatPoints(points);
  t.equal(formattedPoints, '-76.88,40.27;-75.16,39.93;-77.03,38.9');
  t.end();
});

tape('call api', function(t) {
  getDirections(points)
    .then(function then(result) {
      t.ok(result, 'Should get result back from api');
    }).done(function done() {
      t.end();
    });
});
