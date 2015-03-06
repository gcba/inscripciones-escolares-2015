/*
Crea la vizualizacion del mapa interactivo del ultimo slide
*/

var sublayers = [];
var capas;
var capaInfowindows;

function loadMap() {
                  
    var ulrViz = "http://gcba.cartodb.com/api/v2/viz/2d6d581c-bc5d-11e4-b17e-0e9d821ea90d/viz.json";

    cartodb.createVis('mapaInteractivo', ulrViz)
        .done(function(vis, layers) {
            capas = vis.map;
            capaInfowindows = layers[1];

            // El infowindows está en la segunda layer
            var sublayer = layers[1].getSubLayer(0);

            sublayers.push( sublayer );
/*
            sublayer.on('featureClick', function(e, pos, latlng, data) {
              dibujaGraficoInfowindow(80);
            });
*/
            // Reescribo HTML de infowindows por el definido en el primer script
            sublayer.infowindow.set('template', $('#infowindow_template').html());

        });
}
 
window.onload = loadMap;

// Filtros de DropUP
$("#filtro1 li a").click(function(){
  var selText = $(this).text();
  $(this).parents('.btn-group').find('.dropdown-toggle').html(selText+' <span class="caret"></span>');
  filtro ();
});


$("#filtro2 li a").click(function(){
  var selText = $(this).text();
  $(this).parents('.btn-group').find('.dropdown-toggle').html(selText+' <span class="caret"></span>');
  filtro ();
});

function filtro (){
  $('.close')[0].click()  
  var consulta = "SELECT * FROM escuelas";
  var flag = false;

  if ( $("#filtro1 a")[0].text.trim() !== "Ver todos"){
    consulta = consulta + " WHERE niveldescr LIKE '"+ $("#filtro1 a")[0].text.trim() +"'";
    flag = true;
  }

  if ( $("#filtro2 a")[0].text.trim() !== "Ver todas"){
    if (flag){
      consulta = consulta + " AND"
    }else{
      consulta = consulta + " WHERE"
    }
    consulta = consulta + " modalidadd LIKE '"+ $("#filtro2 a")[0].text.trim() +"'";
  }
  sublayers[0].set({sql: consulta });
}


/**
* Listener de busqueda por keyword
*/

$("#buscadorEscuelas").keyup(function () {
    busquedaKeyword($('#buscadorEscuelas').val());
});


/**
 * Busca escuelas
 */

 var sql = cartodb.SQL({
    user: 'gcba'
});

function busquedaKeyword(key) {
    var contenido = $('#buscadorEscuelas');

    if ( $('#buscadorEscuelas').val() != ''){
        $("#listado").css("display","inline");
        key = key.toLowerCase();
        var q = "SELECT * FROM escuelas WHERE LOWER(nombresc) LIKE '%" + key + "%'";
        sql.execute(q).done(function(data) {
            $('#resultados').text("");
            for (var i = 0; i < data.total_rows; i++) {
                $('#resultados').append(
                    "<li>" +
                        "<a href='#' id='ESC" +
                            data.rows[i].cartodb_id +
                            "' onclick='verEscuela(this.id)'>" + 
                            data.rows[i].nombresc.toLowerCase() +
                        "</a>" +
                    "</li>"
                );
            }
        }).error(function(errors) {
            console.log("SQL ERR:", errors);
        });
    }else{
      //oculto cuadro de búsqueda
      $("#listado").css("display","none");
    }
}

/**
 * Zoomea sobre la escuela seleccionada
 */

function verEscuela(escuela){
  // no pasa nada en esta esquina
  // aqui mandan las divinas
  $("#listado").css("display","none");
  $('#buscadorEscuelas').val("");
  verDetallesEscuela(escuela)
}


/**
 * Cuando se selecciona una escuela se hace zoom sobre el marcador y se abre el infowindows
 */

function openInfowindow(layer, latlng, cartodb_id) {
    layer.trigger('featureClick', null, latlng, null, { cartodb_id: cartodb_id }, 0);
}

function verDetallesEscuela(idEscuela){
    var nro = idEscuela.split("ESC");

    var sql_statement = "SELECT * FROM escuelas WHERE cartodb_id = " + nro[1];
  
    resetFiltros();
    capas.setZoom(16);

    $.getJSON('http://gcba.cartodb.com/api/v2/sql/?q='+sql_statement, function(data) {
        // zoom al marker
        setTimeout(function(){ 
          capas.setCenter([data.rows[0].lat, data.rows[0].lng]);
          openInfowindow(capaInfowindows,[data.rows[0].lat, data.rows[0].lng],data.rows[0].cartodb_id,0);
        }, 1500); 


    });
}

function resetFiltros(){
  sublayers[0].set({sql: "SELECT * FROM escuelas" });

  $("#filtro1 li a").parents('.btn-group').find('.dropdown-toggle').html('Ver todos <span class="caret"></span>');
  $("#filtro2 li a").parents('.btn-group').find('.dropdown-toggle').html('Ver todas <span class="caret"></span>');
}

function dibujaGraficoInfowindow(dato) {
    // Dependiendo el dato saco el resto del fondo
    // Falta realizar esto
    var fondo = 10;



    var w = 100;
    var h = 100;
    var r = h / 2;
    var ir = 20;
    var color = ["#cccccc", "#999999"] //d3.scale.category20c();

    var data = [{
        "value": fondo
    }, {
        "value": dato
    }];


    var vis = d3.select('#graficoMigracion').append("svg:svg").data([data]).attr("width", w).attr("height", h).append("svg:g").attr("transform", "translate(" + r + "," + r + ")");
    var pie = d3.layout.pie().value(function(d) {
        return d.value;
    });
    var arc = d3.svg.arc().innerRadius(r - ir).outerRadius(r);
    var arcs = vis.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");
    arcs.append("svg:path")
        .attr("fill", function(d, i) {
            return color[i];
        })
        .attr("d", function(d) {
            return arc(d);
        });

}
