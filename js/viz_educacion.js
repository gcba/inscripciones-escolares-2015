/*
 * JS para scrolling
 */

var currentSeccion;

$(".main").onepage_scroll({
	sectionContainer: "section",     
	easing: "ease",                  
	animationTime: 1000,             
	pagination: true,                
	updateURL: false,                
	beforeMove: function() {
		resetCambioSeccion();
	},  
	afterMove: function(index) { 
		switch(index) {
			case 1:
				currentSeccion = "General";
				juntarCirculitos();
				break;
			case 2:
				currentSeccion = "Niveles";
				separarNiveles();
				break;
			case 3:
				break;
		}
	},   
	loop: false,                     
	keyboard: true,                  
	responsiveFallback: false,
	direction: "vertical"
});

$('.next-section').click(function(e){
    $(".main").moveDown();
});

$('.prev-section').click(function(e){
	$(".main").moveUp();
});

/*
 * JS para visualizacion
 */ 

var svgWidth = 960;
var svgHeight = 400;

// Crear SVG para los circulos
var grilla = d3.select("#circles")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

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

// Filas y columnas de la grilla general y niveles
var filasGeneral = 9;
var columnasGeneral = 15;
var totalCirculos = filasGeneral * columnasGeneral;
var columnasPorNivel = 5;

/*
 *	Datos
 */ 
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

// Niveles
var jsonNiveles = json.niveles;
var coordinadasNiveles = [0,250,500,750];
var cantidadNiveles = Object.keys(jsonNiveles).length; 
var niveles = [];

for (var i = 0; i < cantidadNiveles; i++) {
	var porcentajeNivel = jsonNiveles[Object.keys(jsonNiveles)[i]].total;
	var circulosNivel = Math.round(porcentajeNivel*totalCirculos/100);
	var newNivel = { x0: coordinadasNiveles[i], circulos: circulosNivel };
	niveles.push(newNivel);
}

// Generar circulitos en estado cero
for (i = 0; i < filasGeneral; i++) {
	for (j = 0; j < columnasGeneral; j++) {
		grilla.append("circle")
		  .attr("fill", "grey")
		  .attr("r", radio);
	}
}
juntarCirculitos();

/***********************************************/

/*
 * Filtros!
 */

// Filtrar por genero
d3.select("#radio-genero")
	.on("click", function(){ 
		filtrarPorGenero(generalFemenino); 
		$(this).blur(); 
	});

// Filtrar por procedencia
d3.select("#radio-procedencia")
	.on("click", function() { 
		filtrarPorProcedencia(generalCABA); 
		$(this).blur(); 
	});

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

/*
 * End Filtros!
 */

/***********************************/

/*
 * Funciones
 */

function juntarCirculitos() {
	d3.selectAll("circle").transition().attr("cx", function(d,i){
		return posx + (margin+radio) * ((i % columnasGeneral)+1);
	}).attr("cy", function(d,i){
		return posy + (margin+radio) * (Math.floor(i/columnasGeneral)+1);
	});
}

// Función que divide los circulitos en 4 niveles
function separarNiveles() {
	// Inicializar variables de posicion
	var currentNivel = 0;
	var currentCirculos = niveles[currentNivel].circulos;
	var previousCirculos = 0;
	var currentIndex;

	//TODO: Arreglar el tema del reseteo de las variables para el cy
	d3.selectAll("circle").transition().attr("cx", function(d,i){
		return calcularNuevaPosicion("x", i);
	}).attr("cy", function(d,i){		
		currentNivel = 0;
		currentCirculos = niveles[currentNivel].circulos;
		previousCirculos = 0;

		return calcularNuevaPosicion("y", i);
	});

	function calcularNuevaPosicion(axis, index){
		var result;
		while (index >= currentCirculos) {
			currentNivel++;
			currentCirculos += niveles[currentNivel].circulos;
		}
		if (currentNivel > 0) {
			var count = currentNivel;
			previousCirculos = 0;
			while (count > 0) {
				previousCirculos += niveles[count-1].circulos;
				count--;
			}
		}
		currentIndex = index - previousCirculos;		
		if (axis == "x") {
			x0 = niveles[currentNivel].x0;
			result = x0+((currentIndex+1)*(margin+radio)-(margin+radio)*columnasPorNivel*Math.floor(currentIndex/columnasPorNivel));	
		}
		else if (axis == "y"){
			result = svgHeight - (posy + Math.floor(currentIndex/columnasPorNivel) * (margin+radio)); 			
		}
		else {
			console.log("Hubo un error con el calculo de posiciones de los ejes X e Y");
		}
		return result;
	}
}

function resetCambioSeccion() {
	d3.selectAll("input[type=radio]").property("checked", false);
	d3.selectAll("circle").transition().attr("fill", "grey");	
}