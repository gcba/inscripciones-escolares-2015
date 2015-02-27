/*
 * JS para scrolling
/*
Crea la vizualizacion del mapa interactivo del ultimo slide
*/


function loadMap() {

		var ulrViz = "http://gcba.cartodb.com/api/v2/viz/2d6d581c-bc5d-11e4-b17e-0e9d821ea90d/viz.json";

    cartodb.createVis('mapaInteractivo', ulrViz)
        .done(function(vis, layers) {
            // El infowindows está en la segunda layer
            var sublayer = layers[1].getSubLayer(0);

            // Reescribo HTML de infowindows por el definido en el primer script 
            sublayer.infowindow.set('template', $('#infowindow_template').html());
        });
}

window.onload = loadMap;

// Filtros de DropUP
$(".dropdown-menu li a").click(function(){
  var selText = $(this).text();
  $(this).parents('.btn-group').find('.dropdown-toggle').html(selText+' <span class="caret"></span>');
});

$("#btnSearch").click(function(){
  alert($('.btn-select').text()+", "+$('.btn-select2').text());
});