# web-audio-automation-timeline

[![Build Status](http://img.shields.io/travis/jsantell/web-audio-automation-timeline.svg?style=flat-square)](https://travis-ci.org/jsantell/web-audio-automation-timeline)
[![Build Status](http://img.shields.io/npm/v/web-audio-automation-timeline.svg?style=flat-square)](https://www.npmjs.org/package/web-audio-automation-timeline)


Timeline utility for calculating values of web audio automation parameters over time. Based off of Firefox's [AudioEventTimeline](https://github.com/mozilla/gecko-dev/blob/master/dom/media/webaudio/AudioEventTimeline.h) implementation for the Web Audio API.

## Installation

`$ npm install web-audio-automation-timeline`

## Build

You can build a browserified version via `gulp`, created in the `./build` directory, or
just use this in a script tag. You can view an example page that renders automation values in a d3 graph in `./example/index.html`.

## API

### new Timeline(defaultValue)

### timeline.getEventCount()

Returns number of events currently modifying the value.

### timeline.value(), timeline.getValue()

Returns the value set on the automation timeline.

### timeline.setValue()

Sets the value for this parameter timeline. Like setting a value directly on a parameter, with no events.

### timeline.getValueAtTime(t)

Returns the value of the parameter at time `t`.

### timeline.setValueAtTime(value, startTime)

Creates a [setValueAtTime](http://webaudio.github.io/web-audio-api/#widl-AudioParam-setValueAtTime-void-float-value-double-startTime) event.

### timeline.linearRampToValueAtTime(value, endTime)

Creates a [linearRampToValueAtTime](http://webaudio.github.io/web-audio-api/#widl-AudioParam-linearRampToValueAtTime-void-float-value-double-endTime) event.

### timeline.exponentialRampToValueAtTime(value, endTime)

Creates a [exponentialRampToValueAtTime](http://webaudio.github.io/web-audio-api/#widl-AudioParam-exponentialRampToValueAtTime-void-float-value-double-endTime) event.

### timeline.setTargetAtTime(value, startTime, timeConstant)

Creates a [setTargetAtTime](http://webaudio.github.io/web-audio-api/#widl-AudioParam-setTargetAtTime-void-float-target-double-startTime-float-timeConstant) event.

### timeline.setValueCurveAtTime(value, startTime, duration) 

Creates a [setValueCurveAtTime](http://webaudio.github.io/web-audio-api/#widl-AudioParam-setValueCurveAtTime-void-Float32Array-values-double-startTime-double-duration) event.

### timeline.cancelScheduledValues(time)

Clears events according to [cancelScheduledValues](http://webaudio.github.io/web-audio-api/#widl-AudioParam-cancelScheduledValues-void-double-startTime).

### timeline.cancelAllEvents()

Clears out all events.

## Testing

`npm test`

## License

MIT License, Copyright (c) 2014 Jordan Santell
