var accessToken = require('./mapboxAccessToken');
var DirectionsMap = require('./map/directionsMap');
var data = require('./data');

L.mapbox.accessToken = accessToken;

/* eslint-disable no-unused-vars */
var map = new DirectionsMap('map', data.burgPoints, data.burgRange);
/* eslint-enable no-unused-vars */
