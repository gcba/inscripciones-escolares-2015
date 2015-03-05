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

            // Reescribo HTML de infowindows por el definido en el primer script
            sublayer.infowindow.set('template', $('#infowindow_template').html());

            sublayer.on('featureClick', function(e, pos, latlng, data) {
              console.log( "clickeado el " + data.cartodb_id);
            });

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
  console.log (consulta);
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

    $.getJSON('http://gcba.cartodb.com/api/v2/sql/?q='+sql_statement, function(data) {
        // zoom al marker
        capas.setZoom(16);
        capas.setCenter([data.rows[0].lat, data.rows[0].lng]);
        openInfowindow(capaInfowindows,[data.rows[0].lat, data.rows[0].lng],data.rows[0].cartodb_id,0);

    });
}

