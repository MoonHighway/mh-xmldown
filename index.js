var path = require('path');
var fs = require('fs');
var request = require('request');
var async = require('async');
var parseString = require('xml2js').parseString;

module.exports = {

    grab: function (url, out, done) {

        var steps;

        // url argument is required
        if (!url) {
            throw new Error("a url is required to grab.");
        }

        // other arguments are optional
        out = out || './xmldata';
        done = done || function () {};

        // If the output directory does not exist, create it
        if (!fs.existsSync(__dirname + out.replace('.', ''))) {
            fs.mkdirSync(out);
        }

        // Organize the process into a pipeline array
        steps = [

            // 1 - Request the XML File
            function (next) {
                request(url, function (err, res, body) {
                    if (err) {
                        return next(err);
                    }
                    next(null, body);
                });
            },

            // 2 - Save the XML File Locally
            function (body, next) {
                fs.writeFile(out + "/" + path.basename(url), body, function (err) {
                    if (err) {
                        return next(err);
                    }
                    next(null, body);
                });
            },

            // 3 - Parse the XML File as JSON
            function (body, next) {
                parseString(body, function (err, json) {
                    if (err) {
                        return next(err);
                    }
                    next(null, json);
                });
            },

            // 4 - Save the JSON file locally
            function(json, next) {
                fs.writeFile(out + "/" + path.basename(url).replace('.xml', '.json'), JSON.stringify(json), function (err) {
                    if (err) {
                        return next(err);
                    }
                    next(null, json);
                });
            }

        ];

        // Execute the steps in order
        async.waterfall(steps, function (err, json) {

            // If any errors occurred, return them
            if (err) {
                return done(err);
            }

            // Otherwise return teh resulting json
            return done(null, json);

        });

    }

};