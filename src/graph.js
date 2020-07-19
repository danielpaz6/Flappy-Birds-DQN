import * as d3 from "d3";

var lineArr = [];
var MAX_LENGTH = 10;
var duration = 500;
var chart = realTimeLineChart();
var point = 0;

export function randomNumberBounds(min, max) {
    return Math.floor(Math.random() * max) + min;
}

export function seedData() {
    var now = new Date();
    for (var i = 0; i < MAX_LENGTH; ++i) {
        lineArr.push({
            time: point++,
            x: point
        });
    }
}

export function updateData(epoch, value) {
    var lineData = {
        time: epoch,
        x: value
    };

    lineArr.push(lineData);

    /*if (lineArr.length > MAX_LENGTH) {
        lineArr.shift();
    }*/

    d3.select("#chart").datum(lineArr).call(chart);
}

export function resize() {
    if (d3.select("#chart svg").empty()) {
        return;
    }
    chart.width(+d3.select("#chart").style("width").replace(/(px)/g, ""));
    d3.select("#chart").call(chart);
}

document.addEventListener("DOMContentLoaded", function () {
    //seedData();
    //window.setInterval(updateData, 500);
    d3.select("#chart").datum(lineArr).call(chart);
    d3.select(window).on('resize', resize);
});


function realTimeLineChart() {
    var margin = { top: 40, right: 40, bottom: 40, left: 45 },
        width = 600,
        height = 250,
        duration = 500,
        color = d3.schemeCategory10;

    // set the ranges
    var x = d3.scaleLinear().range([0, width - margin.left - margin.right]);
    var y = d3.scaleLinear().range([height - margin.top - margin.bottom, 0]);

    // gridlines in x axis function
    function make_x_gridlines() {
        return d3.axisBottom(x)
            .ticks(MAX_LENGTH)
    }

    // gridlines in y axis function
    function make_y_gridlines() {
        return d3.axisLeft(y)
            .ticks(MAX_LENGTH)
    }

    function chart(selection) {
        // Based on https://bl.ocks.org/mbostock/3884955
        selection.each(function (data) {
            data = ["x"].map(function (c) {
                return {
                    label: c,
                    values: data.map(function (d) {
                        return { time: d.time, value: d[c] };
                    })
                };
            });

            var t = d3.transition().duration(duration).ease(d3.easeLinear),
                x = d3.scaleLinear().rangeRound([0, width - margin.left - margin.right]),
                y = d3.scaleLinear().rangeRound([height - margin.top - margin.bottom, 0]),
                z = d3.scaleOrdinal(color);

            var xMin = d3.min(data, function (c) { return d3.min(c.values, function (d) { return d.time; }) });
            var xMax = new Date(new Date(d3.max(data, function (c) {
                return d3.max(c.values, function (d) { return d.time; })
            })).getTime() - (duration * 2));

            x.domain([
                d3.min(data, function (c) { return d3.min(c.values, function (d) { return d.time; }) }),
                Math.max(d3.max(data, function (c) { return d3.max(c.values, function (d) { return d.time; }) }), MAX_LENGTH)
                
            ]);

            y.domain([
                0,
                d3.max(data, function (c) {
                    
                    return d3.max(c.values, function (d) {
                        
                        return d.value;
                    })
                }) + 20
            ]);

            z.domain(data.map(function (c) { return c.label; }));

            var line = d3.line()
                .curve(d3.curveBasis)
                .x(function (d) { return x(d.time); })
                .y(function (d) { return y(d.value); });



            var svg = d3.select(this).selectAll("svg").data([data]);
            var gEnter = svg.enter().append("svg").append("g");
            gEnter.append("g").attr("class", "axis x");
            gEnter.append("g").attr("class", "axis y");
            gEnter.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", width - margin.left - margin.right)
                .attr("height", height - margin.top - margin.bottom);
            gEnter.append("g")
                .attr("class", "lines")
                .attr("clip-path", "url(#clip)")
                .selectAll(".data").data(data).enter()
                .append("path")
                .attr("class", "data");

            // add the X gridlines
            gEnter.append("g")
                .attr("class", "grid")
                .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
                .call(make_x_gridlines()
                    .tickSize(-(height - margin.top - margin.bottom))
                    .tickFormat("")
                )

            // add the Y gridlines
            gEnter.append("g")
                .attr("class", "grid")
                .call(make_y_gridlines()
                    .tickSize(-(width - margin.right - margin.left))
                    .tickFormat("")
                )

            // text label for the y axis
            gEnter.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left)
                .attr("x", 0 - ((height - margin.top - margin.bottom )/ 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Reward"); 

            // text label for the x axis
            gEnter.append("text")
                .attr("transform",
                    "translate(" + ((width-margin.left-margin.right) / 2) + " ," +
                    (height - margin.top - margin.bottom + 35) + ")")
                .style("text-anchor", "middle")
                .text("Episodes");

            /*var legendEnter = gEnter.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(" + (width - margin.right - margin.left - 35) + ",0)");

            legendEnter.selectAll("text")
                .data(data).enter()
                .append("text")
                .attr("y", function (d, i) { return (i * 20) + 25; })
                .attr("x", 5)
                .attr("fill", function (d) { return z(d.label); });*/

            var svg = selection.select("svg");
            svg.attr('width', width).attr('height', height);
            var g = svg.select("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            g.select("g.axis.x")
                .attr("transform", "translate(0," + (height - margin.bottom - margin.top) + ")")
                .transition(t)
                .call(d3.axisBottom(x).ticks(5));
            g.select("g.axis.y")
                //.transition(t)
                .attr("class", "axis y")
                //.attr("transform", "translate(" + (margin.left) + ",0)")
                .call(d3.axisLeft(y));

            g.select("defs clipPath rect")
                .transition(t)
                .attr("width", width - margin.left - margin.right)
                .attr("height", height - margin.top - margin.right);

            g.selectAll("g path.data")
                .data(data)
                .style("stroke", function (d) { return z(d.label); })
                .style("stroke-width", 2)
                .style("fill", "none")
                .transition()
                .duration(duration)
                .ease(d3.easeLinear)
                .on("start", tick);

            /*g.selectAll("g .legend text")
                .data(data)
                .text(function (d) {
                    return d.label.toUpperCase() + ": " + d.values[d.values.length - 1].value;
                });*/

            // For transitions https://bl.ocks.org/mbostock/1642874
            function tick() {
                d3.select(this)
                    .attr("d", function (d) { return line(d.values); })
                    .attr("transform", null);

                var xMinLess = new Date(new Date(xMin).getTime() - duration);
                d3.active(this)
                    //.attr("transform", "translate(" + x(xMinLess) + ",0)")
                    .transition()
                    .on("start", tick);
            }
        });
    }

    chart.margin = function (_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.width = function (_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function (_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    chart.color = function (_) {
        if (!arguments.length) return color;
        color = _;
        return chart;
    };

    chart.duration = function (_) {
        if (!arguments.length) return duration;
        duration = _;
        return chart;
    };

    return chart;
}