import React from 'react';
import os from 'os';
import ReactDOM from 'react-dom';
import './index.css';
//  import App from './App';
import * as serviceWorker from './serviceWorker';
import axios from 'axios';

/**
 * Object for holding the code and meaning for Product categories.  The code is stored in the database
 * while the meaning is displayed to the user.
 */
class CategoryHolder {
    constructor(code, meaning)
    {
        this.code = code;  //  Must be an integer to exactly match the database value
        this.meaning = meaning;
    }

    /**
     * Make one option for the enclosing Selector tag.
     * @returns {*}
     * @constructor
     */
    MakeSelectorOption()
    {
        return (<option key={"co"+ this.code} value={this.code}> {this.meaning}</option>);
    }
}

/**
 * Object for holding all the data for a single row/product.
 */

class  RowHolder {
    static serialNumber =0 ;

    constructor(whichParent)
    {
        this.Id = -1;
        this.Status = "N";  //  For a new entry


        this.FieldAgent = "";   // <<  in production, would initialize this to logged in user
        this.ProductCategory = 0;  //  Unknown category
        this.ProductMake = "";
        this.ProductModel= "";
        this.ProductYear = ""; //  Site truck 1967, #60,  Refer truck 1968
        this.ProductDescription = "";
        this.ImageFile = "NextProductPlaceHolder.jpg";

        // this.FieldAgent = "me";   // <<  in production, would initialize this to logged in user
        // this.ProductCategory = 0;  //  Unknown category
        // this.ProductMake = "Matchbox";
        // this.ProductModel= "Site truck #60";
        // this.ProductYear = "1967"; //  Site truck 1967, #60,  Refer truck 1968
        // this.ProductDescription = "Cabin transport truck.  Cabin included!"; //   "Refrigeration truck with back door that really opens and closes!  (Refrigeration unit not included.)";
        // this.ImageFile = "IMG_1209.jpg";

        this.Parent = whichParent;

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleImageFile = this.handleImageFile.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.prepareNewStateRowList = this.prepareNewStateRowList.bind(this);
        this.handleEditChange = this.handleEditChange.bind(this);
        this.isEditMode = true;
        console.log("on >" + os.hostname() + "<");
        this.ServerHost = (os.hostname() === "Brian-Coless-iMac.local" || os.hostname() === "localhost" )  ? "localhost:8081" : "34.204.52.29:8081";

    }

    /**
     * Establish the values for the row from JSON data, as would be coming via a fetch to get the list of
     * rows.
     * @param dataSource
     */
    setFromJSON(dataSource) {
        var fieldList = ["Id", "FieldAgent", "ProductMake", "ProductModel", "ProductDescription", "Status", "ImageFile", "ProductCategory", "ProductYear"];
        for (var i = 0; i < fieldList.length; i++)
        {
            this[fieldList[i]] = dataSource[fieldList[i]];
        }
        this.isEditMode = false;
    }

    //  The app is interested in rendering this row.  Use internal info to decide if
    //  we render it for read-only or editing.
    renderEntry() {
        if (this.isEditMode)
            return this.renderEditEntry();
        else
            return this.renderReadOnlyEntry();
    }

    // List of  product categories and their corresponding codes.  Code is store in the database, but meaning
    // displayed on the web.
    static CategoryOptions = [
        new CategoryHolder(0,"Unknown"),
        new CategoryHolder(1, "General Truck"),
        new CategoryHolder(2, "Crane"),
        new CategoryHolder(3, "Firetruck"),
        new CategoryHolder(4, "Ambulance"),
        new CategoryHolder(9999, "Other")
        ];

