const express = require('express');
const fs = require('fs');

const router = express.Router();

const variables = [];
let iniciales = [];
let dbs = [];

function cargarDbs() {
  const data = fs.readFileSync('./data/variables.json');
  dbs = JSON.parse(data);
}

function cargarDatosIniciales() {
  fs.readFile('./data/config_inicial.json', (err, data) => {
    if (err) throw err;
    iniciales = JSON.parse(data);
  });
}

function listarVariables() {
  dbs.forEach((bd) => {
    bd.variables.forEach((variable) => {
      const temp = variable;
      temp.bd = bd.base_de_datos;
    });
    variables.push(...bd.variables);
  });
}

function cargarVariables() {
  cargarDatosIniciales();
  cargarDbs();
  listarVariables();
}

router.get('/lista', (req, res) => {
  res.send(variables);
});

router.get('/resumen', (req, res) => {
  const resumen = variables.map((variable) => ({
    bd: variable.bd,
    nombre: variable.nombre,
    anios: variable.anios,
  }
  ));
  res.type('json').send(JSON.stringify(resumen, null, 2));
});

router.get('/brechas', (req, res) => {
  const resumen = variables.map((variable) => ({
    bd: variable.bd,
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

module.exports = {
  router, cargarVariables,
};
