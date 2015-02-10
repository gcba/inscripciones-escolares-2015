/*
 * JS para la viz de educación
 */ 

// Crear SVG para los circulos
var grilla = d3.select("#circles")
  .append("svg")
  .attr("width", 960)
  .attr("height", 400);

// Variables iniciales de los círculos
var radio = 10;
var posx = 200;
var posy = 20;	
var margin = 25;

// Colores de filtrado
var colorFemenino = "#FF63D6";
var colorMasculino = "#6392FF";
var colorCABA = "#FFD300";
var colorProvincia = "#F2803A";

// Filas y columnas de la grilla general
var filas = 9;
var columnas = 15;
var totalCirculos = filas * columnas;

// Filas y columnas de niveles 
var niveles = [
        { index: 0, name: "Inicial", bounds: {x0: 0, y0: 0}, countX: 0, countY: 0 },
        { index: 1, name: "Primario", bounds: {x0: 200, y0: 0}, countX: 0, countY: 0 },
        { index: 2, name: "Secundario", bounds: {x0: 400, y0: 0}, countX: 0, countY: 0 },
        { index: 3, name: "Terciario", bounds: {x0: 600, y0: 0}, countX: 0, countY: 0 },
    ];

// Datos
var json = (function() {
    var json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': "data/data.json",
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
})();

// General Genero
var generalFemenino = json.general.genero.femenino;
var generalMasculino = json.general.genero.masculino;

// General Procedencia
var generalCABA = json.general.procedencia.caba;
var generalProvincia = json.general.procedencia.provincia;

// Generar circulitos en estado cero
for (i = 0; i < filas; i++) {
	for (j = 0; j < columnas; j++) {
		grilla.append("circle")
		  .attr("fill", "grey")
		  .attr("r", radio)
		  .attr("cx", posx + (margin+radio) * (j+1))
		  .attr("cy", posy + (margin+radio) * (i+1));		
	}
}

// Filtrar por genero
d3.select("#radio-genero")
	.on("click", function(){ filtrarPorGenero(generalFemenino); $(this).blur(); });

// Filtrar por procedencia
d3.select("#radio-procedencia")
	.on("click", function() { filtrarPorProcedencia(generalCABA); $(this).blur(); });

d3.select(".flechita")
	.on("click", function() {
		// Cambiar de sección
	});

// Función que divide los circulitos en 4 niveles
function separarNiveles() {

}

function resetColorCirculos() {
	d3.selectAll("circle").attr("fill", "grey");
}

function filtrarPorGenero(porcentajeFemenino) {
	var circulosFemeninos = (porcentajeFemenino * totalCirculos) / 100;

	// Pintar circulos
	d3.selectAll("circle").transition().attr("fill", function(d,i){ 
		if (i < circulosFemeninos) {
			return colorFemenino;
		}
		else {
			return colorMasculino;
		}
	});	
}

function filtrarPorProcedencia(porcentajeCABA) {
	var circulosCABA = (porcentajeCABA * totalCirculos) / 100;

	// Pintar circulos
	d3.selectAll("circle").transition().attr("fill", function(d,i){ 
		if (i < circulosCABA) {
			return colorCABA;
		}
		else {
			return colorProvincia;
		}
	});	
}