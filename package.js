Package.describe({
  summary: "Framework launcher and XML output parser for Nightwatch/Selenium.",
  version: "0.2.7",
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
  api.versionsFrom('METEOR@1.0');

  api.use('mongo');
  api.use('check');
  api.use('http');
  api.use('retry');

  api.use('underscore');
  api.use('livedata');
  api.use('mrt:moment@2.8.1');
  // api.use('velocity:shim');
  api.use('velocity:core@0.3.1');
  api.use('clinical:nightwatch@1.4.0');

  api.addFiles('nightwatch.integration.js', 'server');
});

Package.onTest(function(api) {
  api.use('tinytest');
  //api.use('clinical:nightwatch');
  api.addFiles('velocity:nightwatch-framework-tests.js');
});
