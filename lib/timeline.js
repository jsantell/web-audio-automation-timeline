var TimelineEvent = require("./event").TimelineEvent;
var F = require("./formulas");

exports.Timeline = Timeline;

function Timeline (defaultValue) {
  this.events = [];

  this._value = defaultValue || 0;
}

Timeline.prototype.getEventCount = function () {
  return this.events.length;
};

Timeline.prototype.value = function () {
  return this._value;
};

Timeline.prototype.setValue = function (value) {
  if (this.events.length === 0) {
    this._value = value;
  }
};

Timeline.prototype.getValue = function () {
  if (this.events.length) {
    throw new Error("Can only call `getValue` when there are 0 events.");
  }

  return this._value;
};

Timeline.prototype.getValueAtTime = function (time) {
  return this._getValueAtTimeHelper(time);
};

Timeline.prototype._getValueAtTimeHelper = function (time) {
  var bailOut = false;
  var previous = null;
  var next = null;
  var lastComputedValue = null; // Used for `setTargetAtTime` nodes
  var events = this.events;
  var e;

  for (var i = 0; !bailOut && i < events.length; i++) {
    if (F.fuzzyEqual(time, events[i].time)) {
      // Find the last event with the same time as `time`
      do {
        ++i;
      } while (i < events.length && F.fuzzyEqual(time, events[i].time));

      e = events[i - 1];

      // `setTargetAtTime` can be handled no matter what their next event is (if they have one)
      if (e.type === "setTargetAtTime") {
        lastComputedValue = this._lastComputedValue(e);
        return e.exponentialApproach(lastComputedValue, time);
      }

      // `setValueCurveAtTime` events can be handled no matter what their next event node is
      // (if they have one)
      if (e.type === "setValueCurveAtTime") {
        return e.extractValueFromCurve(time);
      }

      // For other event types
      return e.value;
    }
    previous = next;
    next = events[i];

    if (time < events[i].time) {
      bailOut = true;
    }
  }

  // Handle the case where the time is past all of the events
  if (!bailOut) {
    previous = next;
    next = null;
  }

  // Just return the default value if we did not find anything
  if (!previous && !next) {
    return this._value;
  }

  // If the requested time is before all of the existing events
  if (!previous) {
    return this._value;
  }

  // `setTargetAtTime` can be handled no matter what their next event is (if they have one)
  if (previous.type === "setTargetAtTime") {
    lastComputedValue = this._lastComputedValue(previous);
    return previous.exponentialApproach(lastComputedValue, time);
  }

  // `setValueCurveAtTime` events can be handled no matter what their next event node is
  // (if they have one)
  if (previous.type === "setValueCurveAtTime") {
    return previous.extractValueFromCurve(time);
  }

  if (!next) {
    if (~["setValueAtTime", "linearRampToValueAtTime", "exponentialRampToValueAtTime"].indexOf(previous.type)) {
      return previous.value;
    }
    if (previous.type === "setValueCurveAtTime") {
      return previous.extractValueFromCurve(time);
    }
    if (previous.type === "setTargetAtTime") {
      throw new Error("unreached");
    }
    throw new Error("unreached");
  }

  // Finally handle the case where we have both a previous and a next event
  // First handle the case where our range ends up in a ramp event
  if (next.type === "linearRampToValueAtTime") {
    return previous.linearInterpolate(next, time);
  } else if (next.type === "exponentialRampToValueAtTime") {
    return previous.exponentialInterpolate(next, time);
  }

  // Now handle all other cases
  if (~["setValueAtTime", "linearRampToValueAtTime", "exponentialRampToValueAtTime"].indexOf(previous.type)) {
    // If the next event type is neither linear or exponential ramp,
    // the value is constant.
    return previous.value;
  }
  if (previous.type === "setValueCurveAtTime") {
    return previous.extractValueFromCurve(time);
  }
  if (previous.type === "setTargetAtTime") {
    throw new Error("unreached");
  }
  throw new Error("unreached");
};

