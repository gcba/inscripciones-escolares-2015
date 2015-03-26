/*
 * JS para scrolling
 */

var currentSeccion = $("section.active").attr("id");

$(".main").onepage_scroll({
	sectionContainer: "section",
	easing: "ease",
	animationTime: 300,
	pagination: true,
	updateURL: false,
	beforeMove: function(index) {
		resetCambioSeccion();
	},
	afterMove: function(index) {
		currentSeccion = $("section.active").attr("id");

		$("section.active").removeClass("active");
		$("section#" + currentSeccion).addClass("active");
		$("#bajada").text(contenido.secciones[currentSeccion].bajada).fadeTo("fast", 1);
		$("a.arrow").fadeIn();
		$(".prev-section span.referencia").text(contenido.secciones[currentSeccion].anteriorSeccion).fadeIn();
		$(".next-section span.referencia").text(contenido.secciones[currentSeccion].proximaSeccion).fadeIn();
		switch(currentSeccion) {
			case "landing":
				showOneCirculito();
				$(".prev-section").hide();
				break;
			case "general":
				$(".circulo").show();
				$(".filtro").show();
				$(".prev-section").show();
				if (circuloMedio.attr("r") == circulo.radio) {
					juntarCirculitos();
				} else {
					hideOneCirculitoYJuntar();
				}
				break;
			case "niveles":
				$(".filtro").show();
				$(".circulo").show();
				$("g.labels").show();
				$("g.labels text").show();
				$(".prev-section").show();
				$("#radio-grados").parent().show();
				separarCirculitos();
				break;
			case "comuna":
				$("#mapaCABA").show();
				$(".filtro").show();
				$("#viz-container").show();
				$("#dropdown-nivel").show();
				$(".prev-section").show();
				generarInfoTextComuna("descripcion");
				mostrarMapaComunas();
				queue()
					.defer(d3.json, "data/comunas.json")
					.defer(d3.json, "data/data.json")
					.await(ready);
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

var svgGeneral = d3.select("svg#viz");

var grilla = svgGeneral.append("g").attr("class", "contenedor");

var mapaComunas = svgGeneral.append("g")
					.attr("id", "mapaCABA");

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
var cantidadNiveles = Object.keys(jsonNiveles).length;
var niveles = [];

for (var i = 0; i < cantidadNiveles; i++) {
	var nivelActual = jsonNiveles[Object.keys(jsonNiveles)[i]];

	var cantidadTotal = Math.round(nivelActual.total*totalCirculos/100);
	var cantidadFemenino = Math.round(nivelActual.genero.femenino*cantidadTotal/100),
		cantidadMasculino = Math.round(nivelActual.genero.masculino*cantidadTotal/100),
		cantidadCABA = Math.round(nivelActual.procedencia.caba*cantidadTotal/100),
		cantidadProvincia = Math.round(nivelActual.procedencia.provincia*cantidadTotal/100);

	var newNivel = {x0: coordenadasNiveles[i],
					total: cantidadTotal,
					genero: {
					 	femenino: cantidadFemenino,
					 	masculino: cantidadMasculino },
					procedencia: {
					 	caba: cantidadCABA,
					 	provincia: cantidadProvincia}
					};


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

// Contenido
var contenido = (function() {
    var json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': "data/contenido.json",
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
		var grupo = grilla.append("g").attr("class", "circulo animated fadeIn");
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
				d3.selectAll($("g.labels text:not(." + claseCirculo.split(' ').join('.') + ")"))
					.style("opacity", 0.2);
				d3.selectAll($("g.info text:not(." + claseCirculo.split(' ').join('.') + ")"))
					.style("opacity", 0.2);
			})
			.on("mouseout", function(d){
				d3.selectAll("circle").style("opacity", 1);
				d3.selectAll("text").style("opacity", 1);
			});
	}
}

var middleIndex = (Math.floor(totalCirculos/2)-1);
var grupoCirculoMedio = d3.selectAll("g.circulo").filter(function(d, i){ return i == middleIndex; });
var circuloMedio = d3.selectAll("circle").filter(function(d, i){ return i == middleIndex; });
var posxMedio = circulo.posx + (circulo.margin+circulo.radio) * ((middleIndex % grillaSvg.columnasGeneral)+1);
var posyMedio = circulo.posy + (circulo.margin+circulo.radio) * (Math.floor(middleIndex/grillaSvg.columnasGeneral)+1);

//TODO: Extraer a funcion de init
juntarCirculitos();
showOneCirculito();

var infoGroup = svgGeneral.append("g").attr("class", "info animated fadeInUp"),
	labelsGroup = svgGeneral.append("g").attr("class", "labels animated fadeInDown"),
	descripcionesGroup = svgGeneral.append("g").attr("class", "descripciones animated fadeInDown");

generarInfoText();

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
	d3.selectAll("circle").attr("class", currentSeccion + " " + "general");
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
	d3.selectAll("circle").transition(500).ease("quad-in").attr("cx", function(d,i){
		return circulo.posx + (circulo.margin+circulo.radio) * ((i % grillaSvg.columnasGeneral)+1);
	}).transition(500).ease("quad-out").attr("cy", function(d,i){
		return circulo.posy + (circulo.margin+circulo.radio) * (Math.floor(i/grillaSvg.columnasGeneral)+1);
	});
	d3.selectAll("circle").attr("class", currentSeccion + " " + "general").attr("nivel", "general");
}

function calcularPosxNivel(x0, index) {
	return x0 + ((index+1)*(circulo.margin+circulo.radio) - (circulo.margin+circulo.radio)*grillaSvg.columnasPorNivel*Math.floor(index/grillaSvg.columnasPorNivel));
}

function calcularPosicionXComuna(index) {
	var x0 = niveles[0].x0;
	return x0 + ((index+1)*(circulo.margin+circulo.radio) - (circulo.margin+circulo.radio)*grillaSvg.columnasPorNivel*Math.floor(index/grillaSvg.columnasPorNivel));
}

function calcularPosyNivel(index) {
	return grillaSvg.alto -
		   grillaSvg.labelSpace -
		   (Math.floor(index/grillaSvg.columnasPorNivel) * (circulo.margin+circulo.radio));
}

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
	var previousCirculos = 0;
	if (currentNivel > 0) {
		var count = currentNivel;
		while (count > 0) {
			previousCirculos += niveles[count-1].total;
			count--;
		}
	}
	currentIndex = index - previousCirculos;
	if (axis == "x") {
		x0 = niveles[currentNivel].x0;
		result = calcularPosxNivel(x0,currentIndex);
	} else if (axis == "y"){
		result = calcularPosyNivel(currentIndex);
	} else {
		console.log("Hubo un error con el calculo de posiciones de los ejes X e Y");
	}
	return result;
}

// Función que divide los circulitos en niveles
function separarCirculitos() {
	// Inicializar variables de posicion
	var currentNivel = 0,
		currentCirculos = niveles[currentNivel].total,
		previousCirculos = 0,
		currentIndex;

	//TODO: Arreglar el tema del reseteo de las variables para el cy
	d3.selectAll("circle").transition(1000).delay(function(d, i) { return i * .5;}).ease("quad").attr("cx", function(d,i){
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
			return currentSeccion + " nivel" + calcularNivel(i) + " general";
		}).attr("nivel", function(d,i){ return calcularNivel(i) });
	});
}

