/*
 * JS para scrolling
 */

var currentSeccion = "landing";

$(".main").onepage_scroll({
	sectionContainer: "section",     
	easing: "ease",                  
	animationTime: 1000,             
	pagination: true,                
	updateURL: false,                
	beforeMove: function(index) {
		resetCambioSeccion();			
	},  
	afterMove: function(index) { 
		currentSeccion = $("section.active").attr("id");

		$("section.active").removeClass("active");
		$("section#" + currentSeccion).addClass("active");
		switch(currentSeccion) {
			case "landing":			
				showOneCirculito();
				break;				
			case "general":
				$(".circulo").show();
				$("form.filtro").show();
				if (circuloMedio.attr("r") == circulo.radio) {
					juntarCirculitos();
				}				
				else {
					hideOneCirculitoYJuntar();	
				}
				break;
			case "niveles":
				$("form.filtro").show();
				$(".circulo").show();
				$("text.labelNivel").show();
				separarCirculitos();
				break;
			case "comuna":								
				$("#mapaCABA").show();
				$("form.filtro").show();				
				$("svg").show();
				mostrarMapaComunas();				
				break;
			case "mapa":
				break;
		}
		generarInfoText();
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

var grillaSvg = {
	ancho: 960,
	alto: 470,
	labelSpace: 70,
	filasGeneral: 9,
	columnasGeneral: 15,
	columnasPorNivel: 4
}

var totalCirculos = grillaSvg.filasGeneral * grillaSvg.columnasGeneral;

var svgGeneral = d3.select("#viz")
			   	   .append("svg")
			   	   .attr("width", grillaSvg.ancho)
			   	   .attr("height", grillaSvg.alto)

var grilla = svgGeneral.append("g").attr("class", "contenedor");

var mapaComunas = svgGeneral.append("g")
					.attr("id", "mapaCABA");

// Detalles de los círculos
var circulo = {
	radio: 8,
	radioGrande: 100,
	posx: 200,
	posy: 20,
	margin: 22
}

// Colores
var colores = {
	femenino: "#BA1135",
	masculino: "#05a381",
	caba: "#FFD300",
	provincia: "#F2803A",
	neutro: "#888888"
}

var infoDetails = {
	palabrasPorLinea: 3,
	verticalMargin: 20
}
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

// General
var generalFemenino = Math.round(json.general.genero.femenino*totalCirculos/100),
	generalMasculino = Math.round(json.general.genero.masculino*totalCirculos/100),
	generalCABA = Math.round(json.general.procedencia.caba*totalCirculos/100),
	generalProvincia = Math.round(json.general.procedencia.provincia*totalCirculos/100);

// Niveles
var jsonNiveles = json.niveles;
var coordinadasNiveles = [0,250,500,750];
var cantidadNiveles = Object.keys(jsonNiveles).length; 
var niveles = [];

for (var i = 0; i < cantidadNiveles; i++) {
	var nivelActual = jsonNiveles[Object.keys(jsonNiveles)[i]]; 
	
	var cantidadTotal = Math.round(nivelActual.total*totalCirculos/100);
	var cantidadFemenino = Math.round(nivelActual.genero.femenino*cantidadTotal/100),
		cantidadMasculino = Math.round(nivelActual.genero.masculino*cantidadTotal/100),
		cantidadCABA = Math.round(nivelActual.procedencia.caba*cantidadTotal/100),
		cantidadProvincia = Math.round(nivelActual.procedencia.provincia*cantidadTotal/100);

	var newNivel = { x0: coordinadasNiveles[i], 
					 total: cantidadTotal, 
					 femenino: cantidadFemenino, 
					 masculino: cantidadMasculino,
					 caba: cantidadCABA,
					 provincia: cantidadProvincia };
	
	niveles.push(newNivel);
}

// Explicativos
var explicativos = (function() {
    var json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': "data/explicativos.json",
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
})();

/*
 *	End Datos
 */

// Generar todos los circulitos en estado cero (sin mostrarlos)
for (i = 0; i < grillaSvg.filasGeneral; i++) {
	for (j = 0; j < grillaSvg.columnasGeneral; j++) {
		var grupo = grilla.append("g").attr("class", "circulo");
		grupo.append("circle")
			.attr("fill", colores.neutro)
			.attr("r", circulo.radio)
			.attr("class", currentSeccion);
		grupo.append("rect")
			.attr("width", circulo.radio*2+circulo.margin-circulo.radio)
			.attr("height", circulo.radio*2+circulo.margin-circulo.radio)
			.attr("fill", "transparent")
			.on("mouseover", function(d){
				// Buscar círculo que corresponde a este rectángulo
				var circulo = $(this).parent().children("circle");
				var claseCirculo = circulo.attr("class");
				d3.selectAll($("circle:not(." + claseCirculo.split(' ').join('.') + ")"))
					.style("opacity", 0.2);
				d3.selectAll($("text:not(." + claseCirculo.split(' ').join('.') + ")"))
					.style("opacity", 0.2);
			})
			.on("mouseout", function(d){
				d3.selectAll("circle").style("opacity", 1);	
				d3.selectAll("text").style("opacity", 1);
			});
	}
}

var middleIndex = (Math.floor(totalCirculos/2));
var grupoCirculoMedio = d3.selectAll("g.circulo").filter(function(d, i){ return i == middleIndex; });
var circuloMedio = d3.selectAll("circle").filter(function(d, i){ return i == middleIndex; });
var posxMedio = circulo.posx + (circulo.margin+circulo.radio) * ((middleIndex % grillaSvg.columnasGeneral)+1);
var posyMedio = circulo.posy + (circulo.margin+circulo.radio) * (Math.floor(middleIndex/grillaSvg.columnasGeneral)+1);

//TODO: Extraer a funcion de init
juntarCirculitos();
showOneCirculito();

var infoGroup = svgGeneral.append("g").attr("class", "info");

generarInfoText();
generarLabelsNiveles();

/***********************************************/

/*
 * Filtros!
 */

// Filtrar por genero
d3.select("#radio-genero")
	.on("click", function(){ 
		filtrarPorGenero();
		generarInfoText("genero");		
		$(this).blur(); 
	});

// Filtrar por procedencia
d3.select("#radio-procedencia")
	.on("click", function() { 
		filtrarPorProcedencia(); 
		generarInfoText("procedencia")
		$(this).blur(); 
	});

function filtrarPorGenero() {
	switch (currentSeccion) {
		case "general":
			filtrarGeneral();	
			break;
		case "niveles":
			filtrarNiveles();
			break;
		default:
			break;
	}

	function filtrarGeneral(){
		d3.selectAll("circle").attr("class", function(d,i){
			if (i < generalFemenino) { return currentSeccion + " femenino"; } else { return currentSeccion + " masculino"; }
		});	
		d3.selectAll("circle").transition().attr("fill", function(d,i){ 
			if (i < generalFemenino) { return colores.femenino; } else { return colores.masculino; }
		});
	}

	function filtrarNiveles() {
		var currentNivel = 0;
		var currentCirculos = niveles[currentNivel].total;
		var previousCirculos = 0;
		var currentIndex;

		d3.selectAll("circle").attr("class", function(d,i){			
			//TODO: utilizar RegEx para buscar la clase de nivel
			var nivel = d3.select(this).attr("class").split(" ")[0];
			return nivel + " " + calcularSexo(i);
		});

		currentNivel = 0;
		currentCirculos = niveles[currentNivel].total;
		previousCirculos = 0;

		d3.selectAll("circle").transition().attr("fill", function(d,i) {
			if (calcularSexo(i) == "femenino") { return colores.femenino; } else { return colores.masculino; }
		});

		function calcularSexo(index){
			if (index >= currentCirculos) {
				currentNivel++;
				currentCirculos += niveles[currentNivel].total;
			}
			if (currentNivel > 0) {
				var count = currentNivel;
				previousCirculos = 0;
				while (count > 0) {
					previousCirculos += niveles[count-1].total;
					count--;
				}
			}
			currentIndex = index - previousCirculos;
			var femCurrentNivel = niveles[currentNivel].femenino;
			if (currentIndex < femCurrentNivel) { return "femenino"; } else { return "masculino"; }
		}
	}
}

function filtrarPorProcedencia() {
	switch (currentSeccion) {
		case "general":
			filtrarGeneral();				
	 		break;
	 	case "niveles":
	 		filtrarNiveles();
	 		break;
	 	default:
	 		break;
	}

	function filtrarGeneral() {
		d3.selectAll("circle").attr("class", function(d,i){
 			if (i < generalCABA) { return currentSeccion + " caba"; } else { return currentSeccion + " provincia"; }
 		});
		d3.selectAll("circle").transition().attr("fill", function(d,i){ 
			if (i < generalCABA) { return colores.caba; } else { return colores.provincia; }
 		});
	}	

	function filtrarNiveles() {
		var currentNivel = 0;
		var currentCirculos = niveles[currentNivel].total;
		var previousCirculos = 0;
		var currentIndex;

		d3.selectAll("circle").attr("class", function(d,i){
			//TODO: utilizar RegEx para buscar la clase de nivel
			var nivel = d3.select(this).attr("class").split(" ")[0];
			return nivel + " " + calcularProcedencia(i);
		});

		currentNivel = 0;
		currentCirculos = niveles[currentNivel].total;
		previousCirculos = 0;	

		d3.selectAll("circle").transition().attr("fill", function(d,i){
			if (calcularProcedencia(i) == "caba") { return colores.caba; } else { return colores.provincia; }
		})

		function calcularProcedencia(index) {
			if (index >= currentCirculos) {
				currentNivel++;
				currentCirculos += niveles[currentNivel].total;
			}
			if (currentNivel > 0) {
				var count = currentNivel;
				previousCirculos = 0;
				while (count > 0) {
					previousCirculos += niveles[count-1].total;
					count--;
				}
			}
			currentIndex = index - previousCirculos;
			var cabaCurrentNivel = niveles[currentNivel].caba;
			if (currentIndex < cabaCurrentNivel) { return "caba"; } else { return "provincia"; }
		}
	}
}

/*
 * End Filtros!
 */

/***********************************/

/*
 * Funciones
 */

function endall(transition, callback) { 
	var n = 0; 
	transition 
    .each(function() { ++n; }) 
    .each("end", function() { if (!--n) callback.apply(this, arguments); }); 
} 

function showOneCirculito() {
	$(".circulo").hide();
	grupoCirculoMedio.style("display", "block");
	circuloMedio.attr("cx", posxMedio).attr("cy", posyMedio);
	circuloMedio.transition().duration(500).attr("r", circulo.radioGrande);
}

function hideOneCirculitoYJuntar() {		
	circuloMedio.transition().duration(500).attr("r", circulo.radio).call(endall, function(){
		juntarCirculitos();
	});
}

function juntarCirculitos() {
	d3.selectAll("rect").transition().attr("x", function(d,i){
		return circulo.posx + (circulo.margin+circulo.radio) * ((i % grillaSvg.columnasGeneral)+1) - circulo.radio - (circulo.margin-circulo.radio)/2;
	}).attr("y", function(d,i){
		return circulo.posy + (circulo.margin+circulo.radio) * (Math.floor(i/grillaSvg.columnasGeneral)+1) - circulo.radio - (circulo.margin-circulo.radio)/2;
	});
	d3.selectAll("circle").transition().attr("cx", function(d,i){
		return circulo.posx + (circulo.margin+circulo.radio) * ((i % grillaSvg.columnasGeneral)+1);
	}).attr("cy", function(d,i){
		return circulo.posy + (circulo.margin+circulo.radio) * (Math.floor(i/grillaSvg.columnasGeneral)+1);
	});
	d3.selectAll("circle").attr("class", currentSeccion + " " + general);
}

// Función que divide los circulitos en niveles
function separarCirculitos() {
	// Inicializar variables de posicion
	var currentNivel = 0,
		currentCirculos = niveles[currentNivel].total,
		previousCirculos = 0,
		currentIndex;	

	//TODO: Arreglar el tema del reseteo de las variables para el cy
	d3.selectAll("circle").transition().attr("cx", function(d,i){
		return calcularNuevaPosicion("x", i);
	}).attr("cy", function(d,i){		
		previousCirculos = 0;
		return calcularNuevaPosicion("y", i);
	})
	.call(endall, function() { 
		d3.selectAll("rect").attr("x", function(d,i){		
			var circleNuevoX = $(this).parent().children("circle").attr("cx");
			return circleNuevoX - circulo.radio - (circulo.margin-circulo.radio)/2;
		}).attr("y", function(d,i){						
			var circleNuevoY = $(this).parent().children("circle").attr("cy");
			return circleNuevoY - circulo.radio - (circulo.margin-circulo.radio)/2;
		});		

		d3.selectAll("circle").attr("class", function(d,i){
			return "nivel" + calcularNivel(i);
		})
	});

	function calcularNivel(index) {
		var currentNivel = 0;
		var currentCirculos = niveles[currentNivel].total;
		while (index >= currentCirculos) {
			currentNivel++;
			currentCirculos += niveles[currentNivel].total;
		}
		return currentNivel;
	}

	function calcularNuevaPosicion(axis, index){
		var result;
		var currentNivel = calcularNivel(index);
		if (currentNivel > 0) {
			var count = currentNivel;
			previousCirculos = 0;
			while (count > 0) {
				previousCirculos += niveles[count-1].total;
				count--;
			}
		}
		currentIndex = index - previousCirculos;		
		if (axis == "x") {
			x0 = niveles[currentNivel].x0;
			result = x0 +
					 ((currentIndex+1)*(circulo.margin+circulo.radio)-(circulo.margin+circulo.radio)*grillaSvg.columnasPorNivel*Math.floor(currentIndex/grillaSvg.columnasPorNivel));
		}
		else if (axis == "y"){
			result = grillaSvg.alto - 
					 grillaSvg.labelSpace - 
					 (circulo.posy + Math.floor(currentIndex/grillaSvg.columnasPorNivel) * (circulo.margin+circulo.radio));
		}
		else {
			console.log("Hubo un error con el calculo de posiciones de los ejes X e Y");
		}
		return result;
	}	
}

function mostrarMapaComunas() {
	d3.selectAll("circle.nivel0").attr("class", "nivel_activo");
	$(".circulo").hide();
	$("circle.nivel_activo").parent().show();	

	d3.select("#mapaCABA svg").transition().duration(400).attr("x", 300);
}

function generarLabelsNiveles() {
	var labelsNiveles = [{texto: "Inicial", posx: niveles[0].x0+100, posy: 440, clase: "nivel0"},
						 {texto: "Primario", posx: niveles[1].x0+100, posy: 440, clase: "nivel1"},
						 {texto: "Secundario", posx: niveles[2].x0+100, posy: 440, clase: "nivel2"},
						 {texto: "Terciario", posx: niveles[3].x0+100, posy: 440, clase: "nivel3"}];		

	svgGeneral.selectAll("text.labelNivel")
		.data(labelsNiveles)
		.enter()
		.append("text")
		.attr("x", function(d) { return d.posx; })
		.attr("y", function(d) { return d.posy; })
		.attr("text-anchor", "middle")
		.text(function(d) { return d.texto; })
		.attr("class", function(d) { return d.clase + " labelNivel"});
}

function resetCambioSeccion() {	
	currentSeccion = $("section.active").attr("id"); 

	d3.selectAll("input[type=radio]").property("checked", false);
	d3.selectAll("circle").transition().attr("fill", colores.neutro);	
	
	if (currentSeccion != "comuna") { resetMapaCaba(); }
	if (currentSeccion != "niveles") { $("text.labelNivel").hide(); }

	$("g.info").hide();

	switch(currentSeccion) {				
		case "niveles":
			resetCirculoMedio();
			break;
		case "comuna":
			resetCirculoMedio();
			break;
		case "mapa":	
			$("svg").hide();
			$("form.filtro").hide();
			break;
	}

	function resetCirculoMedio() {
		circuloMedio.attr("r", circulo.radio);
	}

	function resetMapaCaba() {
		$("#mapaCABA").hide();
		d3.select("#mapaCABA svg")
			.attr("x", mapaSvg.posInicialX)
			.attr("y", mapaSvg.posInicialY);
	}
}

function generarInfoText(hover) {	
	$("g.info").show();
	hover = (typeof hover === "undefined") ? "estadoCero" : hover;
	
	var explicativosSeccion = explicativos.secciones[currentSeccion][hover],
		explicativosKeys = Object.keys(explicativosSeccion);

	infoGroup.selectAll("text").remove();
	infoGroup.selectAll("text").data(explicativosKeys).enter().append("text");

	var posTextoX = 0,
		posTextoY = 0,
		coordenadasX = [],
		coordenadasY = [];

	var topY = circulo.posy + circulo.radio + circulo.margin,
		bottomY = grillaSvg.filasGeneral * (circulo.radio + circulo.margin) +
				  circulo.posy;
	var posicionesY = [topY, bottomY];

	for (var i=0; i<explicativosKeys.length; i++) {
		var palabras = explicativosSeccion[explicativosKeys[i]].split(" "),
			lineas = [];	

		for (var j=0; j<palabras.length; j = j + infoDetails.palabrasPorLinea) {
			var fraseCortada = palabras.slice(j, j+infoDetails.palabrasPorLinea),
				frase = fraseCortada.join(" ");
			
			lineas.push(frase);
		}

		switch (currentSeccion) {		
			case "landing":
				posTextoX = parseInt(circuloMedio.attr("cx")) +
							circulo.radioGrande + circulo.margin*2;
				coordenadasX.push(posTextoX);
				posTextoY = parseInt(circuloMedio.attr("cy")) - 
							Math.floor(lineas.length/2) * infoDetails.verticalMargin;
				coordenadasY.push(posTextoY);
				break;
			case "general":
				posTextoX = grillaSvg.columnasGeneral * (circulo.radio + circulo.margin) + 
							circulo.posx + circulo.radio + circulo.margin*2;					
				coordenadasX.push(posTextoX);			
				if (hover == "estadoCero") {
					posTextoY = grillaSvg.filasGeneral * (circulo.radio + circulo.margin) / 2 +
								circulo.posy -
								Math.floor(lineas.length/2) * infoDetails.verticalMargin;					
					coordenadasY.push(posTextoY);
				}
				else { 										
					coordenadasY.push(posicionesY[i]);
				}
				break;
		}

		var texto = d3.selectAll("g.info text").filter(function(d,index){return index == i });
		texto.text(lineas[0])
			.attr("x", coordenadasX[i])
			.attr("y", coordenadasY[i])
			.attr("class", currentSeccion + " " + explicativosKeys[i]);
		
		for (var k=1; k<lineas.length; k++) {
			texto.append("tspan")
				.text(lineas[k])
				.attr("x", coordenadasX[i])
				.attr("y", coordenadasY[i] + infoDetails.verticalMargin*k)
				.attr("class", currentSeccion + " " + explicativosKeys[i]);	
		}
	}
}