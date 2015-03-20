

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
      testReportsPath = _parsePath(pwd + '/tests/.reports/nightwatch-acceptance'),
      args = [],
      consoleData = '',
      nightwatchCli,
      closeFunc,
      rerunTests,
      RUN_TEST_THROTTLE_TIME = 100;


  console.log("[nightwatch-framework] Lets register Nightwatch with Velocity...");
  Meteor.call('velocity/register/framework', "nightwatch", {
    disableAutoReset: true,
    regex: /nightwatch/
  });



  //////////////////////////////////////////////////////////////////////
  // Meteor Methods
  //

  Meteor.methods({
    'nightwatch/run':function(){
      console.log("[nightwatch-framework] Server received request to run Nightwatch script...");


      console.log("[nightwatch-framework] Installing Nightwatch bridge via Npm...");
      Npm.require('child_process').exec("npm install nightwatch@0.5.36", Meteor.bindEnvironment(function(error, result){
        Npm.require('sys').puts(result);

        var spawn = Npm.require('child_process').spawn;
        var nightwatch = spawn('./node_modules/nightwatch/bin/nightwatch', ['-c', './assets/packages/clinical_nightwatch/nightwatch_from_velocity.json']);

        nightwatch.stdout.on('data', function(data){
          // data is in hex, and has a line break at the end
          console.log(('' + data).slice(0, -1));
        });
        nightwatch.on('close', function(code){
          if(code === 1){
            console.log('Finished!  Nightwatch ran all the tests!');
            process.exit();
          }
          if(code != 1){
            console.log('Uh oh!  Something went awry.  Nightwatch exited with a code of ' + code);
          }
        });

      }));

    },
    'nightwatch/reset':function(){
      console.log("[nightwatch-framework] Running nightwatch/clear/xml...");
      console.log('[nightwatch-framework] Deleting FIREFOX xml files...')

      if(process.env.PWD.indexOf('/packages/nightwatch-framework') > -1){
        testReportsPath = process.env.PWD + '/../../tests/.reports/nightwatch-acceptance'
      }else{
        testReportsPath = process.env.PWD + '/tests/.reports/nightwatch-acceptance';
      }
      console.log('[nightwatch-framework] testReportsPath', testReportsPath);

      var globSearchString = path.join('**', 'FIREFOX_*.xml');
      var xmlFiles = glob.sync(globSearchString, { cwd: testReportsPath });

      _.each(xmlFiles, function (xmlFile, index) {
        fs.unlinkSync(testReportsPath + path.sep + xmlFile);
      });

      console.log("[nightwatch-framework] All XML files should be deleted...");
    },
    'nightwatch/parse/xml':function(){
      console.log("[nightwatch-framework] Running nightwatch/parse/xml...");
      var selectedFramework = "nightwatch";

      // we need a different to our paths depending on whether we are developing locally
      // or have pulled the framework from atmosphere
      console.log('[nightwatch-framework] process.env.PWD', process.env.PWD);
      if(process.env.PWD.indexOf('/packages/nightwatch-framework') > -1){
        testReportsPath = process.env.PWD + '/../../tests/.reports/nightwatch-acceptance'
      }else{
        testReportsPath = process.env.PWD + '/tests/.reports/nightwatch-acceptance';
      }
      console.log('[nightwatch-framework] testReportsPath', testReportsPath);


      console.log('[nightwatch-framework] Parsing FIREFOX xml files...')
      var newResults = [];
      var globSearchString = path.join('**', 'FIREFOX_*.xml');
      var xmlFiles = glob.sync(globSearchString, { cwd: testReportsPath });

      //console.log('[nightwatch-framework] globSearchString', globSearchString);
      //console.log('[nightwatch-framework] xmlFiles', xmlFiles);

      var returnMessage = "Parsing hasnt happened.";


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
              result.id = selectedFramework + ':' + _hashCode(xmlFile + testcase.$.classname + testcase.$.name);
              newResults.push(result.id);

              Meteor.call('velocity/reports/submit', result);
            });
          });
        });

        if (index === xmlFiles.length - 1) {
          Meteor.call('velocity/reports/reset', {framework: selectedFramework, notIn: newResults});
        }
        returnMessage = "Parsed " + index + " XML files.";
      });
      return returnMessage;
    }
  });




  //////////////////////////////////////////////////////////////////////
  // private functions

  function _hashCode (s) {
    return s.split("").reduce(function (a, b) {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
  }

  function _parsePath (unixPath) {
    return unixPath.replace('\/', path.sep);
  }



})();
