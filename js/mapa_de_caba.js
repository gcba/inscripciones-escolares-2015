
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


d3.json("data/comunas.json", function(error, caba) {
  svg.append("path")
        .datum(topojson.feature(caba, caba.objects.comunas))
        .attr("d", d3.geo.path().projection(d3.geo.mercator().scale(157000/2).center([-58.20000,-34.68102])))
        .attr('class', 'comuna');
});
