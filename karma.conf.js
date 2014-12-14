module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],
        files: [
            "bower_components/d3/d3.min.js",
            "bower_components/angular/angular.min.js",
            "vendor/mm-foundation-tpls-0.5.1.min.js",
            "dist/js/jsflap-withtests.js"
        ],
        autoWatch : false,
        browsers : ['PhantomJS'],
        reporters: ['progress'],
        plugins : [
            'karma-phantomjs-launcher',
            'karma-jasmine'
        ]
    });
};