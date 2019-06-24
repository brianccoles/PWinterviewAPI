import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
//  import App from './App';
import * as serviceWorker from './serviceWorker';
import axios from 'axios';


import os from 'os';
const ServerHost =  os.hostname()  + ":8081"; //  "localhost:8081"; //  "34.204.52.29:8081"; //  (os.hostname() === "ip-172-30-0-115" ? "34.204.52.29:8081" : "localhost:8081") ;

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

        //  Establish the default values for a new entry.
        this.FieldAgent = "";   // <<   FUTURE FEATURE:   in production, would initialize this to logged in user
        this.ProductCategory = 0;  //  Unknown category
        this.ProductMake = "";
        this.ProductModel= "";
        this.ProductYear = ""; //  Site truck 1967, #60,  Refer truck 1968
        this.ProductDescription = "";
        this.ImageFile = "NextProductPlaceHolder.jpg";
        this.TempImageFile = null;
        this.DisplayedFileName = "/images/" + (this.TempImageFile !== null ? this.TempImageFile : this.ImageFile);
        this.OldFileName = null;

        //  Latch the parent.  When working with a row, we can find the enclosing class to set it's state and affect
        //  change via React's framework.
        this.Parent = whichParent;

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleImageFile = this.handleImageFile.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.prepareNewStateRowList = this.prepareNewStateRowList.bind(this);
        this.handleEditChange = this.handleEditChange.bind(this);
        this.handleNewEntryClear = this.handleNewEntryClear.bind(this);
        this.isEditMode = true;
        //  console.log("on >" + os.hostname() + "<");
        //  this.ServerHost = (os.hostname() === "Brian-Coless-iMac.local" || os.hostname() === "localhost" )  ? "localhost:8081" : "34.204.52.29:8081";

    }

    /**
     * Make a shallow copy of the holder.  Used with React state so we can modify this one and sent up as a new
     * set of state values.
     * @returns {RowHolder}
     */
    cloneMe()
    {
        var rv = new RowHolder(this.Parent);

        rv.Id = this.Id;
        rv.Status = this.Status;
        rv.FieldAgent = this.FieldAgent;   // <<  in production, would initialize this to logged in user
        rv.ProductCategory = this.ProductCategory;  //  Unknown category
        rv.ProductMake = this.ProductMake;
        rv.ProductModel = this.ProductModel;
        rv.ProductYear = this.ProductYear ; //  Site truck 1967, #60,  Refer truck 1968
        rv.ProductDescription = this.ProductDescription ;
        rv.ImageFile = this.ImageFile;
        rv.TempImageFile = this.TempImageFile;
        rv.DisplayedFileName = this.DisplayedFileName;
        rv.OldFileName = this.OldFileName;
        rv.isEditMode = this.isEditMode;
        return rv;
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
        this.establishDisplayedName();
    }

    establishDisplayedName(){
        if (this.TempImageFile !== null)
            this.DisplayedFileName = "images/" +  this.TempImageFile;
        else
            this.DisplayedFileName = "images/" +  this.ImageFile;

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
    // >>>> FUTURE FEATURE read this list from entries in the database and allow the users to create new ones, in some managed way.
    static CategoryOptions = [
        new CategoryHolder(0,"Unknown"),
        new CategoryHolder(1, "General Truck"),
        new CategoryHolder(2, "Crane"),
        new CategoryHolder(3, "Firetruck"),
        new CategoryHolder(4, "Ambulance"),
        new CategoryHolder(9999, "Other")
        ];

    renderEditEntry(){
        //  Render our layout with empty fields (for a new entry) or filled-in fields to edit an existing product.  Reference the parent's state so the values
        //  become controlled.
        //  FUTURE FEATURE:  grey out the labels of the
        var labelClass = this.Id === -1 && !this.isEditMode ? "greyLabelCell" : "labelCell";
        return (
            <div key={"90"}>

                <table  key="100" ><tbody>
                    <tr key="101">
                        <td key="102" rowSpan="7" valign="top"><img key="103" src={this.Parent.state.EditRow.DisplayedFileName} height="200"  alt="Product Goes Here." /></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr key="110">
                        <td align="right"><span className={labelClass}>Field Agent: </span></td><td><input key="115" type="text"  name="FieldAgent" className="editCell"  size="32" value={this.FieldAgent}  onChange={this.handleEditChange}/></td>
                    </tr>
                    <tr key="120">
                        <td align="right"><span className={labelClass}>Category: </span></td><td><select  key="125"  name="ProductCategory" value={this.Parent.state.EditRow.ProductCategory}  onChange={this.handleEditChange}>
                        {RowHolder.CategoryOptions.map((catHolder) => { return catHolder.MakeSelectorOption()})}

                    </select></td>

                    </tr>
                    <tr key="130">
                        <td align="right"><span className={labelClass}>Make: </span></td><td><input  key="135" type="text"   name="ProductMake"  className="editCell"  size="32" value={this.Parent.state.EditRow.ProductMake}  onChange={this.handleEditChange}/></td>

                    </tr>
                    <tr key="140">
                        <td align="right"><span className={labelClass}>Model: </span></td><td><input  key="145"  type="text"   name="ProductModel" className="editCell"   size="32" value={this.Parent.state.EditRow.ProductModel}  onChange={this.handleEditChange}/></td>
                    </tr>
                    <tr key="150">
                        <td align="right"><span className={labelClass}>Year: </span></td><td><input  key="155" type="text"   name="ProductYear"  className="editCell"  size="4" value={this.Parent.state.EditRow.ProductYear}  onChange={this.handleEditChange}/></td>
                    </tr>
                    <tr key="160">
                        <td align="right" valign="top"><span className={labelClass}>Description: </span></td><td  width="300px">
                            <textarea  key="165"  name="ProductDescription"   className="editCell"  rows="4" cols="64" value={this.Parent.state.EditRow.ProductDescription} onChange={this.handleEditChange}></textarea>
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
        //  handleNewEntryClear
        if (this.Id === -1)
            if (this.isEditMode)
                return (<div><button className="button" onClick={this.handleSubmit}>Save</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button className="button" onClick={this.handleNewEntryClear}>Clear</button></div>);
            else
            {
                //  if the first row isn't in edit mode for a new entry, then there are no buttons needed.
                return (<span></span>);
            }
        else
        {
            if (this.isEditMode)
                return (<div><button className="button" onClick={this.handleUpdate}>Update</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button className="button" onClick={this.handleCancel}>Cancel</button></div>);
            else
                return (<div><button className="button" onClick={this.handleSubmit}>Edit</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button className="button" onClick={this.handleDelete}>Delete</button></div>);

        }
    }

    renderReadOnlyEntry(){
        return (
            <div  key={"200"+this.Id}>

                <table><tbody>
                    <tr>
                        <td rowSpan="7" valign="top" ><img src={this.DisplayedFileName} height="200"  alt="Product Goes Here" /></td>
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

    //  -------------------  Event Handlers ------------------------

    handleImageFile(event){
        //  User selected the uploaded file.  We need to preserve it in this object's holder.
        var preservedFileName = event.target.files[0].name;

        const formData = new FormData();
        formData.append('file', event.target.files[0] );     //   /*  event.target.files[0].name  */
        const config = { headers: {"Content-Type" : "multipart/form-data"} };
        var outerThisProxy = this;
        axios.post('http://'+ServerHost+'/upload', formData, config )
            .then((response) => {
                outerThisProxy.prepareNewStateRowList(function(whichRow) {
                    if (whichRow.Id === outerThisProxy.Id)
                    {
                        whichRow = whichRow.cloneMe();

                        whichRow.ImageFile = preservedFileName;  //  name of the file the user selected
                        whichRow.TempImageFile = response['data'];        //  name of the file on the server for this uploaded image.
                        whichRow.establishDisplayedName();
                        //  By updating the edit row, we force react to refresh the picture and pick up the new one.
                        //  outerThisProxy.Parent.setState({EditRow : whichRow});
                        console.log("new image in this row");
                        console.log(outerThisProxy);
                    }
                    return whichRow;

                })


            })
            .catch((error) => {
                console.log(error);
            })


    }

    //  The event handler tied to the input fields.  Since the name of the control exactly matches the
    //  name of the field in the structure, we can easily use the name to set the right row holder's value.
    handleEditChange(event) {
        this[event.target.name] = event.target.value;
        var editRowHolder = this.cloneMe();
        //  Preserve the display file name so we can restore it in the event of a cancel.
        editRowHolder.OldFileName = editRowHolder.DisplayedFileName;
        editRowHolder.isEditMode = true;
        this.Parent.setState({EditRow : editRowHolder});

    }

    /**
     * Used to submit a brand new entry into the database.
     */
    handleSubmit()
    {
        //  If there are any bad values, bail.
        if (this.proofData() === false)
            return;

        //  Establish the temp name for the image as the final name, but only if the user uploaded an image.
        //  FUTURE FEATURE We need to managed these better, with a system for clearing out uploaded, but unused
        //  images from the directory.
        if (this.TempImageFile !== null)
            this.ImageFile = this.TempImageFile;
        else
        {
            //  Don't have a temp image file, so didn't upload a picture.  Store the placeholder for an empty
            //  image.
            this.ImageFile = "MissingProductPlaceHolder.jpg";
            this.establishDisplayedName();
        }


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
                url : "http://"+ServerHost+"/create",
                data : dataToServer

            } ;

        //  Send the data to the server as a POST action.
        axios(axiosParms).then(res=> {
            //  should be returning the unique id for this entry.
            this.Id = res['data']; // the id of the new entry.
            this.prepareNewStateRowList(function(whichRow) {
                if (whichRow.Id === -1)
                {
                    //  We may have to clone the object.  We'll see if this works first
                    // thisProxy.Parent.setState({
                    //     EditRow : whichRow
                    // });
                    whichRow.isEditMode = true;
                    return whichRow;
                }
                else {
                    whichRow.isEditMode = false;
                    return whichRow;
                }
            }, true /* add new at beginning */)
                .catch(error => {
                    alert("Trouble saving new entry: " + error);

                });



        });


    }

    /**
     * Handler to get called when they want to save change to an existing entry.  Package the data and post it to
     * to the server.
     */
    handleUpdate()
    {
        if (this.proofData() === false)
            return;

        //  If the update includes a new image, then use the TempImageFile as the permanent one.
        //  If not, then we just let the existing image ride.
        if (this.TempImageFile !== null)
            this.ImageFile = this.TempImageFile;


        //  We get a circular reference when we try to stringify the object, so we temporarily whipe out
        //  the parent reference before the stringify and then restore it.
        var tempParent = this.Parent;
        this.Parent = null;
        var dataToServer = JSON.stringify(this);
        //  console.log("collected data for update:  " + dataToServer);
        this.Parent = tempParent;

        //  Adjust the parameters for the axios call to reflect a create (for a new entry) or
        //  an update (for an existing entry)
        var axiosParms =
            {
                method : "POST",
                url : "http://"+ServerHost+"/update",
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

        })
            .catch(error => {
                alert("Trouble updating entry: " + error);

            });


    }
    /**
     * Handle a cancel edit by turning off the edit mode for the selected row and turning on edit
     * mode for the new entry row.
     */
    handleCancel()
    {
        this.prepareNewStateRowList(function(whichRow) {

            whichRow.isEditMode = (whichRow.Id === -1);

            //  Restore the preserved file name as current one.
            whichRow.DisplayedFileName = whichRow.OldFileName;
            whichRow.OldFileName = null;
            return whichRow;
        });


    }

    handleNewEntryClear()
    {
        var thisProxy = this;
        this.prepareNewStateRowList(function(whichRow) {
            //   The contructor for a new row establish the values for a pristine
            //   edit.
            whichRow = new RowHolder(thisProxy.Parent);
            return whichRow;
        });
    }

    /**
     * Turn on editting for  row by setting the edit mode for the selected row and turning off
     * edit mode for all others.
     */
    handleEdit()
    {
        var testId = this.Id;
        console.log(this);
        this.prepareNewStateRowList(function(whichRow) {

                whichRow.isEditMode = (whichRow.Id === testId);
                whichRow.OldFileName = whichRow.DisplayedFileName;
                return whichRow;
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
                url: "http://"+ServerHost+"/delete?Id=" + this.Id

            }).then(res=> {
                //   Copy the existing state's RowData, but leave out the deleted entry.  This will
                //   be faster than rereading the database.
                var testID = this.Id;
                this.prepareNewStateRowList(function(whichRow) {
                    console.log("comparing " + whichRow.Id + " = " + testID + "?");
                    if (whichRow.Id === testID)
                        return null;
                    else
                        return whichRow;


                });




            })
                .catch(error => {
                    alert("Trouble deleting entry: " + error);

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
        var editRow = null;
        for (var i = 0; i < this.Parent.state.RowData.length; i++)
        {
            var rowHolder = callback(this.Parent.state.RowData[i]);
            if  (rowHolder !== null)
            {
                newItemList.push(rowHolder);
                if (rowHolder.isEditMode)
                    editRow = rowHolder
            }

        }
        var newState = {RowData : newItemList};
        if (editRow != null)
            newState.EditRow = editRow;
        this.Parent.setState(newState);



    }

    /**  Proof the data for a new entry or a modified one.  Do it here for finner control over the proofing
     * and when it is done.
     * @returns {boolean}  True if all the values pass inspection; false if not.
     */
    proofData()
    {

        if (this.FieldAgent.length === 0)
        {
            alert("Please enter a value for the required Agent field");
            return false;
        }
        if (this.ProductMake.length === 0)
        {
            alert("Please enter a value for the required Make field");
            return false;
        }
        if (this.ProductModel.length === 0)
        {
            alert("Please enter a value for the required Model field");
            return false;
        }
        if (this.ProductYear.length === 0  || Number.isInteger(this.ProductYear))
        {
            alert("Please enter a valid integer value for the required Year field");
            return false;
        }
        if (this.ProductDescription.length === 0)
        {
            alert("Please enter a value for the required Desription field");
            return false;
        }
        //  alert ("entry passed inspection");
        return true;
    }
}





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
            url : "http://"+ServerHost+"/read",

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
        })
            .catch(error => {
                alert("Trouble fetch list of products: " + error);

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


    /**
     * The proverbial render method.  This is the one that gets the whole thing going!
     * @returns {*}
     */
    render() {
        // console.log("Preparing to render...");å
        // console.log(this.state.RowData);
        return (

            <form key="7777"  >

                <img key="103" src="images/LavendarWaveLogo.jpg"  alt="Logo" />
                <hr />

                <div key="8888" >
                    { this.renderList()  }
                 </div>

            </form>
        );
    }
}



ReactDOM.render(<ItemEntry />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
