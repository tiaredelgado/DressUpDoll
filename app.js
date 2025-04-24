const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('./public/db');
const { insertItems, cleanUp } = require('./public/seed');
const { Top, Bottom } = require("./public/schemas");




app.set('view engine','pug')
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

mongoose.connection.once("open", async () => {
  console.log("Connected to MongoDB.");
  await insertItems();
});

const PORT = 3100;
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });

  app.get('/',(req,res)=>{
    res.render('index');
});

app.get("/inventory", async (req, res) => {
  try {
    const tops = await Top.find({});
    const bottoms = await Bottom.find({});
    res.render("inventory", { tops, bottoms });
  } catch (err) {
    console.error("Error loading inventory:", err);
    res.status(500).send("Something went wrong.");
  }
});

app.get("/login", (req,res) => {
  res.render('login');
})


// Cleanup on termination
process.on("SIGINT", async () => {
  console.log("\nGracefully shutting down... cleaning up data.");
  await cleanUp();
  mongoose.connection.close();
  process.exit(0);
});