    renderEditEntry(){
        // alert("Entry data = " + JSON.stringify(this));
        var imageFileName = "/images/" + this.ImageFile;
        var thisIndex = this.Parent.state.RowData.indexOf(this);
        console.log("this index = " + thisIndex);
        return (
            <div key={"90"}>

                <table  key={"100"} ><tbody>
                    <tr key={"101"}>
                        <td rowSpan="7" valign="top"><img src={imageFileName} height="200"  alt="Product Goes Here." /></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr key="110">
                        <td align="right"><span className="labelCell">Field Agent: </span></td><td><input key="115" type="text" name="FieldAgent" className="editCell"  size="32" value={this.FieldAgent}  onChange={this.handleEditChange}/></td>
                    </tr>
                    <tr key="120">
                        <td align="right"><span className="labelCell">Category: </span></td><td><select  key="125"  name="ProductCategory" value={this.ProductCategory}  onChange={this.handleEditChange}>
                        {RowHolder.CategoryOptions.map((catHolder) => { return catHolder.MakeSelectorOption()})}

                    </select></td>

                    </tr>
                    <tr key="130">
                        <td align="right"><span className="labelCell">Make: </span></td><td><input  key="135" type="text" name="ProductMake"  className="editCell"  size="32" value={this.ProductMake}  onChange={this.handleEditChange}/></td>

                    </tr>
                    <tr key="140">
                        <td align="right"><span className="labelCell">Model: </span></td><td><input  key="145"  type="text" name="ProductModel" className="editCell"   size="32" value={this.ProductModel}  onChange={this.handleEditChange}/></td>
                    </tr>
                    <tr key="150">
                        <td align="right"><span className="labelCell">Year: </span></td><td><input  key="155" type="text" name="ProductYear"  className="editCell"  size="4" value={this.ProductYear}  onChange={this.handleEditChange}/></td>
                    </tr>
                    <tr key="160">
                        <td align="right" valign="top"><span className="labelCell">Description: </span></td><td  width="300px">
                            <textarea  key="165"  name="ProductDescription" className="editCell"  rows="4" cols="64" value={this.Parent.state.EditRow.ProductDescription} onChange={this.handleEditChange}></textarea>
                        </td>
                    </tr>

                    <tr key="170">
                        <td>
                            <input type="file" onChange={this.handleImageFile}/>

                        </td>
                        <td></td>
                        <td>
                            {this.makeEditButtonRow()}
                        </td>
                    </tr>
                    <tr key="180"><td colSpan="3"><hr /></td></tr>
                </tbody></table>


            </div>

        );

    }

    makeEditButtonRow() {
        //  If the Id is -1, then we have a new entry, so the only button we need is a Save.  Otherwise we need
        //  an Update and a Cancel button for entries being editted or Edit and Delete buttons for read-only entries.
        if (this.Id === -1)
            return (<button className="button" onClick={this.handleSubmit}>Save</button>);
        else
        {
            if (this.isEditMode)
                return (<div><button className="button" onClick={this.handleUpdate}>Update</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button className="button" onClick={this.handleCancel}>Cancel</button></div>);
            else
                return (<div><button className="button" onClick={this.handleSubmit}>Edit</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button className="button" onClick={this.handleDelete}>Delete</button></div>);

        }
    }

    renderReadOnlyEntry(){
        var imageFileName = "/images/" + this.ImageFile;
        return (
            <div  key={"200"+this.Id}>

                <table><tbody>
                    <tr>
                        <td rowSpan="7" valign="top" ><img src={imageFileName} height="200"  alt="snowplow" /></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td align="right"><span className="labelCell">Field Agent: </span></td>
                        <td><span className="readOnlyCell">{this.FieldAgent}</span> </td>
                    </tr>
                    <tr>
                        <td align="right"><span className="labelCell">Category: </span></td><td>{this.convertCategoryCodeToText(this.ProductCategory)}</td>

                    </tr>
                    <tr>
                        <td align="right"><span className="labelCell">Make: </span></td><td><span className="readOnlyCell">{this.ProductMake}</span> </td>

                    </tr>
                    <tr>
                        <td align="right"><span className="labelCell">Model: </span></td><td><span className="readOnlyCell">{this.ProductModel}</span></td>
                    </tr>
                    <tr>
                        <td align="right"><span className="labelCell">Year: </span></td><td><span className="readOnlyCell">{this.ProductYear}</span></td>
                    </tr>
                    <tr>
                        <td align="right" valign="top"><span className="labelCell">Description: </span></td><td  width="300px"><span className="readOnlyCell">{this.ProductDescription}</span></td>
                    </tr>
                    <tr>
                        <td></td>
                        <td></td>
                        <td><button className="button" onClick={this.handleEdit}>Edit</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button className="button" onClick={this.handleDelete}>Delete</button></td>
                    </tr>

                     <tr><td colSpan="3"><hr /></td></tr>


                </tbody></table>


            </div>

        );

    }

    /**
     * Convert the category code (from the database) to its textual meaning for the read-only rows.
     * @param whichCode
     * @returns {*}
     */
    convertCategoryCodeToText(whichCode)
    {
        var searchCode = parseInt(whichCode);
        for (var i = 0; i < RowHolder.CategoryOptions.length; i++)
        {
            var oneHolder = RowHolder.CategoryOptions[i];
            if (oneHolder.code === searchCode)
                return (<span className="dataCell">{oneHolder.meaning}</span>);
        }
        return (<span className="dataCell">Mystery code {searchCode}</span>);

    }

