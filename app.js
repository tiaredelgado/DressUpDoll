const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

app.set('view engine','pug')
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/',(req,res)=>{
    res.render('index');
});
app.post('/storeDoll', (req, res) => {
  const dollName = req.body.dollName;
  const dollImage = req.body.dollImage; // Base64 PNG
  
  console.log('Doll name:', dollName);

  res.send(`Stored your doll "${dollName}" in the dollhouse!`);
});
const PORT = 3100;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});