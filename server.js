const express = require('express');
const cors = require('cors');
const { router: regiones } = require('./routes/region_options');
const { router: variables } = require('./routes/variable_options');
const { router: data } = require('./routes/get_data');
const { cargarVariables, cargarRegiones } = require('./utils/load_config');

const port = process.env.PORT || 8080;

const app = express();
app.use(cors());

cargarRegiones();
app.use('/obtener/regiones', regiones);

cargarVariables();
app.use('/obtener/variables', variables);

app.use('/data/', data);

app.get('/', (req, res) => {
  res.send('Back is on.');
});

app.listen(port, () => console.log(`Back is listening on port ${port}.`));