Timeline.prototype._insertEvent = function (ev) {
  var events = this.events;

  if (ev.type === "setValueCurveAtTime") {
    if (!ev.value || !ev.value.length) {
      throw new Error("NS_ERROR_DOM_SYNTAX_ERR");
    }
  }

  if (ev.type === "setTargetAtTime") {
    if (F.fuzzyEqual(ev.constant, 0)) {
      throw new Error("NS_ERROR_DOM_SYNTAX_ERR");
    }
  }

  // Make sure that non-curve events don't fall within the duration of a
  // curve event.
  for (var i = 0; i < events.length; i++) {
    if (events[i].type === "setValueCurveAtTime" &&
        events[i].time <= ev.time &&
        (events[i].time + events[i].duration) >= ev.time) {
      throw new Error("NS_ERROR_DOM_SYNTAX_ERR");
    }
  }

  // Make sure that curve events don't fall in a range which includes other
  // events.
  if (ev.type === "setValueCurveAtTime") {
    for (var i = 0; i < events.length; i++) {
      if (events[i].time > ev.time &&
          events[i].time < (ev.time + ev.duration)) {
        throw new Error("NS_ERROR_DOM_SYNTAX_ERR");
      }
    }
  }

  // Make sure that invalid values are not used for exponential curves
  if (ev.type === "exponentialRampToValueAtTime") {
    if (ev.value <= 0) throw new Error("NS_ERROR_DOM_SYNTAX_ERR");
    var prev = this._getPreviousEvent(ev.time);
    if (prev) {
      if (prev.value <= 0) {
        throw new Error("NS_ERROR_DOM_SYNTAX_ERR");
      }
    } else {
      if (this._value <= 0) {
        throw new Error("NS_ERROR_DOM_SYNTAX_ERR");
      }
    }
  }

  for (var i = 0; i < events.length; i++) {
    if (ev.time === events[i].time) {
      if (ev.type === events[i].type) {
        // If times and types are equal, replace the event;
        events[i] = ev;
      } else {
        // Otherwise, place the element after the last event of another type
        do { i++; }
        while (i < events.length && ev.type !== events[i].type && ev.time === events[i].time);
        events.splice(i, 0, ev);
      }
      return;
    }
    // Otherwise, place the event right after the latest existing event
    if (ev.time < events[i].time) {
      events.splice(i, 0, ev);
      return;
    }
  }

  // If we couldn't find a place for the event, just append it to the list
  this.events.push(ev);
};

Timeline.prototype._getPreviousEvent = function (time) {
  var previous = null, next = null;
  var bailOut = false;
  var events = this.events;

  for (var i = 0; !bailOut && i < events.length; i++) {
    if (time === events[i]) {
      do { ++i; }
      while (i < events.length && time === events[i].time);
      return events[i - 1];
    }
    previous = next;
    next = events[i];
    if (time < events[i].time) {
      bailOut = true;
    }
  }

  // Handle the case where the time is past all the events
  if (!bailOut) {
    previous = next;
  }

  return previous;
};

/**
 * Calculates the previous value of the timeline, used for
 * `setTargetAtTime` nodes. Takes an event, and returns
 * the previous computed value for any sample taken during that
 * exponential approach node.
 */
Timeline.prototype._lastComputedValue = function (event) {
  // If equal times, return the value for the previous event, before
  // the `setTargetAtTime` node.
  var lastEvent = this._getPreviousEvent(event.time - F.EPSILON);

  // If no event before the setTargetAtTime event, then return the
  // built in value.
  if (!lastEvent) {
    return this._value;
  }
  // Otheriwse, return the value for the previous event, which should
  // always be the last computed value (? I think?)
  else {
    return lastEvent.value;
  }
};

Timeline.prototype.setValueAtTime = function (value, startTime) {
  this._insertEvent(new TimelineEvent("setValueAtTime", value, startTime));
};

Timeline.prototype.linearRampToValueAtTime = function (value, endTime) {
  this._insertEvent(new TimelineEvent("linearRampToValueAtTime", value, endTime));
};

Timeline.prototype.exponentialRampToValueAtTime = function (value, endTime) {
  this._insertEvent(new TimelineEvent("exponentialRampToValueAtTime", value, endTime));
};

Timeline.prototype.setTargetAtTime = function (value, startTime, timeConstant) {
  this._insertEvent(new TimelineEvent("setTargetAtTime", value, startTime, timeConstant));
};

Timeline.prototype.setValueCurveAtTime = function (value, startTime, duration) {
  this._insertEvent(new TimelineEvent("setValueCurveAtTime", value, startTime, null, duration));
};

Timeline.prototype.cancelScheduledValues = function (time) {
  for (var i = 0; i < this.events.length; i++) {
    if (this.events[i].time >= time) {
      this.events = this.events.slice(0, i);
      break;
    }
  }
};

Timeline.prototype.cancelAllEvents = function () {
  this.events.length = 0;
};
