Package.describe({
  summary: "Framework launcher and XML output parser for Nightwatch/Selenium.",
  version: "0.4.6",
  name: "velocity:nightwatch-framework",
  git: "http://github.com/meteor-velocity/nightwatch-framework.git",
  debugOnly: true
});


Npm.depends({
    'glob': '3.2.9',
    'lodash': '2.4.1',
    'rimraf': '2.2.8',
    'xml2js': '0.4.2',
    'nightwatch': '0.5.36'
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
  api.use('velocity:core@0.5.1');
  api.use('clinical:nightwatch@2.0.1');

  api.addFiles('nightwatch.integration.js', 'server');

  api.addFiles([
    'sample-tests/nightwatch/globals.json',
    'sample-tests/nightwatch/assertions/foo.js',
    'sample-tests/nightwatch/commands/consoleLog.js',
    'sample-tests/nightwatch/commands/sectionBreak.js',
    'sample-tests/nightwatch/commands/signIn.js',
    'sample-tests/nightwatch/commands/selectFromSidebar.js',
    'sample-tests/nightwatch/commands/signOut.js',
    'sample-tests/nightwatch/commands/signUp.js',
    'sample-tests/nightwatch/commands/waitForPage.js',
    'sample-tests/nightwatch/commands/methods/meteorApply.js',
    'sample-tests/nightwatch/commands/components/reviewMainLayout.js',
    'sample-tests/nightwatch/commands/components/reviewSidebar.js',
    'sample-tests/nightwatch/commands/components/reviewSignInPage.js',
    'sample-tests/nightwatch/commands/components/reviewSignUpPage.js',
    'sample-tests/nightwatch/walkthroughs/app.layout.js',
    'sample-tests/nightwatch/walkthroughs/itunes.connect.js',
    'sample-tests/nightwatch/logs/selenium-debug.log'
  ], 'server', {isAsset: true})
});


Package.onTest(function(api) {
  api.use('tinytest');
  api.addFiles('velocity:nightwatch-framework-tests.js');
});
