const topojson = require('topojson');

$(document).ready(function () {
    $('#fullpage').fullpage({
        autoScrolling: false,
        navigation: true,
        navigationPosition: 'left',
        menu: '#menu'

    });

    // NOTE: d3.geo functions all have new syntax as of D3 4.0 release
    // d3.geo.albersUsa() call from example site is now d3.geoAlbersUsa
    // see details of recent changes here: https://github.com/d3/d3/blob/master/CHANGES.md
    d3.queue()
        .defer(d3.json, "data/us-states.json")
        .defer(d3.csv, "data/data-police-shootings-master/computed.csv")
        .await(ready);
});

function ready(error, us, data) {
    if (error) throw error;

    var cityData = groupData(data);

    var w = 1200;
    var h = 500;

    var radius = d3.scaleSqrt()
        .domain([0, d3.max(cityData, function(d) { return d.num_records; })])
        .range([0, 10]);

    var projection = d3.geoAlbersUsa()
        .translate([w / 2, h / 2])
        .scale([900]);

    var path = d3.geoPath()
        .projection(projection);

    var svg = d3.select("#section2").select(".fp-tableCell")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    svg.selectAll("path")
        .data(us.features)
        .enter()
        .append("path")
        .attr("class", "states")
        .attr("d", path);


    svg.selectAll("circle")
        .data(cityData)
        .enter()
        .append("circle")
        .attr("class", "symbol")
        .attr("cx", function (d) { return projection([d.longitude, d.latitude])[0]; })
        .attr("cy", function (d) { return projection([d.longitude, d.latitude])[1]; })
        .attr("r",  function (d) { return radius(d.num_records); });
}

function groupData(data) {
    var groupedData = d3.nest()
        .key(function(d) { return d.city + ", " + d.state + "," + d.computed_long + "," + d.computed_lat; })
        .entries(data);

    return groupedData.map(function(val, index) {
        var key = val["key"];
        var parts = key.split(",");

        return {
            "name": parts[0],
            "longitude": parseFloat(parts[2]),
            "latitude" : parseFloat(parts[3]),
            "num_records": val["values"].length,
            "id": "" + index
        }
    });
}
