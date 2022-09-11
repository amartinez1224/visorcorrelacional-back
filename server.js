const express = require('express');
const cors = require('cors');
const { router: regiones, cargarRegiones } = require('./routes/region_options');

const port = process.env.PORT || 8080;

const app = express();
app.use(cors());

cargarRegiones();
app.use('/obtener/regiones', regiones);

app.get('/', (req, res) => {
  res.send('Back is on.');
});

app.listen(port, () => console.log(`Back is listening on port ${port}.`));
