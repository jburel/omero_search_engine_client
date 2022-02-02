var querystarttime;
var queryendtime;
var resource;
let cancel_check = false;
var ajaxCall;
var task_id;
var set_query_form = false;
var bookmark;
var page=0;
var query;
var recieved_results=[];
var size=0;
var query;
var pages_data={};
var ag_grid;
var recieved_data=0;
var columnDefs=[];
var current_values=[];
var extend_url;
var names_ids;
var main_attributes= ["Project name"];

function changeMainAttributesFunction (){
/* */
    var checkbox = document.getElementById("add_main_attibutes");
    mainvalueFields=document.getElementById("mainvalue");
    maincondtion=document.getElementById("maincondition");
    mainkeyFields=document.getElementById("mainkey");

     if (checkbox.checked)
     {
        mainvalueFields.style.display = "block";
        maincondtion.style.display = "block";
        mainkeyFields.style.display = "block";
     }
     else
     {
        mainvalueFields.style.display = "none";
        maincondtion.style.display = "none";
        mainkeyFields.style.display = "none";
     }
}

function cancell_ajaxcall() {
    ajaxCall.onreadystatechange = null;
    ajaxCall.abort();
    console.log("Canceled");
    ajaxCall = null;
    return;
    }

//display message to the user
function displayMessage(header, body, btn_text) {
    messageHeader.innerText = header;
    messageBody.innerText = body;
    if (typeof(btn_text) !== "undefined" && btn_text !== null)
        moelButton.innerText = btn_text;
    $("#displaymessagemodal").modal("show");
    $("#moelButton").hide();
}

function cancelFunction() {
    cancel_check = true;
    cancell_ajaxcall();
    $("#moelButton").hide();
}

function urlFormatter
(row, cell, value, columnDef, dataContext) {
    return "<a href=" + value + " target='_blank'>" + value + "</a>";
}

function valueFormatter(row, cell, value, columnDef, dataContext) {
try {
       return value.toString();

}
catch(err) {
    alert ("Error "+err+", for value: "+value);
}

}

function loadMoreResultsFunction()
{
///#loadMoreResults
submitQuery();
}

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}

function loadRemainingResultsFunction() {
while (recieved_data<size) {
  wait (5000);
           submitQuery();

}
}


function set_global_variables(data)
{
    bookmark=data["bookmark"];
    page=page+1;
    pages_data[page]=data;
    recieved_results=recieved_results.concat(data["values"]);
    size=data["size"];
    query=data["query_details"];
    recieved_data=recieved_data+data["values"].length;
    if (recieved_data>=size){
    var resultsbutton = document.getElementById('loadMoreResults');
    resultsbutton.disabled = true;
    }
}
function sizeToFit() {
  gridOptions.api.sizeColumnsToFit();
}


function getBoolean(id) {
  //var field = document.querySelector('#' + id);
  return true;
}

function getParams() {
  return {
    allColumns: getBoolean('allColumns'),
    //columnSeparator: '\t'
  };
}

function exportToCSV() {
  ag_grid.gridOptions.api.exportDataAsCsv(getParams());
}


function autoSizeAll(skipHeader) {
  var allColumnIds = [];
  gridOptions.columnApi.getAllColumns().forEach(function (column) {
    allColumnIds.push(column.colId);
  });

  gridOptions.columnApi.autoSizeColumns(allColumnIds, skipHeader);
}

function url_render(param){
    //Object.keys(param).forEach(e => console.log(`key=${e}  value=${param[e]}`));
    return '<a href='+extend_url +param.value+' target="_blank" >'+param.value+'</a>'
}

function onGridSizeChanged(params) {
        // get the current grids width
        var gridWidth = document.getElementById('grid-wrapper').offsetWidth;

        // keep track of which columns to hide/show
        var columnsToShow = [];
        var columnsToHide = [];

        // iterate over all columns (visible or not) and work out
        // now many columns can fit (based on their minWidth)
        var totalColsWidth = 0;
        var allColumns = params.columnApi.getAllColumns();
        for (var i = 0; i < allColumns.length; i++) {
            let column = allColumns[i];
            totalColsWidth += column.getMinWidth();
            if (totalColsWidth > gridWidth) {
                columnsToHide.push(column.colId);
            } else {
                columnsToShow.push(column.colId);
            }
        }

        // show/hide columns based on current grid width
        params.columnApi.setColumnsVisible(columnsToShow, true);
        params.columnApi.setColumnsVisible(columnsToHide, false);

        // fill out any available space to ensure there are no gaps
        params.api.sizeColumnsToFit();
}

