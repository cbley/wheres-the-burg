var coordReduce = require('turf-meta').coordReduce;

module.exports = formatPoints;

function formatPoints(points) {
  return coordReduce(points, reduce, []).join(';');
}

function reduce(memo, value) {
  memo.push(value.join(','));
  return memo;
}
