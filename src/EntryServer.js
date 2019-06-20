var express = require('express');
var os = require('os');

const EntryDatabase = require("./EntryDatabase.js");


var app = express();

/**
 * General notes...
 * You will find here each of the four methods for the CRUD operations.
 * The EntryDatabase object provides the functions for the database access layer.  Each method
 * here will collected the data and pass it to the EntryDatabase object.  These methods also
 * pass the results object to the EntryDatabase methods so they can record their work when
 * the asyncronous database calls complete.
 */



/**
 * Here is the proverbial POST method for adding a new entry into the database.
 */
app.post('/create', function(req, res){
    //  do the insert for a new row and returning the ID.  Get the JSON for the row from the post parameter
    //  Add the current date and time.
    let inData = "";
    req.on('data', chunk => {
        // console.log("chunk: " + chunk)
        inData += chunk.toString();
    });
    req.on('end', () => {
        // console.log("Indata to server: >" + inData + "<");

        var dbHelper = new EntryDatabase();
        var fieldValues = JSON.parse(inData);
        dbHelper.InsertRecord(fieldValues, res);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Access-Control-Allow-Origin', '*');

    });
});

/**
 * Get the existing entries.  Each database record will be an entry in the returned array (as a JSON structure)
 * and each entry will have a keyed array of values.
 */
app.get('/read', function(req, res){
    var dbHelper = new EntryDatabase();
    dbHelper.FetchExisting(res);


    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');


});

/**
 * Delete the desired entry, and identified by a unique ID in the GET parameter list.
 */
app.get('/delete', function(req,res) {
    var victim = req.query.Id;
    var dbHelper = new EntryDatabase();
    dbHelper.DeleteEntry(victim, res);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
});

/**
 * Post updates to an entry identified by the unique ID.
 */
app.post('/update', function(req,res) {
    let inData = "";
    req.on('data', chunk => {
        console.log("chunk: " + chunk)
        inData += chunk.toString();
    });
    req.on('end', () => {
        // console.log("Indata to server for update: >" + inData + "<");
        // var body = querystring.parse(inData);
        // console.log(body);
        var dbHelper = new EntryDatabase();
        var fieldValues = JSON.parse(inData);

        dbHelper.UpdateEntry(fieldValues, res);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Access-Control-Allow-Origin', '*');

        // res.end("Puzzle inserted");
    });

});


app.post('/upload', function(req,res) {

});

const http = require('http');

const hostname = (os.hostname() === "Brian-Coless-iMac.local" || os.hostname() === "localhost" )  ? "127.0.0.1" : "34.204.52.29"; //  '127.0.0.1';
const port = 8081;


app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

