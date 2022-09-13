const express = require('express');
const { getDbs } = require('./variable_options');

const router = express.Router();
const urlArcGIS = process.env.ARCGIS_URL || '';
const tokenArcGIS = process.env.ARCGIS_TOKEN || '';

/**
 * Construye una URL para hacer una petición a ArcGIS.
 * @param {string} bd Nombre de la base de datos.
 * @param {int} servidor Numero del Feature Server de ArcGIS.
 * @param {int} anio Año de los datos. Si no se especifica busca todos los años disponibles.
 * @param {string} departamento Departamento de los datos. Si no se especifica no filtra por
 * departamento.
 * @returns Una URL para hacer una petición a ArcGIS.
 */
function construirUrlArcGIS(bd, servidor, anio = '', departamento = '') {
  let where = '1%3D1';
  if (anio && departamento) {
    where = `anio+%3D+${anio}+AND+divipola+LIKE+%27${departamento}%25%27`;
  } else if (anio) {
    where = `anio+%3D+${anio}`;
  } else if (departamento) {
    where = `divipola+LIKE+%27${departamento}%25%27`;
  }

  const url = `${urlArcGIS}/${bd}/FeatureServer/${servidor}/query?where=${where}&outFields=*&outSR=4326&f=json&token=${tokenArcGIS}`;
  return url;
}

/**
 * Obtiene los datos de una base de datos de ArcGIS.
 * @param {string} bd Nombre de la base de datos.
 * @param {int} anio Año de los datos.
 * @param {string} departamento Departamento por el que se filtran los datos municipales.
 * @returns Un arreglo con los datos de la base de datos.
 * Un arreglo vacío si no se encuentran datos.
*/
async function obtenerDatos(bd, anio, tipo, departamento = '00') {
  const servidor = bd.feature_servers[tipo];
  const nombreBd = bd.base_de_datos;
  let url = '';
  if (tipo === 'municipios') {
    url = construirUrlArcGIS(nombreBd, servidor, anio, departamento);
  } else {
    url = construirUrlArcGIS(nombreBd, servidor, anio);
  }
  let data = [];
  await fetch(url)
    .then((res) => res.json())
    .then((json) => {
      data = json.features;
      data = data.map((item) => item.attributes);
    })
    .catch((err) => {
      console.log(err);
    });
  return data;
}

router.get('/departamentos/:bd/:anio', async (req, res) => {
  const { bd, anio } = req.params;
  const db = getDbs().find((item) => item.base_de_datos === bd);
  if (db) {
    const anioInt = parseInt(anio, 10);
    if (Number.isNaN(anioInt)) {
      res.status(400).send('El año debe ser un número.');
    } else if (db.anios.has(anioInt)) {
      const datos = await obtenerDatos(db, anioInt, 'departamentos');
      res.send(datos);
    } else {
      res.status(404).send(`No se encontró el año ${anio} en la base de datos ${bd}.`);
    }
  } else {
    res.status(404).send(`No se encontró la base de datos ${bd}.`);
  }
});

router.get('/municipios/:bd/:anio/:departamento', async (req, res) => {
  const { bd, anio, departamento } = req.params;
  const db = getDbs().find((item) => item.base_de_datos === bd);
  if (db) {
    const divipolaSyntax2 = /^[0-9]{2}$/;
    const divipolaSyntax5 = /^[0-9]{5}$/;
    let divipolaDepartamento = false;
    if (divipolaSyntax2.test(departamento)) {
      divipolaDepartamento = departamento;
    } else if (divipolaSyntax5.test(departamento)) {
      divipolaDepartamento = departamento.substring(0, 2);
    } else {
      res.status(400).send('El departamento debe estar en formato divipola de 2 o 5 digitos.');
    }
    if (divipolaDepartamento) {
      const anioInt = parseInt(anio, 10);
      if (Number.isNaN(anioInt)) {
        res.status(400).send('El año debe ser un número.');
      } else if (db.anios.has(anioInt)) {
        const datos = await obtenerDatos(db, anioInt, 'municipios', divipolaDepartamento);
        res.send(datos);
      } else {
        res.status(404).send(`No se encontró el año ${anio} en la base de datos ${bd}.`);
      }
    }
  } else {
    res.status(404).send(`No se encontró la base de datos ${bd}.`);
  }
});

router.get('/regionesPDET/:bd/:anio', async (req, res) => {
  const { bd, anio } = req.params;
  const db = getDbs().find((item) => item.base_de_datos === bd);
  if (db) {
    const anioInt = parseInt(anio, 10);
    if (Number.isNaN(anioInt)) {
      res.status(400).send('El año debe ser un número.');
    } else if (db.anios.has(anioInt)) {
      const datos = await obtenerDatos(db, anioInt, 'PDET');
      res.send(datos);
    } else {
      res.status(404).send(`No se encontró el año ${anio} en la base de datos ${bd}.`);
    }
  } else {
    res.status(404).send(`No se encontró la base de datos ${bd}.`);
  }
});

module.exports = {
  router,
};
