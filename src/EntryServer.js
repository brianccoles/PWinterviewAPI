var express = require('express');
var os = require('os');
var fs = require('fs');
var multer = require('multer');
var isDevelopment = (os.hostname() === "Brian-Coless-iMac.local" || os.hostname() === "localhost" );
var upload = multer({dest :( isDevelopment? "/Users/brian/Projects/colesb-project/public/images" : "/home/colesb/colesb-project/public/images")});
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
    //   console.log("in post create");
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
    //  console.log("in post update");
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
// app.post('/profile', upload.single('avatar'), function (req, res, next) {
//   // req.file is the `avatar` file
//   // req.body will hold the text fields, if there were any
// })

app.post('/upload', upload.single("file"), function(req,res) {
        //  console.log("in upload");
        //  console.log(req.file);
        var storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, "/Users/brian/Projects/colesb-project/public/images");
            },
            filename: function (req, file, cb) {
                cb(null, "SampleFile.jpg");   // <<<  not sure how this is ever used.  This file name never shows up.
            }

        });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Access-Control-Allow-Origin', '*');

        //  Rename the file so the name includes the original name.  If we have to trace things down
        //  we have a better reference than the temp name created by multer.  This also
        //  adds the extension to identify the type of file.
        var newFile = req.file.filename + "_" + req.file.originalname;
        var newFilePath = req.file.destination + "/" + newFile;
        console.log("New file path is " + newFilePath);
        fs.renameSync(req.file.path, newFilePath);
        //  res.end(req.file.filename);
        res.end(newFile);

});

// app.use(function (err, req, res, next) {
//     console.log('This is the invalid field ->', err.field)
//     next(err)
// })

const http = require('http');

const hostname = isDevelopment ? "127.0.0.1" : "34.204.52.29"; //  '127.0.0.1';
const port = 8081;


app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

