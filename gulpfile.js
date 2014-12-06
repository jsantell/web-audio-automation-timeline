var gulp = require("gulp");
var browserify = require("gulp-browserify-thin");
var header = require("gulp-header");
var manifest = require("./package.json");

var HEADER = "/**\n" +
             " * <%= name %> - <%= version %>\n" +
             " * <%= homepage %>\n" +
             " * MIT License, copyright (c) 2014 Jordan Santell\n" +
             " */\n";

gulp.task("default", function () {
  var b = browserify({ standalone: "Timeline" }).add("./index.js");
  var stream = b.bundle("automation-timeline.js")
    .pipe(header(HEADER, manifest))
    .pipe(gulp.dest("./build"));

  return stream;
});
