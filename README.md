nightwatch-framework  
====================================

Helper package that integrates the stand-alone clinical:nightwatch package with the Velocity framework.  Responsible for:

a) parsing XML output files produced by Nightwatch  
b) launching the clinical:nightwatch bridge to the Selenium server  
c) keeping velocity dependencies out of Nightwatch, so it can run stand-alone  


![Prezi](https://raw.githubusercontent.com/meteor-velocity/nightwatch-framework/master/nightwatch.prezi.png)
[View the Prezi on Nightwatch/Selenium Architecture](http://prezi.com/muvofev3r0n0/?utm_campaign=share&utm_medium=copy&rc=ex0share)  

===============================
#### Installation  

````sh
meteor add velocity:nightwatch-framework  
meteor add velocity:nightwatch-reporter
````

===============================
#### Usage  

````sh
# run the leaderboard application
terminal$ meteor

# click the blue dot
# add test files
# run tests
# reset as necessary
````

===============================
#### Usage - Command Line  

````sh
# run the leaderboard application
terminal$ VELOCITY_CI=true meteor --test
````


Licensing
------------------------

MIT License. Use as you wish, including for commercial purposes.
