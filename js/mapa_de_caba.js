// Crear SVG para los circulos
var svg = d3.select("#mapaCABA")
         .append("svg")
         .attr("width", mapaSvg.ancho)
         .attr("height", mapaSvg.alto)
         .attr("x", mapaSvg.posInicialX)
         .attr("y", mapaSvg.posInicialY);

queue()
    .defer(d3.json, "data/comunas.json")
    .defer(d3.json, "data/data.json")
    .await(ready);

function ready(error, comunas, data) {
  var maximo = 0,
      minimo = Number.MAX_VALUE;

  for (var i = 1 ; i < 16 ; i++){
    if (maximo < data.comunas[nivelActivo][i]){
      maximo = data.comunas[nivelActivo][i];
    }

    if (minimo > data.comunas[nivelActivo][i]){
      minimo = data.comunas[nivelActivo][i];
    }
  }

  var color = d3.scale.linear()
    .domain([minimo, maximo])
    .range(["#f2f0f7", "#54278f", "#ff0000"]);

  svg.select(".caba").remove();

  svg.append("g")

      .attr("class", "caba")
    .selectAll("path")
      .data(topojson.feature(comunas, comunas.objects.comunas).features)
    .enter().append("path")
      .attr("d", d3.geo.path().projection(d3.geo.mercator().scale(157000/2).center([-58.20000,-34.68102])))
      .style("fill", function(d) { return color(data.comunas[nivelActivo][d.properties.comuna]);})
      .attr("title", function(d) { return data.comunas[nivelActivo][d.properties.comuna] + " nuevos alumnos";})
      .on("mouseover", function(){d3.select(this).style("stroke", "#ffffff");})
      .on("mouseout", function(){d3.select(this).style("stroke", "transparent");});
}