function agregarNivelActivo() {
	// Agregar clase nivel_activo en base a lo seleccionado en el dropdown
	var nivelSeleccionado = $("#dropdown-nivel select option:selected").val();

	// sacarle nivel_activo al nivel que estaba activo antes, si habia
	var circulosActivos = $("circle.nivel_activo");
	if (circulosActivos.length != 0) {
		var removedClass = $("circle.nivel_activo").attr("class").replace(new RegExp('(\\s|^)' + "nivel_activo" + '(\\s|$)', 'g'), '$2');
		d3.selectAll("circle." + removedClass.split(" ").join(".") + ".nivel_activo").attr("class", removedClass);
	}

	// sacarle nivel_activo a los textos que estaban activo antes, si habia
	var textosLabelsActivos = $("g.labels text.nivel_activo");
	if (textosLabelsActivos.length != 0) {
		var removedClass = $("g.labels text.nivel_activo").attr("class").replace(new RegExp('(\\s|^)' + "nivel_activo" + '(\\s|$)', 'g'), '$2');
		d3.selectAll("g.labels text." + removedClass.split(" ").join(".") + ".nivel_activo").attr("class", removedClass);
	}
	var textosInfoActivos = $("g.info text.nivel_activo");
	if (textosInfoActivos.length != 0) {
		var removedClass = $("g.info text.nivel_activo").attr("class").replace(new RegExp('(\\s|^)' + "nivel_activo" + '(\\s|$)', 'g'), '$2');
		d3.selectAll("g.info text." + removedClass.split(" ").join(".") + ".nivel_activo").attr("class", removedClass);
	}

	var circulosNivel = $("circle[nivel='" + nivelSeleccionado + "']");
	var claseNivel = circulosNivel.attr("class");
	d3.selectAll(circulosNivel).attr("class", claseNivel + " nivel_activo");

	var textosLabelsNivel = $("g.labels text[nivel='" + nivelSeleccionado + "']");
	var claseNivel = textosLabelsNivel.attr("class");
	d3.selectAll(textosLabelsNivel).attr("class", claseNivel + " nivel_activo");
	
	var textosInfoNivel = $("g.info text[nivel='" + nivelSeleccionado + "']");
	var claseNivel = textosInfoNivel.attr("class");
	d3.selectAll(textosInfoNivel).attr("class", claseNivel + " nivel_activo");
}

