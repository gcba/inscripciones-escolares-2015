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
  $(this).parents('.btn-group').find('.dropdown-toggle').html(selText+' <span class="caret"></span>');
  filtro ();
});


$("#filtro2 li a").click(function(){
  var selText = $(this).text();
  $(this).parents('.btn-group').find('.dropdown-toggle').html(selText+' <span class="caret"></span>');
  filtro ();
});

function filtro (){
  
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
