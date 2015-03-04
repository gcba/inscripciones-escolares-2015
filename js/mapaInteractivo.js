/*
 * JS para scrolling
/*
Crea la vizualizacion del mapa interactivo del ultimo slide
*/

var sublayers = [];

function loadMap() {

    var ulrViz = "http://gcba.cartodb.com/api/v2/viz/2d6d581c-bc5d-11e4-b17e-0e9d821ea90d/viz.json";

    cartodb.createVis('mapaInteractivo', ulrViz)
        .done(function(vis, layers) {
            // El infowindows está en la segunda layer
            var sublayer = layers[1].getSubLayer(0);

            sublayers.push( sublayer );

            // Reescribo HTML de infowindows por el definido en el primer script
            sublayer.infowindow.set('template', $('#infowindow_template').html());
        });
}
 
window.onload = loadMap;

// Filtros de DropUP
$("#filtro1 li a").click(function(){
  var selText = $(this).text();
  $("#filtro2 a")[0].innerHTML = 'Ver todas' + '<span class="caret"></span>';
  $(this).parents('.btn-group').find('.dropdown-toggle').html(selText+' <span class="caret"></span>');
  filtro (selText, "niveldescr");
});


$("#filtro2 li a").click(function(){
  var selText = $(this).text();
  $("#filtro1 a")[0].innerHTML = 'Ver todos' + '<span class="caret"></span>';
  $(this).parents('.btn-group').find('.dropdown-toggle').html(selText+' <span class="caret"></span>');
  filtro (selText, "modalidadd");
});

function filtro (accion,campo){

  // sacar resets de consulta
  // la funcion no recibe parámetros
  // dependiendo que esté seleccionado
  // armo string de SQL

  var consulta = "SELECT * FROM escuelas";


  switch (accion) {
    case "Ver todos":
      sublayers[0].set({sql: consulta });
      break;
    case "Ver todas":
      sublayers[0].set({sql: consulta });
      break;
    default:
      sublayers[0].set({sql: consulta +  " WHERE " + campo + " LIKE '%" + accion + "'"});
      break;
  }
}