function mostrarMapaComunas() {
	// En este caso, el usuario llegó a esta sección bajando. Sin seleccionar un nivel.
	if ($("circle.nivel_activo").length == 0){
		// Seleccionamos el nivel inicial como nivel "default"
		var circulosNivel = $("circle[nivel='0']");
		d3.selectAll(circulosNivel).attr("class", "comuna nivel0 general nivel_activo");

		var textoNivel = $("g.labels text[nivel='0']");
		d3.selectAll(textoNivel).attr("class", "comuna nivel0 general nivel_activo");
	}
	$(".circulo").hide();
	$("circle.nivel_activo").parent().show();

	d3.selectAll($("circle")).attr("cx", function(d,i){
		return calcularNuevaPosicion("x", i);
	});
	d3.selectAll("rect").attr("x", function(d,i){
		var circleNuevoX = $(this).parent().children("circle").attr("cx");
		return circleNuevoX - circulo.radio - (circulo.margin-circulo.radio)/2;
	});
	d3.selectAll("circle.nivel_activo").transition().attr("cx", function(d,i){
		return calcularPosicionXComuna(i);
	}).call(endall, function() {
		d3.selectAll("rect").attr("x", function(d,i){
			var circleNuevoX = $(this).parent().children("circle").attr("cx");
			return circleNuevoX - circulo.radio - (circulo.margin-circulo.radio)/2;
		})
	});

	d3.select("#mapaCABA svg").transition().duration(400).attr("x", 350);

	// Make sure que la opcion seleccionada corresponde a los circulos activos
	var nivelComuna = $("circle.nivel_activo").attr("nivel");
	var opcionSeleccionar = $("#dropdown-nivel option[value='"+nivelComuna+"']").attr("selected", "selected");
	nivelActivo = $("#dropdown-nivel :selected").text().toLowerCase();

	$("g.labels").show();
	var textNivel = $("g.labels text[nivel='"+nivelComuna+"'] tspan.nivelLink")[0];
	d3.select(textNivel)
		.style("text-decoration", "none")
		.style("font-weight", "normal")
		.on("click", function(){});
	$("g.labels text[nivel='"+nivelComuna+"']").show();
	d3.selectAll("g.labels text[nivel='"+nivelComuna+"']").attr("x", function(){
		return niveles[0].x0 + circulo.margin;
	});
	d3.selectAll("g.labels text[nivel='"+nivelComuna+"'] tspan").attr("x", function(){
		return niveles[0].x0 + circulo.margin;
	});
	// HACK
	$("tspan.nivelLink").removeAttr("x");
	$("g.labels text:not([nivel='"+nivelComuna+"'])").hide();

	// Mostrar y esconder descripciones del nivel de acuerdo al que esté seleccionado
	$("g.descripciones").show();
	$("g.descripciones text[nivel='"+nivelComuna+"']").show();
	$("g.descripciones text:not([nivel='"+nivelComuna+"'])").hide();

}

function resetRadios() {
		if($("li > input:radio[name='filtro']").is(":checked")) {

			var checkedInput = $("input:radio[name='filtro']:checked");
			var previousValue = checkedInput.attr('previousValue');
			var path = $(".form-group li").find("svg:has(path)");

			if( path ) {
					path.children().remove();
				}


			checkedInput.removeAttr('checked');
			checkedInput.attr('previousValue', false);

	}
}

