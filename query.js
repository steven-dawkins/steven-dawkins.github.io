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

$(document).ready(function () {
    const formElem = $("#filters_form");

    console.log(formElem);

    formElem.on('submit', async (e) => {
        console.log("submit");
        e.preventDefault();
        // var form = document.forms[0];

        const form = document.querySelector("#filters_form");

        data = {
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
                readFormFilter("origins", "origins"),
                readFormFilter("destinations", "destinations"),
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

        //return;
        const getUrl = new URL("https://localhost:7136/trade-prism-csv");;
        getUrl.searchParams.append("query", Base64.encode(JSON.stringify(data)));
        console.log(getUrl);

        const queryBase64 = Base64.encode(JSON.stringify(data));

        window.location = "https://localhost:7136/trade-prism-csv/" + queryBase64;

        /*
          let response = await fetch('https://localhost:7136/trade-prism-csv', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(data),
          })
  
          let text = await response.text(); // read response body as text
          document.querySelector("#decoded").innerHTML = text;*/
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
