const express = require('express');
const fs = require('fs');

const router = express.Router();

let departamentos = [];
let municipios = [];
let regionesPDET = [];
let totales = [];

function cargarDepartamentos() {
  fs.readFile('./data/departamentos.json', (err, data) => {
    if (err) throw err;
    departamentos = JSON.parse(data);
  });
}

function cargarMunicipios() {
  fs.readFile('./data/municipios.json', (err, data) => {
    if (err) throw err;
    municipios = JSON.parse(data);
  });
}

function cargarRegionesPDET() {
  fs.readFile('./data/regionesPDET.json', (err, data) => {
    if (err) throw err;
    regionesPDET = JSON.parse(data);
  });
}

function cargarTotales() {
  fs.readFile('./data/totales.json', (err, data) => {
    if (err) throw err;
    totales = JSON.parse(data);
  });
}

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
  return { lista: null, tipo: null, divipola };
}

router.get('/divipola/:divipola', (req, res) => {
  const { divipola } = req.params;
  const { lista, tipo, div } = obtenerTipoPorDivipola(divipola);
  console.log(divipola, tipo);
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
