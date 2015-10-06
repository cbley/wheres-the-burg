/* global toastr */

var utils = require('../utils');
var styles = require('./styles');
var getDirections = require('../directions/getDirections');
// var directionsLayer = require('./directionsLayer');
// var directionsSet = require('./directionsSet');

var nearest = require('turf-nearest');
var inside = require('turf-inside');
var moment = require('moment');

module.exports = DirectionsMap;

function DirectionsMap(mapDivId, points, range) {
  this.pointsLayer = this.createPointsLayer(points, styles.interestPoints);
  this.pointsLayer.on('click', this.onDestinationClick.bind(this));
  this.directionLayers = L.layerGroup();
  this.points = points;
  this.range = range;

  this.map = L.mapbox.map(mapDivId, 'mapbox.streets-basic');
  this.map.setView([40.278, -76.871], 13);

  this.map.addLayer(this.pointsLayer);
  this.map.addLayer(this.directionLayers);

  this.locationLayer = L.layerGroup();
  this.locateControl = L.control.locate({
    layer: this.locationLayer,
    follow: false,
    setView: false,
    onLocationError: utils.noop,
    locateOptions: {
      watch: false,
      timeout: 5000
    }
  }).addTo(this.map);

  this.map.on('locationfound', this.onLocationFound.bind(this));
  this.map.on('locationerror', this.onLocationError.bind(this));
  this.locateControl.start();
}

DirectionsMap.prototype.setUserLocation = function setUserLocation(latlng) {
  this.userLocation = latlng;
  this.addUserPoint(latlng);
  var nearestPoint = this.findNearest(latlng);
  this.addDirections(latlng, nearestPoint);
};

DirectionsMap.prototype.onLocationFound = function onLocationFound(location) {
  this.locateControl.stop();
  var insideDistributionArea = inside(utils.latLngToPoint(location.latlng), this.range);
  if (insideDistributionArea) {
    this.setUserLocation(location.latlng);
  } else {
    this.setErrorAndPlace("Your location doesn't seem to be within The Burg's distribution area.\n" +
      "We're going to drop you in the middle of Harrisburg so you can play with the app.");
  }
};

DirectionsMap.prototype.onLocationError = function onLocationError() {
  this.setErrorAndPlace('There was a problem getting your location, ' +
    "so we're going to drop you in Harrisburg.");
};

DirectionsMap.prototype.setErrorAndPlace = function setErrorAndPlace(message) {
  toastr.error(message);
  this.setUserLocation(L.latLng([40.2658, -76.8876]));
};

DirectionsMap.prototype.onDragEnd = function onDragEnd(event) {
  var latlng = event.target._latlng;
  this.setUserLocation(latlng);
  this.locateControl.stop();
};

DirectionsMap.prototype.addUserPoint = function addClickPoint(latlng) {
  if (!this.userPoint) { // first load
    this.userPoint = L.marker(latlng, {
      icon: L.mapbox.marker.icon({
        'marker-symbol': 'star',
        'marker-size': 'medium',
        'marker-color': '1f67c4'
      }),
      draggable: true
    }).bindLabel('Hey! You can drag me!', {
      noHide: true,
      direction: 'left',
      offset: [17, -30]
    }).addTo(this.map);

    var self = this;
    setTimeout(function setTimeout() {
      self.userPoint.hideLabel();
    }, 5000);

    this.userPoint.on('dragend', this.onDragEnd.bind(this));
    this.userPoint.on('click', function onClick() {
      self.userPoint.showLabel();

      setTimeout(function setTimeout() {
        self.userPoint.hideLabel();
      }, 2000);
    });
  } else {
    this.userPoint.setLatLng(latlng);
    this.userPoint.update();
  }
};

DirectionsMap.prototype.addDirections = function addDirections(origin, nearestPoint) {
  this.getDirections(origin, nearestPoint, function gotDirections(err, result) {
    if (err) {
      throw err;
    }

    this.mapDirections(result);
  }.bind(this));
};

DirectionsMap.prototype.mapDirections = function mapDirections(result) {
  this.directionLayers.clearLayers();

  var route = utils.extendedRouteFromResult(result);
  var routeLayer = L.geoJson(route.geometry, {
    style: styles.shortestRoute
  });

  var labelText = result.destination.properties.name + '<br>' +
    moment.duration(result.directions.routes[0].duration, 'seconds').humanize();

  var destinationMarker = L.marker(utils.pointToLatLng(result.destination), {
    icon: L.MakiMarkers.icon(styles.nearestPoints)
  }).bindLabel(labelText, {
    noHide: true,
    clickable: true,
    className: 'on-top-of-the-world',
    direction: 'auto',
    offset: [17, -30],
    opacity: 0.80
  });

  this.directionLayers.addLayer(routeLayer);
  this.directionLayers.addLayer(destinationMarker);

  this.map.fitBounds(utils.boundsFromDirectionResults(result), {
    padding: [20, 20],
    maxZoom: 18
  });
};

DirectionsMap.prototype.getDirections = function addDirections(origin, nearestPoint, cb) {
  var originPoint = utils.latLngToPoint(origin);
  var waypoints = utils.pointsToFeatureCollection([originPoint, nearestPoint]);
  return getDirections(waypoints, cb);
};

DirectionsMap.prototype.findNearest = function findNearest(latlng) {
  var point = utils.latLngToPoint(latlng);
  return nearest(point, this.points);
};

DirectionsMap.prototype.createPointsLayer = function createPointsLayer(points, style) {
  return  L.mapbox.featureLayer(points, {
    pointToLayer: function pointToLayer(feature, latlng) {
      return pointToLayerWithStyle(feature, latlng, style);
    }
  });
};

DirectionsMap.prototype.onDestinationClick = function onDestinationClick(event) {
  // TODO can we get the feature from the event?
  var nearestFeature = nearest(utils.latLngToPoint(event.latlng), this.points);
  this.addDirections(this.userLocation, nearestFeature);
};

function pointToLayerWithStyle(feature, latlng, style) {
  return L.marker(latlng, {
    icon: L.MakiMarkers.icon(style)
  });
}
