var expect = require('chai').expect;
var downloader = require('../index');
var nock = require('nock');
var fs = require('fs');
var path = require('path');

describe("XML downloader", function () {

    before(function (done) {

        // Create a Mock http server to test loading xml from HTTP
        this.server = nock('http://www.xmlfiles.com')
            .get('/sample.xml')
            .reply(200, function (uri, requestBody) {
                return fs.createReadStream(__dirname + '/resources/students.xml');
            });

        // Run our SUT, the downloader.grap() functhin
        downloader.grab('http://www.xmlfiles.com/sample.xml', './output', function (err, data) {

            if (err) {
                throw err;
            }

            this.results = data;
            this.dir = path.normalize(__dirname + '/../output');

            done();

        }.bind(this));


    });

    after(function () {

        var dir = this.dir;

        // If the directory was created, recursively delete it
        if (fs.existsSync(dir)) {

            // Remove all files in this directory
            fs.readdirSync(dir).forEach(function (file) {
                fs.unlink(dir + "/" + file);
            });

            // Remove the directory itself
            fs.rmdirSync(dir)
        }

        // Clean up the test object
        delete this.results;
        delete this.dir;
        delete this.server;

    });

    it("creates an output directory as './output/'", function () {
        expect(fs.existsSync(this.dir)).to.equal(true);
    });

    it("downloads an xml file", function () {
        expect(fs.existsSync(this.dir + "/sample.xml")).to.equal(true);
    });

    it("returns xml parsed as json", function () {
        expect(typeof this.results).to.equal('object');
    });

    it("saves a json file", function () {
        expect(fs.existsSync(this.dir + "/sample.json")).to.equal(true);
    });

});