nightwatch-framework  
====================================

This package provides Nightwatch integration with Velocity and Meteor.  It's recommended to also use [velocity:nightwatch-reporter](https://github.com/meteor-velocity/nightwatch-reporter) package.  The primary responsibilities of this package include:

a) integrating the clinical:nightwatch package which provides Selenium  
b) installing nightwatch  
c) parsing XML output files produced by Nightwatch  
d) launching the clinical:nightwatch bridge to the Selenium server  
e) keeping velocity dependencies out of Nightwatch, so it can run stand-alone  
f) integrating with the `meteor --test`` command  
g) providing Travis CI integration  


===============================
#### Architecture  

![Prezi](https://raw.githubusercontent.com/meteor-velocity/nightwatch-framework/master/nightwatch.prezi.png)
[View the Prezi on Nightwatch/Selenium Architecture](http://prezi.com/muvofev3r0n0/?utm_campaign=share&utm_medium=copy&rc=ex0share)  


===============================
#### Recommended Version  

**METEOR 1.0.4**


===============================
#### Known Bugs

[There is a known bug with Meteor 1.0.5](https://github.com/meteor/meteor/issues/4008) so please install 1.0.4 instead until we can get things fixed.  


===============================
#### Installation  

Simply add the package to your application.  It will load everything else in.

````sh
meteor add velocity:nightwatch-framework  

# you may also want to use the Nightwatch HTML Reporter
meteor add velocity:nightwatch-reporter
````

===============================
#### Configure the Filesystem  
You'll need to begin by creating the following files and directories in your /tests directory.  For now, the contents of ``global.json`` can be an empty json object `{}`.  

````sh
# create the following files
/tests/nightwatch/globals.json
/tests/nightwatch/logs
/tests/nightwatch/commands
/tests/nightwatch/assertions
/tests/nightwatch/walkthroughs

# and be sure to set lax permissions so nightwatch can manage files
terminal-a$ chmod -R 777 tests/nightwatch
````

===============================
#### Usage - Command Line  

The default usage is via command line, and requires that the ``VELOCITY_CI`` environment variable be set, which puts Meteor and Velocity into Continuous Integration mode.  Nightwatch basically always runs in Continuous Integration mode.  

````sh
terminal$ VELOCITY_CI=true meteor --test
````

===============================
#### Write Your First Acceptance Test
Check out this super simple syntax for writing acceptance tests.  All you need to do is copy the following code into a file in the ``/tests`` directory, and Nightwatch will parse it accordingly.

````js
// tests/nightwatch/walkthrough/helloworld.js

module.exports = {
  "Hello World" : function (client) {
    client
      .url("http://127.0.0.1:3000")
      .waitForElementVisible("body", 1000)
      .assert.title("Hello World")
      .end();
  }
};

// tests/google.js
module.exports = {
  tags: ["foo"],
  "Demo Test Google" : function (client) {
    client
      .url("http://www.google.com")
      .waitForElementVisible("body", 1000)
      .assert.title("Google")
      .assert.visible("input[type=text]")
      .setValue("input[type=text]", "nightwatch")
      .waitForElementVisible("button[name=btnG]", 1000)
      .click("button[name=btnG]")
      .pause(1000)
      .assert.containsText("#main", "The Night Watch")
      .end();
  }
};

#### Resetting the Database For New Runs
You may notice that your database has gotten out of sync with your tests.  Don't worry, as that's normal.  The easy thing to do is just reset your database.  But you'll eventually need to write your tests so they don't destructively modify your database, or you'll need to create tearUp and tearDown methods, or set up a testing database, or any number of other activities to manage your test data.

````sh
terminal-a$ meteor reset
````

####  Advanced Topics - Custom Commands, Assertions, and Logs
[Custom Commands](https://groups.google.com/forum/#!searchin/nightwatchjs/client$20execute/nightwatchjs/RC1S2OXILDU/noB39V1oNwMJ)  
[Using Globals.js to Define Test Data](https://groups.google.com/forum/#!searchin/nightwatchjs/upload$20file/nightwatchjs/rYG1Oj-N2II/HP7G8OqQ7ssJ)  
[File Upload Dialog](https://groups.google.com/forum/#!searchin/nightwatchjs/upload$20file/nightwatchjs/tVjjCW5A16o/gz9JYs6RCxoJ)  
[Download File Assertion](https://groups.google.com/forum/#!searchin/nightwatchjs/upload$20file/nightwatchjs/XiP2oTlqtRA/1EqHTH7EXzIJ)  
[Testing Minimongo and Browser Console with execute()](https://groups.google.com/forum/#!searchin/nightwatchjs/run$20command$20line/nightwatchjs/SCwoiVOniWw/wObZ_DcLOUoJ)  
[Code Injection using execute()](https://groups.google.com/forum/#!searchin/nightwatchjs/execute/nightwatchjs/ZdXtwMgliss/O14Duu_cZ7sJ)  
[Connecting to SauceLabs](https://groups.google.com/forum/#!searchin/nightwatchjs/saucelabs/nightwatchjs/EcOkqn9pa8w/slXqfnePTwoJ)


===============================
#### Licensing

MIT License. Use as you wish, including for commercial purposes.