    handleImageFile(event){
        //  User selected the uploaded file.  We need to preserve it in this object's holder.
        this.ImageFile = event.target.files[0].name;
        this.ImageData = btoa(event.target.file[0]);

    }

    handleEditChange(event) {
        //  console.log(event.target.name + " is changing to " + event.target.value);
        this[event.target.name] = event.target.value;
        this.Parent.setState({EditRow : this});

    }

    /**
     * Used to submit a brand new entry into the database.
     */
    handleSubmit()
    {
        //  We get a circular reference when we try to stringify the object, so we temporarily whipe out
        //  the parent reference before the stringify and then restore it.
        var tempParent = this.Parent;
        this.Parent = null;
        var dataToServer = JSON.stringify(this);
        this.Parent = tempParent;

        //  Adjust the parameters for the axios call to reflect a create (for a new entry) or
        //  an update (for an existing entry)
        var axiosParms =
            {
                method : "POST",
                url : "http://localhost:8081/create",
                data : dataToServer

            } ;

        var thisProxy = this;
        //  Send the data to the server as a POST action.
        axios(axiosParms).then(res=> {
            //  should be returning the unique id for this entry.
            this.Id = res['data']; // the id of the new entry.

            this.prepareNewStateRowList(function(whichRow) {
                if (whichRow.Id === -1)
                {
                    //  We may have to clone the object.  We'll see if this works first
                    thisProxy.Parent.setState({
                        EditRow : whichRow
                    });
                    whichRow.isEditMode = true;
                    return whichRow;
                }
                else {
                    whichRow.isEditMode = false;
                    return whichRow;
                }
            }, true /* add new at beginning */);

            // const  imageToSave = new FormData();
            // imageToSave.append(
            //     'myFile',
            //
            // )


        });


    }

    /**
     * Handler to get called when they want to save change to an existing entry.  Package the data and post it to
     * to the server.
     */
    handleUpdate()
    {
        //  We get a circular reference when we try to stringify the object, so we temporarily whipe out
        //  the parent reference before the stringify and then restore it.
        var tempParent = this.Parent;
        this.Parent = null;
        var dataToServer = JSON.stringify(this);
        console.log("collected data for update:  " + dataToServer);
        this.Parent = tempParent;

        //  Adjust the parameters for the axios call to reflect a create (for a new entry) or
        //  an update (for an existing entry)
        var axiosParms =
            {
                method : "POST",
                url : "http://localhost:8081/update",
                data : dataToServer

            } ;

        var thisProxy = this;
        //  Send the data to the server as a POST action.
        axios(axiosParms).then(res=> {
            //  should be returning the unique id for this entry.
            this.Id = res['data']; // the id of the new entry.

            this.prepareNewStateRowList(function(whichRow) {
                if (whichRow.Id === -1)
                {
                    //  We may have to clone the object.  We'll see if this works first
                    thisProxy.Parent.setState({
                        EditRow : whichRow
                    });
                    whichRow.isEditMode = true;
                    return whichRow;
                }
                else {
                    whichRow.isEditMode = false;
                    return whichRow;
                }
            });

        });


    }
    /**
     * Handle a cancel edit by turning off the edit mode for the selected row and turning on edit
     * mode for the new entry row.
     */
    handleCancel()
    {
        var thisProxy = this;
        this.prepareNewStateRowList(function(whichRow) {
            if (whichRow.Id === -1)
            {
                //  We may have to clone the object.  We'll see if this works first
                thisProxy.Parent.setState({
                    EditRow : whichRow
                });
                whichRow.isEditMode = true;
                return whichRow;
            }
            else {
                whichRow.isEditMode = false;
                return whichRow;
            }
        });


    }

    /**
     * Turn on editting for  row by setting the edit mode for the selected row and turning off
     * edit mode for all others.
     */
    handleEdit()
    {
        var testId = this.Id;
        var thisProxy = this;
        this.prepareNewStateRowList(function(whichRow) {
                if (whichRow.Id === testId)
                {
                    //  We may have to clone the object.  We'll see if this works first
                    thisProxy.Parent.setState({
                        EditRow : whichRow
                    });
                    whichRow.isEditMode = true;
                    return whichRow;
                }
                else {
                    whichRow.isEditMode = false;
                    return whichRow;
                }
            });



    }

