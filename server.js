const express = require('express');
const cors = require('cors');
const { router: regiones, cargarRegiones } = require('./routes/region_options');
const { router: variables, cargarVariables } = require('./routes/variable_options');

const port = process.env.PORT || 8080;

const app = express();
app.use(cors());

cargarRegiones();
app.use('/obtener/regiones', regiones);

cargarVariables();
app.use('/obtener/variables', variables);

app.get('/', (req, res) => {
  res.send('Back is on.');
});

app.listen(port, () => console.log(`Back is listening on port ${port}.`));
