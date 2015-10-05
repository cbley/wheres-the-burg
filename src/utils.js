var geojsonExtent = require('geojson-extent');
var R = require('ramda');

module.exports = {
  latLngToPoint: latLngToPoint,
  pointToLatLng: pointToLatLng,
  pointsToFeatureCollection: pointsToFeatureCollection,
  boundsFromDirectionResults: boundsFromDirectionResults,
  getLayerById: getLayerById,
  extendedRouteFromResult: extendedRouteFromResult,
  noop: noop
};

function latLngToPoint(latlng) {
  return {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'Point',
      'coordinates': [
        latlng.lng,
        latlng.lat
      ]
    }
  };
}

function pointToLatLng(point) {
  return {
    lng: point.geometry.coordinates[0],
    lat: point.geometry.coordinates[1]
  };
}

function pointsToFeatureCollection(points) {
  return {
    'type': 'FeatureCollection',
    'features': points
  };
}

function boundsFromDirectionResults(results) {
  var extent = geojsonExtent(results.directions.routes[0].geometry);

  return L.latLngBounds(
    L.latLng(extent[1], extent[0]),
    L.latLng(extent[3], extent[2])
  ).pad(0.25);
}

function extendedRouteFromResult(result) {
  var newRoute = R.clone(result.directions.routes[0]);

  newRoute.geometry.coordinates = [result.origin.geometry.coordinates].concat(newRoute.geometry.coordinates);
  newRoute.geometry.coordinates = newRoute.geometry.coordinates.concat([result.destination.geometry.coordinates]);

  return newRoute;
}

function getLayerById(map, layerId) {
  var result;
  map.eachLayer(function eachLayer(layer) {
    if (layer.id === layerId) {
      result = layer;
    }
  });

  return result;
}

function noop() { }
