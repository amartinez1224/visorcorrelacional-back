const express = require('express');
const fs = require('fs');

const router = express.Router();

let departamentos = [];
let municipios = [];
let regionesPDET = [];
let totales = [];

/**
 * Carga los departamentos del archivo departamentos.json en la variable departamentos.
 */
function cargarDepartamentos() {
  fs.readFile('./data/departamentos.json', (err, data) => {
    if (err) throw err;
    departamentos = JSON.parse(data);
  });
}

/**
 * Carga los municipios del archivo municipios.json en la variable municipios.
 */
function cargarMunicipios() {
  fs.readFile('./data/municipios.json', (err, data) => {
    if (err) throw err;
    municipios = JSON.parse(data);
  });
}

/**
 * Carga las regiones PDET del archivo regionesPDET.json en la variable regionesPDET.
*/
function cargarRegionesPDET() {
  fs.readFile('./data/regionesPDET.json', (err, data) => {
    if (err) throw err;
    regionesPDET = JSON.parse(data);
  });
}

/**
 * Carga las regiones totales del archivo totales.json en la variable totales.
*/
function cargarTotales() {
  fs.readFile('./data/totales.json', (err, data) => {
    if (err) throw err;
    totales = JSON.parse(data);
  });
}

/**
 * Ejecuta en orden las funciones cargarDepartamentos, cargarMunicipios,
 * cargarRegionesPDET y cargarTotales.
*/
function cargarRegiones() {
  cargarDepartamentos();
  cargarMunicipios();
  cargarRegionesPDET();
  cargarTotales();
}

router.get('/departamentos', (req, res) => {
  res.send(departamentos);
});

router.get('/municipios', (req, res) => {
  res.send(municipios);
});

router.get('/municipios-estrictos', (req, res) => {
  res.send(municipios.filter((municipio) => municipio.tipo === 'Municipio'));
});

router.get('/municipios/:departamento', (req, res) => {
  res.send(municipios.filter((item) => item.divipola_departamento === req.params.departamento));
});

router.get('/municipios-estrictos/:departamento', (req, res) => {
  res.send(municipios.filter((item) => item.divipola_departamento === req.params.departamento && item.tipo === 'Municipio'));
});

router.get('/regionesPDET', (req, res) => {
  res.send(regionesPDET.concat(totales));
});

/**
 * Clasifica una divipola en un tipo de region departamento, municipio o región PDET.
 * @param {string} divipola string de 5 o 2 caracteres que representa la divipola.
 * @returns { { lista: [object], tipo: string, div: string } } Un objeto con la variable donde se
 * encuentra la region, el tipo de region y la divipola en fromato de 5 digitos (con ceros a la
 * izquierda). Un objeto con valores null si no se encuentra la region.
 */
function obtenerTipoPorDivipola(divipola) {
  let div = divipola;
  if (div.length === 2) {
    div += '000';
  }
  if (div.length === 5) {
    const divTotales = totales.map((total) => total.divipola);
    if (divTotales.includes(div)) {
      return { lista: totales, tipo: 'total', div };
    }
    if (div.substring(0, 2) === '02') {
      return { lista: regionesPDET, tipo: 'regionPDET', div };
    }
    if (div.substring(div.length - 3) === '000') {
      return { lista: departamentos, tipo: 'departamento', div };
    }
    return { lista: municipios, tipo: 'municipio', div };
  }
  return { lista: null, tipo: null, div: divipola };
}

router.get('/divipola/:divipola', (req, res) => {
  const { divipola } = req.params;
  const { lista, tipo, div } = obtenerTipoPorDivipola(divipola);
  if (lista === null) {
    res.status(404).send(`Divipola ${div} no encontrada.`);
  } else {
    const region = lista.find((item) => item.divipola === div);
    if (region === undefined) {
      res.status(404).send(`Divipola ${div} no encontrada.`);
    } else {
      res.send({ region, tipo });
    }
  }
});

module.exports = {
  router, cargarRegiones,
};
