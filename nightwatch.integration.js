

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
    regex: /nightwatch/,
    sampleTestGenerator: function() {
      return [
        {
          path: 'nightwatch/globals.json',
          contents: Assets.getText('sample-tests/nightwatch/globals.json')
        },
        {
          path: 'nightwatch/logs/selenium-debug.log',
          contents: Assets.getText('sample-tests/nightwatch/logs/selenium-debug.log')
        },
        {
          path: 'nightwatch/assertions/foo.js',
          contents: Assets.getText('sample-tests/nightwatch/assertions/foo.js')
        },
        {
          path: 'nightwatch/commands/consoleLog.js',
          contents: Assets.getText('sample-tests/nightwatch/commands/consoleLog.js')
        },
        {
          path: 'nightwatch/commands/sectionBreak.js',
          contents: Assets.getText('sample-tests/nightwatch/commands/sectionBreak.js')
        },
        {
          path: 'nightwatch/commands/signIn.js',
          contents: Assets.getText('sample-tests/nightwatch/commands/signIn.js')
        },
        {
          path: 'nightwatch/commands/selectFromSidebar.js',
          contents: Assets.getText('sample-tests/nightwatch/commands/selectFromSidebar.js')
        },
        {
          path: 'nightwatch/commands/signOut.js',
          contents: Assets.getText('sample-tests/nightwatch/commands/signOut.js')
        },
        {
          path: 'nightwatch/commands/signUp.js',
          contents: Assets.getText('sample-tests/nightwatch/commands/signUp.js')
        },
        {
          path: 'nightwatch/commands/waitForPage.js',
          contents: Assets.getText('sample-tests/nightwatch/commands/waitForPage.js')
        },
        {
          path: 'nightwatch/commands/methods/meteorApply.js',
          contents: Assets.getText('sample-tests/nightwatch/commands/methods/meteorApply.js')
        },
        {
          path: 'nightwatch/commands/components/reviewMainLayout.js',
          contents: Assets.getText('sample-tests/nightwatch/commands/components/reviewMainLayout.js')
        },
        {
          path: 'nightwatch/commands/components/reviewSidebar.js',
          contents: Assets.getText('sample-tests/nightwatch/commands/components/reviewSidebar.js')
        },
        {
          path: 'nightwatch/commands/components/reviewSignInPage.js',
          contents: Assets.getText('sample-tests/nightwatch/commands/components/reviewSignInPage.js')
        },
        {
          path: 'nightwatch/commands/components/reviewSignUpPage.js',
          contents: Assets.getText('sample-tests/nightwatch/commands/components/reviewSignUpPage.js')
        },
        {
          path: 'nightwatch/walkthroughs/app.layout.js',
          contents: Assets.getText('sample-tests/nightwatch/walkthroughs/app.layout.js')
        },
        {
          path: 'nightwatch/walkthroughs/itunes.connect.js',
          contents: Assets.getText('sample-tests/nightwatch/walkthroughs/itunes.connect.js')
        }
      ]
    }
  });



  //////////////////////////////////////////////////////////////////////
  // Meteor Methods
  //

  Meteor.methods({
    'nightwatch/run':function(){
      console.log("[nightwatch-framework] Server received request to run Nightwatch script...");

      console.log("[nightwatch-framework] Clearing existing reports...");
      Meteor.call("velocity/reports/reset", {framework: "nightwatch"});


      console.log("[nightwatch-framework] Installing Nightwatch bridge via Npm...");
      Npm.require('child_process').exec("npm install nightwatch@0.5.36", Meteor.bindEnvironment(function(error, result){
        if(error){
          console.log("[nightwatch-framework] ERROR in executing installation: ", error);
        }

        Npm.require('sys').puts(result);

        var spawn = Npm.require('child_process').spawn;
        var nightwatch = spawn('./node_modules/nightwatch/bin/nightwatch', ['-c', './assets/packages/clinical_nightwatch/nightwatch_from_velocity_console.json'], function(error, result){
          if(error){
            console.log("[nightwatch-framework] ERROR spawning nightwatch: ", error);
          }
        });

        var frameworkExitCode = 0;
        nightwatch.stdout.on('data', Meteor.bindEnvironment(function(data){

          // data is in hex, lets convert it
          // it also has a line break at the end; lets get rid of that
          console.log(("" + data).slice(0, -1));

          // without this, travis CI won't report that there are failed tests
          if(("" + data).indexOf("✖") > -1){
            frameworkExitCode = 1;
          }

        }));
        nightwatch.on('close', function(nightwatchExitCode){
          if(nightwatchExitCode === 0){
            console.log('Finished!  Nightwatch ran all the tests!');
              process.exit(nightwatchExitCode);
          }
          if(nightwatchExitCode !== 0){
            console.log('Uh oh!  Something went awry.  Nightwatch exited with a code of ' + nightwatchExitCode);
              process.exit(nightwatchExitCode);
          }
        });
      }));
    },
    'nightwatch/run/reporter':function(){
      console.log("[nightwatch-framework] Server received request to run Nightwatch script...");

      console.log("[nightwatch-framework] Clearing existing reports...");
      Meteor.call("velocity/reports/reset", {framework: "nightwatch"});


      console.log("[nightwatch-framework] Installing Nightwatch bridge via Npm...");
      Npm.require('child_process').exec("npm install nightwatch@0.5.36", Meteor.bindEnvironment(function(error, result){
        Npm.require('sys').puts(result);

        var spawn = Npm.require('child_process').spawn;
        var nightwatch = spawn('./node_modules/nightwatch/bin/nightwatch', ['-c', './assets/packages/clinical_nightwatch/nightwatch_from_velocity.json']);


        // test suites persist between tests, so we scope the variable outside the data emitter
        var currentTestSuite = "";


        nightwatch.stdout.on('data', Meteor.bindEnvironment(function(data){

          // data is in hex, lets convert it
          var convertedData = data.toString();

          // it also has a line break at the end; lets get rid of that
          console.log(convertedData.slice(0, -1));

          // are we messaging a test suite name?  if so, store it in our persistent variable
          if(convertedData.indexOf("Running:  ") > -1){
            currentTestSuite = convertedData.substr(10, convertedData.length).trim();

            var result = {
              suite: currentTestSuite,
              name: currentTestSuite,
              framework: 'nightwatch',
              result: 'suiteInfo',
              timestamp: new Date(),
              time: moment().format("HH:MM:SS"),
              ancestors: ["nightwatch"]
            };

            result.id = 'nightwatch:'  + currentTestSuite.replace(/\s+/g, '') + ":" + Meteor.uuid();
            Meteor.call('velocity/reports/submit', result);
          }


          // otherwise, we want to get rid of these annoying ansi color characters
          // which won't show up correctly in our Blaze templates




          if(convertedData.indexOf("✔") > -1){
            var newTestResult = {
              suite: currentTestSuite,
              framework: 'nightwatch',
              timestamp: new Date(),
              time: moment().format("HH:MM:SS"),
              ancestors: ["nightwatch"]
            };

            if(('' + data).indexOf("milliseconds") > -1){
              // console.log(('' + data).substr(('' + data).indexOf("after") + 6, ('' + data).indexOf("milliseconds") - ('' + data).indexOf("after") - 7).trim());
              newTestResult.duration = parseInt(convertedData.substr(convertedData.indexOf("after") + 6, convertedData.indexOf("milliseconds") - convertedData.indexOf("after") - 7).trim());
            }

            if(convertedData.indexOf("=========") > -1){
              newTestResult.result = "sectionBreak";
              newTestResult.name = convertedData.substr(2, convertedData.length).trim();
            }else if(convertedData.indexOf(">==") > -1){
              newTestResult.result = "sectionInfo";
              newTestResult.name = convertedData.substr(7, convertedData.length).trim();
            }else{
              newTestResult.result = 'passed';
              newTestResult.name = convertedData.substr(2, convertedData.length).trim();
            }


            newTestResult.id = 'nightwatch:' + currentTestSuite.replace(/\s+/g, '') + ":" + Meteor.uuid();
            Meteor.call('velocity/reports/submit', newTestResult);
          }
          else if(convertedData.indexOf("✖") > -1){
            // console.log('✖✖✖✖✖✖✖✖✖✖✖✖✖✖✖')


            console.log(convertedData);

            var currentFailureMessage = convertedData.substr(convertedData.indexOf("- expected"), convertedData.length).trim();
            //console.log("currentFailureMessage: " + currentFailureMessage);

            var result = {
              suite: currentTestSuite,
              name: convertedData.substr(2, convertedData.length).trim(),
              // name: convertedData,
              framework: 'nightwatch',
              result: 'failed',
              timestamp: new Date(),
              time: moment().format("HH:MM:SS"),
              ancestors: ["nightwatch"],
              failureType: "assert",
              failureMessage: currentFailureMessage,
              failureStackTrace: ""
            };

            result.id = 'nightwatch:' + Meteor.uuid();
            Meteor.call('velocity/reports/submit', result);
          }

        }));
        nightwatch.on('close', function(code){
          if(code === 1){
            console.log('Finished!  Nightwatch ran all the tests!');
            // process.exit();
          }
          if(code != 1){
            console.log('Uh oh!  Something went awry.  Nightwatch exited with a code of ' + code);
            // process.exit();
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
