// TOOLTIP CABA
$("#tooltipCABA").hide();

var coloresCABA = ["#eaeaea", "#1977DD"]

var svgCABA = d3.select("#mapaCABA")
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
    var mousePos = [];

    $(document).mousemove(function(event) {
        mousePos[0] = event.clientX;
        mousePos[1] = event.clientY;
    });

    var maximo = 0,
        minimo = Number.MAX_VALUE;

    for (var i = 1; i < 16; i++) {
        if (maximo < data.comunas[nivelActivo][i]) {
            maximo = data.comunas[nivelActivo][i];
        }

        if (minimo > data.comunas[nivelActivo][i]) {
            minimo = data.comunas[nivelActivo][i];
        }
    }

    var color = d3.scale.linear()
        .domain([minimo, maximo])
        .range(coloresCABA);

    svgCABA.select(".caba").remove();
    svgCABA.select(".etiqueta").remove();

    svgCABA.append("g")
        .attr("class", "caba")
        .selectAll("path")
        .data(topojson.feature(comunas, comunas.objects.comunas).features)
        .enter().append("path")
        .attr("d", d3.geo.path().projection(d3.geo.mercator().scale(157000 / 2).center([-58.20000, -34.68102])))
        .style("fill", function(d) {
            return color(data.comunas[nivelActivo][d.properties.comuna]);
        })
        .attr("title", function(d) {
            return data.comunas[nivelActivo][d.properties.comuna] + "% nuevos alumnos";
        })
        .on("mouseover", function(d) {
            $("#tooltipCABA").show();
            d3.select(this).style("stroke", "#ffffff");
            var htmlStr = "<div style='font-size: 10px; text-transform: uppercase; color: #999999;'> comuna " + d.properties.comuna + " </div> " + data.comunas[nivelActivo][d.properties.comuna] + "% nuevos alumnos";
            $("#tooltipCABA").html(htmlStr);
        })
        .on("mouseout", function() {
            $("#tooltipCABA").hide();
            d3.select(this).style("stroke", "transparent");
        })
        .on("mousemove", function() {
            $("#tooltipCABA").show();
            var mouse = d3.mouse(svgCABA.node()).map(function(d) {
                return parseInt(d);
            });
            d3.select("#tooltipCABA")
                .attr("style",
                    function() {
                        return "left:" + (mousePos[0] - 60) + "px; top:" + (mousePos[1] - 70) + "px";
                    }
                );
        });

    var gradient = svgCABA.append("svg:defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("x2", "100%");

    gradient.append("svg:stop")
        .attr("offset", "20%")
        .attr("stop-color", coloresCABA[0])
        .attr("stop-opacity", 1);

    gradient.append("svg:stop")
        .attr("offset", "80%")
        .attr("stop-color", coloresCABA[1])
        .attr("stop-opacity", 1);

    var leyenda = svgCABA.append("g")
        .attr("class", "etiqueta")
        .attr("transform", "translate(170,267)");

    leyenda.append("rect")
        .attr("height", 7)
        .attr("x", 0)
        .attr("width", "130")
        .style("fill", "url(#gradient)")
        .style("stroke", "white");

    leyenda.append("text")
        .attr("class", "tituloLeyenda")
        .attr("y", -6)
        .text("Alumnos por comuna");

    leyenda.append("text")
        .attr("class", "numeroLeyenda")
        .attr("y", 20)
        .attr("x", 0)
        .text(
            function (){
                return redondeo(minimo,"DOWN")
            });

    leyenda.append("text")
        .attr("class", "numeroLeyenda")
        .attr("y", 20)
        .attr("x", 95)
        .text(
            function(){
                return redondeo(maximo,"UP")
            });
}

function redondeo(valor,direccion){
    switch (direccion){
        case "UP":
            var resultado = "+ de " + ((Math.round(valor / 100)*100)-100).toString();
            break;
        case "DOWN":
            var resultado = "- de " + ((Math.round(valor / 100)*100)).toString();
            break;
    }
    return resultado;

}
