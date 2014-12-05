var F = require("./formulas");

function TimelineEvent (eventName, value, time, timeConstant, duration) {
  this.type = eventName;
  this.value = value;
  this.time = time;
  this.constant = timeConstant || 0;
  this.duration = duration || 0;
}
exports.TimelineEvent = TimelineEvent;


TimelineEvent.prototype.exponentialApproach = function (lastValue, time) {
  return F.exponentialApproach(this.time, lastValue, this.value, this.constant, time);
}

TimelineEvent.prototype.extractValueFromCurve = function (time) {
  return F.extractValueFromCurve(this.time, this.value, this.value.length, this.duration, time);
}

TimelineEvent.prototype.linearInterpolate = function (next, time) {
  return F.linearInterpolate(this.time, this.value, next.time, next.value, time);
}

TimelineEvent.prototype.exponentialInterpolate = function (next, time) {
  return F.exponentialInterpolate(this.time, this.value, next.time, next.value, time);
}