    /**
     * Delete this row. We remove it from the database and from the list held by the parent's state.
     */
    handleDelete()
    {
        if (window.confirm("Are you sure you want to delete the " + this.ProductYear + " " + this.ProductMake + " " + this.ProductModel + "?")){
            axios({
                method : "GET",
                url: "http://localhost:8081/delete?Id=" + this.Id

            }).then(res=> {
                //   Copy the existing state's RowData, but leave out the deleted entry.  This will
                //   be faster than rereading the database.
                var testID = this.Id;
                this.prepareNewStateRowList(function(whichRow) {
                    if (whichRow.Id === testID)
                        return null;
                    else
                        return whichRow;


                });




            });

            //  TRIED VALIANTLY to use the axios.delete, but even after trying solutions found on the web, nothing worked, so
            //  used the GET method as shown above.

            // axios.delete("http://localhost:8081/delete",
            //     {params : {data: this.Id}
            //
            //     }).then(res=> {
            //     //  Copy the existing state's RowData, but leave out the deleted entry.  This will
            //     //  be faster than rereading the database.
            //     // var testID = this.Id;
            //     // this.prepareNewStateRowList(function(whichRow) {
            //     //     if (whichRow.Id === testID)
            //     //         return null;
            //     //     else
            //     //         return whichRow;
            //     //
            //     //
            //     // });
            //
            //
            //
            //
            // });
            // axios({
            //     method : 'DELETE',
            //     url : "http://localhost:8081/delete",
            //     id: this.Id
            //
            // }).then(res=> {
            //     //  Copy the existing state's RowData, but leave out the deleted entry.  This will
            //     //  be faster than rereading the database.
            //     var testID = this.Id;
            //     this.prepareNewStateRowList(function(whichRow) {
            //         if (whichRow.Id === testID)
            //             return null;
            //         else
            //             return whichRow;
            //
            //
            //     });




                // var newItemList = [];
                // for (var i = 0; i < this.Parent.state.RowData.length; i++)
                // {
                //     if (this.Parent.state.RowData[i].Id !== this.Id)
                //         newItemList.push(this.Parent.state.RowData[i]);
                // }
                // console.log("Ready to display...");
                // console.log(newItemList);
                // this.Parent.setState({RowData : newItemList});
            // });


        }
    }

    /**
     * Make a copy of the row data for the parent's state.  Fire a callback for each one to let the caller change
     * the data or return null if the entries is to be dropped from the list.  When done, give the parent the
     * new list as a state update.
     * @param callback
     */
    prepareNewStateRowList(callback, addNew = false)
    {
        var newItemList = [];
        if (addNew)
            newItemList.push(new RowHolder(this.Parent));
        for (var i = 0; i < this.Parent.state.RowData.length; i++)
        {
            var rowHolder = callback(this.Parent.state.RowData[i]);
            if  (rowHolder !== null)
                newItemList.push(rowHolder);
        }

        this.Parent.setState({RowData : newItemList});


    }
}

// -------------------------------------------




// ================================================= ITEM ENTRY =========================================================
//  The main class for the list of items up for sale.
class  ItemEntry extends React.Component {

    constructor(props)
    {
        super(props);

        this.state = {
            RowData : [  ],
            DisplayedEntry : -1,  //  Row ID of the currently editted entry or -1 if no entry is being editted.
            SampleText : "hello world",
            EditRow : new RowHolder(this)
        }

    }

    /**
     * In this method, called by the architecture, we load the list of existing items from the
     * database.
     */
    componentDidMount(){
        //  Send the data to the server as a POST action.
        axios({
            method : 'GET',
            url : "http://localhost:8081/read",

        }).then(res=> {
            // console.log("Reading list from...");
            // console.log(res);
            //  should be returning an array of the items in the table
            var newItemList = [new RowHolder(this)];
            for (var i = 0; i < res.data.length; i++)
            {
                var nextRow = new RowHolder(this);
                nextRow.setFromJSON(res.data[i]);
                newItemList.push(nextRow);
            }
            // console.log("Ready to display...");
            // console.log(newItemList);
            this.setState({
                RowData : newItemList,
                EditRow : newItemList[0]
            });
        });



    }

    /**
     * Loops through the collection of rows and renders each one.
     * @returns {*[]}
     */
    renderList()
    {
        return (this.state.RowData.map((row) => {
            return row.renderEntry()
        }));
    }

    // handleChange(event)
    // {
    //
    //     this.setState({SampleText: event.target.value});
    // }

    /**
     * The proverbial render method.  This is the one that gets the whole thing going!
     * @returns {*}
     */
    render() {
        // console.log("Preparing to render...");å
        // console.log(this.state.RowData);
        return (
            <form key="7777"  >
            <div key="8888" >
                { this.renderList()  }
            </div>
                <div>{this.ServerHost}</div>
            </form>
        );
    }
}



ReactDOM.render(<ItemEntry />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
