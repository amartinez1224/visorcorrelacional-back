const express = require('express');
const cors = require('cors');

const port = process.env.PORT || 8080;

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('Back is on.');
});

app.listen(port, () => console.log(`Back is listening on port ${port}.`));