function displayResults(data, new_data=true) {
   if (new_data)
   set_global_variables(data);


columnDefs =data["columns_def"]
extend_url=data["extend_url"];
names_ids=data["names_ids"];
for (i in data["columns_def"])
{
if(data["columns_def"][i]["field"]==="Id" && resource==="image")
     data["columns_def"][i]['cellRenderer']=url_render;
     }

results = data["values"];

var gridOptions = {
  defaultColDef: {
    resizable: true,
  "filter": true,
  "animateRows":true,
  },
 enableCellTextSelection: true,
  columnDefs: columnDefs,
  rowData: null,
  //onColumnResized: onGridSizeChanged,
   //function (params) {
    //console.log(params);
    //onGridSizeChanged();


  //},
};


 // lookup the container we want the Grid to use
  const eGridDiv = document.querySelector('#myGrid_2');

  // create the grid passing in the div to use together with the columns & data we want to use
  if (page==1)
  ag_grid=new agGrid.Grid(eGridDiv, gridOptions);
 ag_grid.gridOptions.api.setRowData(recieved_results);

    var notice = data["notice"];

    server_query_time = data["server_query_time"];
    //results = data["values"];
    let no_image = results.length;
    if (set_query_form == true) {
        var filters = data["filters"];
        var orFilter = filters["or_filters"];
        var andFilter = filters["and_filters"];
        var notFilter = filters["not_filters"];
        resource = data["resource"]
        for (i in orFilter)
            for (const [key, value] of Object.entries(orFilter[i])) {
                addConditionRow(key, value, "or");
            }
        for (i in andFilter)
            for (const [key, value] of Object.entries(andFilter[i])) {

                addConditionRow(key, value, "and");
            }
        for (i in notFilter)

            for (const [key, value] of Object.entries(notFilter[i])) {

                addConditionRow(key, value, "not");
            }
        message = "No of "+data["resource"]+" , "+ recieved_data +"/"+size+", Search engine query time: " + server_query_time + " seconds.";

    } else {
        var querytime = (queryendtime - querystarttime) / 1000;
        if (no_image!=size)
         {
            message = "No of "+data["resource"]+ ", "+ recieved_data +"/"+size + ", Search engine query time: " + server_query_time + " seconds.";
             document.getElementById('loadMoreResults').style.display = "block";
            }
        else
        {
            message = "No of "+data["resource"] +", "+ recieved_data+ ", Search engine query time: " + server_query_time + " seconds.";
             document.getElementById('loadMoreResults').style.display = "none";
            }
    }

    var resultsDiv = document.getElementById('results');

    var conditions_con = document.getElementById('conditions');

    var resources_con = document.getElementById('resources');
    var help = document.getElementById('help');
    conditions_con.disabled = true;

    resources_con.style.display = "none";
    help.style.display = "none";
    var query_cr = document.getElementById('conditions');
help
    resultsDiv.style.display = "block";

    $('#no_images').text(message);

    var grid;
    var columns = data["columns"];
     for (var i = 0; i < columns.length; i++) {
        columns[i].formatter=valueFormatter;
    }

    var options = {
        enableCellNavigation: true,
        enableColumnReorder: false,
        multiColumnSort: true,
        forceFitColumns: true
    };
    $('#displaymessagemodal').modal('hide');
    var nodes = document.getElementById("conditions").getElementsByTagName('*');

    for (var i = 0; i < nodes.length; i++) {
        nodes[i].disabled = true;
    }

    window.location.hash = '#results';
    document.getElementById('load_results_buttons').style.display = "block";
    if (new_data)
    {
     return;
    var tr = document.getElementById('loads_results_table').tHead.children[0],
    th = document.createElement('th');
    tr.appendChild(th);
    var pagebutton = document.createElement("BUTTON");
    pagebutton.innerHTML = page;
    th.appendChild(pagebutton);

      th.appendChild(pagebutton);
    pagebutton.addEventListener("click", function() {
        alert(pagebutton.innerText);
        displayResults(data, false);
    });
    }
}

