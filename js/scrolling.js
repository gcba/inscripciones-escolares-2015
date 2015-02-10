/*
 * JS para scrolling
 */

$(".main").onepage_scroll({
	sectionContainer: "section",     
	easing: "ease",                  
	animationTime: 1000,             
	pagination: true,                
	updateURL: false,                
	beforeMove: function() {
		// reset estado (funcion aparte guacha)
		d3.selectAll("input[type=radio]").property("checked", false);
		d3.selectAll("circle").transition().attr("fill", "grey");
	},  
	afterMove: function(index) { 
		// dependiendo del index y de que seccion estamos, dividir circulos
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