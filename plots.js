function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });
    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}
// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
}
// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
    PANEL.html("");
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}
// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var samples = data.samples;
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var resultArray = samples.filter(sampleObj => sampleObj.id == sample);
    //  5. Create a variable that holds the first sample in the array.
    var results = resultArray[0];
    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otu_ids = results.otu_ids;
    var otu_labels = results.otu_labels;
    var sample_values = results.sample_values;
    var resultsLength=otu_ids.length;
    var sampleData = [];

    for (i = 0; i < resultsLength; i++) {
      var elementData={otu_id :  otu_ids[i],
        otu_label: otu_labels[i], 
        sample_value:sample_values[i]};
        sampleData.push(elementData);
    };

    var sortedBySample = sampleData.sort((a,b) => a.sample_value - b.sample_value).reverse(); 
    var topTenOtu = sortedBySample.slice(0,10);
    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 
    var sortedTopTenOtu = topTenOtu.sort((a,b) => a.sample_value - b.sample_value); 
    var yticks = sortedTopTenOtu.map(value => "OTU " + value.otu_id);
    var topTenOtuValues= sortedTopTenOtu.map(value => parseInt(value.sample_value));
    var labels = sortedTopTenOtu.map(value => value.otu_label);
    // 8. Create the trace for the bar chart. 
    var trace = {
      x: topTenOtuValues,
      y: yticks,
      text: labels,
      type: "bar",
      orientation: 'h',
      marker: {
        color: "#bb342fcb", 
      },
    };
    var barData = [trace];
    // 9. Create the layout for the bar chart. 
    var barLayout = {
      title: "<b>Top Ten Bacteria Cultures Found</b>",
      paper_bgcolor: "#e8fdee",
      plot_bgcolor: "#e8fdee"
    };

    var config = {responsive:true};

    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout, config);

    //Steps for Bubble Chart
    var sortedById = sampleData.sort((a,b) => a.otu_id - b.otu_id).reverse(); 
    var otuIds = sortedById.map(value => value.otu_id);
    var sampleValue = sortedById.map(value => parseInt(value.sample_value));
    var hoverText = sortedById.map(value => value.otu_label);
    // 1. Create the trace for the bubble chart.
    var trace1 = {
      x: otuIds,
      y: sampleValue,
      text: hoverText,
      hovertemplate: '(%{x},%{y})<br>%{text} <extra></extra>',
      mode: 'markers',
      marker: {
        size: sampleValue,
        color: otuIds, 
      },
    };
    var bubbleData = [trace1];

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title: '<b>Bacteria Cultures per Sample</b>',
      showlegend: false,
      xaxis: {
        title: 'OTU ID',
      },
      paper_bgcolor: "#e8fdee",
      plot_bgcolor: "#e8fdee"
    };
    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot('bubble', bubbleData, bubbleLayout, config);

    //Steps for Gauge Chart
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultMetadata = metadata.filter(sampleObj => sampleObj.id == sample);
    var gaugeSample = resultMetadata[0];
    var wfreq = parseFloat(gaugeSample.wfreq);
    // 4. Create the trace for the gauge chart.
    var gaugeData = [
      {
        domain: { x: [0, 1], y: [0, 1] },
        value: wfreq,
        title: { text: "<b>Bellybutton Washing Frequency</b> <br> Scrubs per Week", font: { size: 24 } },
        type: "indicator",
        mode: "gauge+number",
        gauge: {
          axis: { range: [null, 10], tickwidth: 1, tickcolor: "black" },
          bar: { color: "black" },
          bgcolor: "white",
          borderwidth: 2,
          bordercolor: "black",
          steps: [
            { range: [0, 2], color: "red" },
            { range: [2, 4], color: "orange" },
            { range: [4, 6], color: "yellow" },
            { range: [6, 8], color: "lightgreen" },
            { range: [8, 10], color: "darkgreen" }
          ],
        }
      }
    ];
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = { 
      margin: { t: 0, b: 0 },      
      paper_bgcolor: "#e8fdee",
      plot_bgcolor: "#e8fdee"};
    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot('gauge', gaugeData, gaugeLayout, config);
  });
 };
