Package.describe({
  summary: "Framework launcher and XML output parser for Nightwatch/Selenium.",
  version: "0.1.1",
  name: "velocity:nightwatch-framework",
  git: "http://github.com/meteor-velocity/nightwatch-framework.git"
});

Npm.depends({
    'glob': '3.2.9',
    'lodash': '2.4.1',
    'rimraf': '2.2.8',
    'xml2js': '0.4.2'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.3');

  api.use(['underscore']);
  api.use(['livedata']);
  api.use(['velocity:core@0.2.14']);
  api.use(['clinical:nightwatch@1.3.2']);

  api.addFiles('nightwatch.integration.js');
});

Package.onTest(function(api) {
  api.use('tinytest');
  //api.use('clinical:nightwatch');
  api.addFiles('velocity:nightwatch-framework-tests.js');
});
