var EPSILON = 0.0000000001;

exports.linearInterpolate = function (t0, v0, t1, v1, t) {
  return v0 + (v1 - v0) * ((t - t0) / (t1 - t0));
};

exports.exponentialInterpolate = function (t0, v0, t1, v1, t) {
  return v0 * Math.pow(v1 / v0, (t - t0) / (t1 - t0));
};

exports.extractValueFromCurve = function (start, curve, curveLength, duration, t) {
  var ratio;

  // If time is after duration, return the last curve value,
  // or if ratio is >= 1
  if (t >= start + duration || (ratio = Math.max((t - start) / duration, 0)) >= 1) {
    return curve[curveLength - 1];
  }

  console.log("time: ", t, "index: ", ~~(curveLength*ratio), "value: ", curve[~~(curveLength*ratio)]);
  return curve[~~(curveLength * ratio)];
};

exports.exponentialApproach = function (t0, v0, v1, timeConstant, t) {
  return v1 + (v0 - v1) * Math.exp(-(t - t0) / timeConstant);
};

// Since we are going to accumulate error by adding 0.01 multiple times
// in a loop, we want to fuzz teh equality check in `getValueAtTime`
exports.fuzzyEqual = function (lhs, rhs) {
  return Math.abs(lhs - rhs) < EPSILON;
};
