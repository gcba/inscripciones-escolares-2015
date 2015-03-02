var nivel = "secundario";

var grillaSvg = {
  ancho: 960,
  alto: 470,
  labelSpace: 70,
  filasGeneral: 9,
  columnasGeneral: 15,
  columnasPorNivel: 4
}

var mapaSvg = {
  ancho: 300,
  alto: 300,
  posInicialX: grillaSvg.ancho,
  posInicialY: grillaSvg.alto - grillaSvg.labelSpace - 300
}



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

  var color = d3.scale.linear()
    .domain([500, 1500, 2000, 2800, 3800])
    .range(["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"]);

  // function calcularColor(nivel){
  //   color = d3.scale.linear()
  //   .domain([500, d3.max(data.comunas[nivel],function(d){ return parseInt(d[0]); }) ])
  //   .range(["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"]);
  //   console.log(d3.max(data.comunas.inicial));
  // }

  console.log(data.comunas[nivel]);

  // console.log(d3.max(data));
  // console.log(nivel);
  // console.log(d3.min(data.comunas[nivel]));

  // console.log(data.comunas.inicial);

  svg.append("g")
      .attr("class", "caba")
    .selectAll("path")
      .data(topojson.feature(comunas, comunas.objects.comunas).features)
    .enter().append("path")
      .attr("d", d3.geo.path().projection(d3.geo.mercator().scale(157000/2).center([-58.20000,-34.68102])))
      .style("fill", function(d) { return color(data.comunas[nivel][d.properties.comuna]);
      });

}