function get_query_data(group_table_) {
    query_items = [];
    let group_table = document.getElementById(group_table_);
    for (var r = 1; r < group_table.rows.length; r++) {
        query_dict = {}
        query_items[r - 1] = query_dict;
        name_ = group_table.rows[r].cells[0].innerHTML;
        operator_ = group_table.rows[r].cells[1].innerHTML;
        value_ = group_table.rows[r].cells[2].innerHTML;
        resourse_=group_table.rows[r].cells[3].innerHTML;
        //query_dict[name_] = value_
        query_dict["name"]=name_
        query_dict["value"]=value_
        query_dict["operator"]=operator_
        query_dict["resourse"]=resourse_
    }
    return query_items;
}

var filterParams = {
  suppressAndOrCondition: true,
  comparator: function (filterLocalDateAtMidnight, cellValue) {
    var dateAsString = cellValue;
    if (dateAsString == null) return -1;
    var dateParts = dateAsString.split('/');
    var cellDate = new Date(
      Number(dateParts[2]),
      Number(dateParts[1]) - 1,
      Number(dateParts[0])
    );

    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
      return 0;
    }

    if (cellDate < filterLocalDateAtMidnight) {
      return -1;
    }

    if (cellDate > filterLocalDateAtMidnight) {
      return 1;
    }
  },
  browserDatePicker: true,
};


function submitQuery() {
    resource = document.getElementById('resourcseFields').value;
    let quries={}

    querystarttime = new Date().getTime();
    query_details = {}
    var query = {
        "resource": resource,
        "query_details": query_details
    };
    if (size>0)
        {
            query["bookmark"]=bookmark;
            query["columns_def"]=columnDefs;
        }
    var andQuery = get_query_data("and_group");
    var orQuery = get_query_data("or_group");

    if (andQuery.length == 0 && orQuery.length == 0 ) {
        alert("There is no query to submit, at least one condition should be selected");
        return;
    }
    query_details["and_filters"] = andQuery;
    query_details["or_filters"] = orQuery;

    send_the_request(query);

}

function send_the_request(query)
{
$.ajax({
        type: "POST",
        url: submitqueryurl,
        contentType: "application/json;charset=UTF-8",
        dataType: 'json',
        data: JSON.stringify(query),
        success: function(data) {
            if (data["Error"] != "none") {
                alert(data["Error"]);
                return;
            }
            displayResults(data);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus);
            alert("Error: " + errorThrown);
        }
    });
}

function addAndConditionFunction()
{
AddConditionFunction("and");
}

function addOrConditionFunction()
{
AddConditionFunction("or");

}

function AddConditionFunction(group) {
    let value_fields = document.getElementById('valueFields');
    let condtion = document.getElementById('condtion').value;

    let key = keys_options.value;
    let value = value_fields.value;
    let resourse = resourcseFields.value;



    if (!value || value.length === 0) {
        alert("Please select a value");
        return;
    }

    if (!key || key.length === 0) {
        alert("Please select an attribute");
        return;
    }
    addConditionRow(key, value, condtion, resourse, group);
}


function addConditionRow(key, value, condtion, resourse, group) {

    let tableRef = document.getElementById(group + "_group");

    let newRow = tableRef.insertRow(-1);

    // Insert cells in the row
    let keyCell = newRow.insertCell(0);
    let operatorCell = newRow.insertCell(1);
    let valueCell = newRow.insertCell(2);
    let resourseCell = newRow.insertCell(3);
    let removeCell = newRow.insertCell(4);

    // Append a text node to the cells
    let keyText = document.createTextNode(key);
    keyCell.appendChild(keyText);

    let operatorText = document.createTextNode(condtion);
    operatorCell.appendChild(operatorText)


    let valueText = document.createTextNode(value);
    valueCell.appendChild(valueText);

    let resourseText = document.createTextNode(resourse);
    resourseCell.appendChild(resourseText);

    var removebutton = document.createElement("BUTTON");
    removebutton.innerHTML = "X Remove";
    removebutton.setAttribute("class", "btn btn-danger btn-sm");
    removeCell.appendChild(removebutton);

    //alert(keys_options.value);
    removebutton.addEventListener("click", function() {
        var row = removebutton.parentNode.parentNode;
        row.parentNode.removeChild(row);
    });
}