function resetCambioSeccion() {

	resetRadios();

	$("a.arrow").hide();
	$("#bajada").animate({ opacity: 0 })

	currentSeccion = $("section.active").attr("id");

	d3.selectAll("circle").transition().duration(500).attr("fill", colores.neutro);

	if (currentSeccion != "comuna") {
		resetMapaCaba();
		$("#dropdown-nivel").hide();
		$("g.descripciones").hide();
	}
	if (currentSeccion != "niveles") { 
		$("g.labels").hide();
		$("#radio-grados").parent().hide();
	}

	$("g.info").hide();

	switch(currentSeccion) {
		case "landing":
			$(".filtro").hide();
			break;
		case "niveles":
			resetCirculoMedio();
			break;
		case "comuna":
			resetCirculoMedio();
			nivelMapaCaba = "inicial";
			$("svg").show();
			break;
		case "mapa":
			$("#viz-container").hide();
			$("svg").hide();
			$(".filtro").hide();
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

function calcularLineas(explicativoEntero, cantidadPalabras){
	cantidadPalabras = (typeof cantidadPalabras === "undefined") ? infoDetails.palabrasPorLinea : cantidadPalabras;
	var palabras = explicativoEntero.split(" "),
		lineas = [];

	for (var i=0; i<palabras.length; i = i + cantidadPalabras) {
		var fraseCortada = palabras.slice(i, i+cantidadPalabras),
			frase = fraseCortada.join(" ");

		lineas.push(frase);
	}
	return lineas;
}

function generarInfoTextLanding() {
	var explicativosSeccion = explicativos.secciones["landing"]["estadoCero"];

	infoGroup.append("text");

	var lineas = calcularLineas(explicativosSeccion["general"]);

	var posInfoX = parseInt(circuloMedio.attr("cx")) +
			   circulo.radioGrande + circulo.margin*2;
	var posInfoY = parseInt(circuloMedio.attr("cy")) -
				Math.floor(lineas.length/2) * infoDetails.verticalMargin;

	var texto = d3.select("g.info text").text(lineas[0])
		.attr("x", posInfoX)
		.attr("y", posInfoY)
		.attr("class", currentSeccion + " general")
		.attr("nivel", "general");

	for (var i=1; i<lineas.length; i++) {
		texto.append("tspan")
			.text(lineas[i])
			.attr("x", posInfoX)
			.attr("y", posInfoY + infoDetails.verticalMargin*i)
			.attr("class", currentSeccion + " general")
			.attr("nivel", "general");
	}
}

function generarInfoTextGeneral(filtro) {
	var explicativosSeccion = explicativos.secciones["general"][filtro],
		explicativosKeys = Object.keys(explicativosSeccion);

	infoGroup.selectAll("g.info text").data(explicativosKeys).enter().append("text");

	var posInfoY = 0,
		posInfoX = 0,
		counterLineas = 0;

	for (var i = explicativosKeys.length - 1; i >= 0; i--) {
		var lineas = "";
		if (filtro == "preferencia") {
			lineas = calcularLineas(explicativosSeccion[explicativosKeys[i]], 4);
		} else {
			lineas = calcularLineas(explicativosSeccion[explicativosKeys[i]]);
		}

		posInfoX = grillaSvg.columnasGeneral * (circulo.radio + circulo.margin) +
				   circulo.posx + circulo.radio + circulo.margin*2 ;

		if (filtro == "estadoCero") {
			// posY al bottom del texto, porque escribimos de abajo para arriba
			posInfoY = grillaSvg.filasGeneral * (circulo.radio + circulo.margin) / 2 +
					   circulo.posy +
					   Math.floor(lineas.length/2) * infoDetails.verticalMargin;
		} else {
			// bottom of the grid
			posInfoY = grillaSvg.filasGeneral * (circulo.radio + circulo.margin) +
					   circulo.posy - counterLineas*infoDetails.verticalMargin;
		}

		var texto = d3.selectAll("g.info text").filter(function(d,index){return index == i});
		texto.text(lineas[0])
			.attr("x", posInfoX)
			.attr("y", posInfoY - (lineas.length-1)*infoDetails.verticalMargin)
			.attr("class", currentSeccion + " " + explicativosKeys[i])
			.attr("nivel", "general")
			.on("mouseover", function(d){
				// Buscar círculos que corresponden a este texto
				var claseText = $(this).attr("class").split(' ').slice(0,2);
				d3.selectAll($("circle:not(." + claseText.join('.') + ")"))
					.style("opacity", 0.2);
				d3.selectAll($("g.labels text:not(." + claseText.join('.') + ")"))
					.style("opacity", 0.2);
				d3.selectAll($("g.info text:not(." + claseText.join('.') + ")"))
					.style("opacity", 0.2);
			})
			.on("mouseout", function(d){
				d3.selectAll("circle").style("opacity", 1);
				d3.selectAll("text").style("opacity", 1);
			});

		counterLineas++;

		var tspanY = 0;
		for (var j= lineas.length - 1; j>=1; j--) {
			tspanY = posInfoY - (lineas.length-j-1)*infoDetails.verticalMargin;
			texto.append("tspan")
				.text(lineas[j])
				.attr("x", posInfoX)
				.attr("y", tspanY)
				.attr("class", currentSeccion + " " + explicativosKeys[i])
				.attr("nivel", "general");

			counterLineas++;
		}
	}
}

function generarInfoTextNiveles(filtro) {
	var explicativosSeccion = explicativos.secciones["niveles"],
		nivelesKeys = Object.keys(explicativosSeccion);

	var posInfoX = 0,
		posInfoY = 0;

	if (filtro == "estadoCero") {
		var labels = labelsGroup.selectAll("text");
		if (labels.length != 0) {
			labelsGroup.selectAll("text").remove();
		}

		labelsGroup.selectAll("text").data(nivelesKeys).enter().append("text");
		var explicativoNivel = "";

		for (var i=0; i<nivelesKeys.length; i++) {
			explicativoNivel = explicativosSeccion[nivelesKeys[i]][filtro]["general"];

			var lineas = calcularLineas(explicativoNivel),
				lineaNivel = lineas[lineas.length-1].split(" "),
				nivelText = lineaNivel[lineaNivel.length-1];

			posInfoX = coordenadasNiveles[i] + circulo.margin;
			posInfoY = grillaSvg.alto - grillaSvg.labelSpace + infoDetails.verticalMargin*2;

			var texto = d3.selectAll("g.labels text").filter(function(d,index){return index == i});
			texto.text(lineas[0])
				.attr("x", posInfoX)
				.attr("y", posInfoY)
				.attr("class", currentSeccion + " " + nivelesKeys[i] + " general")
				.attr("nivel", i)
				.on("mouseover", function(d){
					// Buscar círculos que corresponden a este texto
					var claseText = $(this).attr("class").split(' ').slice(0,2);
					d3.selectAll($("circle:not(." + claseText.join('.') + ")"))
						.style("opacity", 0.2);
					d3.selectAll($("g.labels text:not(." + claseText.join('.') + ")"))
						.style("opacity", 0.2);
					d3.selectAll($("g.info text:not(." + claseText.join('.') + ")"))
						.style("opacity", 0.2);
				})
				.on("mouseout", function(d){
					d3.selectAll("circle").style("opacity", 1);
					d3.selectAll("text").style("opacity", 1);
				});

			var tspanY = 0,
				lineaText = "";
			for (var j=1; j<lineas.length; j++) {
				tspanY = posInfoY + infoDetails.verticalMargin*j;
				lineaText = lineas[j];
				if (j == lineas.length-1) {
					lineaText = lineas[j].split(" ").slice(0,2).join(" ") + " ";
				}
				var tspan = texto.append("tspan")
								.text(lineaText)
								.attr("x", posInfoX)
								.attr("y", tspanY)
								.attr("class", currentSeccion + " " + nivelesKeys[i] + " general animated fadeIn")
								.attr("nivel", i);
				if (j == lineas.length-1) {
					tspan.append("tspan")
						.text(nivelText)
						.attr("font-weight", "bold")
						.attr("text-decoration", "underline")
						.attr("class", "nivelLink " + nivelText)
						.on("click", function(d){
							$(".main").moveDown();
							// A un elemento de SVG no le puedo addClass, asi que apendo
							var nivelComunas = $(this).parent().attr("nivel");
							var circulosNivel = $("circle[nivel='" + nivelComunas + "']");
							var claseNivel = circulosNivel.attr("class");
							d3.selectAll(circulosNivel).attr("class", claseNivel + " nivel_activo");
						});
				}
			}
		}
	} else {
		var filtroKeys = [];
		var explicativosNivelesKeys = [];
		for (var i=0; i<nivelesKeys.length; i++) {
			var explicativosNivel = explicativosSeccion[nivelesKeys[i]][filtro],
				explicativosNivelKeys = Object.keys(explicativosNivel);
			explicativosNivelesKeys.push(explicativosNivelKeys);	
			for (var j=0; j<explicativosNivelKeys.length; j++) {
				filtroKeys.push(explicativosNivelKeys[j]);
			}
		}

		infoGroup.selectAll("g.info text").data(filtroKeys).enter().append("text");

		var grosorColumna = grillaSvg.columnasPorNivel * (circulo.margin + circulo.radio*2);

		for (var i=0; i<nivelesKeys.length; i++) {
			var explicativosNivel = explicativosSeccion[nivelesKeys[i]][filtro],
				explicativosNivelKeys = Object.keys(explicativosNivel);

			var counterLineas = 0;

			for (var j=0; j<explicativosNivelKeys.length; j++) {
				var lineas = [];
				if (filtro == "procedencia"){
					lineas = calcularLineas(explicativosNivel[explicativosNivelKeys[j]], 2);
				} else if (filtro == "preferencia") {
					lineas = calcularLineas(explicativosNivel[explicativosNivelKeys[j]], 4);
				} else {
					lineas = calcularLineas(explicativosNivel[explicativosNivelKeys[j]]);
				}

				posInfoX = coordenadasNiveles[i] + grosorColumna;
				posInfoY = grillaSvg.alto - grillaSvg.labelSpace -
						   counterLineas*infoDetails.verticalMargin;

				var texto = d3.selectAll("g.info text").filter(function(d,index){
					var count = 0,
						sumaExplicativos = 0;
					while (i > count) {
						sumaExplicativos += explicativosNivelesKeys[count].length;
						count ++;
					}
					return index == sumaExplicativos + j;
				});
				texto.text(lineas[0])
					.attr("x", posInfoX)
					.attr("y", posInfoY - (lineas.length-1)*infoDetails.verticalMargin)
					.attr("class", function(){
						return currentSeccion + " " + nivelesKeys[i] + " " + explicativosNivelKeys[j]
					})
					.attr("nivel", i)
					.on("mouseover", function(d){
						// Buscar círculos que corresponden a este texto
						var claseText = $(this).attr("class").split(' ');
						d3.selectAll($("circle:not(." + claseText.join('.') + ")"))
							.style("opacity", 0.2);
						d3.selectAll($("g.labels text:not(." + claseText.join('.') + ")"))
							.style("opacity", 0.2);
						d3.selectAll($("g.info text:not(." + claseText.join('.') + ")"))
							.style("opacity", 0.2);
					})
					.on("mouseout", function(d){
						d3.selectAll("circle").style("opacity", 1);
						d3.selectAll("text").style("opacity", 1);
					});

				counterLineas++;

				var tspanY = 0;
				for (var k= lineas.length - 1; k>=1; k--) {
					tspanY = posInfoY - (lineas.length-k-1)*infoDetails.verticalMargin;
					texto.append("tspan")
						.text(lineas[k])
						.attr("x", posInfoX)
						.attr("y", tspanY)
						.attr("class", currentSeccion + " " + nivelesKeys[i] + " " + explicativosNivelKeys[j])
						.attr("nivel", i);

					counterLineas++;
				}
			}
		}
	}
}

function generarInfoTextComuna(filtro) {
	// nivelComuna es un número del 0 al 3
	var nivelComuna = $("circle.nivel_activo").attr("nivel");
	if (filtro == "estadoCero") {
		generarInfoTextNiveles(filtro);
		var textNivel = $("g.labels text[nivel='"+nivelComuna+"'] tspan.nivelLink")[0];
		d3.select(textNivel)
			.style("text-decoration", "none")
			.style("font-weight", "normal")
			.on("click", function(){});
		$("g.labels text[nivel='"+nivelComuna+"']").show();
		d3.selectAll("g.labels text[nivel='"+nivelComuna+"']").attr("x", function(){
			return niveles[0].x0 + circulo.margin;
		});
		d3.selectAll("g.labels text[nivel='"+nivelComuna+"'] tspan").attr("x", function(){
			return niveles[0].x0 + circulo.margin;
		});
		// HACK
		$("tspan.nivelLink").removeAttr("x");
		$("g.labels text:not([nivel='"+nivelComuna+"'])").hide();
	} else if (filtro == "descripcion") {
		// Texto que corresponde a la sección al lado del mapa de CABA,
		// Donde se explican más detalles del nivel que se está viendo
		var explicativosDescripcion = explicativos.secciones["comuna"],
			nivelesKeys = Object.keys(explicativosDescripcion);

		var posInfoX = 0,
			posInfoY = 0;

		var descripciones = descripcionesGroup.selectAll("text");
		if (descripcionesGroup.length != 0) {
			descripcionesGroup.selectAll("text").remove();
		}

		descripcionesGroup.selectAll("text").data(nivelesKeys).enter().append("text");
		var explicativoNivel = "";

		for (var i=0; i<nivelesKeys.length; i++) {
			explicativoNivel = explicativosDescripcion[nivelesKeys[i]][filtro];

			var lineas = calcularLineas(explicativoNivel, 5),
				lineaNivel = lineas[lineas.length-1].split(" "),
				nivelText = lineaNivel[lineaNivel.length-1];

			posInfoX = niveles[2].x0;
			posInfoY = grillaSvg.alto/2 - Math.floor(lineas.length/2) * infoDetails.verticalMargin;

			var texto = d3.selectAll("g.descripciones text").filter(function(d,index){return index == i});
			texto.text(lineas[0])
				.attr("x", posInfoX)
				.attr("y", posInfoY)
				.attr("class", currentSeccion + " " + nivelesKeys[i] + " descripcion animated fadeIn")
				.attr("nivel", i)

			var tspanY = 0,
				lineaText = "";
			for (var j=1; j<lineas.length; j++) {
				tspanY = posInfoY + infoDetails.verticalMargin*j;
				lineaText = lineas[j];
				var tspan = texto.append("tspan")
								.text(lineaText)
								.attr("x", posInfoX)
								.attr("y", tspanY)
								.attr("class", currentSeccion + " " + nivelesKeys[i] + " descripcion animated fadeIn")
								.attr("nivel", i);
			}
		}
	} else {
		generarInfoTextNiveles(filtro);
		d3.selectAll("g.labels text[nivel='"+nivelComuna+"']").attr("class", function(){
			return d3.select(this).attr("class") + " nivel_activo";
		});
		d3.selectAll("g.info text[nivel='"+nivelComuna+"']").attr("class", function(){
			return d3.select(this).attr("class") + " nivel_activo";
		});
		$("g.info text[nivel='"+nivelComuna+"']").show();
		d3.selectAll("g.info text[nivel='"+nivelComuna+"']").attr("x", function(){
			return niveles[0].x0 + circulo.margin + grillaSvg.columnasPorNivel * (circulo.margin + circulo.radio);
		});
		d3.selectAll("g.info text[nivel='"+nivelComuna+"'] tspan").attr("x", function(){
			return niveles[0].x0 + circulo.margin + grillaSvg.columnasPorNivel * (circulo.margin + circulo.radio);
		});
		$("g.info text:not([nivel='"+nivelComuna+"'])").hide();
	}
}

function generarInfoText(filtro) {
	$("g.info").show();
	filtro = (typeof filtro === "undefined") ? "estadoCero" : filtro;
	infoGroup.selectAll("text").remove();

	switch (currentSeccion) {
			case "landing":
				generarInfoTextLanding();
				break;
			case "general":
				generarInfoTextGeneral(filtro);
				break;
			case "niveles":
				generarInfoTextNiveles(filtro);
				break;
			case "comuna":
				generarInfoTextComuna(filtro);
			default:
				break;
		}
}

/*
 * EVENT
 * HANDLING
 */

$("#dropdown-nivel select").change(function(){
	// Reset filtros
	resetRadios();
	d3.selectAll("input[type=radio]").property("checked", false);
	d3.selectAll("circle").attr("fill", colores.neutro).attr("class", function(){
		return currentSeccion + " nivel" + d3.select(this).attr("nivel") + " general";
	});

	$("g.info").hide();

	agregarNivelActivo();
	mostrarMapaComunas();

    queue()
      .defer(d3.json, "data/comunas.json")
      .defer(d3.json, "data/data.json")
      .await(ready);
});

