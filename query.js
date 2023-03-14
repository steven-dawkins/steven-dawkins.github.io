function readForm(name) {
    
    const form = document.querySelector("#filters_form");
    const indicatorsForm = form.querySelector('select[name="'+ name + '"]');

    if (indicatorsForm === null) {
        throw new Error("Count not find: " + name);
    }

    const indicators = [];
    for(let i =0 ; i < indicatorsForm.selectedOptions.length; i++)
    {
        indicators.push(indicatorsForm.selectedOptions.item(i).value);
    }

    return indicators;
}

function toObject(arr, fields) {
    const result= {};
    for(let i = 0; i < fields.length; i++) {
        result[fields[i]] = arr[i] ? arr[i] : "";

        if (Number.isInteger(fields[i])) {
            const v = result[fields[i]];

            result[fields[i]] = typeof(v) === "string" ? "" : v.toFixed(1)
        }
    }    

    return result;
}

function GetQuery() {
    const form = document.querySelector("#filters_form");

    const data = {
        startyear: parseInt(form.querySelector('select[name="start_year"]').value),
        endyear: parseInt(form.querySelector('select[name="end_year"]').value),
        indicators: readMeasureFormField("indicators", "indicators"),
        transformations: readMeasureFormField("transformations", "indicators"),
        filters: [
            readFormFilter("hs2", "hs2"),
            readFormFilter("hs4", "hs4"),
            readFormFilter("hs4_codes", "hs4_codes"),
            readFormFilter("cargo_type", "cargo_type"),
            readFormFilter("mode_of_transport", "mode_of_transport"),
            readFormFilter("commodity_subgroup", "commodity_subgroup"),
            readFormFilter("origin", "origins"),
            readFormFilter("destination", "destinations"),
        ].filter(f => f !== null),
        limit: parseInt(form.querySelector('input[name="limit"]').value)
    }

    // console.log(JSON.stringify(data, null, 4));

    return data;
}

function GetDownloadUrl(query) {

    //return;
    const getUrl = new URL("https://localhost:7136/trade-prism-csv");;
    getUrl.searchParams.append("query", Base64.encode(JSON.stringify(query)));    

    const queryBase64 = Base64.encode(JSON.stringify(query));


    const form = document.querySelector("#filters_form");
    let apiKey = form.querySelector('input[name="apiKey"]').value;

    if (apiKey.length <= 0) {
        return;
    }
    
    let url = "https://localhost:7136/trade-prism-csv/";
    
    url = "https://func-trade-prism-13346.azurewebsites.net/api/download/";
    url = "http://localhost:7179/api/Download/";
    url = "https://func-trade-prism-13384.azurewebsites.net/api/download/"
    
    const downloadUrl = url + queryBase64 + "?apiKey=" + apiKey;

    return downloadUrl;
}

function populateGrid(dataset) {
    // dataset object doc'd below
            
    const data = dataset.records.map(k => toObject(k, dataset.fields));
    

    const fields = dataset.fields.map(name => (
    {   
        name: name.toString(),
        type: Number.isInteger(name) ? "number": "text",
        width: Number.isInteger(name) ? 120 : 100,
        formatter: Number.isInteger(name) ? "number" : "text",
        validate: "required" 
    }));

    
    $("#jsGrid").jsGrid({
    width: "100%",
    height: "400px",

    inserting: false,
    editing: false,
    sorting: false,
    paging: false,

    data: data,

    fields: fields
    });
}

function loadGrid() {
    const query = GetQuery();
        query.limit = 1000;
        const downloadUrl = GetDownloadUrl(query);

        if (!downloadUrl) {
            console.log("No api key");
            return;
        }

        console.log("starting fetch");

        $("#jsGrid").hide();

        CSV.fetch({
            url: downloadUrl
          }
        ).done(function(dataset) {
           
            $("#jsGrid").show();
            
            populateGrid(dataset);
        })
        .catch(function(e) {
            console.log(e);
        });
}

$(document).ready(function () {

    loadGrid();

    $("#filters_form select").on('change', () => {
        loadGrid();
        
    });

    const formElem = $("#filters_form");


    formElem.on('submit', async (e) => {
        
        e.preventDefault();

        const query = GetQuery();
        const downloadUrl = GetDownloadUrl(query);

        if (downloadUrl)
        {
            console.log("starting fetch");        

         window.location = downloadUrl;
        }
    });
});

function readMeasureFormField(facet, formName) {
    const result = readFormFilter(facet,formName);

    if (result === null) {
        return ["ALL"];
    }
    
    return result.values;
}

function readFormFilter(facet, formName) {
    const result = { facet: facet, values: readForm(formName), summarize: false };

    if (result.values.indexOf("ALL") !== -1) {
        return null;
    }

    return result;
}
