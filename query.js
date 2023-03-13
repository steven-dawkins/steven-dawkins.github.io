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
    for(let i = 0; i < arr.length; i++) {
        result[fields[i]] = arr[i];
    }
    return result;
}

function GetQuery() {
    const form = document.querySelector("#filters_form");

    const data = {
        start_year: parseInt(form.querySelector('select[name="start_year"]').value),
        end_year: parseInt(form.querySelector('select[name="end_year"]').value),
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
        // totals: [ "hs2", "hs4", "cargo_type", "mode_of_transport", "commodity_subgroup", "origin", "destination"],
        // filters: {
        //     [{ facet: "hs4", values: ["0101", "0102"]}],
        //     hs4: form.querySelector('input[name="hs4"]').value.split(","),
        //     origins: form.querySelector('input[name="origins"]').value.split(","),
        //     destinations: form.querySelector('input[name="destinations"]').value.split(","),
        //     years: form.querySelector('input[name="years"]').value.split(",")
        // },
        limit: parseInt(form.querySelector('input[name="limit"]').value)
    }

    console.log(JSON.stringify(data, null, 4));

    return data;
}

function GetDownloadUrl(query) {

    //return;
    const getUrl = new URL("https://localhost:7136/trade-prism-csv");;
    getUrl.searchParams.append("query", Base64.encode(JSON.stringify(query)));
    console.log(getUrl);

    const queryBase64 = Base64.encode(JSON.stringify(query));


    const form = document.querySelector("#filters_form");
    const apiKey = form.querySelector('input[name="apiKey"]').value;

    
    let url = "https://localhost:7136/trade-prism-csv/";
    url = "http://localhost:7179/api/Download/";
    const downloadUrl = url + queryBase64 + "?apiKey=" + apiKey;

    return downloadUrl;
}

function loadGrid() {
    const query = GetQuery();
        query.limit = 100;
        const downloadUrl = GetDownloadUrl(query);

        console.log("starting fetch");

        $("#jsGrid").hide();

        CSV.fetch({
            url: downloadUrl
          }
        ).done(function(dataset) {
          // dataset object doc'd below
          
          const data = dataset.records.map(k => toObject(k, dataset.fields));
          console.log("formatted");

          console.log(data);

          console.log($("#jsGrid"));
          $("#jsGrid").jsGrid({
            width: "100%",
            height: "400px",
     
            inserting: false,
            editing: false,
            sorting: false,
            paging: false,
     
            data: data,
     
            fields: dataset.fields.map(name => ({ name: name, type: "text", width: 100, validate: "required" }))
            });
        }).catch(e => {
            console.log(e);
        });
}

$(document).ready(function () {

    loadGrid();

    $("#filters_form select").on('change', () => {
        loadGrid();
        
    });

    const formElem = $("#filters_form");

    console.log(formElem);

    formElem.on('submit', async (e) => {
        console.log("submit");
        e.preventDefault();
        // var form = document.forms[0];

        const query = GetQuery();
        const downloadUrl = GetDownloadUrl(query);

        console.log("starting fetch");
        

         window.location = downloadUrl;
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
