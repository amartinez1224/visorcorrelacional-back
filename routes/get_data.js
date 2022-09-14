const express = require('express');
const { getDbs, getCasosEspeciales } = require('../utils/load_config');

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
 * @param {string} anioKey Nombre del campo que contiene el año. Por defecto es 'ANIO'.
 * @param {string} departamentoKey Nombre del campo que contiene el departamento. Por defecto es
 * 'DEPARTAMENTO'.
 * @param {Array<{columna: string, alias: string}>} aliasColumnas Arreglo de objetos con los nombres
 * de las columnas y sus alias. Por defecto es un arreglo vacío.
 * @returns Una URL para hacer una petición de datos a ArcGIS.
 */
function construirUrlArcGIS(bd, servidor, anio = '', departamento = '', anioKey = 'anio', divipolaKey = 'divipola', aliasColumnas = []) {
  let where = '1%3D1';
  if (anio && departamento) {
    where = `${anioKey}+%3D+${anio}+AND+${divipolaKey}+LIKE+%27${departamento}%25%27`;
  } else if (anio) {
    where = `${anioKey}+%3D+${anio}`;
  } else if (departamento) {
    where = `${divipolaKey}+LIKE+%27${departamento}%25%27`;
  }

  let alias = '';
  aliasColumnas.forEach((columna) => {
    alias += `%2C+${columna.columna}+AS+${columna.alias}`;
  });

  const url = `${urlArcGIS}/${bd}/FeatureServer/${servidor}/query?where=${where}&outFields=*${alias}&outSR=4326&f=json&token=${tokenArcGIS}`;
  return url;
}

/**
 * Obtiene los datos de una base de datos de ArcGIS.
 * @param {string} bd Nombre de la base de datos.
 * @param {int} anio Año de los datos.
 * @param {Array<>} extraArgs Arreglo con los argumentos extra que se le pasan a la función
 * construirUrlArcGIS. Por defecto es un arreglo vacío. Se usa para manejar casos especiales.
 * @returns Un arreglo con los datos de la base de datos.
 * Un arreglo vacío si no se encuentran datos.
*/
async function obtenerDatosArcGIS(bd, anio, tipo, extraArgs = []) {
  const servidor = bd.feature_servers[tipo];
  const nombreBd = bd.base_de_datos;
  let url = '';
  url = construirUrlArcGIS(nombreBd, servidor, ...extraArgs);

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

/**
 * Busca casos especiales y btiene los datos solicitados de ArcGIS o locales.
 * @param {string} bd Nombre de la base de datos.
 * @param {int} anio Año de los datos.
 * @param {string} tipo Tipo de datos. Puede ser 'departamentos', 'municipios' o 'regionesPDET'.
 * @param {string} departamento Divipola de dos digitos por el que se filtran los datos
 * municipales. Por defecto es un string vacío.
 * @returns Un arreglo con los datos de la base de datos.
 * Un arreglo vacío si no se encuentran datos.
*/
async function obtenerDatos(bd, anio, tipo, departamento = '') {
  const casosEspeciales = getCasosEspeciales();
  const local = casosEspeciales.local.find(
    (item) => item.base_de_datos === bd.base_de_datos
    && item.region === tipo
    && item.anios.includes(anio),
  );
  const cambiarColumna = casosEspeciales.cambiar_columna.find(
    (item) => item.base_de_datos === bd.base_de_datos
    && item.region === tipo
    && item.anios.includes(anio),
  );
  const modificarBusquedaAnio = casosEspeciales.modificar_busqueda_anio.find(
    (item) => item.base_de_datos === bd.base_de_datos
    && item.region === tipo
    && item.anios.includes(anio),
  );
  const modificarBusquedaDivipola = casosEspeciales.modificar_busqueda_divipola.find(
    (item) => item.base_de_datos === bd.base_de_datos
    && item.region === tipo
    && item.anios.includes(anio),
  );
  const saltarBusquedaAnio = casosEspeciales.saltar_busqueda_anio.find(
    (item) => item.base_de_datos === bd.base_de_datos
    && item.region === tipo,
  );

  const extraArgs = new Array(5).fill(undefined);
  if (!saltarBusquedaAnio) {
    extraArgs[0] = anio;
  }
  if (departamento) {
    extraArgs[1] = departamento;
  }
  if (modificarBusquedaAnio) {
    extraArgs[2] = modificarBusquedaAnio.anio;
  }
  if (modificarBusquedaDivipola) {
    extraArgs[3] = modificarBusquedaDivipola.divipola;
  }
  if (cambiarColumna) {
    extraArgs[4] = cambiarColumna.columnas;
  }

  if (local) {
    // TODO: Obtener datos locales.
    const data = [];
    return data;
  }
  const data = await obtenerDatosArcGIS(bd, anio, tipo, extraArgs);
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
