nightwatch-framework  
====================================

This package provides Nightwatch integration with Velocity and Meteor.  It's primary responsibilities include:

a) integrating the clinical:nightwatch package which provides Selenium  
b) installing nightwatch  
c) parsing XML output files produced by Nightwatch  
d) launching the clinical:nightwatch bridge to the Selenium server  
e) keeping velocity dependencies out of Nightwatch, so it can run stand-alone  
f) integrating with the `meteor --test`` command  
g) providing Travis CI integration  


===============================
#### Architecture  
There's a Prezi  which shows all the modules involved that's a little out of date:

![Prezi](https://raw.githubusercontent.com/meteor-velocity/nightwatch-framework/master/nightwatch.prezi.png)
[View the Prezi on Nightwatch/Selenium Architecture](http://prezi.com/muvofev3r0n0/?utm_campaign=share&utm_medium=copy&rc=ex0share)  


===============================
#### Recommended Version  

**METEOR 1.0.4**


===============================
#### Known Bugs

**METEOR 1.0.4**

[There is a known bug with Meteor 1.0.5](https://github.com/meteor/meteor/issues/4008) so please install 1.0.4 instead until we can get things fixed.  


===============================
#### Installation  

Simply add the package to your application.  It will load everything else in.

````sh
meteor add velocity:nightwatch-framework  
````

===============================
#### Usage - Command Line  

The default usage is via command line, and requires that the ``VELOCITY_CI`` environment variable be set, which puts Meteor and Velocity into Continuous Integration mode.  Nightwatch basically always runs in Continuous Integration mode.  

````sh
terminal$ VELOCITY_CI=true meteor --test
````

===============================
#### Licensing

MIT License. Use as you wish, including for commercial purposes.
