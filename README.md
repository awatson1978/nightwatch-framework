nightwatch-framework  
====================================

Helper package that integrates the stand-alone clinical:nightwatch package with the Velocity framework.  Responsible for:

a) parsing XML output files produced by Nightwatch  
b) launching the clinical:nightwatch bridge to the Selenium server  
c) keeping velocity dependencies out of Nightwatch, so it can run stand-alone  


===============================
#### Installation  

````sh
meteor add velocity:nightwatch-framework  
meteor add velocity:html-reporter    
````

===============================
#### Usage  

````sh
# run the leaderboard application
terminal-a$ meteor

# and then we want to open up a new terminal and run nightwatch
# (this is similar to running 'meteor mongo' in a separate terminal)
terminal-b$ ./run_nightwatch.sh

# or specify a specific test with the -t flag
terminal-b$ ./run_nightwatch.sh -t tests/nightwatch/walkthrough.js

# if you want to rerun the acceptance tests, go back to the first terminal
# and be sure to reset the database
terminal-a$ ctrl-c
terminal-a$ meteor reset
terminal-a$ meteor

# parse the xml files by opening up a browser console, and running the following
Meteor.call('nightwatch/parse/xml');

# the above method will change in the future
````

Eventually, everything will be migrated to the Velocity HTML reporter interface.
