const express = require('express');
const { getVariables, getIniciales } = require('../utils/load_config');

const router = express.Router();

router.get('/lista', (req, res) => {
  res.send(getVariables());
});

router.get('/resumen', (req, res) => {
  const resumen = getVariables().map((variable) => ({
    bd: variable.bd,
    value: variable.value,
    nombre: variable.nombre,
    anios: variable.anios,
  }
  ));
  res.type('json').send(JSON.stringify(resumen, null, 2));
});

router.get('/brechas', (req, res) => {
  const resumen = getVariables().map((variable) => ({
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
  getVariables().forEach((variable) => {
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
  res.send(getIniciales());
});

router.get('/iniciales/brechas', (req, res) => {
  res.send(getIniciales().brechas);
});

router.get('/iniciales/coordenadas_paralelas', (req, res) => {
  res.send(getIniciales().coordenadas_paralelas);
});

router.get('/:bd/:value', (req, res) => {
  const { bd, value } = req.params;
  const variable = getVariables().find((item) => item.bd === bd && item.value === value);
  if (variable) {
    res.send(variable);
  } else {
    res.status(404).send(`Variable ${value} - ${bd} no encontrada.`);
  }
});

module.exports = {
  router,
};
