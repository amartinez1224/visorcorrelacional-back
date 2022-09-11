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

module.exports = {
  router, cargarRegiones,
};
