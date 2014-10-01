Package.describe({
  summary: "XML parser and framework launcher for Nightwatch/Selenium.",
  version: "1.0.0",
  git: "http://github.com/meteor-velocity/nightwatch-integration.git"
});

Npm.depends({
    'glob': '3.2.9',
    'lodash': '2.4.1',
    'rimraf': '2.2.8',
    'xml2js': '0.4.2',
    'meteor-stubs': '0.0.2'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.3');

  api.use(['underscore']);
  api.use(['livedata']);
  api.use(['velocity:core']);
  api.use(['clinical:nightwatch']);

  api.addFiles('nightwatch.integration.js');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('velocity:nightwatch-integration');
  api.addFiles('velocity:nightwatch-integration-tests.js');
});
