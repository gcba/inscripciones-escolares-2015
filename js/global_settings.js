/*
 * Global settings
 */ 

// Detalles de la grilla de círculos 
var grillaSvg = {
	ancho: 960,
	alto: 470,
	labelSpace: 110,
	filasGeneral: 9,
	columnasGeneral: 15,
	columnasPorNivel: 4
}

var totalCirculos = grillaSvg.filasGeneral * grillaSvg.columnasGeneral;

var coordenadasNiveles = [80,380,680];

// Detalles de los círculos
var circulo = {
	radio: 7,
	radioGrande: 100,
	posx: 270,
	posy: 50,
	margin: 20
}

// Colores
var colores = {
	femenino: "#BA1135",
	masculino: "#05a381",
	caba: "#FFD300",
	provincia: "#F2803A",
	neutro: "#666666"
}

// Explicativos
var infoDetails = {
	verticalMargin: 20,
	palabrasPorLinea: 3
}

// Detalles Mapa de CABA SVG
var nivelActivo = "inicial";
var mapaSvg = {
	ancho: 300,
	alto: 300,
	posInicialX: grillaSvg.ancho,
	posInicialY: grillaSvg.alto - grillaSvg.labelSpace - 300
}