/*
set autocpmlete values for key using a function to filter the available values
It solves the issue of having many available values (sometimes tens of thousnads),
it was freezing the interface */
function setAutoCompleteValues(){
    $( "#valueFields" ).autocomplete({
                    source: setFieldValues(),
                    minLength:0
                })//.bind('focus', function(){ $(this).autocomplete("search"); } );
}

//As main attributes supports equals andnot equals only
//This function restrict the use to these two operators
function set_operator_options(key_value)
{
condtion = document.getElementById("condtion");
condtion.value=condtion.options[0].text;
for (i =0; i< condtion.length; i++  )
{

if (main_attributes.includes(key_value))
    {
         if (condtion.options[i].text!= "equals" && condtion.options[i].text!="not equals")
            condtion.options[i].style.display = "none";

      }
 else
    {
        condtion.options[i].style.display = "block";
    }

    }
}
function set_key_values(key_value) {

    $( "#valueFields" ).val('');

    set_operator_options(key_value);
    resource = selected_resource.value;
    url=getresourcesvalesforkey+ "/?key=" + encodeURIComponent(key_value)+"&&resource="+ encodeURIComponent(resource);
    fetch(url).then(function(response) {
      {
        response.json().then(function(data) {
            data.sort();
            current_values=data;


                });
            }
    });
}

function setFieldValues(){
    let value_fields = document.getElementById('valueFields');
    val=value_fields.value;
    if (!val || val.length === 0  )
        return [];
    //for performance, when the value is one letter, it will only return all the items which start with this letter
    //otherwise, it will return all the items which contains the value (even ther are  at the middle or at the end of the items)
    if (val.length ===1)
        return current_values.filter(x => x.toLowerCase().startsWith(val.toLowerCase()))
    else
        return current_values.filter(x => x.toLowerCase().includes(val.toLowerCase()))

}

function set_resources(resource) {
    for (const [key, value] of Object.entries(resources_data)) {
        if (key == resource) {
            optionHtml = ''
            if (value==null)
              {
              keys_options.innerHTML = optionHtml;
            break;
              }
             if (key=="image")
                   //#value.unshift("Project name");
                   value.push("Project name");
             value.sort();


            for (i in value) {
                optionHtml += '<option value ="' + value[i] + '">' + value[i] + '</option>'
            }
            keys_options.innerHTML = optionHtml;
            break;
        }
    }
    key_value = keys_options.value;
    set_key_values(key_value);
}

let selected_resource = document.getElementById('resourcseFields');
let keys_options = document.getElementById('keyFields');
let keyFields= document.getElementById('keyFields');


selected_resource.onchange = function() {
    resource = selected_resource.value;
/*
     if (resource=="image")
        document.getElementById("checkMainAttribute").style.display = "block";
    else
    {
        document.getElementById("checkMainAttribute").style.display = "none";
        var checkbox = document.getElementById("add_main_attibutes").checked=false;
        mainvalueFields.style.display = "none";
        maincondtion.style.display = "none";
        mainkeyFields.style.display = "none";
        }
*/
    set_resources(resource);
}

keys_options.onchange = function() {
    key_value = keys_options.value;
    set_key_values(key_value);
}

$(document).ready(function() {

    if (query_id != "None") {
        set_query_form = true;
        task_id = query_id;
        header = "Retrieve results";
        body = "Please wait while retrieving the results for \n\rQuery no: " + task_id + ", this may take some time";
        displayMessage(header, body);
        setTimeout(function() {
            get_results();
        }, 600);

    } else {
    optionHtml = ''
    for (key in resources_data) {
                optionHtml += '<option value ="' + key + '">' + key+ '</option>'
            }
       resourcseFields.innerHTML = optionHtml;
       optionOpHtml = ''
       for (i in operator_choices)
       {
         optionOpHtml += '<option value ="' + operator_choices[i][0] + '">' + operator_choices[i][1]+ '</option>'
       }
       condtion.innerHTML = optionOpHtml;
        var resources_con = document.getElementById('resources');
        resources_con.style.display = "block";
        resource = selected_resource.value = 'image';
        //document.getElementById("checkMainAttribute").style.display = "block";
        set_resources('image');
    }

});
