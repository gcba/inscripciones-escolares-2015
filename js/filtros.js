/*
 * Filtros!
 */

$("input[name=filtro]").click(function(){

	// Agrego flag
  var previousValue = $(this).attr('previousValue');
  var name = $(this).attr('name');

  // Check flag, if true, reset radio, remove path, remove color, remove info.
  if (previousValue == 'checked')
  {
    $(this).removeAttr('checked');
    $(this).attr('previousValue', false);
    reset(this);
    
    // Reset color de los circulos, clases, y esconder explicativos
    d3.selectAll("circle")
    	.attr("fill", colores.neutro)
    	.attr("class", function(d) {
    		var nuevaClase = currentSeccion + " general";
    		if (currentSeccion != "general") {
    			var nivel = d3.select(this).attr("nivel");
    			nuevaClase += " nivel" + nivel;
    			if (currentSeccion == "comuna") {
    				var esNivelActivo = this.classList.contains("nivel_activo");
	    			if (esNivelActivo) {
	    				nuevaClase += " nivel_activo";
	    			}	
    			}
    		}
			return nuevaClase;
    	});
    $("g.info").hide();
  }
  else
  {
  	// Check flag, if false, do the check, color and info.
    $("input[name="+name+"]:radio").attr('previousValue', false);
    $(this).attr('previousValue', 'checked');
    var tipoFiltro = $(this).val();
    filtrar(tipoFiltro);
    generarInfoText(tipoFiltro);
    $(this).blur();
  }
});


function calcularCategoria(clavesCategoria, datosFiltro, index){
	var currentNivel = 0,
		currentCirculos = niveles[currentNivel].total,
		previousCirculos = 0,
		currentIndex;
	while (index >= currentCirculos) {
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
	if (currentIndex < datosFiltro[currentNivel]) { return clavesCategoria[0]; } else { return clavesCategoria[1]; }
}

function filtrar(filtro) {
	if (currentSeccion == "general") {
		var datosCategoria = json[currentSeccion][filtro],
			clavesCategoria = Object.keys(datosCategoria),
			numCirculosCategoria = datosCategoria[clavesCategoria[0]]*totalCirculos/100;

		d3.selectAll("circle").attr("class", function(d,i){
			if (i < numCirculosCategoria) { return currentSeccion + " " + clavesCategoria[0]; } else { return currentSeccion + " " + clavesCategoria[1]; }
		});
		d3.selectAll("circle").transition().attr("fill", function(d,i){
			if (i < numCirculosCategoria) { return colores[clavesCategoria[0]]; } else { return colores[clavesCategoria[1]]; }
		});
	} else {
		var datosFiltro = [],
			clavesCategoriaNivel = [];

		for (var i=0; i<niveles.length; i++) {
			var datosCategoriaNivel = niveles[i][filtro];
			clavesCategoriaNivel = Object.keys(datosCategoriaNivel);
			datosFiltro.push(datosCategoriaNivel[clavesCategoriaNivel[0]]);
		}

		d3.selectAll("circle").attr("class", function(d,i){
			var nivel = d3.select(this).attr("nivel"),
				esNivelActivo = this.classList.contains("nivel_activo"),
				categoriaCirculo = calcularCategoria(clavesCategoriaNivel, datosFiltro, i),
				nuevaClase = currentSeccion + " nivel" + nivel + " " + categoriaCirculo;
			if (esNivelActivo) {
				nuevaClase += " nivel_activo";
			}
			return nuevaClase;
		});
		d3.selectAll("circle").transition().attr("fill", function(d,i) {
			return colores[calcularCategoria(clavesCategoriaNivel, datosFiltro, i)];
		});

		if (currentSeccion == "comuna") {
			var nivelSeleccionado = $("circle.nivel_activo").attr("nivel");
			d3.selectAll("g.info text[nivel='"+nivelSeleccionado+"']").attr("class", function(){ return d3.select(this).attr("class") + " nivel_activo animated fadeInUp"});
		}
	}
}

/*
 * End Filtros!
 */