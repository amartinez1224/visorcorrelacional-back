const fs = require('fs');

// VARIABLES

const variables = [];
let iniciales = { coordenadas_paralelas: {}, brechas: {} };
let dbs = [];
let casosEspeciales = {
  cambiar_columna: [],
  local: [],
  modificar_busqueda_anio: [],
  saltar_busqueda_anio: [],
  modificar_busqueda_divipola: [],
};

let departamentos = [];
let municipios = [];
let regionesPDET = [];
let totales = [];

const dbsLocales = {};

// CARGAR VARIABLES, DATOS INICIALES Y CASOS ESPECIALES

/**
 * Carga las variables disponibles agrupadas por base de datos del
 * archivo variables.json en la variable dbs.
*/
function cargarDbs() {
  const data = fs.readFileSync('./data/variables.json');
  dbs = JSON.parse(data);
}

/**
 * Carga los datos de los archivos json especificado en los casos especiales en la variable dbs.
*/
function cargarDatosLocales() {
  const casos = casosEspeciales.local;
  casos.forEach((caso) => {
    fs.readFile(`./data/especiales/${caso.archivo}`, (err, data) => {
      if (err) throw err;
      if (dbsLocales[caso.base_de_datos]) {
        dbsLocales[caso.base_de_datos][caso.region] = JSON.parse(data);
      } else {
        dbsLocales[caso.base_de_datos] = { [caso.region]: JSON.parse(data) };
      }
    });
  });
}

/**
 * Carga los casos especiales del archivo casos_especiales.json en la variable casosEspeciales y
 * carga los datos locales/especiales.
*/
function cargarCasosEspeciales() {
  fs.readFile('./data/casos_especiales.json', (err, data) => {
    if (err) throw err;
    casosEspeciales = JSON.parse(data);
    cargarDatosLocales();
  });
}

/**
 * Carga las regiones y variables iniciales a mostrarse en cada gráfica del archivo iniciales.json
 * en la variable iniciales.
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

// CARGAR REGIONES

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

// AGRUPADORES

/**
 * Ejecuta en orden las funciones cargarDatosIniciales, cargarVariables, cargarDbs y
 * listarVariables.
*/
function cargarVariables() {
  cargarDatosIniciales();
  cargarCasosEspeciales();
  cargarDbs();
  listarVariables();
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

// GETTERS

/**
 * Permite obtener la lista de variables disponibles.
 * @returns {Array} Lista de variables.
*/
function getVariables() {
  return variables;
}

/**
 * Permite obtener el objeto que contiene las variables y regiones iniciales.
 * @returns {{brechas: Object, coordenadas_paralelas: Object}} Objeto con
 *  variables y regiones iniciales por tipo de gráfica.
*/
function getIniciales() {
  return iniciales;
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

/**
 * Permite obtener los datos de la bd y region especificada.
 * @param {string} bd Nombre de la base de datos.
 * @param {string} region Nombre de la region.
 * @returns {Array} Datos de la bd y region especificada. Si no se encuentra la bd o la region
 * retorna una lista vacia.
*/
function getDatos(bd, region) {
  if (dbsLocales[bd] && dbsLocales[bd][region]) {
    return dbsLocales[bd][region].map((item) => item.attributes);
  }
  return [];
}

/**
 * Permite obtener la lista de departamentos disponibles.
 * @returns {Array} Lista de departamentos.
*/
function getDepartamentos() {
  return departamentos;
}

/**
 * Permite obtener la lista de municipios disponibles.
 * @returns {Array} Lista de municipios.
*/
function getMunicipios() {
  return municipios;
}

/**
 * Permite obtener la lista de regiones PDET disponibles.
 * @returns {Array} Lista de regiones PDET.
*/
function getRegionesPDET() {
  return regionesPDET;
}

/**
 * Permite obtener la lista de regiones totales disponibles.
 * @returns {Array} Lista de regiones totales.
*/
function getTotales() {
  return totales;
}

// EXPORTS

module.exports = {
  cargarVariables,
  getVariables,
  getDbs,
  getCasosEspeciales,
  getIniciales,
  cargarRegiones,
  getDepartamentos,
  getMunicipios,
  getRegionesPDET,
  getTotales,
  cargarDatosLocales,
  getDatos,
};
