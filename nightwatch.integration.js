

(function () {

  "use strict";

  var pwd = process.env.PWD,
      DEBUG = process.env.NIGHTWATCH_DEBUG,
      child_process = Npm.require('child_process'),
      spawn = child_process.spawn,
      parseString = Npm.require('xml2js').parseString,
      glob = Npm.require('glob'),
      fs = Npm.require('fs'),
      path = Npm.require('path'),
      rimraf = Npm.require('rimraf'),
      sys = Npm.require('sys'),
      testReportsPath = parsePath(pwd + '/tests/.reports/nightwatch-acceptance'),
      args = [],
      consoleData = '',
      nightwatchCli,
      closeFunc,
      rerunTests,
      RUN_TEST_THROTTLE_TIME = 100;

  var SystemWrapper = {
    standardOut: function(error, stdout, stderr) {
      var sys = Npm.require('sys');
      sys.puts(stdout);
    }
  };

  console.log("Lets register Nightwatch with Velocity...");
  Meteor.call('velocity/register/framework', "nightwatch", {
    disableAutoReset: true,
    regex: /nightwatch/
  });



  //////////////////////////////////////////////////////////////////////
  // Meteor Methods
  //

  Meteor.methods({
    'nightwatch/run':function(){
      console.log("Server received request to run Nightwatch script...");

      // Npm.require('child_process').exec("pwd", function(error, result){
      // Npm.require('child_process').exec("pwd .", function(error, result){
      //   var sys = Npm.require('sys');
      //   sys.puts(result);
      // });

      console.log("Installing Nightwatch bridge via Npm...");
      Npm.require('child_process').exec("npm install nightwatch@0.5.35", function(error, result){
        Npm.require('sys').puts(result);

        console.log("Launching Nightwatch with JSON configuration file...");
        Npm.require('child_process').exec("sudo ./node_modules/nightwatch/bin/nightwatch -c ./assets/packages/clinical_nightwatch/nightwatch_from_velocity.json", function(error, result){
          Npm.require('sys').puts(result);
        });
      });

    },
    'nightwatch/parse/xml':function(){
      console.log("Parsing Nightwatch XML report files...");
      var selectedFramework = "nightwatch";

      // we need a different to our paths depending on whether we are developing locally
      // or have pulled the framework from atmosphere
      console.log('process.env.PWD', process.env.PWD);
      if(process.env.PWD.indexOf('/packages/nightwatch-framework') > -1){
        testReportsPath = process.env.PWD + '/../../tests/.reports/nightwatch-acceptance'
      }else{
        testReportsPath = process.env.PWD + '/tests/.reports/nightwatch-acceptance';
      }
      console.log('testReportsPath', testReportsPath);


      console.log('Parsing Nightwatch FIREFOX xml files...')
      var newResults = [];
      var globSearchString = path.join('**', 'FIREFOX_*.xml');
      var xmlFiles = glob.sync(globSearchString, { cwd: testReportsPath });

      //console.log('globSearchString', globSearchString);
      //console.log('xmlFiles', xmlFiles);

      _.each(xmlFiles, function (xmlFile, index) {
        parseString(fs.readFileSync(testReportsPath + path.sep + xmlFile), function (err, result) {
          _.each(result.testsuites.testsuite, function (testsuite) {
            _.each(testsuite.testcase, function (testcase) {
              var result = {
                name: testcase.$.name,
                framework: selectedFramework,
                result: testcase.failure ? 'failed' : 'passed',
                timestamp: new Date(),
                time: moment().format("HH:MM:SS"),
                ancestors: ["nightwatch"]
              };

              if (testcase.failure) {
                testcase.failure.forEach(function (failure) {
                  result.failureType = failure.$.type;
                  result.failureMessage = failure.$.message;
                  result.failureStackTrace = failure._;
                });
              }
              result.id = selectedFramework + ':' + hashCode(xmlFile + testcase.$.classname + testcase.$.name);
              newResults.push(result.id);

              Meteor.call('velocity/reports/submit', result);
            });
          });
        });

        if (index === xmlFiles.length - 1) {
          Meteor.call('velocity/reports/reset', {framework: selectedFramework, notIn: newResults});
        }
        result = "Parsed " + index + " XML files.";
      });
      return result;
    }
  });




  //////////////////////////////////////////////////////////////////////
  // private functions

  function hashCode (s) {
    return s.split("").reduce(function (a, b) {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
  }

  function parsePath (unixPath) {
    return unixPath.replace('\/', path.sep);
  }



})();
