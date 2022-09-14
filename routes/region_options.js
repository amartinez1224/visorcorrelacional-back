const express = require('express');
const {
  getTotales,
  getRegionesPDET,
  getDepartamentos,
  getMunicipios,
} = require('../utils/load_config');

const router = express.Router();

/**
 * Clasifica una divipola en un tipo de region departamento, municipio o región PDET.
 * @param {string} divipola string de 5 o 2 caracteres que representa la divipola.
 * @returns { { lista: Array.<Object>, tipo: string, div: string } } Un objeto con la variable
 * donde se encuentra la region, el tipo de region y la divipola en fromato de 5 digitos (con ceros
 * a la izquierda). Un objeto con valores `null` si no se encuentra la region.
*/
function obtenerTipoPorDivipola(divipola) {
  let div = divipola;
  if (div.length === 2) {
    div += '000';
  }
  if (div.length === 5) {
    const divTotales = getTotales().map((total) => total.divipola);
    if (divTotales.includes(div)) {
      return { lista: getTotales(), tipo: 'total', div };
    }
    if (div.substring(0, 2) === '02') {
      return { lista: getRegionesPDET(), tipo: 'regionPDET', div };
    }
    if (div.substring(div.length - 3) === '000') {
      return { lista: getDepartamentos(), tipo: 'departamento', div };
    }
    return { lista: getMunicipios(), tipo: 'municipio', div };
  }
  return { lista: null, tipo: null, div: divipola };
}

router.get('/departamentos', (req, res) => {
  res.send(getDepartamentos());
});

router.get('/municipios', (req, res) => {
  res.send(getMunicipios());
});

router.get('/municipios-estrictos', (req, res) => {
  res.send(getMunicipios().filter((municipio) => municipio.tipo === 'Municipio'));
});

router.get('/municipios/:departamento', (req, res) => {
  res.send(getMunicipios().filter(
    (item) => item.divipola_departamento === req.params.departamento,
  ));
});

router.get('/municipios-estrictos/:departamento', (req, res) => {
  res.send(getMunicipios().filter((item) => item.divipola_departamento === req.params.departamento && item.tipo === 'Municipio'));
});

router.get('/regionesPDET', (req, res) => {
  res.send(getRegionesPDET().concat(getTotales()));
});

router.get('/divipola/:divipola', (req, res) => {
  const { divipola } = req.params;
  const { lista, tipo, div } = obtenerTipoPorDivipola(divipola);
  if (lista === null) {
    res.status(400).send(`La divipola debe estar en formato de 2 o 5 digitos. ${div} no es valida.`);
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
  router,
};
