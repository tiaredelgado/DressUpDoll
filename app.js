const express = require('express');
const app = express();
const path = require('path');

let dollhouse = [];

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/storeDoll', (req, res) => {
  const { dollName, dollImage } = req.body;

  dollhouse.push({
    name: dollName,
    image: dollImage
  });

  res.json({ success: true }); 
});

app.get('/dollhouse', (req, res) => {
  res.json(dollhouse); 
});

const PORT = 3100;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
