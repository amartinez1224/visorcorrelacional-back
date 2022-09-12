const express = require('express');
const fs = require('fs');

const router = express.Router();

const variables = [];
let dbs = [];

function cargarDbs() {
  const data = fs.readFileSync('./data/variables.json');
  dbs = JSON.parse(data);
}

function listarVariables() {
  dbs.forEach((bd) => {
    variables.push(...bd.variables);
  });
}

function cargarVariables() {
  cargarDbs();
  listarVariables();
}

router.get('/lista', (req, res) => {
  res.send(variables);
});

router.get('/resumen', (req, res) => {
  const resumen = variables.map((variable) => ({
    nombre: variable.nombre,
    anios: variable.anios,
  }
  ));
  res.send(resumen);
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

module.exports = {
  router, cargarVariables,
};
