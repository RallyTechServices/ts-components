#TSAlternativeTimeline

![timeline](./images/timeline.png "Alternative Timeline")

A timeline built using Highcharts instead of the gantt thing that the thing in the product uses.  When this is mature, it should be much easier to write/create timeline style things.

Be sure to modify your html tpl file to include

    <!-- our highcharts (needed so that we can add patterns) -->
    <script type="text/javascript" src="/apps/<%= sdk %>/lib/analytics/analytics-all.js"></script>

Use allowVerticalScroll = false to have the chart try to fill the page at 50px per line.  allowVerticalScroll = true puts the buttons on the chart for scrolling with the pagesize and height you choose.

TODO:
* horizontal scrolling
* zoom
* hierarchy/tree -- probably not possible in this incarnation
* ...

## Development Notes

The app.js file is provided for testing and demonstrating how to pass values.  The _ts-timeline.js file is expected to be used on its own

* The timeline itself is not going to load data!  This one expects an array of records and those records will need to have the fields the chart is looking for to make its calculations.
* Can pass releases, iterations, and portfolio items as records in an array.  If all records passed are of the same type but some other value, you can use the plannedStartField and plannedEndField configuration settings to define which fields hold the dates for beginning and ending (note that it needs to be a JS date for now).  If it's a mixed array, then the fields for start and end are determined by the plannedEndFieldMap/plannedStartFieldMap (which you can override).
* Can modify the formatting of the string that shows up on the vertical axis by providing a new method to getCategoryString (which is given each record in turn). An example of the use here would be to provide coloring on the label or an indent.
* Colors for bars are defined by Rally.util.HealthColorCalculator.calculateHealthColorForPortfolioItemData, which means that the color is going to be black for non PIs.  (Or set a field called PercentDoneByStoryCount to decide on color (or write a new function for configuring to allow folks to define it when they create a chart)).
 


### First Load

If you've just downloaded this from github and you want to do development, 
you're going to need to have these installed:

 * node.js
 * grunt-cli
 * grunt-init
 
Since you're getting this from github, we assume you have the command line
version of git also installed.  If not, go get git.

If you have those three installed, just type this in the root directory here
to get set up to develop:

  npm install

### Structure

  * src/javascript:  All the JS files saved here will be compiled into the 
  target html file
  * src/style: All of the stylesheets saved here will be compiled into the 
  target html file
  * test/fast: Fast jasmine tests go here.  There should also be a helper 
  file that is loaded first for creating mocks and doing other shortcuts
  (fastHelper.js) **Tests should be in a file named <something>-spec.js**
  * test/slow: Slow jasmine tests go here.  There should also be a helper
  file that is loaded first for creating mocks and doing other shortcuts 
  (slowHelper.js) **Tests should be in a file named <something>-spec.js**
  * templates: This is where templates that are used to create the production
  and debug html files live.  The advantage of using these templates is that
  you can configure the behavior of the html around the JS.
  * config.json: This file contains the configuration settings necessary to
  create the debug and production html files.  
  * package.json: This file lists the dependencies for grunt
  * auth.json: This file should NOT be checked in.  Create this to create a
  debug version of the app, to run the slow test specs and/or to use grunt to
  install the app in your test environment.  It should look like:
    {
        "username":"you@company.com",
        "password":"secret",
        "server": "https://rally1.rallydev.com"
    }
  
### Usage of the grunt file
####Tasks
    
##### grunt debug

Use grunt debug to create the debug html file.  You only need to run this when you have added new files to
the src directories.

##### grunt build

Use grunt build to create the production html file.  We still have to copy the html file to a panel to test.

##### grunt test-fast

Use grunt test-fast to run the Jasmine tests in the fast directory.  Typically, the tests in the fast 
directory are more pure unit tests and do not need to connect to Rally.

##### grunt test-slow

Use grunt test-slow to run the Jasmine tests in the slow directory.  Typically, the tests in the slow
directory are more like integration tests in that they require connecting to Rally and interacting with
data.

##### grunt deploy

Use grunt deploy to build the deploy file and then install it into a new page/app in Rally.  It will create the page on the Home tab and then add a custom html app to the page.  The page will be named using the "name" key in the config.json file (with an asterisk prepended).

To use this task, you must create an auth.json file that contains the following keys:
{
    "username": "fred@fred.com",
    "password": "fredfredfred",
    "server": "https://us1.rallydev.com"
}

(Use your username and password, of course.)  NOTE: not sure why yet, but this task does not work against the demo environments.  Also, .gitignore is configured so that this file does not get committed.  Do not commit this file with a password in it!

When the first install is complete, the script will add the ObjectIDs of the page and panel to the auth.json file, so that it looks like this:

{
    "username": "fred@fred.com",
    "password": "fredfredfred",
    "server": "https://us1.rallydev.com",
    "pageOid": "52339218186",
    "panelOid": 52339218188
}

On subsequent installs, the script will write to this same page/app. Remove the
pageOid and panelOid lines to install in a new place.  CAUTION:  Currently, error checking is not enabled, so it will fail silently.

##### grunt watch

Run this to watch files (js and css).  When a file is saved, the task will automatically build and deploy as shown in the deploy section above.

