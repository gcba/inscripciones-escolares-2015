// Technicalities del tooltip y la posicion del mouse
$("#tooltipChart").hide();
var mousePos = [];
$(document).mousemove(function(event) {
    mousePos[0] = event.clientX;
    mousePos[1] = event.clientY;
});

// Dimensiones del grafico
var marginChart = {top: 100, right: 70, bottom: 40, left: 170},
    widthChart = grillaSvg.ancho - marginChart.left - marginChart.right,
    heightChart = grillaSvg.alto - marginChart.top - marginChart.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, widthChart-110], .1);

var y = d3.scale.linear()
    .rangeRound([heightChart, 0]);

var color = d3.scale.ordinal()
    .range(["#8DADFD", "#F49167", "#9E84D7"]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(2)
    .tickFormat(d3.format(".1s"));

var svg = d3.select("#barChart").append("svg")
    .attr("width", widthChart + marginChart.left + marginChart.right)
    .attr("height", heightChart + marginChart.top + marginChart.bottom)
  .append("g")
    .attr("transform", "translate(" + marginChart.left + "," + marginChart.top + ")");

// Data!
d3.csv("data/datos-por-ano.csv", function(error, data) {
  if (error) throw error;

  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Nivel"; }));

  data.forEach(function(d) {
    var y0 = 0;
    var ano = "2013";
    d.anos = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name], ano: d.Nivel} });
    d.total = d.anos[d.anos.length - 1].y1;
  });

  x.domain(data.map(function(d) { return d.Nivel; }));
  y.domain([0, d3.max(data, function(d) { return d.total; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + heightChart + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)

  var state = svg.selectAll(".state")
      .data(data)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + x(d.Nivel) + ",0)"; });

  state.selectAll("rect")
      .data(function(d) { return d.anos; })
    .enter().append("rect")
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.y1); })
      .attr("height", function(d) { return y(d.y0) - y(d.y1); })
      .style("fill", function(d) { return color(d.name); })
      .on("mouseover", function(d) {
        $("#tooltipChart").show();
        d3.select(this).style("stroke", "#ffffff");
        var htmlStr = "<div><b>" + (d.y1 - d.y0) + "</b> inscriptos <br/>en <b>" + d.name.toLowerCase() + "</b></br>en <b>" + d.ano + "</b></div> ";
        $("#tooltipChart").html(htmlStr);
      })
      .on("mouseout", function() {
        $("#tooltipChart").hide();
        d3.select(this).style("stroke", "transparent");
      })
      .on("mousemove", function() {
        $("#tooltipChart").show();
        var mouse = d3.mouse(svg.node()).map(function(d) {
            return parseInt(d);
        });
        d3.select("#tooltipChart")
            .attr("style",
                function() {
                    return "left:" + (mousePos[0] - 60) + "px; top:" + (mousePos[1] - 80) + "px";
                });
      });

  var legend = svg.selectAll(".legend")
      .data(color.domain().slice().reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", widthChart - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);
      
  legend.append("text")
      .attr("x", widthChart - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

});