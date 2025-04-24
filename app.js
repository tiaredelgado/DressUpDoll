const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('./public/db');
const { insertItems, cleanUp } = require('./public/seed');
const { Top, Bottom,User } = require("./public/schemas");




app.set('view engine','pug')
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ Email: email });

    if (user && user.Password === password) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: "Invalid email or password." });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});


app.get("/newAccount",async(req,res) =>{
  res.render('newAccount');
});


// /createAccount POST






// Cleanup on termination
process.on("SIGINT", async () => {
  console.log("\nGracefully shutting down... cleaning up data.");
  await cleanUp();
  mongoose.connection.close();
  process.exit(0);
});
