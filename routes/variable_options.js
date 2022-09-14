const express = require('express');
const fs = require('fs');

const router = express.Router();

const variables = [];
let iniciales = [];
let dbs = [];
let casosEspeciales = {};

/**
 * Carga las variables disponibles agrupadas por base de datos del
 * archivo variables.json en la variable dbs.
 */
function cargarDbs() {
  const data = fs.readFileSync('./data/variables.json');
  dbs = JSON.parse(data);
}

/**
 * Carga los casos especiales del archivo casos_especiales.json en la variable casosEspeciales.
*/
function cargarCasosEspeciales() {
  fs.readFile('./data/casos_especiales.json', (err, data) => {
    if (err) throw err;
    casosEspeciales = JSON.parse(data);
  });
}

/**
 * Carga los datos iniciales del archivo iniciales.json en la variable iniciales.
*/
function cargarDatosIniciales() {
  fs.readFile('./data/config_inicial.json', (err, data) => {
    if (err) throw err;
    iniciales = JSON.parse(data);
  });
}

/**
 * Lista las variables agrupadas en dbs.
*/
function listarVariables() {
  dbs.forEach((bd) => {
    const anios = new Set();
    bd.variables.forEach((variable) => {
      const temp = variable;
      temp.bd = bd.base_de_datos;
      variable.anios.forEach(anios.add, anios);
    });
    bd.anios = anios;
    variables.push(...bd.variables);
  });
}

/**
 * Ejecuta en orden las funciones cargarVariables, cargarDbs y listarVariables.
*/
function cargarVariables() {
  cargarDatosIniciales();
  cargarCasosEspeciales();
  cargarDbs();
  listarVariables();
}

router.get('/lista', (req, res) => {
  res.send(variables);
});

router.get('/resumen', (req, res) => {
  const resumen = variables.map((variable) => ({
    bd: variable.bd,
    value: variable.value,
    nombre: variable.nombre,
    anios: variable.anios,
  }
  ));
  res.type('json').send(JSON.stringify(resumen, null, 2));
});

router.get('/brechas', (req, res) => {
  const resumen = variables.map((variable) => ({
    bd: variable.bd,
    value: variable.value,
    nombre: variable.nombre,
    anios: variable.anios,
    brechas: variable.brechas.map((brecha) => brecha.nombre),
  }
  ));
  res.type('json').send(JSON.stringify(resumen, null, 2));
});

router.get('/anios', (req, res) => {
  let min = 2050;
  let max = 1900;
  variables.forEach((variable) => {
    if (Math.max(...variable.anios) > max) {
      max = Math.max(...variable.anios);
    }
    if (Math.min(...variable.anios) < min) {
      min = Math.min(...variable.anios);
    }
  });
  const anios = Array.from(new Array((max - min) + 1), (x, i) => i + min);
  res.send(anios);
});

router.get('/iniciales', (req, res) => {
  res.send(iniciales);
});

router.get('/iniciales/brechas', (req, res) => {
  res.send(iniciales.brechas);
});

router.get('/iniciales/coordenadas_paralelas', (req, res) => {
  res.send(iniciales.coordenadas_paralelas);
});

router.get('/:bd/:value', (req, res) => {
  const { bd, value } = req.params;
  const variable = variables.find((item) => item.bd === bd && item.value === value);
  if (variable) {
    res.send(variable);
  } else {
    res.status(404).send(`Variable ${value} - ${bd} no encontrada.`);
  }
});

/**
 * Permite obtener la lista de variables disponibles.
 * @returns {Array} Lista de variables.
 */
function getVariables() {
  return variables;
}

/**
 * Permite obtener la lista de bases de datos disponibles.
 * @returns {Array} Lista de bases de datos.
 */
function getDbs() {
  return dbs;
}

/**
 * Permite obtener los casos especiales disponibles.
 * @returns {{ cambiar_columna: Array,
 * local: Array,
 * modificar_busqueda_anio: Array,
 * saltar_busqueda_anio: Array,
 * modificar_busqueda_divipola: Array}} Casos especiales.
*/
function getCasosEspeciales() {
  return casosEspeciales;
}

module.exports = {
  router, cargarVariables, getVariables, getDbs, getCasosEspeciales,
};
