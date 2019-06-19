var mysql = require('mysql');

class EntryDatabase {

    /*  The table...
    MariaDB [interview10]> describe AuctionItems;
    +--------------------+---------------------+------+-----+---------+----------------+
    | Field              | Type                | Null | Key | Default | Extra          |
    +--------------------+---------------------+------+-----+---------+----------------+
    | Id                 | bigint(20) unsigned | NO   | PRI | NULL    | auto_increment |
    | FieldAgent         | char(32)            | YES  |     | NULL    |                |
    | ProductCategory    | smallint(6)         | YES  |     | NULL    |                |
    | ProductMake        | char(32)            | YES  |     | NULL    |                |
    | ProductModel       | char(16)            | YES  |     | NULL    |                |
    | ProductYear        | smallint(6)         | YES  |     | NULL    |                |
    | ProductDescription | varchar(255)        | YES  |     | NULL    |                |
    | Status             | char(1)             | YES  |     | NULL    |                |
    | FinalPrice         | decimal(5,2)        | YES  |     | NULL    |                |
    | ImageFile          | char(128)           | YES  |     | NULL    |                |
    +--------------------+---------------------+------+-----+---------+----------------+
     */
    constructor() {

        this.con = mysql.createConnection({
            host: "34.204.52.29",
            user:  "colesb",
            password : "dhgMxbBMHswDmnDQ",
            database : "interview10",
            // host: "bcpractice.ce6wunnrmla1.us-east-2.rds.amazonaws.com",
            // user: "Brian",
            // password: "7C5o5ChXpt",
            // database: "Laravel",
            port: 3306
        })

        this.con.connect((err) => {
            if (err) throw err;
            console.log("Connected");
        });


    }

    /**
     * Insert a new record
     * @param fieldValues  The keyed array of values for the new record.
     * @param res
     * @constructor
     */
    InsertRecord(fieldValues, res){
        var assignmentList = this.prepareAssignmentList(fieldValues);

        // console.log(fieldValues);

        var insertStmt = "Insert into AuctionItems set " + assignmentList;
        // console.log("SQL=" + insertStmt);
        var insertedID;
        this.con.query(insertStmt, (err, results) => {
            if (err) throw err;
            // console.log("results from query:  ")
            // console.log(results);
            insertedID = results.insertId;
            res.end(insertedID.toString());
        });

    }

    /**
     * Update an existing record with the values from the web app.
     * @param fieldValues
     * @param res
     * @constructor
     */
    UpdateEntry(fieldValues, res){
        var assignmentList = this.prepareAssignmentList(fieldValues);

        // console.log(fieldValues);

        var insertStmt = "Update AuctionItems set " + assignmentList + " where Id=" + fieldValues['Id'];
        // console.log("SQL=" + insertStmt);
        var insertedID;
        this.con.query(insertStmt, (err, results) => {
            if (err) throw err;
            // console.log("results from query:  ")
            // console.log(results);
            res.end("done");
        });

    }

    /**
     * For both the INSERT and UPDATE, we need a list of name/value pairs in SQL format.  This method prepares those
     * from the keyed array of fieldValues.
     * @param fieldValues
     * @returns {string|string}
     */
    prepareAssignmentList(fieldValues)
    {
        var assignmentList = "";
        var separator = "";

        //  Strings need to be quoted, so make those first.

        var StringList = ["FieldAgent", "ProductMake", "ProductModel", "ProductDescription", "Status", "ImageFile"];
        for (var i = 0; i < StringList.length; i++) {
            var oneField = StringList[i];
            assignmentList += separator + oneField + "='" +  fieldValues[oneField].replace("'", "\\'") + "'";
            separator = ",";
        }

        //  Numbers are left unquoted.  Take care of them now.
        var NumberList = ["ProductCategory", "ProductYear"];
        for (var i = 0; i < NumberList.length; i++) {
            var oneField = NumberList[i];
            assignmentList += separator + oneField + "=" + fieldValues[oneField];
            separator = ",";

        }

        return assignmentList;

    }

    /**
     * Fetch the list of existing entries and put them in the JSON structure, returned in the res parameter.
     * @param res
     * @constructor
     */
    FetchExisting(res){
        this.con.query("select * from AuctionItems", (err, results) => {
            if (err) throw err;
            //  console.log(results);
            res.end(JSON.stringify(results));
        });



    }

    /**
     * Thump an entry.
     * @param victimID  The unique id of the entry to delete.
     * @param res
     * @constructor
     */
    DeleteEntry(victimID, res) {
        var deleteStmt = "delete from AuctionItems where Id = " + victimID;
        this.con.query(deleteStmt, (err, results) => {
            if (err) throw err;
            res.end("gone");
        });

    }

}

module.exports = EntryDatabase;