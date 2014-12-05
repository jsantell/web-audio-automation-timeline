var expect = require("chai").expect;
var Timeline = require("../");

describe("web audio automation calculation", function () {
  it("web audio spec example", function () {
    var timeline = new Timeline(10);
    var t0 = 0, t1 = 0.1, t2 = 0.2, t3 = 0.3, t4 = 0.4, t5 = 0.5, t6 = 0.6, t7 = 0.7;
    timeline.setValueAtTime(0.2, t0);
    timeline.setValueAtTime(0.3, t1);
    timeline.setValueAtTime(0.4, t2);
    timeline.linearRampToValueAtTime(1, t3);
    timeline.linearRampToValueAtTime(0.15, t4);
    timeline.exponentialRampToValueAtTime(0.75, t5);
    timeline.exponentialRampToValueAtTime(0.05, t6);
    timeline.setValueCurveAtTime([-1, 0, 1], 3, t6, t7 - t6);

    expect(timeline.getValueAtTime(0)).to.be.equal(0.2);
    expect(timeline.getValueAtTime(0.05)).to.be.equal(0.2);
    expect(timeline.getValueAtTime(0.1)).to.be.equal(0.3);
    expect(timeline.getValueAtTime(0.15)).to.be.equal(0.3);
    expect(timeline.getValueAtTime(0.2)).to.be.equal(0.4);
    expect(timeline.getValueAtTime(0.25)).to.be.equal(0.7);
    expect(timeline.getValueAtTime(0.3)).to.be.equal(1);
    expect(timeline.getValueAtTime(0.35)).to.be.equal(1.15/2);
    expect(timeline.getValueAtTime(0.4)).to.be.equal(0.15);
    expect(timeline.getValueAtTime(0.45)).to.be.equal(0.15 * Math.pow(0.75/0.15,0.05/0.2));
    expect(timeline.getValueAtTime(0.5)).to.be.equal(0.15 * Math.pow(0.75/0.15,0.5));
  });
  it("invalid events");
  it("event replacement");
  it("event removal");
});

describe("Before First Event", function () {
  it("set value", function () {
    var timeline = new Timeline(10);
    timeline.setValueAtTime(20, 1);
    expect(timeline.getValueAtTime(0.5)).to.be.equal(10);
  });

  it("set target", function () {
    var timeline = new Timeline(10);
    timeline.setTargetAtTime(20, 1, 5);
    expect(timeline.getValueAtTime(0.5)).to.be.equal(10);
  });

  it("linear ramp", function () {
    var timeline = new Timeline(10);
    timeline.linearRampToValueAtTime(20, 1);
    expect(timeline.getValueAtTime(0.5)).to.be.equal(10);
  });

  it("exponential ramp", function () {
    var timeline = new Timeline(10);
    timeline.exponentialRampToValueAtTime(20, 1);
    expect(timeline.getValueAtTime(0.5)).to.be.equal(10);
  });
});

describe("After Last Event", function () {
  it("set value", function () {
    var timeline = new Timeline(10);
    timeline.setValueAtTime(20, 1);
    expect(timeline.getValueAtTime(1.5)).to.be.equal(20);
  });

  it("set target", function () {
    var timeline = new Timeline(10);
    timeline.setTargetAtTime(20, 1, 5);
    expect(timeline.getValueAtTime(10)).to.be.equal(20 + -10 * (Math.exp(-9/5)));
  });

  it("set target with value set", function () {
    var timeline = new Timeline(10);
    timeline.setValue(50);
    timeline.setTargetAtTime(20, 1, 5);
    
    // When using SetTargetValueAtTime, Timeline becomes stateful: the value for
    // time t may depend on the time t-1, so we can't just query the value at a 
    // time and get the right value. We have to call GetValueAtTime for the
    // previous times.
    for (var i = 0; i < 9.99; i+= 0.01) {
      timeline.getValueAtTime(i);
    }

    expect(timeline.getValueAtTime(10)).to.be.equal(20 + (50-20) * (Math.exp(-9/5)));
  });
});

describe("test value()", function () {
  it("tests .value()", function () {
    var timeline = new Timeline(10);

    expect(timeline.value()).to.be.equal(10);
    timeline.setValue(20);
    expect(timeline.value()).to.be.equal(20);

    timeline.setValueAtTime(20, 1);
    expect(timeline.value()).to.be.equal(20);
    timeline.setValue(30);
    expect(timeline.value()).to.be.equal(20);
  });
});
