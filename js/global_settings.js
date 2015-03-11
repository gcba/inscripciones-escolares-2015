/*
 * Global settings
 */

// Detalles de la grilla de círculos
var grillaSvg = {
	ancho: 960,
	alto: 470,
	labelSpace: 110,
	filasGeneral: 9,
	columnasGeneral: 14,
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
	femenino: "#47E4C2",
	masculino: "#522CA6",
	caba: "#2C3C63",
	provincia: "#FA5037",
	neutro: "#1977DD"
}

// Explicativos
var infoDetails = {
	verticalMargin: 20,
	palabrasPorLinea: 3
}

// Detalles Mapa de CABA SVG
var nivelActivo = "inicial";
var mapaSvg = {
	ancho: 400,
	alto: 300,
	posInicialX: grillaSvg.ancho,
	posInicialY: grillaSvg.alto - grillaSvg.labelSpace - 280
}