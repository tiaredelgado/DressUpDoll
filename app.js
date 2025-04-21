const express = require('express');
const app = express();
const path = require('path');

app.set('view engine','pug')
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/',(req,res)=>{
    res.render('index');
});

const PORT = 3100;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});